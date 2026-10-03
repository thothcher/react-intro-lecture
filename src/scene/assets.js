// Screenshots of the two real restaurant sites (captured by `npm run capture`) and canvas labels.
// Images are imported (not fetched by URL) so the production build inlines them; that keeps
// WebGL textures same-origin even when the deck is opened from file://.
import * as THREE from 'three';
import vanillaMeta from '../assets/screens/vanilla/meta.json';
import reactMeta from '../assets/screens/react/meta.json';

const files = import.meta.glob([
  '../assets/screens/*/*.webp',
  '!../assets/screens/vanilla/main-*.webp',  // vanilla shows whole pages only
  '!../assets/screens/vanilla/header.webp',
  '!../assets/screens/vanilla/footer.webp',
], { eager: true, query: '?url', import: 'default' });

export const META = { vanilla: vanillaMeta, react: reactMeta };

/** Pages shown on the monitor strips (left → right) and the header link that leads to each. */
export const STRIP = ['home', 'menu', 'product', 'cart', 'profile'];

/** The ten pages of the site, as files (vanilla) and as routes (React). */
export const PAGES = [
  { key: 'home', file: 'index.html', route: '/' },
  { key: 'menu', file: 'menu.html', route: '/menu' },
  { key: 'product', file: 'product.html', route: '/product/:id' },
  { key: 'cart', file: 'cart.html', route: '/cart' },
  { key: 'profile', file: 'profile.html', route: '/profile' },
  { key: 'login', file: 'login.html', route: '/login' },
  { key: 'register', file: 'register.html', route: '/register' },
  { key: 'verify', file: 'verify.html', route: '/verify' },
  { key: 'forgot', file: 'forgot.html', route: '/forgot' },
  { key: 'reset', file: 'reset.html', route: '/reset' },
];

export const url = (site, name) => files[`../assets/screens/${site}/${name}.webp`];

export function loadTextures(renderer) {
  const loader = new THREE.TextureLoader();
  const maxAniso = renderer.capabilities.getMaxAnisotropy();
  const cache = new Map();
  const get = (site, name) => {
    const k = `${site}/${name}`;
    if (!cache.has(k)) {
      const tex = loader.load(url(site, name));
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.anisotropy = Math.min(8, maxAniso);
      tex.generateMipmaps = true;
      tex.minFilter = THREE.LinearMipmapLinearFilter;
      cache.set(k, tex);
    }
    return cache.get(k);
  };
  const ready = () => Promise.all([...cache.values()].map((t) => (t.image?.complete ? null : new Promise((r) => {
    const img = t.image;
    if (!img) { r(); return; }
    img.addEventListener('load', r, { once: true });
    img.addEventListener('error', r, { once: true });
  }))));
  return { get, ready, dispose: () => cache.forEach((t) => t.dispose()) };
}

/**
 * Text label rendered to a canvas texture, for sprites that always face the camera.
 * style: 'file' (vanilla file name), 'route' (React route), 'node' (the <Header /> source).
 */
export function labelTexture(text, { style = 'file', sub = '' } = {}) {
  const dpr = 2;
  const font = '500 26px "JetBrains Mono", monospace';
  const subFont = '400 18px "JetBrains Mono", monospace';
  const ctx0 = document.createElement('canvas').getContext('2d');
  ctx0.font = font;
  const tw = ctx0.measureText(text).width;
  ctx0.font = subFont;
  const sw = sub ? ctx0.measureText(sub).width : 0;
  const padX = 16;
  const w = Math.ceil(Math.max(tw, sw) + padX * 2);
  const h = sub ? 74 : 44;

  const canvas = document.createElement('canvas');
  canvas.width = w * dpr;
  canvas.height = h * dpr;
  const ctx = canvas.getContext('2d');
  ctx.scale(dpr, dpr);

  const dark = style === 'node';
  ctx.fillStyle = dark ? '#0B1B3A' : 'rgba(255,255,255,0.94)';
  ctx.fillRect(0, 0, w, h);
  ctx.strokeStyle = dark ? '#0B1B3A' : style === 'route' ? 'rgba(164,72,58,0.55)' : 'rgba(11,27,58,0.28)';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(0.75, 0.75, w - 1.5, h - 1.5);
  if (!dark) {
    ctx.fillStyle = style === 'route' ? '#A4483A' : '#0B1B3A';
    ctx.fillRect(0, 0, 4, h); // accent tick on the left edge
  }
  ctx.fillStyle = dark ? '#FFFFFF' : '#0B1B3A';
  ctx.font = font;
  ctx.textBaseline = 'middle';
  ctx.fillText(text, padX, sub ? 26 : h / 2 + 1);
  if (sub) {
    ctx.font = subFont;
    ctx.fillStyle = dark ? 'rgba(255,255,255,0.7)' : '#5B6577';
    ctx.fillText(sub, padX, 54);
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  return { texture: tex, aspect: w / h, height: h };
}

/** Soft radial shadow texture used under each monitor base (grounding). */
export function contactShadowTexture() {
  const c = document.createElement('canvas');
  c.width = c.height = 256;
  const ctx = c.getContext('2d');
  const g = ctx.createRadialGradient(128, 128, 0, 128, 128, 128);
  g.addColorStop(0, 'rgba(11,27,58,0.55)');
  g.addColorStop(0.5, 'rgba(11,27,58,0.18)');
  g.addColorStop(1, 'rgba(11,27,58,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 256, 256);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/** Very faint diagonal glare for the screen glass. */
export function glareTexture() {
  const c = document.createElement('canvas');
  c.width = 512;
  c.height = 288;
  const ctx = c.getContext('2d');
  const g = ctx.createLinearGradient(0, 0, 512, 288);
  g.addColorStop(0, 'rgba(255,255,255,0.10)');
  g.addColorStop(0.38, 'rgba(255,255,255,0.03)');
  g.addColorStop(0.42, 'rgba(255,255,255,0)');
  g.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 512, 288);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}
