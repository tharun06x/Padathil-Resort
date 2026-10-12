// Integration checks for the static site. Requires Node 22+ and installed Chrome.
// Run: node scripts/verify-site.cjs [--screenshots]
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const http = require('node:http');
const { spawn } = require('node:child_process');
const assert = require('node:assert/strict');
const root = path.resolve(__dirname, '..');
const interactionsOnly = process.argv.includes('--interactions-only');
const output = path.join(root, '.impeccable/review/implementation-verification', interactionsOnly ? 'interaction-confirmation' : '');
const capture = process.argv.includes('--screenshots');
const pause = ms => new Promise(resolve => setTimeout(resolve, ms));
const files = fs.readdirSync(root).filter(file => file.endsWith('.html'));
const reports = [];
const checks = [];
fs.mkdirSync(output, { recursive: true });
// Emulate the repository's explicit path redirects for local integration tests.
// Deployed Cloudflare headers and domain rules are checked separately.
const redirects = new Map(fs.readFileSync(path.join(root, '_redirects'), 'utf8')
  .split(/\r?\n/).filter(line => line.trim() && !line.startsWith('#'))
  .map(line => { const [source, destination, status] = line.trim().split(/\s+/); return [source, { destination, status: Number(status) }]; }));
const server = http.createServer((request, response) => {
  const url = new URL(request.url, 'http://localhost');
  let route = decodeURIComponent(url.pathname);
  if (redirects.has(route)) {
    const redirect = redirects.get(route);
    response.writeHead(redirect.status, { Location: redirect.destination + url.search });
    response.end();
    return;
  }
  if (route === '/') route = '/index.html';
  else if (!path.extname(route)) route += '.html';
  const target = path.resolve(root, '.' + route);
  const allowed = target.startsWith(root + path.sep) && !route.split('/').some(part => part.startsWith('.'));
  const exists = allowed && fs.existsSync(target) && fs.statSync(target).isFile();
  const file = exists ? target : path.join(root, '404.html');
  const mime = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.webp': 'image/webp', '.svg': 'image/svg+xml', '.otf': 'font/otf', '.woff2': 'font/woff2', '.xml': 'application/xml', '.txt': 'text/plain' };
  response.writeHead(exists ? 200 : 404, { 'Content-Type': mime[path.extname(file)] || 'application/octet-stream' });
  response.end(fs.readFileSync(file));
});

(async () => {
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const origin = `http://127.0.0.1:${server.address().port}`;
  const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'padathil-verification-'));
  const chromePath = process.env.CHROME_PATH || (process.platform === 'win32' ? 'C:/Program Files/Google/Chrome/Application/chrome.exe' : 'google-chrome');
  const chrome = spawn(chromePath, ['--headless=new', '--remote-debugging-port=0', `--user-data-dir=${profile}`, '--no-first-run', '--no-default-browser-check', 'about:blank'], { windowsHide: true, stdio: 'ignore' });
  let ws;
  try {
    let port;
    for (let attempt = 0; attempt < 50; attempt++) {
      const marker = path.join(profile, 'DevToolsActivePort');
      if (fs.existsSync(marker)) { port = fs.readFileSync(marker, 'utf8').split('\n')[0]; break; }
      await pause(200);
    }
    assert.ok(port, 'Chrome did not start; check browser permissions and CHROME_PATH');
    const targets = await (await fetch(`http://127.0.0.1:${port}/json`)).json();
    ws = new WebSocket(targets.find(target => target.type === 'page').webSocketDebuggerUrl);
    await new Promise(resolve => ws.addEventListener('open', resolve, { once: true }));
    let id = 0;
    const pending = new Map();
    let exceptions = [];
    ws.addEventListener('message', event => {
      const message = JSON.parse(event.data);
      if (message.id) { pending.get(message.id)?.(message); pending.delete(message.id); }
      else if (message.method === 'Runtime.exceptionThrown') exceptions.push(message.params.exceptionDetails);
    });
    const call = (method, params = {}) => new Promise((resolve, reject) => {
      const number = ++id;
      const timer = setTimeout(() => { pending.delete(number); reject(Error(`Timeout: ${method}`)); }, 20000);
      pending.set(number, message => { clearTimeout(timer); message.error ? reject(Error(JSON.stringify(message.error))) : resolve(message.result); });
      ws.send(JSON.stringify({ id: number, method, params }));
    });
    const evaluate = async expression => {
      const result = await call('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
      if (result.exceptionDetails) throw Error(JSON.stringify(result.exceptionDetails));
      return result.result.value;
    };
    const viewport = async (width, height = 900) => {
      await call('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor: 1, mobile: false });
      await pause(100);
    };
    const go = async route => {
      exceptions = [];
      await call('Page.navigate', { url: origin + route });
      await pause(500);
      for (let attempt = 0; attempt < 30; attempt++) {
        if (await evaluate('document.readyState === "complete"')) break;
        await pause(150);
      }
      await evaluate('Promise.race([document.fonts.ready, new Promise(resolve => setTimeout(resolve, 2000))])');
    };
    const key = async (name, code) => {
      await call('Input.dispatchKeyEvent', { type: 'rawKeyDown', key: name, code: name, windowsVirtualKeyCode: code });
      if (name === 'Enter') await call('Input.dispatchKeyEvent', { type: 'char', key: name, text: '\r', windowsVirtualKeyCode: code });
      await call('Input.dispatchKeyEvent', { type: 'keyUp', key: name, code: name, windowsVirtualKeyCode: code });
      // Native dialog close and details toggle events settle on a later task.
      await pause(100);
    };
    const check = (name, value) => { checks.push({ name, pass: !!value }); assert.ok(value, name); };
    await call('Page.enable');
    await call('Runtime.enable');
    await call('Network.enable');
    for (const file of interactionsOnly ? [] : files) {
      const source = fs.readFileSync(path.join(root, file), 'utf8');
      check(`${file}: UTF-8 copy has no encoding artifacts`, !/[\u00c3\u201a][\u00c2\u201a]|\u00e2\u20ac|\ufffd/.test(source));
      const route = file === 'index.html' ? '/' : '/' + file.slice(0, -5);
      await viewport(1440);
      await go(route);
      const height = await evaluate('document.documentElement.scrollHeight');
      for (let y = 0; y < height; y += 650) {
        await evaluate(`window.scrollTo({top:${y}, behavior:'instant'})`);
        await pause(100);
      }
      await pause(700);
      const page = await evaluate(`({route:location.pathname,h1:document.querySelectorAll('h1').length,main:document.querySelectorAll('main').length,canonical:document.querySelector('link[rel=canonical]')?.href,loading:[...document.querySelectorAll('img.is-image-loading')].filter(image=>image.getClientRects().length).map(image=>image.src),broken:[...document.images].filter(image=>image.complete&&!image.naturalWidth&&image.getAttribute('src')).map(image=>image.src),imageRatioErrors:[...document.images].filter(image=>image.naturalWidth&&image.width&&image.height&&image.hasAttribute('width')&&Math.abs((Number(image.getAttribute('width'))/Number(image.getAttribute('height')))/(image.naturalWidth/image.naturalHeight)-1)>.025).map(image=>image.src),current:[...document.querySelectorAll('[data-nav-link][aria-current],.stay-option[aria-current=page]')].map(link=>link.getAttribute('href')),layouts:[]})`);
      check(`${route}: one h1 and main`, page.h1 === 1 && page.main === 1);
      check(`${route}: images leave loading state`, page.loading.length === 0);
      check(`${route}: images load`, page.broken.length === 0);
      check(`${route}: correct intrinsic proportions`, page.imageRatioErrors.length === 0);
      if (file !== '404.html') {
        check(`${route}: canonical matches final route`, page.canonical === 'https://padathilstays.com' + route);
        check(`${route}: current navigation`, page.current.includes(file.startsWith('blog-') ? '/blog' : route));
      }
      for (const width of [320, 390, 430, 768, 1280, 1440, 1920]) {
        await viewport(width, width < 600 ? 844 : 900);
        await pause(100);
        const layout = await evaluate('({width:innerWidth,scrollWidth:document.documentElement.scrollWidth,height:document.documentElement.scrollHeight})');
        check(`${route}: no overflow at ${width}`, layout.scrollWidth <= width);
        page.layouts.push(layout);
        if (capture && (width === 390 || width === 1440)) {
          await evaluate('window.scrollTo({top:0,behavior:"instant"})');
          // Bounded viewport captures avoid Chrome hanging on very tall, vh-based pages.
          const image = await call('Page.captureScreenshot', { format: 'png' });
          fs.writeFileSync(path.join(output, `${file.slice(0, -5)}-${width}.png`), Buffer.from(image.data, 'base64'));
          const section = await evaluate(`(() => { const target = document.querySelector('.nc-signature, .article-contents, .gallery-chapter, .contact-desk, .about-roots, #properties, .faq-list'); if (!target) return false; window.scrollTo({top: target.getBoundingClientRect().top + scrollY - 112, behavior:'instant'}); return true; })()`);
          if (section) {
            await pause(250);
            const detail = await call('Page.captureScreenshot', { format: 'png' });
            fs.writeFileSync(path.join(output, `${file.slice(0, -5)}-${width}-detail.png`), Buffer.from(detail.data, 'base64'));
          }
        }
      }
      check(`${route}: no script exceptions`, exceptions.length === 0);
      reports.push(page);
      fs.writeFileSync(path.join(output, 'pages.json'), JSON.stringify(reports, null, 2));
      console.log(`PASS ${route}: images, routes and 7 viewport widths`);
    }
    for (const [route, property] of [['/nature-castle-vattavada', 'Nature Castle Resort'], ['/niva-waterways', 'Niva Waterways'], ['/riparian-ayur-resorts', 'Riparian Resort']]) {
      await viewport(1440);
      await go(route);
      await evaluate('document.querySelector(".header-book").click()');
      check(`${route}: enquiry property selected`, await evaluate('document.querySelector("[name=property]").value') === property);
      await key('Escape', 27);
    }
    await viewport(390, 844);
    await go('/contact');
    await evaluate('document.querySelector(".contact-primary-action").focus()');
    await key('Enter', 13);
    check('enquiry opens by keyboard', await evaluate('document.querySelector("dialog").open'));
    for (const width of [320, 390, 430, 768, 1280, 1440, 1920]) {
      await viewport(width, width < 600 ? 844 : 900);
      check(`enquiry dialog has no inner overflow at ${width}`, await evaluate('document.querySelector("dialog").scrollWidth <= document.querySelector("dialog").clientWidth'));
    }
    await viewport(390, 844);
    await evaluate('window.testWhatsApp=[];window.open=url=>{window.testWhatsApp.push(url);return null}');
    const contrast = await evaluate(`(() => { const luminance = rgb => { const values = rgb.match(/[0-9.]+/g).slice(0,3).map(value => Number(value)/255).map(value => value <= .04045 ? value/12.92 : ((value+.055)/1.055)**2.4); return values[0]*.2126+values[1]*.7152+values[2]*.0722; }; const bg=luminance(getComputedStyle(document.querySelector('dialog')).backgroundColor); const fg=luminance(getComputedStyle(document.querySelector('[name=guests]'),'::placeholder').color); return (Math.max(bg,fg)+.05)/(Math.min(bg,fg)+.05); })()`);
    check('form placeholder contrast meets AA', contrast >= 4.5);
    if (capture) {
      const dialogImage = await call('Page.captureScreenshot', { format: 'png' });
      fs.writeFileSync(path.join(output, 'enquiry-dialog-390.png'), Buffer.from(dialogImage.data, 'base64'));
    }
    for (const value of ['0', '-2', '1.5']) {
      await evaluate(`document.querySelector('[name=guests]').value=${JSON.stringify(value)};document.querySelector('.quick-enquiry-form').requestSubmit()`);
      check(`reject ${value} guests`, await evaluate('window.testWhatsApp.length===0 && !document.querySelector(".quick-enquiry-error").hidden && document.activeElement.name==="guests"'));
    }
    await evaluate('document.querySelector("[name=guests]").value="2";document.querySelector("[name=checkIn]").value="2026-11-10";document.querySelector("[name=checkOut]").value="2026-11-09";document.querySelector(".quick-enquiry-form").requestSubmit()');
    check('reject invalid date order', await evaluate('window.testWhatsApp.length===0 && document.activeElement.name==="checkOut"'));
    await evaluate('document.querySelector("[name=checkOut]").value="2026-11-12";document.querySelector("[name=note]").value="Family & friends + a question";document.querySelector(".quick-enquiry-form").requestSubmit()');
    check('valid handoff retains draft and fallback', await evaluate('window.testWhatsApp.length===1 && document.querySelector("dialog").open && document.querySelector(".quick-enquiry-handoff a").href===window.testWhatsApp[0] && new URL(window.testWhatsApp[0]).searchParams.get("text").includes("Family & friends + a question")'));
    await key('Escape', 27);
    check('enquiry returns keyboard focus', await evaluate('document.activeElement===document.querySelector(".contact-primary-action")'));
    await evaluate('document.querySelector(".mobile-menu summary").focus()');
    await key('Enter', 13);
    check('mobile navigation keyboard opens', await evaluate('document.querySelector(".mobile-menu").open'));
    await key('Escape', 27);
    check('mobile navigation escape', await evaluate('!document.querySelector(".mobile-menu").open'));
    await go('/faq');
    await evaluate('document.querySelector(".faq-list details:nth-child(2) summary").focus()');
    await key('Enter', 13);
    check('FAQ keyboard opens', await evaluate('document.querySelector(".faq-list details:nth-child(2)").open'));
    await go('/gallery');
    await evaluate('document.querySelector("#gallery-mobile-filter").value="niva";document.querySelector("#gallery-mobile-filter").dispatchEvent(new Event("change"));document.querySelector("[data-chapter=niva] .gallery-item a").focus()');
    await key('Enter', 13);
    check('gallery filter and contained viewer', await evaluate('!document.querySelector(".gallery-viewer").hidden && document.querySelector("main").inert && document.querySelector("[data-count]").textContent==="1 / 2"'));
    await key('ArrowRight', 39);
    check('gallery next image', await evaluate('document.querySelector("[data-count]").textContent==="2 / 2"'));
    await key('Escape', 27);
    check('gallery closes and restores focus', await evaluate('document.querySelector(".gallery-viewer").hidden && !document.querySelector("main").inert && document.activeElement.closest(".gallery-item")!==null'));
    await go('/niva-waterways');
    check('hero motion control is removed', await evaluate('document.querySelector(".motion-toggle") === null'));
    await evaluate('document.querySelector("[data-place=kochi]").click()');
    check('explorer labels representative imagery', await evaluate('document.querySelector("[data-explorer-title]").textContent==="Kochi" && document.querySelector("[data-explorer-image-note]").textContent.includes("Representative")'));
    await viewport(1440);
    const nextStay = await evaluate('document.querySelector("[data-next-stay]").href');
    await evaluate('window.scrollTo({top:0,behavior:"instant"});document.querySelector("[data-next-stay]").click()');
    await pause(1500);
    check('next-stay navigation uses the final URL without a redirect', await evaluate(`location.pathname === ${JSON.stringify(new URL(nextStay).pathname)} && performance.getEntriesByType('navigation')[0].redirectCount === 0`));
    await viewport(390, 844);
    await go('/');
    check('homepage motion controls are removed', await evaluate('document.querySelector(".motion-toggle") === null && !document.documentElement.classList.contains("motion-paused")'));
    await call('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'reduce' }] });
    await go('/riparian-ayur-resorts');
    check('reduced motion keeps content visible', await evaluate('document.getAnimations().filter(animation=>animation.playState==="running"&&animation.animationName!=="route-progress").length===0 && [...document.querySelectorAll("[data-riparian-reveal]")].every(section=>getComputedStyle(section).opacity!=="0")'));
    for (const [source, redirect] of redirects) {
      const legacy = await fetch(origin + source, { redirect: 'manual' });
      check(`${source}: permanent redirect to canonical route`, legacy.status === 301 && legacy.headers.get('location') === redirect.destination);
      check(`${source}: destination resolves without another redirect`, (await fetch(origin + redirect.destination, { redirect: 'manual' })).status === 200);
    }
    await call('Emulation.setScriptExecutionDisabled', { value: true });
    await go('/');
    check('homepage remains scrollable without JavaScript', await evaluate('getComputedStyle(document.body).overflow !== "hidden" && getComputedStyle(document.querySelector(".page-loader")).display === "none"'));
    check('homepage has native navigation without JavaScript', await evaluate('document.querySelector(".desktop-nav a[href=\\"/about\\"]") !== null && getComputedStyle(document.querySelector("h1")).visibility === "visible"'));
    if (capture) {
      const noScriptImage = await call('Page.captureScreenshot', { format: 'png' });
      fs.writeFileSync(path.join(output, 'index-no-javascript-390.png'), Buffer.from(noScriptImage.data, 'base64'));
    }
    await go('/gallery');
    check('gallery provides direct photograph links without JavaScript', await evaluate('[...document.querySelectorAll(".gallery-item a")].every(link => link.getAttribute("href").startsWith("images/") && link.getClientRects().length > 0)'));
    await call('Emulation.setScriptExecutionDisabled', { value: false });
    const missing = await fetch(origin + '/nonexistent-verification-route');
    check('missing route returns 404', missing.status === 404);
    const headers = fs.readFileSync(path.join(root, '_headers'), 'utf8');
    check('noindex rules target only dev and preview hosts', headers.includes('https://padathil-resort.pages.dev/*') && headers.includes('https://:version.padathil-resort.pages.dev/*') && !headers.includes('padathilstays.com'));
    fs.writeFileSync(path.join(output, 'checks.json'), JSON.stringify(checks, null, 2));
    console.log(`PASS ${checks.length} ${interactionsOnly ? 'interaction, redirect and no-JavaScript checks' : `checks across ${files.length} pages`}. Results: ${output}`);
    await call('Browser.close');
  } finally {
    if (ws) ws.close();
    chrome.kill();
    server.close();
    fs.writeFileSync(path.join(output, 'checks.json'), JSON.stringify(checks, null, 2));
  }
})().catch(error => { console.error(error.stack); server.close(); process.exitCode = 1; });
