const puppeteer = require('/Users/tonymichael/Documents/python/node_modules/puppeteer');
const path = require('path');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  const file = 'file://' + path.join(__dirname, 'index.html');

  await page.setViewport({ width: 1280, height: 900, deviceScaleFactor: 1 });
  await page.goto(file, { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 2500));
  await page.screenshot({ path: path.join(__dirname, 'render.png'), fullPage: true });

  await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 1 });
  await page.reload({ waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 2000));
  await page.screenshot({ path: path.join(__dirname, 'render-mobile.png'), fullPage: true });

  await browser.close();
  console.log('done');
})();
