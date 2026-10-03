// Rendering strategies, animated: a server (left) with its dist/ folder and a database, a monitor
// (right), the network between them, and an SEO bot (magnifying glass) that grades the first HTML.
//
//   CSR  empty HTML → bot sees nothing → messy JS bundle travels and assembles the page → fetch data
//   SSR  server runs React per request → full HTML → bot is happy → hydration makes it interactive
//   SSG  npm run build makes every page up front → instant file → but data goes stale
//   ISR  like SSG + revalidate: after 60 s the next visitor triggers a background rebuild of one page
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { buildMonitorModel, DESK_Y } from './monitor.js';
import { buildServer, buildFolder, buildDb, buildMagnifier, buildWire, sprite, textSprite } from './renderModels.js';
import { docTexture, fragmentTexture, verdictTexture, tagTexture, timerTexture, veilTexture, sweepTexture, fileTexture, patchTexture } from './renderTextures.js';
import { loadTextures, contactShadowTexture } from './assets.js';
import { Tweens, ease, wait } from './tween.js';

export const MODES = ['csr', 'ssr', 'ssg', 'isr'];
const CANCEL = Symbol('cancel');
const SW = 1.6;
const SH = 0.9;
const PAGE_BG = new THREE.Color('#EEF5FB');
const WHITE = new THREE.Color('#FFFFFF');

// Product page layout (px on the 1280x720 screenshot) — the skeleton the browser "assembles".
const BLOCKS = [
  ['header', [0, 0, 1280, 67], '#031927'],
  ['footer', [0, 655, 1280, 65], '#031927'],
  ['hline', [0, 64, 1280, 3], '#BA1200'],
  ['crumb', [50, 95, 275, 14], '#D5DEE8'],
  ['image', [50, 129, 570, 426], '#DCE4EC'],
  ['title', [660, 148, 515, 40], '#C9D3DE'],
  ['rating', [660, 214, 115, 14], '#D5DEE8'],
  ['desc', [660, 238, 412, 18], '#D5DEE8'],
  ['price', [660, 292, 98, 32], '#C9D3DE'],
  ['stepper', [775, 289, 105, 37], '#E1E8EF'],
  ['button', [897, 284, 241, 49], '#BA1200'],
  ['panel', [50, 580, 1180, 75], '#FFFFFF'],
];
const pxToLocal = ([x, y, w, h]) => ({
  x: ((x + w / 2) / 1280) * SW - SW / 2,
  y: SH / 2 - ((y + h / 2) / 720) * SH,
  w: (w / 1280) * SW,
  h: (h / 720) * SH,
});

const FRAGMENTS = ['import React', 'createRoot()', '=>', '{...}', 'useState', '</>', 'fetch()', '!function(e){', 'map()', 'var t={}', '<Route>', 'export', '0x9f3a', 'return(', 'jsx()', '&&'];
const HYDRATE = ['hydrateRoot()', 'onClick', 'useState', '=>', '{...}', 'jsx()'];

export class RenderScene {
  constructor(container, { onMode, onStep, onDone } = {}) {
    this.container = container;
    this.onMode = onMode || (() => {});
    this.onStep = onStep || (() => {});
    this.onDone = onDone || (() => {});
    this.tweens = new Tweens();
    this.token = 0;
    this.mode = -1;
    this.state = { gearSpeed: 0, activity: 0.15, cpu: 0, flow: 0, flowDir: 1 };
    this.cluster = { active: false, center: new THREE.Vector3(), items: [], spread: 1 };
    this.disposables = [];
    this.clock = new THREE.Clock();
  }

  static supported() {
    try {
      const c = document.createElement('canvas');
      return !!(c.getContext('webgl2') || c.getContext('webgl'));
    } catch { return false; }
  }

  async mount() {
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.VSMShadowMap;
    renderer.setClearColor(0x000000, 0);
    renderer.domElement.className = 'rs-gl';
    this.container.appendChild(renderer.domElement);
    this.renderer = renderer;

    const scene = new THREE.Scene();
    this.scene = scene;
    const pmrem = new THREE.PMREMGenerator(renderer);
    this.envRT = pmrem.fromScene(new RoomEnvironment(), 0.04);
    pmrem.dispose();
    scene.environment = this.envRT.texture;
    scene.environmentIntensity = 0.8;
    this.camera = new THREE.PerspectiveCamera(32, 16 / 9, 0.1, 60);
    this.camera.position.set(0, 0.55, 6.6);
    this.camera.lookAt(0, 0.12, 0);

    const key = new THREE.DirectionalLight(0xffffff, 2.0);
    key.position.set(0.8, 9, 3.2);
    key.castShadow = true;
    key.shadow.mapSize.set(1024, 1024);
    Object.assign(key.shadow.camera, { left: -4.5, right: 4.5, top: 3, bottom: -3, near: 2, far: 16 });
    key.shadow.bias = -0.0006;
    key.shadow.radius = 14;
    key.shadow.blurSamples = 24;
    scene.add(key, new THREE.HemisphereLight(0xffffff, 0xdfe4ea, 0.55));
    const ground = new THREE.Mesh(new THREE.PlaneGeometry(30, 14), new THREE.ShadowMaterial({ opacity: 0.075 }));
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = DESK_Y;
    ground.receiveShadow = true;
    scene.add(ground);

    try { await document.fonts.load('500 26px "JetBrains Mono"'); await document.fonts.load('600 38px "FiraGO"'); } catch { /* fall back */ }
    this.textures = loadTextures(renderer);
    const pageTex = this.textures.get('react', 'product');
    await this.textures.ready();

    this.shadowTex = contactShadowTexture();
    this.buildActors(pageTex);

    this.onResize = () => this.resize();
    this.ro = new ResizeObserver(this.onResize);
    this.ro.observe(this.container);
    this.resize();

    this.loop = this.loop.bind(this);
    this.raf = requestAnimationFrame(this.loop);
    this.play(0);
  }

  // ------------------------------------------------------------------ actors

  track(t) { this.disposables.push(t); return t; }

  buildActors(pageTex) {
    const { scene } = this;

    // server + dist folder + database
    this.server = buildServer();
    scene.add(this.server.group);
    this.folder = buildFolder();
    this.folder.group.position.set(0, this.server.size.H + 0.005, 0.02);
    this.server.group.add(this.folder.group);
    this.folderLabel = textSprite('dist/', 0.062, 'file');
    this.folderLabel.position.set(0.44, this.server.size.H + 0.34, 0.05);
    this.server.group.add(this.folderLabel);
    this.db = buildDb();
    scene.add(this.db.group);
    this.dbLabel = textSprite('DB · API', 0.055, 'file');
    this.db.group.add(this.dbLabel);
    this.dbLabel.position.set(0, this.db.top + 0.1, 0);
    [this.server.group, this.db.group].forEach((g, i) => {
      const contact = new THREE.Mesh(new THREE.PlaneGeometry(i ? 0.6 : 1.1, i ? 0.6 : 1.0), new THREE.MeshBasicMaterial({ map: this.shadowTex, transparent: true, depthWrite: false, opacity: 0.5, toneMapped: false }));
      contact.rotation.x = -Math.PI / 2;
      contact.position.y = 0.002;
      g.add(contact);
    });
    this.serverLabel = textSprite('SERVER', 0.058, 'node');
    scene.add(this.serverLabel);

    // monitor with the screen contents
    this.monitor = new THREE.Group();
    const model = buildMonitorModel(this.shadowTex);
    this.monitor.add(model.group);
    this.monitorModel = model;
    // Seen straight on, the part of the stand hidden behind the panel can bleed through as a
    // one-pixel seam on some rasterisers — in this front view the neck only needs to reach the chin.
    const neck = model.group.children.find((m) => m.geometry?.parameters?.height === 0.68);
    if (neck) {
      const top = -0.46;
      const bottom = DESK_Y + 0.01;
      neck.geometry.dispose();
      neck.geometry = new RoundedBoxGeometry(0.08, top - bottom, 0.026, 3, 0.006);
      neck.position.y = (top + bottom) / 2;
    }
    const screen = new THREE.Group();
    this.monitor.add(screen);
    this.screen = screen;
    this.browserLabel = textSprite('BROWSER', 0.058, 'node');
    scene.add(this.monitor, this.browserLabel);

    const plane = new THREE.PlaneGeometry(SW, SH);
    this.base = new THREE.Mesh(plane, new THREE.MeshBasicMaterial({ color: WHITE.clone(), toneMapped: false }));
    this.base.position.z = 0.002;
    screen.add(this.base);
    this.blocks = BLOCKS.map(([name, rect, color]) => {
      const r = pxToLocal(rect);
      const m = new THREE.Mesh(new THREE.PlaneGeometry(r.w, r.h), new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0, toneMapped: false, depthWrite: false }));
      m.position.set(r.x, r.y, 0.003 + (name === 'hline' ? 0.0003 : 0));
      m.userData = { name, local: new THREE.Vector3(r.x, r.y, 0.003) };
      screen.add(m);
      return m;
    });
    this.page = new THREE.Mesh(plane, new THREE.MeshBasicMaterial({ map: pageTex, transparent: true, opacity: 0, toneMapped: false, depthWrite: false }));
    this.page.position.z = 0.0042;
    screen.add(this.page);
    const patch = (rect, tex) => {
      const r = pxToLocal(rect);
      const m = new THREE.Mesh(new THREE.PlaneGeometry(r.w, r.h), new THREE.MeshBasicMaterial({ map: this.track(tex), transparent: true, opacity: 0, toneMapped: false, depthWrite: false }));
      m.position.set(r.x, r.y, 0.0043);
      screen.add(m);
      return m;
    };
    this.patches = [
      patch([652, 288, 112, 40], patchTexture('$14.00', { w: 448, h: 160, bg: '#DCEBF7', fg: '#031927', size: 84, edge: '#2F6B4F' })),
      patch([897, 284, 241, 49], patchTexture('Add to cart · $14.00', { w: 964, h: 196, bg: '#BA1200', fg: '#FFFFFF', size: 64 })),
    ];
    this.veil = new THREE.Mesh(plane, new THREE.MeshBasicMaterial({ map: this.track(veilTexture('ჩანს, მაგრამ ჯერ არ არის ინტერაქტიული')), transparent: true, opacity: 0, toneMapped: false, depthWrite: false }));
    this.veil.position.z = 0.0044;
    screen.add(this.veil);
    this.sweep = new THREE.Mesh(new THREE.PlaneGeometry(0.3, SH), new THREE.MeshBasicMaterial({ map: this.track(sweepTexture()), transparent: true, opacity: 0, toneMapped: false, depthWrite: false, blending: THREE.AdditiveBlending }));
    this.sweep.position.z = 0.0046;
    screen.add(this.sweep);

    // travelling things
    const thumb = pageTex.image;
    const T = (t) => this.track(t);
    this.cards = {
      empty: sprite(T(docTexture({ name: 'index.html', size: '0.4 KB', tone: 'empty', lines: ['<!doctype html>', '<html>', '  <body>', '    <div id="root"></div>', '    <script src="index.js">', '  </body>', '</html>'] })), 0.5),
      full: sprite(T(docTexture({ name: 'product/34.html', size: '18 KB', thumb, lines: ['<header class="site-header">…', '<h1>Pizza Prosciutto…</h1>', '<strong>$15.50</strong>'] })), 0.5),
      json: sprite(T(docTexture({ name: 'products/34.json', size: '0.6 KB', tone: 'json', lines: ['{', '  "name": "Pizza Prosciutto…",', '  "price": 15.5,', '  "rate": 3.7', '}'] })), 0.34),
    };
    this.pills = {
      req: textSprite('GET /product/34', 0.07, 'route'),
      api: textSprite('GET /api/products/34', 0.07, 'route'),
      build: textSprite('$ npm run build', 0.085, 'node'),
      regen: textSprite('ფონური განახლება · product/34.html', 0.07, 'route'),
      visitor2: textSprite('შემდეგი ვიზიტორი', 0.065, 'file'),
    };
    this.verdicts = {
      low: sprite(T(verdictTexture(1, 'ცარიელი HTML — კონტენტი არ ჩანს')), 0.27, { depthTest: false, order: 30 }),
      high: sprite(T(verdictTexture(5, 'სრული კონტენტი — ინდექსირდება')), 0.27, { depthTest: false, order: 30 }),
    };
    this.tags = {
      db: sprite(T(tagTexture('DB-ში ახლა', '$14.00')), 0.16, { depthTest: false, order: 25 }),
      pageStale: sprite(T(tagTexture('გვერდზე ჩანს', '$15.50', 'bad')), 0.16, { depthTest: false, order: 25 }),
      pageFresh: sprite(T(tagTexture('გვერდზე ჩანს', '$14.00', 'good')), 0.16, { depthTest: false, order: 25 }),
    };
    this.timer = timerTexture();
    this.track(this.timer.texture);
    this.timerSprite = sprite(this.timer.texture, 0.2, { depthTest: false, order: 26 });

    const frag = (txt, dark) => {
      const f = fragmentTexture(txt, dark);
      T(f.texture);
      return sprite(f.texture, 0.06, { depthTest: false, order: 15 });
    };
    this.bundle = FRAGMENTS.map((t, i) => frag(t, i % 3 !== 1));
    this.hydrate = HYDRATE.map((t) => frag(t, false));
    this.bundleLabel = textSprite('index.js · 320 KB', 0.06, 'route');
    this.hydrateLabel = textSprite('client.js · hydrate', 0.06, 'route');

    // SEO bot
    this.bot = buildMagnifier();
    this.botLabel = textSprite('SEO bot', 0.055, 'file');
    this.botLabel.position.set(0, 0.2, 0);
    this.bot.group.add(this.botLabel);
    scene.add(this.bot.group);

    [...Object.values(this.cards), ...Object.values(this.pills), ...Object.values(this.verdicts), ...Object.values(this.tags),
      this.timerSprite, ...this.bundle, ...this.hydrate, this.bundleLabel, this.hydrateLabel].forEach((s) => { s.visible = false; scene.add(s); });

    this.fileTextures = new Map();
  }

  fileCard(name) {
    if (!this.fileTextures.has(name)) this.fileTextures.set(name, this.track(fileTexture(name)));
    const m = new THREE.Mesh(new THREE.PlaneGeometry(0.4, 0.286), new THREE.MeshBasicMaterial({ map: this.fileTextures.get(name), toneMapped: false, transparent: true }));
    m.userData.name = name;
    return m;
  }

  setFolder(names) {
    const { files } = this.folder;
    files.children.slice().forEach((c) => { c.geometry.dispose(); c.material.dispose(); files.remove(c); });
    names.forEach((n) => this.addFile(n));
  }

  addFile(name) {
    const { files } = this.folder;
    const m = this.fileCard(name);
    const i = files.children.length;
    m.position.set(-0.02 + (i % 2) * 0.03, 0.17 + i * 0.014, 0.004 + i * 0.004);
    files.add(m);
    return m;
  }

  // ------------------------------------------------------------------ layout & loop

  resize() {
    const { clientWidth: w, clientHeight: h } = this.container;
    if (!w || !h) return;
    this.renderer.setSize(w, h, false);
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    const dist = this.camera.position.distanceTo(new THREE.Vector3(0, 0.12, 0));
    const visW = 2 * dist * Math.tan(THREE.MathUtils.degToRad(this.camera.fov / 2)) * this.camera.aspect;
    const left = -visW / 2;
    const sx = left + 0.13 * visW;
    const mx = left + 0.48 * visW;
    const MS = 0.95;
    this.server.group.position.set(sx, DESK_Y, 0);
    this.server.group.scale.setScalar(0.8);
    this.db.group.position.set(sx + 0.62, DESK_Y, 0.34);
    this.monitor.position.set(mx, 0.02, 0);
    this.monitor.scale.setScalar(MS);
    this.serverLabel.position.set(sx, DESK_Y - 0.13, 0.4);
    this.browserLabel.position.set(mx, DESK_Y - 0.13, 0.4);
    this.server.group.updateMatrixWorld(true);
    this.monitor.updateMatrixWorld(true);

    // the network wire, from the server port to the back of the monitor
    const port = this.server.group.localToWorld(this.server.portLocal.clone());
    const end = new THREE.Vector3(mx - 0.66 * MS, 0.06, -0.04);
    const mid = new THREE.Vector3((port.x + end.x) / 2 + 0.06, 0.5, 0.18);
    const pts = [port, new THREE.Vector3(port.x + 0.28, port.y + 0.06, 0.16), mid, new THREE.Vector3(end.x - 0.28, end.y + 0.24, 0.12), end];
    this.curve = new THREE.CatmullRomCurve3(pts);
    const off = new THREE.Vector3(0, 0.27, 0.2);
    this.path = new THREE.CatmullRomCurve3(pts.map((p) => p.clone().add(off)));
    if (this.wire) { this.scene.remove(this.wire.mesh); this.wire.mesh.geometry.dispose(); this.wire.material.dispose(); }
    this.wire = buildWire(this.curve);
    this.scene.add(this.wire.mesh);
    this.botPark = new THREE.Vector3(mid.x - 0.4, 2.7, 0.8);
    if (!this.botBusy) this.bot.group.position.copy(this.botPark);
    this.dirty = true;
  }

  loop() {
    this.raf = requestAnimationFrame(this.loop);
    const dt = Math.min(0.05, this.clock.getDelta());
    const now = performance.now();
    this.tweens.update(now);
    const t = now / 1000;
    const s = this.state;

    this.server.gear.rotation.z -= dt * s.gearSpeed;
    this.server.meter.scale.x = Math.max(0.0001, s.cpu);
    this.server.leds.forEach((led) => {
      const v = Math.sin(t * led.userData.speed * (0.4 + s.activity * 2.2) + led.userData.phase) > 0.2 - s.activity ? 1 : 0.15;
      led.material.color.setRGB(0.36 + 0.25 * v, 0.6 + 0.22 * v, 0.72 + 0.22 * v);
    });
    if (this.wire) {
      this.wire.material.uniforms.uTime.value = t;
      this.wire.material.uniforms.uActive.value = s.flow;
      this.wire.material.uniforms.uDir.value = s.flowDir;
    }
    // the messy bundle: fragments orbit and jitter around a moving centre
    const c = this.cluster;
    if (c.active) {
      c.items.forEach((f, i) => {
        const a = t * (1.2 + (i % 5) * 0.35) + i * 2.1;
        const r = (0.09 + (i % 4) * 0.035) * c.spread;
        f.position.set(c.center.x + Math.cos(a) * r, c.center.y + Math.sin(a * 1.3) * r * 0.8, c.center.z + Math.sin(a) * r * 0.5);
      });
    }
    this.bot.group.rotation.z = Math.sin(t * 2) * 0.05;
    this.renderer.render(this.scene, this.camera);
  }

  // ------------------------------------------------------------------ helpers

  guard(token) { if (token !== this.token) throw CANCEL; }

  async step(token, i) { this.guard(token); this.onStep(this.mode, i); }

  async go(token, promise) { await promise; this.guard(token); }

  pathPoint(t) { return this.path.getPointAt(Math.min(1, Math.max(0, t))); }

  screenWorld(local = new THREE.Vector3()) { return this.screen.localToWorld(local.clone()); }

  folderWorld() { return this.folder.group.localToWorld(new THREE.Vector3(0, 0.3, 0.05)); }

  /** A point above the rack (labels for build / regeneration). */
  serverTop(lift = 0.5) { return this.server.group.localToWorld(new THREE.Vector3(0, this.server.size.H, 0.3)).add(new THREE.Vector3(0.1, lift, 0)); }

  show(s, scale = 1) { s.visible = true; s.material.opacity = 1; s.scale.copy(s.userData.baseScale).multiplyScalar(scale); }

  hide(s) { s.visible = false; }

  pop(s, { duration = 320 } = {}) {
    s.visible = true;
    s.material.opacity = 1;
    const base = s.userData.baseScale;
    return this.tweens.run({ duration, easing: ease.outCubic, onUpdate: (p) => s.scale.copy(base).multiplyScalar(0.4 + 0.6 * p) });
  }

  fadeOut(s, duration = 260) {
    const from = s.material.opacity;
    const token = this.token;
    return this.tweens.run({ duration, onUpdate: (p) => { s.material.opacity = from * (1 - p); } })
      .then(() => { if (token === this.token) { s.visible = false; s.material.opacity = 1; } });
  }

  travel(obj, t0, t1, duration, easing = ease.inOutCubic) {
    this.state.flowDir = t1 >= t0 ? 1 : -1;
    this.state.flow = 1;
    return this.tweens.run({ duration, easing, onUpdate: (p) => obj.position.copy(this.pathPoint(t0 + (t1 - t0) * p)) })
      .then(() => { this.state.flow = 0; });
  }

  moveTo(obj, to, duration, easing = ease.inOutCubic) {
    const from = obj.position.clone();
    return this.tweens.run({ duration, easing, onUpdate: (p) => obj.position.lerpVectors(from, to, p) });
  }

  /** Card dives into the monitor screen and disappears. */
  async intoScreen(token, s) {
    const from = s.position.clone();
    const to = this.screenWorld(new THREE.Vector3(0, 0, 0.05));
    const base = s.userData.baseScale.clone();
    await this.go(token, this.tweens.run({ duration: 420, easing: ease.inOutCubic, onUpdate: (p) => {
      s.position.lerpVectors(from, to, p);
      s.scale.copy(base).multiplyScalar(1 - 0.75 * p);
      s.material.opacity = 1 - p;
    } }));
    s.visible = false;
    s.material.opacity = 1;
  }

  setActivity(level, cpu = this.state.cpu, gear = 0) {
    return this.tweens.to(this.state, { activity: level, cpu, gearSpeed: gear }, { duration: 400, key: 'server' });
  }

  async request(token, pill = this.pills.req, duration = 900) {
    pill.position.copy(this.pathPoint(1));
    await this.go(token, this.pop(pill, { duration: 200 }));
    await this.go(token, this.travel(pill, 1, 0, duration));
    await this.go(token, this.fadeOut(pill, 160));
  }

  /** SEO bot flies to the card, scans it, gives a verdict, leaves. */
  async crawl(token, card, verdict, quick = false) {
    this.botBusy = true;
    const g = this.bot.group;
    const at = card.position.clone();
    const a = at.clone().add(new THREE.Vector3(-0.13, 0.04, 0.3));
    const b = at.clone().add(new THREE.Vector3(0.13, -0.06, 0.3));
    await this.go(token, this.moveTo(g, a, quick ? 450 : 700, ease.outCubic));
    await this.go(token, this.moveTo(g, b, quick ? 450 : 750));
    await this.go(token, this.moveTo(g, a.clone().add(new THREE.Vector3(0.05, -0.08, 0)), quick ? 300 : 450));
    const v = this.verdicts[verdict];
    const vw = v.userData.baseScale.x;
    v.position.copy(at.clone().add(new THREE.Vector3(0.24 + vw / 2, 0.04, 0.3)));
    await this.go(token, this.pop(v, { duration: 300 }));
    if (verdict === 'low') {
      const x0 = v.position.x;
      await this.go(token, this.tweens.run({ duration: 420, onUpdate: (p) => { v.position.x = x0 + Math.sin(p * Math.PI * 6) * 0.03 * (1 - p); } }));
    }
    await this.go(token, wait(quick ? 900 : 1600));
    await this.go(token, Promise.all([this.fadeOut(v, 300), this.moveTo(g, this.botPark, 600, ease.inOutCubic)]));
    this.botBusy = false;
  }

  /** Fragments orbit as a messy cluster while the cluster centre moves along the wire. */
  async sendCluster(token, items, label, duration) {
    const c = this.cluster;
    c.items = items;
    c.spread = 1;
    c.center.copy(this.folderWorld());
    items.forEach((f) => this.show(f));
    label.visible = true;
    c.active = true;
    const follow = () => label.position.copy(c.center).add(new THREE.Vector3(0, 0.22, 0));
    follow();
    await this.go(token, this.tweens.run({ duration: 420, onUpdate: (p) => { c.center.lerpVectors(this.folderWorld(), this.pathPoint(0), p); follow(); } }));
    this.state.flow = 1;
    this.state.flowDir = 1;
    await this.go(token, this.tweens.run({ duration, easing: ease.inOutCubic, onUpdate: (p) => { c.center.copy(this.pathPoint(p)); follow(); } }));
    this.state.flow = 0;
    label.visible = false;
    c.active = false;
  }

  /** The bundle bursts; every fragment flies to a block of the page, which then appears. */
  async assemble(token) {
    const order = ['header', 'footer', 'hline', 'crumb', 'image', 'title', 'rating', 'desc', 'price', 'stepper', 'button', 'panel'];
    const frags = this.bundle;
    this.tweens.run({ duration: 600, onUpdate: (p) => { if (token === this.token) this.base.material.color.lerpColors(WHITE, PAGE_BG, p); } });
    const jobs = order.map((name, i) => (async () => {
      await wait(i * 110);
      if (token !== this.token) return;
      const block = this.blocks.find((b) => b.userData.name === name);
      const f = frags[i % frags.length];
      const from = f.position.clone();
      const to = this.screenWorld(block.userData.local.clone().setZ(0.06));
      await this.tweens.run({ duration: 420, easing: ease.inOutCubic, onUpdate: (p) => {
        f.position.lerpVectors(from, to, p);
        f.material.opacity = 1 - p * 0.9;
      } });
      if (token !== this.token) return;
      f.visible = false;
      await this.tweens.run({ duration: 260, easing: ease.outCubic, onUpdate: (p) => { block.material.opacity = p; block.scale.setScalar(0.6 + 0.4 * p); } });
    })());
    frags.slice(order.length).forEach((f) => this.fadeOut(f, 300));
    await this.go(token, Promise.all(jobs));
  }

  /** Hydration: a small bundle sweeps across the visible page and makes it interactive. */
  async hydration(token, duration = 900) {
    await this.go(token, this.sendCluster(token, this.hydrate, this.hydrateLabel, duration));
    this.hydrate.forEach((f) => this.fadeOut(f, 300));
    this.sweep.material.opacity = 1;
    await this.go(token, this.tweens.run({ duration: 700, easing: ease.inOutCubic, onUpdate: (p) => {
      this.sweep.position.x = -SW / 2 + 0.15 + (SW - 0.3) * p;
      this.veil.material.opacity = Math.min(this.veil.material.opacity, 1 - p);
    } }));
    this.sweep.material.opacity = 0;
    this.veil.material.opacity = 0;
  }

  showPage(duration = 500) {
    return this.tweens.run({ duration, onUpdate: (p) => { this.page.material.opacity = p; } });
  }

  /** npm run build: pages pop out of the server and file into dist/. */
  async build(token, names, withTimer = false) {
    const lab = this.pills.build;
    lab.position.copy(this.serverTop(0.55));
    await this.go(token, this.pop(lab));
    await this.go(token, this.setActivity(1, 0.55, 7));
    const gearWorld = this.server.group.localToWorld(new THREE.Vector3(-0.17, 1.25, 0.4));
    for (const name of names) {
      const card = this.fileCard(name);
      card.position.copy(gearWorld);
      card.scale.setScalar(0.3);
      this.scene.add(card);
      const target = this.folderWorld().add(new THREE.Vector3(0, 0.05, 0.05));
      const from = card.position.clone();
      await this.go(token, this.tweens.run({ duration: 300, easing: ease.inOutCubic, onUpdate: (p) => {
        card.position.lerpVectors(from, target, p);
        card.position.y += Math.sin(p * Math.PI) * 0.25;
        card.scale.setScalar(0.3 + 0.7 * p);
      } }));
      this.scene.remove(card);
      card.geometry.dispose();
      card.material.dispose();
      this.addFile(name);
    }
    await this.go(token, this.setActivity(0.15, 0, 0));
    if (withTimer) {
      this.timer.draw(0, '60s');
      this.timerSprite.position.copy(this.folderWorld()).add(new THREE.Vector3(-0.42, 0.04, 0.2));
      await this.go(token, this.pop(this.timerSprite));
    }
    await this.go(token, this.fadeOut(lab));
  }

  /** A prebuilt file leaves dist/ and becomes the HTML card on the wire. */
  async serveFile(token, duration = 500) {
    const card = this.cards.full;
    card.position.copy(this.folderWorld());
    await this.go(token, this.pop(card, { duration: 200 }));
    await this.go(token, this.moveTo(card, this.pathPoint(0), 220));
    return this.travel(card, 0, 0.5, duration, ease.outCubic);
  }

  // ------------------------------------------------------------------ modes

  reset() {
    const s = this.state;
    Object.assign(s, { gearSpeed: 0, activity: 0.15, cpu: 0, flow: 0, flowDir: 1 });
    this.cluster.active = false;
    [...Object.values(this.cards), ...Object.values(this.pills), ...Object.values(this.verdicts), ...Object.values(this.tags),
      this.timerSprite, ...this.bundle, ...this.hydrate, this.bundleLabel, this.hydrateLabel].forEach((x) => {
      x.visible = false;
      x.material.opacity = 1;
      if (x.userData.baseScale) x.scale.copy(x.userData.baseScale);
    });
    this.scene.children.filter((o) => o.userData?.name && o.isMesh).forEach((o) => { this.scene.remove(o); o.geometry.dispose(); o.material.dispose(); });
    this.base.material.color.copy(WHITE);
    this.blocks.forEach((b) => { b.material.opacity = 0; b.scale.setScalar(1); });
    this.page.material.opacity = 0;
    this.patches.forEach((m) => { m.material.opacity = 0; });
    this.veil.material.opacity = 0;
    this.sweep.material.opacity = 0;
    this.botBusy = false;
    if (this.botPark) this.bot.group.position.copy(this.botPark);
  }

  play(index) {
    const token = ++this.token;
    this.tweens.clear();
    this.mode = index;
    this.reset();
    this.onMode(index);
    const run = [this.csr, this.ssr, this.ssg, this.isr][index].bind(this);
    run(token).then(() => { if (token === this.token) this.onDone(index); }).catch((e) => { if (e !== CANCEL) console.error(e); });
  }

  next() {
    if (this.mode >= MODES.length - 1) return false;
    this.play(this.mode + 1);
    return true;
  }

  replay() { this.play(this.mode); }

  async csr(t) {
    this.setFolder(['index.html', 'assets/index.js']);
    await this.step(t, 0);
    await this.request(t);
    await this.step(t, 1);
    await this.go(t, this.setActivity(0.6));
    const card = this.cards.empty;
    card.position.copy(this.folderWorld());
    await this.go(t, this.pop(card));
    await this.go(t, this.moveTo(card, this.pathPoint(0), 300));
    await this.go(t, this.travel(card, 0, 0.5, 900, ease.outCubic));
    this.setActivity(0.15);
    await this.step(t, 2);
    await this.crawl(t, card, 'low');
    await this.go(t, this.travel(card, 0.5, 1, 600, ease.inCubic || ease.inOutCubic));
    await this.intoScreen(t, card);
    await this.step(t, 3);
    await this.go(t, wait(300));
    await this.sendCluster(t, this.bundle, this.bundleLabel, 1700);
    await this.step(t, 4);
    await this.assemble(t);
    await this.step(t, 5);
    await this.request(t, this.pills.api, 700);
    const json = this.cards.json;
    json.position.copy(this.db.group.position).add(new THREE.Vector3(0, this.db.top + 0.25, 0));
    await this.go(t, this.pop(json));
    await this.go(t, this.moveTo(json, this.pathPoint(0), 450));
    await this.go(t, this.travel(json, 0, 1, 900));
    await this.intoScreen(t, json);
    await this.step(t, 6);
    await this.go(t, this.showPage(600));
  }

  async ssr(t) {
    this.setFolder(['server.js', 'assets/client.js']);
    await this.step(t, 0);
    await this.request(t);
    await this.step(t, 1);
    await this.go(t, this.setActivity(1, 0.45, 7));
    const json = this.cards.json;
    json.position.copy(this.db.group.position).add(new THREE.Vector3(0, this.db.top + 0.25, 0));
    await this.go(t, this.pop(json));
    await this.go(t, this.moveTo(json, this.server.group.localToWorld(new THREE.Vector3(0.1, 1.0, 0.35)), 600));
    await this.go(t, this.fadeOut(json, 200));
    await this.go(t, wait(500));
    await this.step(t, 2);
    const card = this.cards.full;
    card.position.copy(this.server.group.localToWorld(new THREE.Vector3(-0.17, 1.25, 0.45)));
    await this.go(t, this.pop(card));
    this.setActivity(0.3, 0.45, 0);
    await this.go(t, this.moveTo(card, this.pathPoint(0), 300));
    await this.go(t, this.travel(card, 0, 0.5, 800, ease.outCubic));
    await this.step(t, 3);
    await this.crawl(t, card, 'high');
    await this.go(t, this.travel(card, 0.5, 1, 500));
    await this.intoScreen(t, card);
    await this.step(t, 4);
    this.page.material.opacity = 1;
    this.veil.material.opacity = 1;
    await this.go(t, wait(700));
    await this.hydration(t, 900);
    await this.step(t, 5);
    await this.request(t, this.pills.req, 600);
    await this.go(t, this.setActivity(1, 0.92, 9));
    await this.go(t, wait(700));
    card.position.copy(this.server.group.localToWorld(new THREE.Vector3(-0.17, 1.25, 0.45)));
    await this.go(t, this.pop(card, { duration: 200 }));
    await this.go(t, this.moveTo(card, this.pathPoint(0), 220));
    await this.go(t, this.travel(card, 0, 1, 700));
    await this.intoScreen(t, card);
    await this.go(t, this.setActivity(0.3, 0.92, 0));
  }

  async ssg(t) {
    this.setFolder([]);
    await this.step(t, 0);
    await this.build(t, ['index.html', 'menu.html', 'product/34.html', 'cart.html', 'login.html', 'register.html']);
    await this.step(t, 1);
    const lab = this.folderLabel;
    await this.go(t, this.tweens.run({ duration: 700, onUpdate: (p) => lab.scale.copy(lab.userData.baseScale).multiplyScalar(1 + Math.sin(p * Math.PI) * 0.35) }));
    await this.step(t, 2);
    await this.request(t, this.pills.req, 600);
    const card = this.cards.full;
    await this.go(t, this.serveFile(t, 420));
    await this.step(t, 3);
    await this.crawl(t, card, 'high', true);
    await this.go(t, this.travel(card, 0.5, 1, 400));
    await this.intoScreen(t, card);
    this.page.material.opacity = 1;
    this.veil.material.opacity = 0.8;
    await this.hydration(t, 600);
    await this.step(t, 4);
    this.tags.db.position.copy(this.db.group.position).add(new THREE.Vector3(0.52, this.db.top * 0.6, 0.25));
    await this.go(t, this.pop(this.tags.db));
    await this.go(t, wait(500));
    this.tags.pageStale.position.copy(this.screenWorld(new THREE.Vector3(0.45, 0.58, 0.1)));
    await this.go(t, this.pop(this.tags.pageStale));
  }

  async isr(t) {
    this.setFolder([]);
    await this.step(t, 0);
    await this.build(t, ['index.html', 'menu.html', 'product/34.html', 'cart.html'], true);
    await this.step(t, 1);
    await this.request(t, this.pills.req, 600);
    const card = this.cards.full;
    await this.go(t, this.serveFile(t, 420));
    await this.crawl(t, card, 'high', true);
    await this.go(t, this.travel(card, 0.5, 1, 400));
    await this.intoScreen(t, card);
    this.page.material.opacity = 1;
    this.veil.material.opacity = 0.8;
    await this.hydration(t, 600);
    await this.step(t, 2);
    await this.go(t, this.tweens.run({ duration: 1600, easing: ease.linear, onUpdate: (p) => this.timer.draw(p, `${Math.ceil(60 * (1 - p))}s`) }));
    this.timer.draw(1, '0s');
    this.tags.db.position.copy(this.db.group.position).add(new THREE.Vector3(0.52, this.db.top * 0.6, 0.25));
    await this.go(t, this.pop(this.tags.db));
    await this.step(t, 3);
    const v2 = this.pills.visitor2;
    v2.position.copy(this.screenWorld(new THREE.Vector3(-0.35, 0.6, 0.1)));
    await this.go(t, this.pop(v2));
    await this.request(t, this.pills.req, 550);
    await this.go(t, this.serveFile(t, 320));
    await this.go(t, this.travel(card, 0.5, 1, 320));
    await this.intoScreen(t, card);
    this.tags.pageStale.position.copy(this.screenWorld(new THREE.Vector3(0.45, 0.58, 0.1)));
    this.pop(this.tags.pageStale);
    const regen = this.pills.regen;
    regen.position.copy(this.serverTop(0.55));
    await this.go(t, this.pop(regen));
    await this.go(t, this.setActivity(1, 0.3, 7));
    const product = this.folder.files.children.find((c) => c.userData.name === 'product/34.html');
    if (product) {
      await this.go(t, this.tweens.run({ duration: 700, onUpdate: (p) => { product.material.opacity = 1 - Math.sin(p * Math.PI) * 0.8; } }));
    }
    this.timer.draw(0, '60s');
    await this.go(t, this.setActivity(0.15, 0, 0));
    await this.go(t, this.fadeOut(regen));
    await this.step(t, 4);
    this.hide(this.tags.pageStale);
    await this.go(t, this.fadeOut(v2, 200));
    await this.request(t, this.pills.req, 550);
    await this.go(t, this.serveFile(t, 320));
    await this.go(t, this.travel(card, 0.5, 1, 320));
    await this.intoScreen(t, card);
    await this.go(t, this.tweens.run({ duration: 380, easing: ease.outCubic, onUpdate: (p) => this.patches.forEach((m) => { m.material.opacity = p; m.scale.setScalar(1.25 - 0.25 * p); }) }));
    this.tags.pageFresh.position.copy(this.screenWorld(new THREE.Vector3(0.45, 0.58, 0.1)));
    await this.go(t, this.pop(this.tags.pageFresh));
  }

  // ------------------------------------------------------------------ teardown

  unmount() {
    this.token += 1;
    cancelAnimationFrame(this.raf);
    this.ro?.disconnect();
    this.tweens.clear();
    this.scene?.traverse((o) => {
      o.geometry?.dispose();
      const mats = Array.isArray(o.material) ? o.material : o.material ? [o.material] : [];
      mats.forEach((m) => m.dispose());
    });
    this.disposables.forEach((t) => t.dispose());
    this.scene?.traverse((o) => { if (o.userData?.labelTexture) o.userData.labelTexture.dispose(); });
    this.textures?.dispose();
    this.shadowTex?.dispose();
    this.envRT?.dispose();
    if (this.renderer) {
      this.renderer.dispose();
      this.renderer.forceContextLoss();
      this.renderer.domElement.remove();
    }
    this.scene = null;
  }
}
