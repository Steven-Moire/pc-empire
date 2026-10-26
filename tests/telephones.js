const { chromium, devices } = require('playwright');
const path = require('path');
const fs = require('fs');

const GAME = 'file:///' + path.resolve(__dirname, '..', 'index.html').replace(/\\/g, '/');
const OUT = path.join(__dirname, 'captures');
fs.mkdirSync(OUT, { recursive: true });

const PHONES = [
  ['iphone-se', devices['iPhone SE']],
  ['iphone-14-pro-max', devices['iPhone 14 Pro Max']],
  ['pixel-7', devices['Pixel 7']],
  ['galaxy-s9', devices['Galaxy S9+']],
  ['petit-android-360x640', { ...devices['Galaxy S5'] }],
  ['iphone-se-paysage', devices['iPhone SE landscape']],
  ['ipad-mini', devices['iPad Mini']],
];

(async () => {
  const browser = await chromium.launch({ args: ['--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const report = [];
  for (const [name, dev] of PHONES) {
    const ctx = await browser.newContext({ ...dev });
    const page = await ctx.newPage();
    const errors = [];
    page.on('pageerror', e => errors.push('pageerror: ' + e.message));
    page.on('console', m => { if (m.type() === 'error') errors.push('console: ' + m.text()); });
    const failed = [];
    page.on('requestfailed', r => failed.push(r.url()));

    const cdp = await ctx.newCDPSession(page);
    const t0 = Date.now();
    await page.goto(GAME, { waitUntil: 'load' });
    const loadMs = Date.now() - t0;
    await page.screenshot({ path: `${OUT}/${name}-1-accueil.png` });

    await page.fill('#nameInput', 'TestCorp');
    await page.tap('#joinBtn');
    // v6 : l'intro de NOVA est obligatoire, on la passe pour le test
    await page.waitForTimeout(600);
    await page.evaluate(() => { if (typeof endIntro === 'function' && dlg && dlg.intro) endIntro(false); });
    await page.waitForTimeout(1500);
    await page.screenshot({ path: `${OUT}/${name}-2-jeu.png` });

    const info = await page.evaluate(() => {
      const r = id => { const el = document.getElementById(id); if (!el) return null; const b = el.getBoundingClientRect(); return { x: Math.round(b.x), y: Math.round(b.y), w: Math.round(b.width), h: Math.round(b.height), bottom: Math.round(b.bottom), top: Math.round(b.top) }; };
      const gl = document.getElementById('gl').getContext('webgl2') || null;
      let renderer = 'n/a';
      try { const c = document.createElement('canvas').getContext('webgl'); const e = c.getExtension('WEBGL_debug_renderer_info'); renderer = c.getParameter(e.UNMASKED_RENDERER_WEBGL); } catch (e) {}
      const small = [...document.querySelectorAll('button')].filter(b => b.offsetParent).map(b => { const x = b.getBoundingClientRect(); return { id: b.id || b.className || b.textContent.trim().slice(0, 15), w: Math.round(x.width), h: Math.round(x.height) }; }).filter(b => b.w < 44 || b.h < 44);
      return {
        vw: innerWidth, vh: innerHeight, dpr: devicePixelRatio, renderer,
        has3D: typeof G !== 'undefined' && !!G,
        tapBtn: r('tapBtn'), dock: r('dock'), topbar: r('topbar'), viewBtn: r('viewBtn'), hint: r('hint'),
        tapOverlapsDock: !!(r('tapBtn') && r('dock')) && r('tapBtn').bottom > r('dock').top + 30,
        hScroll: document.documentElement.scrollWidth > innerWidth,
        smallTargets: small,
      };
    });

    // FPS sur 3 s
    const fps = await page.evaluate(() => new Promise(res => { let n = 0; const s = performance.now(); const f = () => { n++; if (performance.now() - s < 3000) requestAnimationFrame(f); else res(Math.round(n / 3)); }; requestAnimationFrame(f); }));
    // FPS avec CPU ralenti x4 (téléphone d'entrée de gamme)
    await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 });
    const fpsLow = await page.evaluate(() => new Promise(res => { let n = 0; const s = performance.now(); const f = () => { n++; if (performance.now() - s < 3000) requestAnimationFrame(f); else res(Math.round(n / 3)); }; requestAnimationFrame(f); }));
    await cdp.send('Emulation.setCPUThrottlingRate', { rate: 1 });
    const heap = await page.evaluate(() => performance.memory ? Math.round(performance.memory.usedJSHeapSize / 1e6) : null);

    // 50 taps sur CODER
    const tb = info.tapBtn;
    for (let i = 0; i < 50; i++) await page.touchscreen.tap(tb.x + tb.w / 2, tb.y + tb.h / 2);
    const cashAfterTaps = await page.evaluate(() => S.cash);

    // panneaux
    for (const p of ['shop', 'atelier', 'loot', 'market', 'rank']) {
      await page.tap('#dk-' + p, { force: true, timeout: 3000 }).catch(() => page.evaluate(n => openPanel(n), p));
      await page.waitForTimeout(450);
      await page.screenshot({ path: `${OUT}/${name}-3-${p}.png` });
      await page.tap('#closeBtn', { timeout: 3000 }).catch(() => {});
      await page.waitForTimeout(300);
    }
    report.push({ name, loadMs, ...info, fps, fpsCpuX4: fpsLow, heapMB: heap, cashAfter50Taps: cashAfterTaps, errors, failedRequests: failed });
    await ctx.close();
  }

  // Test hors-ligne (Firebase injoignable)
  const ctx = await browser.newContext({ ...devices['Pixel 7'], offline: true });
  const page = await ctx.newPage();
  const errs = []; page.on('pageerror', e => errs.push(e.message));
  const t0 = Date.now();
  await page.goto(GAME, { waitUntil: 'load', timeout: 60000 }).catch(e => errs.push('goto: ' + e.message));
  report.push({ name: 'pixel-7-HORS-LIGNE', loadMs: Date.now() - t0, joinVisible: await page.isVisible('#join').catch(() => false), errors: errs });
  await ctx.close();

  await browser.close();
  fs.writeFileSync(path.join(OUT, 'rapport-telephones.json'), JSON.stringify(report, null, 2));
  console.log(JSON.stringify(report, null, 1));
})();
