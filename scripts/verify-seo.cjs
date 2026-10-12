// Static SEO regression checks. Run: node scripts/verify-seo.cjs
// These validate repository artifacts, not Cloudflare's deployed runtime.
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const origin = 'https://padathilstays.com';
const files = fs.readdirSync(root).filter(file => file.endsWith('.html'));
const errors = [];
let checks = 0;
const check = (value, message) => { checks++; if (!value) errors.push(message); };
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const decode = value => value.replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#(?:39|x27);|&apos;/g, "'").replace(/&mdash;/g, '—');
const attrs = tag => Object.fromEntries([...tag.matchAll(/([\w:-]+)\s*=\s*(["'])(.*?)\2/gs)].map(match => [match[1], decode(match[3])]));
const route = file => file === 'index.html' ? '/' : '/' + file.slice(0, -5);
const sources = new Map(files.map(file => [origin + route(file), read(file)]));
const titles = new Set();
const descriptions = new Set();
const indexed = [];
const definitions = new Set();
const references = [];
const cleanUrl = value => {
  const url = new URL(value, origin);
  return url.origin === origin && !url.search && !url.pathname.endsWith('.html') && (url.pathname === '/' || !url.pathname.endsWith('/'));
};
const inspectUrl = (value, label) => {
  const url = new URL(value, origin);
  if (url.origin !== origin) return;
  if (path.extname(url.pathname)) check(fs.existsSync(path.join(root, decodeURIComponent(url.pathname))), `${label}: missing asset ${value}`);
  else {
    check(cleanUrl(value), `${label}: noncanonical URL ${value}`);
    check(sources.has(url.origin + url.pathname), `${label}: missing page ${value}`);
  }
};
for (const file of files) {
  const source = read(file);
  const head = source.match(/<head>([\s\S]*?)<\/head>/)?.[1] || '';
  const body = source.match(/<body\b[\s\S]*?<\/body>/)?.[0] || '';
  const metaTags = [...head.matchAll(/<meta\b[^>]*>/g)].map(match => attrs(match[0]));
  const meta = name => metaTags.find(tag => tag.name === name || tag.property === name)?.content;
  const links = [...head.matchAll(/<link\b[^>]*>/g)].map(match => attrs(match[0]));
  const canonicalTags = links.filter(tag => tag.rel === 'canonical');
  const canonical = canonicalTags[0]?.href;
  const title = decode(head.match(/<title>([\s\S]*?)<\/title>/)?.[1] || '');
  const description = meta('description');
  check([...body.matchAll(/<h1\b/g)].length === 1, `${file}: must have one primary heading`);
  check(/<html[^>]+lang="en-IN"/.test(source), `${file}: document language`);
  check(meta('viewport')?.includes('width=device-width'), `${file}: responsive viewport`);
  const headings = [...body.matchAll(/<h([1-6])\b/g)].map(match => Number(match[1]));
  check(headings.every((level, index) => !index || level <= headings[index - 1] + 1), `${file}: skipped heading level`);
  for (const tag of metaTags) {
    const key = tag.name || tag.property;
    if (key) check(metaTags.filter(other => (other.name || other.property) === key).length === 1, `${file}: duplicate metadata ${key}`);
  }
  if (file === '404.html') {
    check(meta('robots')?.includes('noindex'), '404 must remain noindex');
    check(!canonical, '404 must not canonicalize to the homepage');
  } else {
    indexed.push(origin + route(file));
    check(title.length > 0 && !titles.has(title), `${file}: missing or duplicate title`);
    check(description?.length > 0 && !descriptions.has(description), `${file}: missing or duplicate description`);
    titles.add(title); descriptions.add(description);
    check(meta('robots') === 'index, follow', `${file}: production indexing directive`);
    check(canonicalTags.length === 1 && canonical === origin + route(file), `${file}: canonical must match clean route`);
    check(meta('og:url') === canonical, `${file}: social URL must match canonical`);
    check(meta('og:site_name') === 'Padathil Stays', `${file}: social brand`);
    check(meta('og:locale') === 'en_IN', `${file}: social locale`);
    check(meta('og:description') === description, `${file}: social description must match page description`);
    check(meta('twitter:title') === title && meta('twitter:description') === description, `${file}: Twitter metadata consistency`);
    check(meta('twitter:image') === meta('og:image'), `${file}: social image consistency`);
    check(meta('og:image')?.startsWith(origin + '/'), `${file}: absolute social image URL`);
    if (meta('og:image')) inspectUrl(meta('og:image'), file);
    check(/href="\/"/.test(body) && /href="\/contact"/.test(body), `${file}: crawlable shared navigation`);
  }
  const ids = new Set([...source.matchAll(/\bid="([^"]+)"/g)].map(match => match[1]));
  for (const match of body.matchAll(/<(?:a|img|script|source)\b[^>]*>/g)) {
    const tag = attrs(match[0]);
    if (match[0].startsWith('<img')) {
      check(Object.hasOwn(tag, 'alt'), `${file}: image missing alt`);
      check(Number(tag.width) > 0 && Number(tag.height) > 0, `${file}: image must reserve its intrinsic dimensions (${tag.src})`);
      if (tag.src?.includes('/bougainvillea/')) check(tag.alt === '', `${file}: decorative foliage must have empty alt`);
      if (tag.fetchpriority === 'high') check(tag.loading !== 'lazy', `${file}: priority image must not be lazy`);
    }
    const values = [tag.href, tag.src, ...(tag.srcset ? tag.srcset.split(',').map(candidate => candidate.trim().split(/\s+/)[0]) : [])].filter(Boolean);
    for (const value of values) {
      if (/^(?:mailto:|tel:|data:|javascript:)/i.test(value)) continue;
      if (value.startsWith('#')) { check(ids.has(value.slice(1)), `${file}: broken fragment ${value}`); continue; }
      inspectUrl(value, file);
      const url = new URL(value, origin);
      if (url.origin === origin && url.hash && !path.extname(url.pathname)) {
        const targetSource = sources.get(url.origin + url.pathname);
        check(targetSource?.includes(`id="${decodeURIComponent(url.hash.slice(1))}"`), `${file}: broken destination fragment ${value}`);
      }
    }
  }
  const schemas = [...head.matchAll(/<script\b[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)];
  if (file !== '404.html') check(schemas.length === 1, `${file}: one consolidated schema graph`);
  for (const [, json] of schemas) {
    try {
      const data = JSON.parse(json);
      check(data['@context'] === 'https://schema.org' && Array.isArray(data['@graph']), `${file}: schema graph format`);
      const pageIds = new Set();
      const walk = node => {
        if (!node || typeof node !== 'object') return;
        if (node['@id']) {
          if (Object.keys(node).length > 1) definitions.add(node['@id']);
          else references.push([file, node['@id']]);
        }
        for (const [key, value] of Object.entries(node)) {
          if (['url', 'item', 'image', 'logo', 'mainEntityOfPage'].includes(key)) {
            for (const item of Array.isArray(value) ? value : [value]) if (typeof item === 'string') inspectUrl(item, file + ': schema');
          }
          if (value && typeof value === 'object') (Array.isArray(value) ? value : [value]).forEach(walk);
        }
      };
      for (const node of data['@graph'] || []) {
        check(!pageIds.has(node['@id']), `${file}: duplicate top-level schema entity ${node['@id']}`);
        pageIds.add(node['@id']); walk(node);
        if (node['@type'] === 'BreadcrumbList') check(node.itemListElement.every((item, index) => item.position === index + 1), `${file}: breadcrumb positions`);
      }
      if (file === 'index.html') check(data['@graph'].some(node => node['@type'] === 'WebSite' && node.name === 'Padathil Stays' && node.url === origin + '/'), 'homepage site-name schema');
    } catch (error) { check(false, `${file}: schema parse error: ${error.message}`); }
  }
}
for (const [file, id] of references) check(definitions.has(id), `${file}: unresolved schema entity ${id}`);
const sitemap = read('sitemap.xml');
const sitemapUrls = [...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map(match => decode(match[1]));
check(sitemap.includes('xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"'), 'sitemap XML namespace');
check(sitemapUrls.length === new Set(sitemapUrls).size, 'sitemap has no duplicates');
check(sitemapUrls.length === indexed.length && indexed.every(url => sitemapUrls.includes(url)), 'sitemap includes exactly the indexable canonical pages');
for (const url of sitemapUrls) check(cleanUrl(url), `sitemap has noncanonical URL ${url}`);
const robots = read('robots.txt');
check(/User-agent:\s*\*/i.test(robots) && /Allow:\s*\//i.test(robots) && !/Disallow:\s*\//i.test(robots), 'production robots permits crawling');
check(robots.includes(`Sitemap: ${origin}/sitemap.xml`), 'robots references production sitemap');
const headers = read('_headers');
check(!headers.includes(origin) && !/^\/\*/m.test(headers), 'noindex rules do not cover production');
check(headers.includes('https://padathil-resort.pages.dev/*') && headers.includes('https://:version.padathil-resort.pages.dev/*'), 'development and preview noindex scopes');
const redirects = read('_redirects').split(/\r?\n/).filter(line => line.trim() && !line.startsWith('#')).map(line => line.trim().split(/\s+/));
check(new Set(redirects.map(rule => rule[0])).size === redirects.length, 'redirect sources are unique');
for (const [source, target, status] of redirects) {
  check(status === '301' && source !== target && !redirects.some(rule => rule[0] === target), `redirect must be permanent and resolve in one hop: ${source}`);
  check(indexed.includes(origin + target), `redirect destination is indexable: ${target}`);
}
for (const file of files.filter(file => file !== '404.html')) check(redirects.some(([source, target]) => source === '/' + file && target === route(file)), `legacy redirect for ${file}`);
const zoneRules = JSON.parse(read('cloudflare-seo-rules.json'));
check(zoneRules.phase === 'http_request_dynamic_redirect' && zoneRules.rules.length === 2, 'Cloudflare account rule draft has the correct redirect phase');
const zonePaths = zoneRules.rules.flatMap(rule => [...rule.expression.match(/http\.request\.uri\.path in \{([^}]+)\}/)[1].matchAll(/"([^"]+)"/g)].map(match => match[1]));
for (const rule of zoneRules.rules) {
  check(rule.expression.includes('http.host in {"padathilstays.com" "www.padathilstays.com"}') && !rule.expression.includes('pages.dev'), 'Cloudflare rule draft is restricted to production hosts');
  check(rule.action === 'redirect' && rule.action_parameters.from_value.status_code === 301 && rule.action_parameters.from_value.preserve_query_string, 'Cloudflare rule draft is permanent and preserves query strings');
}
for (const [source] of redirects) check(zonePaths.includes(source), `Cloudflare rule draft covers ${source}`);
check(indexed.every(url => !zonePaths.includes(new URL(url).pathname)), 'Cloudflare rule draft cannot redirect a canonical route to itself');
const result = { checks, pages: files.length, indexablePages: indexed.length, errors };
const output = path.join(root, '.impeccable/review/seo');
fs.mkdirSync(output, { recursive: true });
fs.writeFileSync(path.join(output, 'static-results.json'), JSON.stringify(result, null, 2));
if (errors.length) { errors.forEach(error => console.error('FAIL ' + error)); process.exitCode = 1; }
else console.log(`PASS ${checks} SEO checks across ${files.length} pages (${indexed.length} indexable).`);
