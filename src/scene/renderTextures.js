// Canvas textures for the rendering-strategies scene: HTML "documents", code fragments,
// SEO verdicts, price tags and the ISR countdown ring. Everything is drawn in the deck palette.
import * as THREE from 'three';

const NAVY = '#0B1B3A';
const ACCENT = '#A4483A';
const MUTED = '#5B6577';
const HAIR = 'rgba(11,27,58,0.18)';
const MONO = '"JetBrains Mono", "FiraGO", monospace';
const SANS = '"FiraGO", system-ui, sans-serif';

function canvas(w, h) {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  return [c, c.getContext('2d')];
}

function toTexture(c) {
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  return t;
}

/** Very small HTML highlighter for the document cards. */
function drawCodeLine(ctx, line, x, y) {
  const parts = line.split(/(<\/?[a-z0-9!]+|\/?>|"[^"]*"|\s[a-z-]+(?==))/gi).filter(Boolean);
  let cx = x;
  parts.forEach((p) => {
    if (/^<\/?[a-z0-9!]/i.test(p) || /^\/?>$/.test(p)) ctx.fillStyle = '#24467F';
    else if (/^"/.test(p)) ctx.fillStyle = '#8C3B2F';
    else if (/^\s[a-z-]+$/i.test(p)) ctx.fillStyle = '#7A5A1E';
    else ctx.fillStyle = NAVY;
    ctx.fillText(p, cx, y);
    cx += ctx.measureText(p).width;
  });
}

/**
 * A document card: file name + size bar, optional page thumbnail, code lines.
 * @param {{name:string, size:string, lines:string[], thumb?:HTMLImageElement, tone?:'empty'|'full'|'json'}} o
 */
export function docTexture({ name, size, lines, thumb = null, tone = 'full' }) {
  const W = 512;
  const H = 640;
  const [c, ctx] = canvas(W, H);
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, W, H);
  ctx.strokeStyle = tone === 'empty' ? ACCENT : 'rgba(11,27,58,0.35)';
  ctx.lineWidth = 4;
  ctx.strokeRect(2, 2, W - 4, H - 4);
  // title bar
  ctx.fillStyle = NAVY;
  ctx.fillRect(0, 0, W, 64);
  ctx.fillStyle = tone === 'empty' ? '#E3A497' : '#9DD1F1';
  ctx.fillRect(24, 26, 12, 12);
  ctx.fillStyle = '#FFFFFF';
  ctx.font = `500 26px ${MONO}`;
  ctx.textBaseline = 'middle';
  ctx.fillText(name, 50, 33);
  ctx.fillStyle = 'rgba(255,255,255,0.65)';
  ctx.font = `400 22px ${MONO}`;
  const sw = ctx.measureText(size).width;
  ctx.fillText(size, W - sw - 24, 33);

  let y = 92;
  if (thumb) {
    const tw = W - 48;
    const th = Math.round(tw * 9 / 16);
    ctx.drawImage(thumb, 24, 84, tw, th);
    ctx.strokeStyle = HAIR;
    ctx.lineWidth = 2;
    ctx.strokeRect(24, 84, tw, th);
    y = 84 + th + 34;
  }
  ctx.font = `400 22px ${MONO}`;
  ctx.textBaseline = 'alphabetic';
  lines.forEach((l, i) => drawCodeLine(ctx, l, 28, y + i * 34));
  if (tone === 'empty') {
    ctx.fillStyle = 'rgba(164,72,58,0.08)';
    ctx.fillRect(14, y + 2 * 34 - 26, W - 28, 36);
  }
  return toTexture(c);
}

/** A file in the dist/ folder: white card, navy band, file name. */
export function fileTexture(name) {
  const W = 420;
  const H = 300;
  const [c, ctx] = canvas(W, H);
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, W, H);
  ctx.strokeStyle = 'rgba(11,27,58,0.35)';
  ctx.lineWidth = 4;
  ctx.strokeRect(2, 2, W - 4, H - 4);
  ctx.fillStyle = NAVY;
  ctx.fillRect(0, 0, W, 70);
  ctx.fillStyle = '#FFFFFF';
  ctx.font = `500 32px ${MONO}`;
  ctx.textBaseline = 'middle';
  ctx.fillText(name, 22, 37);
  ctx.fillStyle = 'rgba(11,27,58,0.12)';
  [0.82, 0.6, 0.72, 0.45].forEach((w, i) => ctx.fillRect(22, 104 + i * 40, (W - 44) * w, 16));
  return toTexture(c);
}

/** Small chip with a bit of (minified, messy) code — pieces of the JS bundle. */
export function fragmentTexture(text, dark = true) {
  const [m] = canvas(8, 8);
  const mctx = m.getContext('2d');
  mctx.font = `500 30px ${MONO}`;
  const w = Math.ceil(mctx.measureText(text).width) + 36;
  const h = 54;
  const [c, ctx] = canvas(w, h);
  ctx.fillStyle = dark ? NAVY : '#FFFFFF';
  ctx.fillRect(0, 0, w, h);
  ctx.strokeStyle = dark ? 'rgba(157,209,241,0.6)' : 'rgba(11,27,58,0.3)';
  ctx.lineWidth = 2;
  ctx.strokeRect(1, 1, w - 2, h - 2);
  ctx.fillStyle = dark ? '#E6F0F9' : NAVY;
  ctx.font = `500 30px ${MONO}`;
  ctx.textBaseline = 'middle';
  ctx.fillText(text, 18, h / 2 + 1);
  return { texture: toTexture(c), aspect: w / h };
}

/** SEO verdict: a 5-step rank meter + one line of text. */
export function verdictTexture(rank, text) {
  const W = 820;
  const H = 300;
  const [c, ctx] = canvas(W, H);
  const good = rank >= 4;
  const tone = good ? NAVY : ACCENT;
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = tone;
  ctx.fillRect(0, 0, 14, H);
  ctx.strokeStyle = tone;
  ctx.lineWidth = 4;
  ctx.strokeRect(2, 2, W - 4, H - 4);
  ctx.textBaseline = 'middle';
  ctx.font = `600 30px ${MONO}`;
  ctx.fillStyle = MUTED;
  ctx.fillText('SEO RANK', 48, 58);
  // the headline word
  ctx.font = `700 92px ${MONO}`;
  ctx.fillStyle = tone;
  ctx.fillText(good ? 'HIGH' : 'LOW', 48, 142);
  // five rank squares + "n / 5"
  for (let i = 0; i < 5; i += 1) {
    ctx.fillStyle = i < rank ? tone : 'rgba(11,27,58,0.12)';
    ctx.fillRect(420 + i * 62, 112, 50, 50);
  }
  ctx.font = `600 30px ${MONO}`;
  ctx.fillStyle = tone;
  ctx.textAlign = 'right';
  ctx.fillText(`${rank} / 5`, W - 44, 58);
  ctx.textAlign = 'left';
  ctx.fillStyle = 'rgba(11,27,58,0.12)';
  ctx.fillRect(48, 206, W - 92, 2);
  ctx.font = `600 40px ${SANS}`;
  ctx.fillStyle = NAVY;
  ctx.fillText(text, 48, 252);
  return toTexture(c);
}

/** A price tag (used to show stale vs fresh data). */
export function tagTexture(label, value, tone = 'neutral') {
  const W = 520;
  const H = 150;
  const [c, ctx] = canvas(W, H);
  const color = tone === 'bad' ? ACCENT : tone === 'good' ? '#2F6B4F' : NAVY;
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, W, H);
  ctx.strokeStyle = color;
  ctx.lineWidth = 4;
  ctx.strokeRect(2, 2, W - 4, H - 4);
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, 12, H);
  ctx.font = `500 26px ${SANS}`;
  ctx.fillStyle = MUTED;
  ctx.textBaseline = 'middle';
  ctx.fillText(label, 36, 44);
  ctx.font = `600 54px ${MONO}`;
  ctx.fillStyle = color;
  ctx.fillText(value, 36, 104);
  return toTexture(c);
}

/** ISR countdown ring, redrawn as it runs. Returns {texture, draw(progress, label)}. */
export function timerTexture() {
  const S = 256;
  const [c, ctx] = canvas(S, S);
  const texture = toTexture(c);
  function draw(progress, label) {
    ctx.clearRect(0, 0, S, S);
    ctx.fillStyle = 'rgba(255,255,255,0.95)';
    ctx.beginPath();
    ctx.arc(S / 2, S / 2, 112, 0, Math.PI * 2);
    ctx.fill();
    ctx.lineWidth = 16;
    ctx.strokeStyle = 'rgba(11,27,58,0.12)';
    ctx.beginPath();
    ctx.arc(S / 2, S / 2, 92, 0, Math.PI * 2);
    ctx.stroke();
    ctx.strokeStyle = progress >= 1 ? ACCENT : NAVY;
    ctx.beginPath();
    ctx.arc(S / 2, S / 2, 92, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * (1 - progress));
    ctx.stroke();
    ctx.fillStyle = progress >= 1 ? ACCENT : NAVY;
    ctx.font = `600 54px ${MONO}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(label, S / 2, S / 2 + 2);
    texture.needsUpdate = true;
  }
  draw(0, '60s');
  return { texture, draw };
}

/** Diagonal hatch with a caption: "visible but not interactive yet" (before hydration). */
export function veilTexture(text) {
  const W = 1024;
  const H = 576;
  const [c, ctx] = canvas(W, H);
  ctx.fillStyle = 'rgba(11,27,58,0.38)';
  ctx.fillRect(0, 0, W, H);
  ctx.strokeStyle = 'rgba(255,255,255,0.10)';
  ctx.lineWidth = 6;
  for (let x = -H; x < W; x += 34) {
    ctx.beginPath();
    ctx.moveTo(x, H);
    ctx.lineTo(x + H, 0);
    ctx.stroke();
  }
  ctx.font = `600 34px ${SANS}`;
  const boxW = Math.min(W - 80, ctx.measureText(text).width + 96);
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(W / 2 - boxW / 2, H / 2 - 44, boxW, 88);
  ctx.fillStyle = NAVY;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, W / 2, H / 2 + 2);
  return toTexture(c);
}

/** A small overlay that rewrites part of the page screenshot (the fresh price after ISR). */
export function patchTexture(text, { w, h, bg, fg, size, edge }) {
  const [c, ctx] = canvas(w, h);
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, w, h);
  if (edge) {
    ctx.fillStyle = edge;
    ctx.fillRect(0, 0, 10, h);
  }
  ctx.fillStyle = fg;
  ctx.font = `700 ${size}px ${SANS}`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, w / 2 + (edge ? 5 : 0), h / 2 + 2);
  return toTexture(c);
}

/** Vertical light band used for the hydration sweep. */
export function sweepTexture() {
  const [c, ctx] = canvas(256, 8);
  const g = ctx.createLinearGradient(0, 0, 256, 0);
  g.addColorStop(0, 'rgba(157,209,241,0)');
  g.addColorStop(0.5, 'rgba(157,209,241,0.85)');
  g.addColorStop(1, 'rgba(157,209,241,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 256, 8);
  return toTexture(c);
}
