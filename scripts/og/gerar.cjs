// Gera a imagem de prévia para links (public/og.png, 1200×630), usada pelo LinkedIn, WhatsApp etc.
// Não faz parte do build: rode de novo só quando mudar o texto.  node scripts/og/gerar.cjs
const { chromium } = require('playwright');
const { join } = require('node:path');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1200, height: 630 } });
  await page.goto('file://' + join(__dirname, 'og.html'));
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(300);
  await page.screenshot({ path: join(__dirname, '..', '..', 'public', 'og.png') });
  await browser.close();
})();
