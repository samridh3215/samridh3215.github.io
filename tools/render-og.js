// Renders tools/og-card.html to assets/img/og-image.png at 1200x630.
// Usage (from repo root): node tools/render-og.js
// Needs Playwright + Chromium; Python 3 with Pillow to shrink the PNG.
const path = require('path');
const { execFileSync } = require('child_process');
const { chromium } = require('playwright');

(async () => {
  const out = path.join(__dirname, '..', 'assets', 'img', 'og-image.png');
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
  await page.goto('file://' + path.join(__dirname, 'og-card.html'));
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(300);
  await page.screenshot({ path: out });
  await browser.close();

  // Quantize to a 256-colour palette so link previews load reliably
  // (WhatsApp drops preview images over ~300 KB).
  try {
    execFileSync('python3', ['-c',
      'import sys;from PIL import Image;p=sys.argv[1];' +
      'Image.open(p).convert("RGB").quantize(256,method=Image.Quantize.MEDIANCUT,dither=Image.Dither.FLOYDSTEINBERG).save(p,optimize=True)',
      out]);
  } catch (e) {
    console.warn('Pillow quantize failed; PNG left full size:', e.message);
  }
})();
