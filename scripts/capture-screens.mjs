// Captures real screenshots of both restaurant sites for the 3D monitor scene.
//
//   npm run capture
//
// - Drives the locally installed Microsoft Edge through puppeteer-core (no browser download).
// - Cart / Profile need a signed-in user: we set a demo token and answer the three
//   user-specific API calls (/users/me, /cart, /users/profile) with demo data.
//   Everything else (products, categories, images) comes from the real API.
// - Every page is captured at 1280x720 as a "full page" (header + top of main + footer)
//   and, separately, the main area only (used by the React monitor).
import puppeteer from 'puppeteer-core';
import fs from 'node:fs';
import path from 'node:path';

const EDGE = [
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  'C:/Program Files/Microsoft/Edge/Application/msedge.exe',
].find((p) => fs.existsSync(p));

const SITES = {
  vanilla: 'https://thothcher.github.io/restaurant-vanilla-js',
  react: 'https://thothcher.github.io/restaurant-react',
};
const API = 'https://restaurantapi.stepacademy.ge';
const API_KEY = '0cdc10b8-cf48-4010-9902-7a895179e018';
const OUT = path.resolve('src/assets/screens');
const W = 1280;
const H = 720;
const PRODUCT_ID = 34;

// page key -> path, and whether it needs a signed-in user
const PAGES = [
  ['home', '/', true],
  ['menu', '/menu', true],
  ['product', `/product/${PRODUCT_ID}`, true],
  ['cart', '/cart', true],
  ['profile', '/profile', true],
  ['login', '/login', false],
  ['register', '/register', false],
  ['verify', '/verify?email=nino%40example.com', false],
  ['forgot', '/forgot', false],
  ['reset', '/reset', false],
];
// which header link is "active" on each page (aria-current)
const ACTIVE = { menu: 'menu', cart: 'cart', profile: 'profile' };

const json = (data) => JSON.stringify({ data, meta: {} });

async function demoData() {
  const res = await fetch(`${API}/api/products?Page=1&Take=50`, { headers: { 'X-API-KEY': API_KEY } });
  const products = (await res.json()).data.products.filter((p) => p.image);
  const pick = [products.find((p) => p.id === PRODUCT_ID), ...products.filter((p) => p.id !== PRODUCT_ID).slice(2, 4)].filter(Boolean);
  const items = pick.map((product, i) => ({ id: 900 + i, quantity: [2, 1, 1][i], product }));
  const user = { id: 7, firstName: 'Nino', lastName: 'Beridze', email: 'nino@example.com', role: 'User' };
  return {
    me: user,
    cart: {
      totalItems: items.reduce((n, i) => n + i.quantity, 0),
      totalPrice: items.reduce((s, i) => s + i.quantity * i.product.price, 0),
      items,
    },
    profile: {
      ...user, createdAt: '2026-09-01T10:00:00', updatedAt: '2026-09-20T10:00:00',
      phoneNumber: '+995 555 12 34 56', address: 'Tbilisi, Rustaveli Ave 12', age: 24, picture: null,
    },
  };
}

async function preparePage(browser, demo, signedIn) {
  const page = await browser.newPage();
  await page.setViewport({ width: W, height: H, deviceScaleFactor: 1 });
  // Reduced motion: both apps then skip AOS / parallax, so screenshots are stable.
  await page.emulateMediaFeatures([
    { name: 'prefers-color-scheme', value: 'light' },
    { name: 'prefers-reduced-motion', value: 'reduce' },
  ]);
  await page.evaluateOnNewDocument((signed) => {
    try {
      localStorage.removeItem('restaurant.theme');
      if (signed) localStorage.setItem('restaurant.auth', JSON.stringify({ accessToken: 'demo-token', refreshToken: 'demo-refresh' }));
      else localStorage.removeItem('restaurant.auth');
    } catch { /* ignore */ }
  }, signedIn);
  await page.setRequestInterception(true);
  page.on('request', (req) => {
    const url = req.url();
    const cors = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'x-api-key,authorization,content-type' };
    if (url.startsWith(API) && req.method() === 'OPTIONS') return req.respond({ status: 204, headers: { ...cors, 'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE' } });
    if (url.startsWith(`${API}/api/users/me`)) return req.respond({ status: 200, headers: cors, contentType: 'application/json', body: json(demo.me) });
    if (url.startsWith(`${API}/api/users/profile`)) return req.respond({ status: 200, headers: cors, contentType: 'application/json', body: json(demo.profile) });
    if (url.startsWith(`${API}/api/cart`)) return req.respond({ status: 200, headers: cors, contentType: 'application/json', body: json(demo.cart) });
    return req.continue();
  });
  return page;
}

async function settle(page) {
  await page.evaluate(async () => {
    await document.fonts.ready;
    const imgs = [...document.images];
    await Promise.all(imgs.map((img) => (img.complete ? null : new Promise((r) => { img.onload = img.onerror = r; setTimeout(r, 6000); }))));
  });
  await new Promise((r) => setTimeout(r, 700));
}

/** Freeze the layout to one 16:9 "full page": header + top of main + footer. */
async function freezeLayout(page, headerHTML, active, extraLink) {
  return page.evaluate(({ headerHTML, active, extraLink }) => {
    const header = document.querySelector('.site-header');
    if (headerHTML) header.innerHTML = headerHTML;
    header.querySelectorAll('[aria-current]').forEach((a) => a.removeAttribute('aria-current'));
    header.querySelectorAll('.nav a').forEach((a) => {
      const href = a.getAttribute('href') || '';
      if (active && href.replace(/^.*\//, '') === active) a.setAttribute('aria-current', 'page');
    });
    if (extraLink && !header.querySelector('[data-extra]')) {
      const menu = [...header.querySelectorAll('.nav a')].find((a) => /menu$/.test(a.getAttribute('href') || ''));
      const a = document.createElement('a');
      a.textContent = 'About'; a.setAttribute('href', 'about'); a.dataset.extra = '1';
      menu.before(a);
    }
    const style = document.getElementById('capture-style') || document.head.appendChild(Object.assign(document.createElement('style'), { id: 'capture-style' }));
    const headerH = Math.round(header.getBoundingClientRect().height);
    const footer = document.querySelector('.site-footer');
    const footerH = Math.round(footer.getBoundingClientRect().height);
    const mainH = 720 - headerH - footerH;
    style.textContent = `
      html, body { overflow: hidden !important; scrollbar-width: none !important; }
      ::-webkit-scrollbar { display: none !important; }
      .site-header { position: relative !important; }
      main { flex: none !important; height: ${mainH}px !important; overflow: hidden !important; padding-bottom: 0 !important; }
      [data-aos] { opacity: 1 !important; transform: none !important; transition: none !important; }
      .toasts { display: none !important; }`;
    window.scrollTo(0, 0);
    const rect = (el) => { if (!el) return null; const r = el.getBoundingClientRect(); return { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) }; };
    const link = (re) => rect([...header.querySelectorAll('.nav a')].find((a) => re.test(a.getAttribute('href') || '')));
    const mainTop = Math.round(document.querySelector('main').getBoundingClientRect().top);
    return {
      headerH, footerH, mainH, mainTop,
      links: { home: rect(header.querySelector('.brand')), menu: link(/menu$/), cart: link(/cart$/), profile: link(/profile$/) },
      cards: [...document.querySelectorAll('main .card:not(.skeleton) .card-media')].map(rect).filter((r) => r.y + r.h / 2 < 720 - footerH),
    };
  }, { headerHTML, active, extraLink });
}

async function captureSite(browser, key, base, demo) {
  const dir = path.join(OUT, key);
  fs.mkdirSync(dir, { recursive: true });
  const meta = { width: W, height: H, pages: {} };

  // Canonical signed-in header (taken from /menu), reused on every page so all pages share it.
  const probe = await preparePage(browser, demo, true);
  await probe.goto(`${base}/menu`, { waitUntil: 'networkidle0', timeout: 60000 });
  await settle(probe);
  const headerHTML = await probe.$eval('.site-header', (h) => h.innerHTML);
  await probe.close();

  for (const [name, route, signedIn] of PAGES) {
    const page = await preparePage(browser, demo, signedIn);
    await page.goto(`${base}${route}`, { waitUntil: 'networkidle0', timeout: 60000 });
    await settle(page);
    const info = await freezeLayout(page, headerHTML, ACTIVE[name], false);
    await new Promise((r) => setTimeout(r, 250));
    await page.screenshot({ path: path.join(dir, `${name}.webp`), type: 'webp', quality: 86, clip: { x: 0, y: 0, width: W, height: H } });
    await page.screenshot({ path: path.join(dir, `main-${name}.webp`), type: 'webp', quality: 86, clip: { x: 0, y: info.mainTop, width: W, height: info.mainH } });
    if (name === 'home') {
      await page.screenshot({ path: path.join(dir, 'header.webp'), type: 'webp', quality: 90, clip: { x: 0, y: 0, width: W, height: info.headerH } });
      await page.screenshot({ path: path.join(dir, 'footer.webp'), type: 'webp', quality: 90, clip: { x: 0, y: H - info.footerH, width: W, height: info.footerH } });
      await freezeLayout(page, null, null, true);
      await new Promise((r) => setTimeout(r, 150));
      await page.screenshot({ path: path.join(dir, 'header-about.webp'), type: 'webp', quality: 90, clip: { x: 0, y: 0, width: W, height: info.headerH } });
    }
    meta.pages[name] = { route, ...info };
    meta.headerH = info.headerH;
    meta.footerH = info.footerH;
    console.log(`${key.padEnd(8)} ${name.padEnd(9)} header ${info.headerH}px  main ${info.mainH}px  cards ${info.cards.length}`);
    await page.close();
  }
  fs.writeFileSync(path.join(dir, 'meta.json'), JSON.stringify(meta, null, 2));
}

const browser = await puppeteer.launch({ executablePath: EDGE, headless: true, args: ['--no-first-run', '--disable-extensions'] });
try {
  const demo = await demoData();
  for (const [key, base] of Object.entries(SITES)) await captureSite(browser, key, base, demo);
} finally {
  await browser.close();
}
