// Official logo paths from simple-icons (CC0 icon data; the marks belong to their owners).
// Used where a picture of the tool explains more than its name: frameworks, tooling, vanilla vs React.
import {
  siReact, siAngular, siVuedotjs, siSvelte, siNextdotjs, siJavascript, siVite,
  siNodedotjs, siNpm, siAstro, siReactrouter, siGithub,
} from 'simple-icons';

// [icon, colour on a light tile, tile background]
const BRANDS = {
  react: [siReact, '#61DAFB', '#20232A'],
  angular: [siAngular, '#FFFFFF', 'linear-gradient(135deg, #F0060B, #CC26D5)'],
  vue: [siVuedotjs, '#4FC08D', '#1E2B3A'],
  svelte: [siSvelte, '#FFFFFF', '#FF3E00'],
  next: [siNextdotjs, '#FFFFFF', '#000000'],
  js: [siJavascript, '#F7DF1E', '#1E1E1E'],
  vite: [siVite, '#FFFFFF', 'linear-gradient(135deg, #41D1FF, #BD34FE)'],
  node: [siNodedotjs, '#5FA04E', '#1B2A1B'],
  npm: [siNpm, '#FFFFFF', '#CB3837'],
  astro: [siAstro, '#FFFFFF', 'linear-gradient(135deg, #BC52EE, #FF5D01)'],
  router: [siReactrouter, '#F44250', '#121212'],
  github: [siGithub, '#FFFFFF', '#181717'],
};

/** Just the mark, in its brand colour (or `color`). */
export function logo(key, { color, size = '1em', title = true } = {}) {
  const [icon, fg] = BRANDS[key];
  return `<svg class="logo" viewBox="0 0 24 24" width="${size}" height="${size}" role="img" aria-label="${icon.title}"${title ? '' : ' aria-hidden="true"'}><path fill="${color || fg}" d="${icon.path}"/></svg>`;
}

/** The mark on its square brand tile — recognisable at a glance. */
export function logoTile(key, cls = '') {
  const [, , bg] = BRANDS[key];
  return `<span class="logo-tile ${cls}" style="background:${bg}">${logo(key)}</span>`;
}

export const brandName = (key) => BRANDS[key][0].title;
