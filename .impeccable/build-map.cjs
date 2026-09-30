// Builds a local vector map (SVG) from OpenStreetMap geometry. Usage: node build-map.cjs <name> <south> <west> <north> <east> <roads-regex> [forest]
const fs = require('node:fs');
const [name, s, w, n, e, roads = 'primary|secondary|tertiary', forest = '1'] = process.argv.slice(2);
const b = [+s, +w, +n, +e];
const box = `${b[0]},${b[1]},${b[2]},${b[3]}`;
const TILES = +(process.env.TILES || 1);
const querySql = bx => `[out:json][timeout:90];(way[waterway=river](${bx});way[natural=water](${bx});way[natural=coastline](${bx});${forest === '1' ? `way[landuse=forest](${bx});way[natural=wood](${bx});` : ''}way[highway~"^(${roads})$"](${bx}););out geom;`;
const sleep = ms => new Promise(r => setTimeout(r, ms));
async function fetchTile(bx) {
  for (let attempt = 0; attempt < 4; attempt++) {
    const res = await fetch('https://overpass-api.de/api/interpreter', { method: 'POST', headers: { 'User-Agent': 'padathil-stays-site-build/1.0', 'Content-Type': 'application/x-www-form-urlencoded' }, body: 'data=' + encodeURIComponent(querySql(bx)) });
    if (res.ok) return (await res.json()).elements;
    await sleep(8000 * (attempt + 1));
  }
  throw new Error('overpass failed for ' + bx);
}
(async () => {
  const seen = new Map();
  for (let i = 0; i < TILES; i++) for (let j = 0; j < TILES; j++) {
    const bx = [b[0] + (b[2] - b[0]) * j / TILES, b[1] + (b[3] - b[1]) * i / TILES, b[0] + (b[2] - b[0]) * (j + 1) / TILES, b[1] + (b[3] - b[1]) * (i + 1) / TILES].map(v => v.toFixed(4)).join(',');
    for (const el of await fetchTile(bx)) seen.set(el.id, el);
    await sleep(3000);
  }
  const data = { elements: [...seen.values()] };
  const W = 900, H = 540;
  const pr = p => [((p.lon - b[1]) / (b[3] - b[1]) * W).toFixed(0), ((b[2] - p.lat) / (b[2] - b[0]) * H).toFixed(0)];
  const minNodes = +(process.env.MIN_NODES || 0);
  const paths = (test, close) => data.elements.filter(x => x.geometry && x.geometry.length >= (x.tags.highway || x.tags.natural === 'coastline' ? 2 : minNodes) && test(x.tags)).map(x => `<path d="${x.geometry.map((p, i) => (i ? 'L' : 'M') + pr(p).join(',')).join(' ')}${close(x.tags) ? 'Z' : ''}"/>`).join('');
  const isArea = t => t.natural === 'water' || t.landuse === 'forest' || t.natural === 'wood';
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}"><metadata>Geographic geometry: OpenStreetMap contributors, ODbL. Downloaded ${new Date().toISOString().slice(0, 10)}. Bounds: ${b}. https://www.openstreetmap.org/copyright</metadata><rect width="${W}" height="${H}" fill="#ece5d5"/><g fill="#bbc3a7" stroke="#73816c" stroke-width=".5" opacity=".8">${paths(t => t.landuse === 'forest' || t.natural === 'wood', isArea)}</g><g fill="none" stroke="#c9a466" stroke-width="1.7" opacity=".65">${paths(t => t.highway, () => false)}</g><g fill="#90b5b0" stroke="#507e79" stroke-width="1">${paths(t => t.natural === 'water', isArea)}</g><g fill="none" stroke="#507e79" stroke-width="3" stroke-linejoin="round">${paths(t => t.waterway === 'river' || t.natural === 'coastline', () => false)}</g></svg>`;
  fs.writeFileSync(`images/${name}-local-map.svg`, svg);
  console.log(name, data.elements.length, 'features', (svg.length / 1024).toFixed(0) + 'KB');
})().catch(err => { console.error(err); process.exitCode = 1; });
