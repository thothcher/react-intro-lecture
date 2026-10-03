// A thin-bezel monitor built from primitives with PBR materials.
// Local origin = centre of the screen surface; the screen faces +z.
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';

export const SCREEN = { w: 1.6, h: 0.9 };
const BEZEL = 0.014;
const CHIN = 0.034;
const DEPTH = 0.028;
export const DESK_Y = -0.792;

function rect(path, x, y, w, h) {
  path.moveTo(x, y);
  path.lineTo(x + w, y);
  path.lineTo(x + w, y + h);
  path.lineTo(x, y + h);
  path.lineTo(x, y);
}

export function buildMonitorModel(shadowTexture) {
  const group = new THREE.Group();
  group.name = 'monitor-model';

  const mats = {
    glass: new THREE.MeshPhysicalMaterial({ color: 0x07090c, roughness: 0.16, metalness: 0, clearcoat: 1, clearcoatRoughness: 0.05 }),
    body: new THREE.MeshPhysicalMaterial({ color: 0x23282e, roughness: 0.5, metalness: 0.55 }),
    alu: new THREE.MeshPhysicalMaterial({ color: 0xc9ced4, roughness: 0.3, metalness: 1 }),
    contact: new THREE.MeshBasicMaterial({ map: shadowTexture, transparent: true, depthWrite: false, opacity: 0.5, toneMapped: false }),
  };

  const W = SCREEN.w + BEZEL * 2;
  const H = SCREEN.h + BEZEL + CHIN;
  const cy = (BEZEL - CHIN) / 2;

  // panel body (slightly rounded hardware edges)
  const body = new THREE.Mesh(new RoundedBoxGeometry(W, H, DEPTH, 4, 0.005), mats.body);
  body.position.set(0, cy, -DEPTH / 2 - 0.0006);

  // black glass across the whole front
  const glass = new THREE.Mesh(new THREE.PlaneGeometry(W - 0.002, H - 0.002), mats.glass);
  glass.position.set(0, cy, 0.0002);

  // bezel frame drawn ABOVE the page strip, so pages slide "behind" the bezel
  const outer = new THREE.Shape();
  rect(outer, -W / 2 + 0.001, cy - H / 2 + 0.001, W - 0.002, H - 0.002);
  const hole = new THREE.Path();
  rect(hole, -SCREEN.w / 2, -SCREEN.h / 2, SCREEN.w, SCREEN.h);
  outer.holes.push(hole);
  const frame = new THREE.Mesh(new THREE.ShapeGeometry(outer), mats.glass);
  frame.position.z = 0.0045;

  // back housing, neck, base
  const housing = new THREE.Mesh(new RoundedBoxGeometry(0.74, 0.46, 0.05, 4, 0.016), mats.body);
  housing.position.set(0, -0.08, -DEPTH - 0.026);
  const neck = new THREE.Mesh(new RoundedBoxGeometry(0.08, 0.68, 0.026, 3, 0.006), mats.alu);
  neck.position.set(0, -0.45, -0.097);
  const base = new THREE.Mesh(new RoundedBoxGeometry(0.5, 0.014, 0.28, 3, 0.006), mats.alu);
  base.position.set(0, DESK_Y + 0.007, -0.07);

  // soft contact shadow under the base
  const contact = new THREE.Mesh(new THREE.PlaneGeometry(1.15, 0.62), mats.contact);
  contact.rotation.x = -Math.PI / 2;
  contact.position.set(0, DESK_Y + 0.0005, -0.07);

  [body, housing, neck, base].forEach((m) => { m.castShadow = true; });
  group.add(body, glass, frame, housing, neck, base, contact);

  let lastOpacity = 1;
  /** Fade the hardware in/out (used when the React monitor appears). */
  function setOpacity(o) {
    if (o === lastOpacity) return;
    const transparent = o < 0.999;
    [mats.glass, mats.body, mats.alu].forEach((m) => {
      if (m.transparent !== transparent) { m.transparent = transparent; m.needsUpdate = true; }
      m.opacity = o;
      m.depthWrite = !transparent || o > 0.5;
    });
    mats.contact.opacity = 0.5 * o;
    [body, housing, neck, base].forEach((m) => { m.castShadow = o > 0.5; });
    lastOpacity = o;
  }

  return { group, mats, setOpacity };
}
