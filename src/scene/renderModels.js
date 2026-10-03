// Models for the rendering-strategies scene, built from primitives (same PBR language as the monitor).
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { labelTexture } from './assets.js';

const phys = (color, metalness, roughness, extra = {}) => new THREE.MeshPhysicalMaterial({ color, metalness, roughness, ...extra });

export function sprite(texture, height, { depthTest = true, order = 0 } = {}) {
  const mat = new THREE.SpriteMaterial({ map: texture, transparent: true, depthTest, depthWrite: false, toneMapped: false });
  const s = new THREE.Sprite(mat);
  const img = texture.image;
  const aspect = img ? img.width / img.height : 1;
  s.scale.set(height * aspect, height, 1);
  s.userData.baseScale = s.scale.clone();
  s.renderOrder = order;
  return s;
}

export function textSprite(text, height, style = 'file', sub = '') {
  const lab = labelTexture(text, { style, sub });
  const s = sprite(lab.texture, height, { depthTest: false, order: 20 });
  s.userData.labelTexture = lab.texture;
  return s;
}

function gearGeometry(r = 0.085, teeth = 10) {
  const shape = new THREE.Shape();
  const ri = r * 0.76;
  const n = teeth * 4;
  for (let i = 0; i <= n; i += 1) {
    const a = (i / n) * Math.PI * 2;
    const rr = (i % 4 === 1 || i % 4 === 2) ? r : ri;
    const x = Math.cos(a) * rr;
    const y = Math.sin(a) * rr;
    if (i === 0) shape.moveTo(x, y); else shape.lineTo(x, y);
  }
  const hole = new THREE.Path();
  hole.absarc(0, 0, r * 0.32, 0, Math.PI * 2, true);
  shape.holes.push(hole);
  return new THREE.ExtrudeGeometry(shape, { depth: 0.018, bevelEnabled: true, bevelSize: 0.003, bevelThickness: 0.003, bevelSegments: 1, curveSegments: 6 });
}

/** Server rack: 5 rack units with blinking LEDs, a control panel with a gear (= "server renders") and a CPU meter. */
export function buildServer() {
  const group = new THREE.Group();
  const W = 0.64;
  const H = 1.45;
  const D = 0.62;
  const mats = {
    body: phys(0x1f252c, 0.55, 0.45),
    plate: phys(0x2a323b, 0.5, 0.4),
    alu: phys(0xc9ced4, 1, 0.3),
    vent: new THREE.MeshBasicMaterial({ color: 0x11161b }),
    meterBg: new THREE.MeshBasicMaterial({ color: 0x11161b }),
    meter: new THREE.MeshBasicMaterial({ color: 0xa4483a, toneMapped: false }),
  };
  const body = new THREE.Mesh(new RoundedBoxGeometry(W, H, D, 4, 0.02), mats.body);
  body.position.y = H / 2;
  body.castShadow = true;
  group.add(body);

  const leds = [];
  const plateGeo = new RoundedBoxGeometry(W - 0.07, 0.17, 0.02, 2, 0.004);
  const ventGeo = new THREE.BoxGeometry(0.26, 0.007, 0.004);
  const ledGeo = new THREE.BoxGeometry(0.022, 0.022, 0.01);
  for (let i = 0; i < 5; i += 1) {
    const y = 0.16 + i * 0.205;
    const plate = new THREE.Mesh(plateGeo, mats.plate);
    plate.position.set(0, y, D / 2 + 0.01);
    group.add(plate);
    for (let v = 0; v < 3; v += 1) {
      const vent = new THREE.Mesh(ventGeo, mats.vent);
      vent.position.set(-0.1, y - 0.035 + v * 0.035, D / 2 + 0.021);
      group.add(vent);
    }
    for (let k = 0; k < 3; k += 1) {
      const mat = new THREE.MeshBasicMaterial({ color: 0x9dd1f1, toneMapped: false });
      const led = new THREE.Mesh(ledGeo, mat);
      led.position.set(W / 2 - 0.08 - k * 0.045, y, D / 2 + 0.022);
      led.userData.phase = Math.random() * 10;
      led.userData.speed = 2 + Math.random() * 5;
      group.add(led);
      leds.push(led);
    }
  }

  // control panel on top: gear + CPU meter
  const panel = new THREE.Mesh(new RoundedBoxGeometry(W - 0.07, 0.26, 0.02, 2, 0.004), mats.plate);
  panel.position.set(0, 1.25, D / 2 + 0.01);
  group.add(panel);
  const gear = new THREE.Mesh(gearGeometry(), mats.alu);
  gear.position.set(-0.17, 1.25, D / 2 + 0.02);
  group.add(gear);
  const meterBg = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.035, 0.006), mats.meterBg);
  meterBg.position.set(0.1, 1.25, D / 2 + 0.022);
  group.add(meterBg);
  const meter = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.035, 0.008).translate(0.14, 0, 0), mats.meter);
  meter.position.set(-0.04, 1.25, D / 2 + 0.024);
  meter.scale.x = 0.0001;
  group.add(meter);

  const port = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.04, 16), mats.alu);
  port.rotation.z = Math.PI / 2;
  port.position.set(W / 2 + 0.02, 1.0, 0.12);
  group.add(port);

  return { group, gear, leds, meter, mats, size: { W, H, D }, portLocal: new THREE.Vector3(W / 2 + 0.04, 1.0, 0.12) };
}

/** The build output folder ("dist/") with a stack of files inside. */
export function buildFolder() {
  const group = new THREE.Group();
  const mats = { back: phys(0x24365a, 0.2, 0.5), front: phys(0x33507f, 0.2, 0.45) };
  const back = new THREE.Mesh(new RoundedBoxGeometry(0.5, 0.34, 0.02, 2, 0.008), mats.back);
  back.position.set(0, 0.17, -0.03);
  const tab = new THREE.Mesh(new RoundedBoxGeometry(0.17, 0.05, 0.02, 2, 0.006), mats.back);
  tab.position.set(-0.155, 0.355, -0.03);
  const files = new THREE.Group();
  const front = new THREE.Mesh(new RoundedBoxGeometry(0.5, 0.25, 0.02, 2, 0.008), mats.front);
  front.position.set(0, 0.125, 0.05);
  front.rotation.x = -0.16;
  [back, tab, front].forEach((m) => { m.castShadow = true; });
  group.add(back, tab, files, front);
  return { group, files, mats };
}

/** Database: three stacked discs. */
export function buildDb() {
  const group = new THREE.Group();
  const mat = phys(0xc9ced4, 0.85, 0.32);
  const rim = phys(0x2a323b, 0.5, 0.4);
  for (let i = 0; i < 3; i += 1) {
    const disc = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.13, 0.08, 40), mat);
    disc.position.y = 0.05 + i * 0.1;
    disc.castShadow = true;
    const band = new THREE.Mesh(new THREE.CylinderGeometry(0.132, 0.132, 0.012, 40), rim);
    band.position.y = disc.position.y + 0.046;
    group.add(disc, band);
  }
  return { group, top: 0.33 };
}

/** The SEO crawler: a magnifying glass. */
export function buildMagnifier() {
  const group = new THREE.Group();
  const ring = new THREE.Mesh(new THREE.TorusGeometry(0.12, 0.017, 14, 56), phys(0x0b1b3a, 0.4, 0.3, { clearcoat: 0.8 }));
  const lens = new THREE.Mesh(new THREE.CircleGeometry(0.115, 48), new THREE.MeshPhysicalMaterial({
    color: 0xdfeefa, transparent: true, opacity: 0.32, roughness: 0.05, metalness: 0, clearcoat: 1, depthWrite: false,
  }));
  const handle = new THREE.Mesh(new THREE.CylinderGeometry(0.019, 0.024, 0.22, 16), phys(0xc9ced4, 1, 0.28));
  handle.position.set(0.12, -0.12, 0);
  handle.rotation.z = Math.PI / 4;
  const grip = new THREE.Mesh(new THREE.CylinderGeometry(0.026, 0.026, 0.11, 16), phys(0x0b1b3a, 0.3, 0.5));
  grip.position.set(0.175, -0.175, 0);
  grip.rotation.z = Math.PI / 4;
  [ring, handle, grip].forEach((m) => { m.castShadow = true; });
  group.add(ring, lens, handle, grip);
  return { group, lens };
}

/** Network wire with a flow shader (dashes travel in the direction of the current transfer). */
export function buildWire(curve) {
  const material = new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uDir: { value: 1 },
      uActive: { value: 0 },
      uBase: { value: new THREE.Color('#9AA6B8') },
      uFlow: { value: new THREE.Color('#A4483A') },
    },
    vertexShader: /* glsl */ `
      varying vec2 vUv;
      void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }
    `,
    fragmentShader: /* glsl */ `
      uniform float uTime; uniform float uDir; uniform float uActive;
      uniform vec3 uBase; uniform vec3 uFlow;
      varying vec2 vUv;
      void main() {
        float d = fract(vUv.x * 18.0 - uTime * 1.6 * uDir);
        float dash = smoothstep(0.0, 0.08, d) * (1.0 - smoothstep(0.32, 0.4, d));
        vec3 col = mix(uBase, uFlow, dash * uActive);
        gl_FragColor = vec4(col, 1.0);
        #include <colorspace_fragment>
      }
    `,
  });
  const mesh = new THREE.Mesh(new THREE.TubeGeometry(curve, 120, 0.011, 8, false), material);
  return { mesh, material };
}
