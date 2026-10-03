// One shader for every "page" surface in the scene:
//  - plain page / cropped page (header plane of the React monitor)
//  - mode 1 (vanilla file): the page carries its OWN header; uNew swaps it for the edited header
//  - mode 2 (React route): the header area is an empty slot until the shared <Header /> fills it
//  - optional fade outside the monitor screen (neighbour pages of the strip look faded)
import * as THREE from 'three';

const vertexShader = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const fragmentShader = /* glsl */ `
  uniform sampler2D map;
  uniform sampler2D headerA;
  uniform sampler2D headerB;
  uniform float uMode;      // 0 plain, 1 vanilla file, 2 react route
  uniform float uSlot;      // react: 0 empty header slot -> 1 header assembled
  uniform float uNew;       // 0 original header -> 1 edited header (with "About")
  uniform float uPulse;     // accent highlight over the header band
  uniform float uOpacity;
  uniform float uFade;      // 1 = fade where the plane leaves the screen
  uniform float uOffsetX;   // plane centre, in monitor-local x
  uniform float uPlaneW;
  uniform float uHalf;      // half screen width
  uniform float uFadeLen;
  uniform float uHeaderFrac;
  uniform vec4 uCrop;       // uv offset (xy) and scale (zw)
  uniform vec2 uRes;        // source page size in px
  uniform vec3 uAccent;
  uniform vec3 uBg;
  uniform vec3 uSlotColor;
  uniform vec3 uInk;
  varying vec2 vUv;

  void main() {
    vec2 uv = uCrop.xy + vUv * uCrop.zw;
    vec4 base = texture2D(map, uv);
    vec3 col = base.rgb;

    if (uMode > 0.5) {
      float top = 1.0 - uHeaderFrac;
      float inH = step(top, uv.y);
      vec2 huv = vec2(uv.x, clamp((uv.y - top) / uHeaderFrac, 0.0, 1.0));
      vec3 hA = uMode < 1.5 ? base.rgb : texture2D(headerA, huv).rgb;
      vec3 hB = texture2D(headerB, huv).rgb;
      vec3 h = mix(hA, hB, uNew);

      if (uMode > 1.5) {
        // empty slot: pale fill with a dashed outline, waiting for <Header />
        float hpx = uHeaderFrac * uRes.y;
        vec2 p = vec2(huv.x * uRes.x, huv.y * hpx);
        float edgeX = step(p.x, 6.0) + step(uRes.x - 6.0, p.x);
        float edgeY = step(p.y, 6.0) + step(hpx - 6.0, p.y);
        float dashX = step(0.5, fract(p.x / 18.0));
        float dashY = step(0.5, fract(p.y / 18.0));
        float border = clamp(edgeY * dashX + edgeX * dashY, 0.0, 1.0);
        vec3 slot = mix(uSlotColor, uInk, border * 0.45);
        h = mix(slot, h, uSlot);
      }

      col = mix(col, h, inH);
      col = mix(col, uAccent, inH * uPulse * 0.62);
      // glowing hairline under the header while it is being edited
      float line = inH * (1.0 - smoothstep(0.0, 0.08, (uv.y - top) / uHeaderFrac));
      col = mix(col, uAccent, line * uPulse);
    }

    float alpha = uOpacity * base.a;
    if (uFade > 0.5) {
      float lx = uOffsetX + (vUv.x - 0.5) * uPlaneW;
      float outside = abs(lx) - uHalf;
      if (outside > 0.0) {
        float k = 1.0 - smoothstep(0.0, uFadeLen, outside);
        float l = dot(col, vec3(0.2126, 0.7152, 0.0722));
        col = mix(vec3(l), col, 0.35);
        col = mix(uBg, col, 0.6);
        alpha *= 0.8 * k;
      }
    }

    gl_FragColor = vec4(col, alpha);
    #include <colorspace_fragment>
  }
`;

export function createPageMaterial({
  map, headerA = null, headerB = null, mode = 0, crop = [0, 0, 1, 1], fade = false,
  planeW = 1.6, half = 0.8, fadeLen = 0.42, headerFrac = 67 / 720, res = [1280, 720],
} = {}) {
  return new THREE.ShaderMaterial({
    uniforms: {
      map: { value: map },
      headerA: { value: headerA || map },
      headerB: { value: headerB || map },
      uMode: { value: mode },
      uSlot: { value: 0 },
      uNew: { value: 0 },
      uPulse: { value: 0 },
      uOpacity: { value: 1 },
      uFade: { value: fade ? 1 : 0 },
      uOffsetX: { value: 0 },
      uPlaneW: { value: planeW },
      uHalf: { value: half },
      uFadeLen: { value: fadeLen },
      uHeaderFrac: { value: headerFrac },
      uCrop: { value: new THREE.Vector4(...crop) },
      uRes: { value: new THREE.Vector2(...res) },
      uAccent: { value: new THREE.Color('#A4483A') },
      uBg: { value: new THREE.Color('#F6F7F9') },
      uSlotColor: { value: new THREE.Color('#E4E9EF') },
      uInk: { value: new THREE.Color('#0B1B3A') },
    },
    vertexShader,
    fragmentShader,
    transparent: true,
    depthWrite: false,
  });
}

// Thin "light beam" from the <Header /> node to one page (React side view).
// uDraw: how much of the beam is drawn (0..1); uPulse: position of a travelling bright spot.
export function createBeamMaterial() {
  return new THREE.ShaderMaterial({
    uniforms: {
      uDraw: { value: 0 },
      uPulse: { value: -1 },
      uOpacity: { value: 1 },
      uColor: { value: new THREE.Color('#A4483A') },
    },
    vertexShader,
    fragmentShader: /* glsl */ `
      uniform float uDraw;
      uniform float uPulse;
      uniform float uOpacity;
      uniform vec3 uColor;
      varying vec2 vUv;
      void main() {
        float t = vUv.y;
        if (t > uDraw) discard;
        float spot = 1.0 - smoothstep(0.0, 0.12, abs(t - uPulse));
        float a = (0.55 + 0.45 * spot) * uOpacity;
        vec3 c = mix(uColor, vec3(1.0), spot * 0.55);
        gl_FragColor = vec4(c, a);
        #include <colorspace_fragment>
      }
    `,
    transparent: true,
    depthWrite: false,
  });
}
