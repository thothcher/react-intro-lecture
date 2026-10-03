// The centrepiece: two monitors that show WHY client-side routing and components matter.
//
//  Step A  VANILLA monitor (left half). A strip of full pages; a nav click slides the WHOLE
//          strip, so header + main + footer are replaced and the header is built again.
//  Step B  REACT monitor (right half). Header and footer are fixed; only <main> is a strip.
//  Step C  "Side view" rotates a monitor ~70° to show what is behind the screen:
//          vanilla = 10 HTML files, each with its own copy of the header (10 edits);
//          React   = one <Header /> with beams to every route (1 edit, all pages update).
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { buildMonitorModel, SCREEN, DESK_Y } from './monitor.js';
import { createPageMaterial, createBeamMaterial } from './pageMaterial.js';
import { loadTextures, labelTexture, contactShadowTexture, glareTexture, META, STRIP, PAGES } from './assets.js';
import { Tweens, ease, wait } from './tween.js';

const DEG = Math.PI / 180;
const SW = SCREEN.w;
const SH = SCREEN.h;
const STEP = SW + 0.16;                      // spacing of pages on the strip
const SIDE_ANGLE = 70 * DEG;
const PX = { w: META.vanilla.width, h: META.vanilla.height };
const HEADER_PX = META.vanilla.headerH;      // 67
const FOOTER_PX = META.vanilla.footerH;      // 65
const MAIN_PX = PX.h - HEADER_PX - FOOTER_PX;
const HEADER_FRAC = HEADER_PX / PX.h;
const STACK = { scale: 0.74, start: -0.26, gap: 0.112, y: 0.07 };
const SIDE_SHIFT = 0.22;                    // monitors move outward a little in side view
const CAM = {
  front: { x: 0, y: 0.26, z: 5.5, tx: 0, ty: -0.1, tz: 0 },
  both: { x: 0, y: 1.3, z: 6.8, tx: 0, ty: -0.06, tz: -0.55 },
  intro: { z: 6.4 },
};
const EDITED_LABEL = new THREE.Color('#F2D9D3');
const WHITE = new THREE.Color('#FFFFFF');
const LINK_TARGET = { home: 'home', menu: 'menu', cart: 'cart', profile: 'profile' };

export class MonitorScene {
  /** @param {HTMLElement} container  @param {{onState?: Function}} opts */
  constructor(container, { onState } = {}) {
    this.container = container;
    this.onState = onState || (() => {});
    this.tweens = new Tweens();
    this.step = 'A';
    this.dirty = true;
    this.monitors = {};
    this.labels = [];
    this.layoutState = { x: 1.5, scale: 1 };
    this.cam = { ...CAM.front, z: CAM.intro.z };
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
    renderer.toneMappingExposure = 1.0;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.VSMShadowMap;
    renderer.setClearColor(0x000000, 0);
    renderer.domElement.className = 'mon-gl';
    this.container.appendChild(renderer.domElement);
    this.renderer = renderer;

    const scene = new THREE.Scene();
    this.scene = scene;
    const pmrem = new THREE.PMREMGenerator(renderer);
    this.envRT = pmrem.fromScene(new RoomEnvironment(), 0.04);
    pmrem.dispose();
    scene.environment = this.envRT.texture;
    scene.environmentIntensity = 0.8;

    this.camera = new THREE.PerspectiveCamera(30, 16 / 9, 0.1, 60);

    // soft studio lighting: one key light with soft shadows + gentle fill
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

    this.textures = loadTextures(renderer);
    this.shadowTex = contactShadowTexture();
    this.glareTex = glareTexture();
    this.geo = {
      page: new THREE.PlaneGeometry(SW, SH),
      main: new THREE.PlaneGeometry(SW, SH * MAIN_PX / PX.h),
      header: new THREE.PlaneGeometry(SW, SH * HEADER_FRAC),
      footer: new THREE.PlaneGeometry(SW, SH * FOOTER_PX / PX.h),
      stack: new THREE.PlaneGeometry(SW * STACK.scale, SH * STACK.scale),
      beam: new THREE.CylinderGeometry(0.0032, 0.0032, 1, 6, 1, true).translate(0, 0.5, 0),
      outline: new THREE.EdgesGeometry(new THREE.PlaneGeometry(1, 1)),
      quad: new THREE.PlaneGeometry(1, 1),
    };

    try { await document.fonts.load('500 26px "JetBrains Mono"'); } catch { /* labels fall back to monospace */ }

    this.monitors.vanilla = this.createMonitor('vanilla');
    this.monitors.react = this.createMonitor('react');
    this.monitors.react.root.visible = false;
    await this.textures.ready();

    // interaction
    this.raycaster = new THREE.Raycaster();
    this.pointer = new THREE.Vector2();
    this.onMove = (e) => this.handlePointer(e, false);
    this.onClick = (e) => this.handlePointer(e, true);
    this.onLeave = () => this.setHover(null);
    renderer.domElement.addEventListener('pointermove', this.onMove);
    renderer.domElement.addEventListener('click', this.onClick);
    renderer.domElement.addEventListener('pointerleave', this.onLeave);

    this.ro = new ResizeObserver(() => this.resize());
    this.ro.observe(this.container);
    this.resize();

    this.loop = this.loop.bind(this);
    this.raf = requestAnimationFrame(this.loop);

    // gentle dolly-in on entry
    this.tweens.to(this.cam, { z: CAM.front.z }, { duration: 1200, easing: ease.outQuint, key: 'cam' });
    this.emit('vanilla');
    this.emit('react');
  }

  // ------------------------------------------------------------------ monitors

  createMonitor(kind) {
    const isReact = kind === 'react';
    const root = new THREE.Group();
    root.name = `monitor-${kind}`;
    const model = buildMonitorModel(this.shadowTex);
    root.add(model.group);

    const screen = new THREE.Group();
    root.add(screen);
    const strip = new THREE.Group();
    strip.position.z = 0.002;
    screen.add(strip);

    const tex = (name) => this.textures.get(kind, name);
    const headerAbout = tex('header-about');

    // ---- the strip (front view)
    const pages = STRIP.map((key, i) => {
      const mat = isReact
        ? createPageMaterial({ map: tex(`main-${key}`), fade: true })
        : createPageMaterial({ map: tex(key), mode: 1, headerB: headerAbout, fade: true });
      const mesh = new THREE.Mesh(isReact ? this.geo.main : this.geo.page, mat);
      mesh.position.x = i * STEP;
      if (isReact) mesh.position.y = SH / 2 - SH * HEADER_FRAC - (SH * MAIN_PX / PX.h) / 2;
      mesh.userData = { kind, key, part: isReact ? 'main' : 'page', index: i };
      strip.add(mesh);
      return mesh;
    });

    // ---- React: header + footer never move
    let header = null;
    let footer = null;
    if (isReact) {
      header = new THREE.Mesh(this.geo.header, createPageMaterial({
        map: tex('home'), crop: [0, 1 - HEADER_FRAC, 1, HEADER_FRAC],
      }));
      header.position.set(0, SH / 2 - (SH * HEADER_FRAC) / 2, 0.0025);
      header.userData = { kind, part: 'header' };
      footer = new THREE.Mesh(this.geo.footer, createPageMaterial({ map: tex('footer') }));
      footer.position.set(0, -SH / 2 + (SH * FOOTER_PX / PX.h) / 2, 0.0025);
      screen.add(header, footer);
    }

    // ---- vanilla: accent bar that sweeps the header after every full page load
    const wipe = new THREE.Mesh(
      new THREE.PlaneGeometry(SW, 0.006).translate(SW / 2, 0, 0),
      new THREE.MeshBasicMaterial({ color: 0xa4483a, transparent: true, opacity: 0, toneMapped: false, depthWrite: false }),
    );
    wipe.position.set(-SW / 2, SH / 2 - SH * HEADER_FRAC + 0.003, 0.0036);
    wipe.scale.x = 0.0001;
    screen.add(wipe);

    // ---- faint diagonal glare on the glass (sells the "real screen")
    const glare = new THREE.Mesh(this.geo.page, new THREE.MeshBasicMaterial({
      map: this.glareTex, transparent: true, opacity: 0.55, depthWrite: false, toneMapped: false,
    }));
    glare.position.z = 0.0042;
    screen.add(glare);

    // ---- hover outline for clickable areas
    const hover = new THREE.Group();
    const hoverLine = new THREE.LineSegments(this.geo.outline, new THREE.LineBasicMaterial({ color: 0xa4483a, toneMapped: false }));
    const hoverFill = new THREE.Mesh(this.geo.quad, new THREE.MeshBasicMaterial({ color: 0xa4483a, transparent: true, opacity: 0.14, toneMapped: false, depthWrite: false }));
    hover.add(hoverFill, hoverLine);
    hover.position.z = 0.004;
    hover.visible = false;
    screen.add(hover);

    // ---- behind the screen (side view)
    const behind = new THREE.Group();
    behind.visible = false;
    root.add(behind);
    const stackW = SW * STACK.scale;
    const stackH = SH * STACK.scale;
    const planes = PAGES.map((p, i) => {
      const mat = isReact
        ? createPageMaterial({ map: tex(p.key), mode: 2, headerA: tex('header'), headerB: headerAbout })
        : createPageMaterial({ map: tex(p.key), mode: 1, headerB: headerAbout });
      mat.uniforms.uOpacity.value = 0;
      const mesh = new THREE.Mesh(this.geo.stack, mat);
      const z = STACK.start - i * STACK.gap;
      mesh.position.set(0, STACK.y, z);
      behind.add(mesh);

      const lab = labelTexture(isReact ? p.route : p.file, { style: isReact ? 'route' : 'file' });
      this.labels.push(lab.texture);
      const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: lab.texture, transparent: true, depthTest: false, depthWrite: false, toneMapped: false, opacity: 0 }));
      const h = 0.05;
      sprite.scale.set(h * lab.aspect, h, 1);
      sprite.center.set(0, 0);
      sprite.position.set(-stackW / 2, STACK.y + stackH / 2 + 0.018 + (i % 3) * 0.062, z);
      sprite.renderOrder = 10;
      behind.add(sprite);
      return { mesh, mat, sprite, z };
    });

    // React: ONE source node with beams to every page's header slot
    let node = null;
    let beams = [];
    if (isReact) {
      const nodePos = new THREE.Vector3(0, STACK.y + stackH / 2 + 0.5, STACK.start - 4.5 * STACK.gap);
      node = new THREE.Group();
      node.position.copy(nodePos);
      const box = new THREE.Mesh(
        new THREE.BoxGeometry(0.34, 0.085, 0.05),
        new THREE.MeshPhysicalMaterial({ color: 0x0b1b3a, roughness: 0.35, metalness: 0.2, clearcoat: 0.6, emissive: 0xa4483a, emissiveIntensity: 0 }),
      );
      node.add(box);
      const lab = labelTexture('<Header />', { style: 'node', sub: 'components/Layout.jsx' });
      this.labels.push(lab.texture);
      const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: lab.texture, transparent: true, depthTest: false, depthWrite: false, toneMapped: false, opacity: 0 }));
      const h = 0.1;
      sprite.scale.set(h * lab.aspect, h, 1);
      sprite.center.set(0.5, 0);
      sprite.position.set(0, 0.07, 0);
      sprite.renderOrder = 11;
      node.add(sprite);
      node.userData = { box, sprite };
      behind.add(node);

      const from = nodePos.clone().add(new THREE.Vector3(0, -0.0425, 0));
      beams = planes.map((pl) => {
        const to = new THREE.Vector3(0, STACK.y + stackH / 2 - (stackH * HEADER_FRAC) / 2, pl.z);
        const dir = to.clone().sub(from);
        const beam = new THREE.Mesh(this.geo.beam, createBeamMaterial());
        beam.position.copy(from);
        beam.scale.set(1, dir.length(), 1);
        beam.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.normalize());
        beam.renderOrder = 5;
        behind.add(beam);
        return beam;
      });
    }

    this.scene.add(root);

    return {
      kind, isReact, root, model, screen, strip, pages, header, footer, wipe, hover, behind, planes, node, beams,
      index: 0, side: false, busy: false, edited: false, edits: 0, rebuilds: 1,
      a: {
        appear: isReact ? 0 : 1,
        stripX: 0,
        sideT: 0,
        stackVis: 0,
        planeVis: PAGES.map(() => 0),
        planePulse: PAGES.map(() => 0),
        planeNew: PAGES.map(() => 0),
        planeDone: PAGES.map(() => 0),
        pageNew: STRIP.map(() => 0),
        slot: 0,
        beamDraw: 0,
        beamPulse: -1,
        nodePulse: 0,
        wipeP: 0,
        wipeO: 0,
      },
    };
  }

  /** Push animated numbers into transforms and uniforms. Cheap; runs every rendered frame. */
  apply() {
    const sideAny = Object.values(this.monitors).some((m) => m.a.sideT > 0.001);
    for (const m of Object.values(this.monitors)) {
      const { a } = m;
      const sign = m.isReact ? 1 : -1; // rotate so the "behind" area opens towards the slide centre
      m.root.position.set(sign * (this.layoutState.x + a.sideT * SIDE_SHIFT), (1 - a.appear) * -0.14, 0);
      m.root.scale.setScalar(this.layoutState.scale);
      m.root.rotation.y = sign * a.sideT * SIDE_ANGLE;
      m.model.setOpacity(a.appear);

      m.strip.position.x = a.stripX;
      m.pages.forEach((mesh, i) => {
        const u = mesh.material.uniforms;
        u.uOffsetX.value = mesh.position.x + a.stripX;
        const neighbourVis = i === m.index ? 1 : 1 - a.sideT;
        u.uOpacity.value = a.appear * neighbourVis;
        u.uNew.value = a.pageNew[i];
      });
      if (m.header) m.header.material.uniforms.uOpacity.value = a.appear;
      if (m.footer) m.footer.material.uniforms.uOpacity.value = a.appear;

      m.wipe.scale.x = Math.max(0.0001, a.wipeP);
      m.wipe.material.opacity = a.wipeO;

      m.behind.visible = a.stackVis > 0.001;
      m.planes.forEach((pl, i) => {
        const vis = a.stackVis * a.planeVis[i];
        const u = pl.mat.uniforms;
        u.uOpacity.value = vis;
        u.uPulse.value = a.planePulse[i];
        u.uNew.value = a.planeNew[i];
        u.uSlot.value = a.slot;
        pl.sprite.material.opacity = vis;
        pl.sprite.material.color.copy(WHITE).lerp(EDITED_LABEL, a.planeDone[i]);
      });
      if (m.node) {
        const s = 1 + a.nodePulse * 0.12;
        m.node.scale.setScalar(s);
        m.node.userData.box.material.emissiveIntensity = a.nodePulse * 1.4;
        m.node.userData.sprite.material.opacity = a.stackVis;
        m.beams.forEach((b) => {
          b.material.uniforms.uDraw.value = a.beamDraw;
          b.material.uniforms.uPulse.value = a.beamPulse;
          b.material.uniforms.uOpacity.value = a.stackVis;
        });
      }
    }

    const c = this.cam;
    this.camera.position.set(c.x, c.y, c.z);
    this.camera.lookAt(c.tx, c.ty, c.tz);
    this.sideAny = sideAny;
  }

  loop(now) {
    this.raf = requestAnimationFrame(this.loop);
    const animating = this.tweens.active;
    this.tweens.update(now);
    if (!animating && !this.dirty) return;
    this.apply();
    this.renderer.shadowMap.needsUpdate = true;
    this.renderer.render(this.scene, this.camera);
    this.dirty = false;
  }

  invalidate() { this.dirty = true; }

  resize() {
    const { clientWidth: w, clientHeight: h } = this.container;
    if (!w || !h) return;
    this.renderer.setSize(w, h, false);
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    // place each monitor at the centre of its half of the slide
    const dist = Math.hypot(CAM.front.z, CAM.front.y - CAM.front.ty);
    const visH = 2 * dist * Math.tan((this.camera.fov * DEG) / 2);
    const visW = visH * this.camera.aspect;
    const half = visW / 2;
    this.layoutState.x = visW / 4;
    this.layoutState.scale = Math.min(1, (half * 0.66) / (SW + 0.03));
    this.invalidate();
  }

  // ------------------------------------------------------------------ public API

  /** Advance the slide's internal step. Returns true if it consumed the "next" action. */
  next() {
    if (this.step !== 'A') return false;
    this.step = 'B';
    const m = this.monitors.react;
    m.root.visible = true;
    this.tweens.to(m.a, { appear: 1 }, { duration: 650, easing: ease.outCubic, key: 'react-appear' });
    this.emit('react');
    return true;
  }

  /** Navigate a monitor to a strip page ('home' | 'menu' | 'product' | 'cart' | 'profile'). */
  async goTo(kind, key) {
    const m = this.monitors[kind];
    const i = STRIP.indexOf(key);
    if (!m || i < 0 || m.side || m.busy || i === m.index || m.a.appear < 0.99) return;
    m.busy = true;
    this.setHover(null);
    m.index = i;
    if (m.isReact) this.setReactHeader(m, key); // active link updates in place; nothing moves
    this.emit(kind);
    await this.tweens.to(m.a, { stripX: -i * STEP }, { duration: m.isReact ? 480 : 600, easing: ease.inOutCubic, key: `${kind}-strip` });
    if (!m.isReact) {
      // full page load: the header was built from scratch again
      m.rebuilds += 1;
      this.emit(kind);
      m.a.wipeO = 1;
      await this.tweens.to(m.a, { wipeP: 1 }, { duration: 320, easing: ease.outCubic });
      await this.tweens.to(m.a, { wipeO: 0 }, { duration: 260, easing: ease.outCubic });
      m.a.wipeP = 0;
    }
    m.busy = false;
    this.emit(kind);
  }

  setReactHeader(m, key) {
    const u = m.header.material.uniforms;
    if (m.edited) {
      u.map.value = this.textures.get('react', 'header-about');
      u.uCrop.value.set(0, 0, 1, 1);
    } else {
      u.map.value = this.textures.get('react', key);
      u.uCrop.value.set(0, 1 - HEADER_FRAC, 1, HEADER_FRAC);
    }
    this.invalidate();
  }

  async toggleSide(kind) {
    const m = this.monitors[kind];
    if (!m || m.busy || m.a.appear < 0.99) return;
    m.busy = true;
    this.setHover(null);
    m.side = !m.side;
    this.emit(kind);
    this.updateCamera();
    const { a } = m;

    if (m.side) {
      await this.tweens.to(a, { sideT: 1 }, { duration: 750, easing: ease.inOutCubic, key: `${kind}-side` });
      a.stackVis = 1;
      if (m.isReact) {
        // pages appear, then <Header /> sends its beams and fills every header slot at once
        await this.tweens.run({ duration: 320, onUpdate: (p) => { a.planeVis.fill(p); } });
        await this.tweens.to(a, { beamDraw: 1 }, { duration: 480, easing: ease.outCubic });
        await this.tweens.to(a, { slot: 1 }, { duration: 300, easing: ease.outCubic });
      } else {
        // the stack of files builds up one by one
        await Promise.all(a.planeVis.map((_, i) => this.tweens.run({
          delay: i * 55, duration: 260, onUpdate: (p) => { a.planeVis[i] = p; },
        })));
      }
    } else {
      await this.tweens.to(a, { stackVis: 0 }, { duration: 240, easing: ease.outCubic });
      a.planeVis.fill(0);
      a.beamDraw = 0;
      a.slot = 0;
      await this.tweens.to(a, { sideT: 0 }, { duration: 650, easing: ease.inOutCubic, key: `${kind}-side` });
    }
    m.busy = false;
    this.emit(kind);
  }

  /** Add the "About" link to the header: 10 edits in vanilla, 1 edit in React. Calling again resets. */
  async editHeader(kind) {
    const m = this.monitors[kind];
    if (!m || m.busy || !m.side) return;
    const { a } = m;
    if (m.edited) {
      m.edited = false;
      m.edits = 0;
      a.planeNew.fill(0);
      a.pageNew.fill(0);
      a.planePulse.fill(0);
      a.planeDone.fill(0);
      if (m.isReact) this.setReactHeader(m, STRIP[m.index]);
      this.emit(kind);
      this.invalidate();
      return;
    }
    m.busy = true;
    m.edited = true;
    this.emit(kind);

    if (!m.isReact) {
      // one file at a time — the same edit, ten times
      const jobs = PAGES.map((p, i) => (async () => {
        await wait(i * 240);
        await this.tweens.run({ duration: 170, onUpdate: (t) => { a.planePulse[i] = t; } });
        a.planeNew[i] = 1;
        a.planeDone[i] = 1;
        const s = STRIP.indexOf(p.key);
        if (s >= 0) a.pageNew[s] = 1;
        m.edits = i + 1;
        this.emit(kind);
        await this.tweens.run({ duration: 380, onUpdate: (t) => { a.planePulse[i] = 1 - t; } });
      })());
      await Promise.all(jobs);
    } else {
      // one edit in <Header />: the change travels down every beam at the same moment
      await this.tweens.run({ duration: 180, onUpdate: (t) => { a.nodePulse = t; } });
      await this.tweens.run({ duration: 460, easing: ease.linear, onUpdate: (t) => { a.beamPulse = -0.1 + t * 1.2; a.nodePulse = 1 - t; } });
      a.beamPulse = -1;
      a.planeNew.fill(1);
      a.planeDone.fill(1);
      a.pageNew.fill(1);
      this.setReactHeader(m, STRIP[m.index]);
      m.edits = 1;
      this.emit(kind);
      await this.tweens.run({ duration: 520, onUpdate: (t) => { a.planePulse.fill(1 - t); } });
    }
    m.busy = false;
    this.emit(kind);
  }

  updateCamera() {
    const v = this.monitors.vanilla.side;
    const r = this.monitors.react.side;
    const L = this.layoutState.x;
    let target = CAM.front;
    if (v && r) target = CAM.both;
    else if (v || r) {
      const s = v ? -1 : 1; // which half to focus
      target = { x: s * (L + 0.5), y: 0.9, z: 5.45, tx: s * (L - 0.55), ty: -0.06, tz: -0.45 };
    }
    this.tweens.to(this.cam, target, { duration: 800, easing: ease.inOutCubic, key: 'cam' });
  }

  emit(kind) {
    const m = this.monitors[kind];
    if (!m) return;
    this.onState(kind, {
      step: this.step,
      page: STRIP[m.index],
      side: m.side,
      busy: m.busy,
      edited: m.edited,
      edits: m.edits,
      rebuilds: m.rebuilds,
      visible: kind === 'vanilla' || this.step !== 'A',
    });
    this.invalidate();
  }

  // ------------------------------------------------------------------ pointer

  handlePointer(e, isClick) {
    const rect = this.renderer.domElement.getBoundingClientRect();
    this.pointer.set(((e.clientX - rect.left) / rect.width) * 2 - 1, -((e.clientY - rect.top) / rect.height) * 2 + 1);
    this.raycaster.setFromCamera(this.pointer, this.camera);

    const targets = [];
    for (const m of Object.values(this.monitors)) {
      if (m.side || m.busy || m.a.appear < 0.99 || !m.root.visible) continue;
      targets.push(m.pages[m.index]);
      if (m.header) targets.push(m.header);
    }
    const hit = this.raycaster.intersectObjects(targets, false)[0];
    const found = hit ? this.hitTest(hit) : null;
    this.setHover(found);
    if (isClick && found) this.goTo(found.kind, found.target);
  }

  /** Convert a hit on a page surface to page pixels and find the link/card under it. */
  hitTest(hit) {
    const { kind, part } = hit.object.userData;
    const m = this.monitors[kind];
    const uv = hit.uv;
    let px;
    if (part === 'page') px = { x: uv.x * PX.w, y: (1 - uv.y) * PX.h };
    else if (part === 'header') px = { x: uv.x * PX.w, y: (1 - uv.y) * HEADER_PX };
    else px = { x: uv.x * PX.w, y: HEADER_PX + (1 - uv.y) * MAIN_PX };

    const meta = META[kind].pages[STRIP[m.index]];
    const inside = (r) => r && px.x >= r.x && px.x <= r.x + r.w && px.y >= r.y && px.y <= r.y + r.h;
    if (part !== 'main') {
      for (const [name, r] of Object.entries(meta.links)) {
        if (inside(r)) return { kind, target: LINK_TARGET[name], rect: r };
      }
    }
    if (part !== 'header' && STRIP[m.index] === 'menu') {
      const card = meta.cards.find(inside);
      if (card) return { kind, target: 'product', rect: card };
    }
    return null;
  }

  setHover(found) {
    const key = found ? `${found.kind}:${found.rect.x}:${found.rect.y}` : '';
    if (key === this.hoverKey) return;
    this.hoverKey = key;
    for (const m of Object.values(this.monitors)) m.hover.visible = false;
    this.renderer.domElement.style.cursor = found ? 'pointer' : '';
    if (found) {
      const m = this.monitors[found.kind];
      const r = found.rect;
      m.hover.position.x = ((r.x + r.w / 2) / PX.w - 0.5) * SW;
      m.hover.position.y = (0.5 - (r.y + r.h / 2) / PX.h) * SH;
      m.hover.scale.set((r.w / PX.w) * SW + 0.012, (r.h / PX.h) * SH + 0.012, 1);
      m.hover.visible = true;
    }
    this.invalidate();
  }

  // ------------------------------------------------------------------ teardown

  unmount() {
    cancelAnimationFrame(this.raf);
    this.ro?.disconnect();
    this.tweens.clear();
    const el = this.renderer?.domElement;
    if (el) {
      el.removeEventListener('pointermove', this.onMove);
      el.removeEventListener('click', this.onClick);
      el.removeEventListener('pointerleave', this.onLeave);
    }
    this.scene?.traverse((obj) => {
      obj.geometry?.dispose();
      const mats = Array.isArray(obj.material) ? obj.material : obj.material ? [obj.material] : [];
      mats.forEach((mat) => {
        if (mat.map && this.labels.includes(mat.map)) mat.map.dispose();
        mat.dispose();
      });
    });
    Object.values(this.geo || {}).forEach((g) => g.dispose());
    this.labels.forEach((t) => t.dispose());
    this.textures?.dispose();
    this.shadowTex?.dispose();
    this.glareTex?.dispose();
    this.envRT?.dispose();
    if (this.renderer) {
      this.renderer.dispose();
      this.renderer.forceContextLoss();
      el?.remove();
    }
    this.monitors = {};
    this.scene = null;
    this.renderer = null;
  }
}
