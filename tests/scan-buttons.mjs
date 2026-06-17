import { chromium } from '/opt/node22/lib/node_modules/playwright/node_modules/playwright-core/index.mjs';

const URL = 'http://localhost:4175/Tinklepebble/';
const TIMEOUT = 60000;
const CHROME_PATH = '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';

(async () => {
  const browser = await chromium.launch({ headless: true, executablePath: CHROME_PATH });
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    userAgent: 'Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36',
    ignoreHTTPSErrors: true
  });
  const page = await context.newPage();

  const errors = [];
  const warnings = [];
  const uncaughtExceptions = [];
  const failedButtons = [];
  const workingButtons = [];

  page.on('console', msg => {
    if (msg.type() === 'error') errors.push({ text: msg.text(), location: msg.location() });
    if (msg.type() === 'warning') warnings.push(msg.text());
  });

  page.on('pageerror', err => {
    uncaughtExceptions.push({ message: err.message, stack: err.stack?.split('\n').slice(0, 3).join('\n') });
  });

  console.log('=== LOADING PAGE ===');
  await page.goto(URL, { waitUntil: 'networkidle', timeout: TIMEOUT });
  console.log('Page loaded. Title:', await page.title());

  // Collect initial console errors
  if (errors.length) {
    console.log('\n=== CONSOLE ERRORS ON LOAD ===');
    errors.forEach(e => console.log('  ERROR:', e.text));
  }
  if (uncaughtExceptions.length) {
    console.log('\n=== UNCAUGHT EXCEPTIONS ON LOAD ===');
    uncaughtExceptions.forEach(e => console.log('  EXCEPTION:', e.message, '\n ', e.stack));
  }

  // Find ALL clickable elements with onclick handlers
  const buttons = await page.evaluate(() => {
    const results = [];
    document.querySelectorAll('[onclick]').forEach((el, i) => {
      const onclick = el.getAttribute('onclick');
      const text = (el.textContent || '').trim().slice(0, 40);
      const tag = el.tagName;
      const id = el.id || '';
      const visible = el.offsetParent !== null || el.offsetWidth > 0;
      const rect = el.getBoundingClientRect();
      results.push({
        index: i,
        tag,
        id,
        text,
        onclick,
        visible,
        top: rect.top,
        left: rect.left,
        width: rect.width,
        height: rect.height
      });
    });
    return results;
  });

  console.log(`\n=== FOUND ${buttons.length} ELEMENTS WITH onclick HANDLERS ===`);

  // Test each visible button by clicking it and checking for JS errors
  const visibleButtons = buttons.filter(b => b.visible && b.width > 0 && b.height > 0);
  console.log(`Testing ${visibleButtons.length} visible buttons...\n`);

  for (const btn of visibleButtons) {
    const errorsBefore = errors.length;
    const exceptionsBefore = uncaughtExceptions.length;

    try {
      // Clear error state
      const priorErrors = [...errors];
      const priorExceptions = [...uncaughtExceptions];

      // Try to click via evaluate to catch inline onclick errors
      const clickResult = await page.evaluate((onclick) => {
        try {
          const fn = new Function(onclick);
          fn.call(document.body);
          return { ok: true };
        } catch (e) {
          return { ok: false, error: e.message, stack: e.stack?.split('\n').slice(0, 2).join(' | ') };
        }
      }, btn.onclick);

      // Wait briefly for async errors
      await page.waitForTimeout(200);

      const newErrors = errors.slice(priorErrors.length);
      const newExceptions = uncaughtExceptions.slice(priorExceptions.length);

      if (!clickResult.ok) {
        failedButtons.push({
          ...btn,
          reason: 'JS error: ' + clickResult.error,
          stack: clickResult.stack
        });
        console.log(`  FAIL [${btn.tag}${btn.id ? '#' + btn.id : ''}] "${btn.text}" → onclick="${btn.onclick}"`);
        console.log(`        Error: ${clickResult.error}`);
      } else if (newExceptions.length > 0) {
        failedButtons.push({
          ...btn,
          reason: 'Uncaught exception: ' + newExceptions.map(e => e.message).join('; ')
        });
        console.log(`  FAIL [${btn.tag}${btn.id ? '#' + btn.id : ''}] "${btn.text}" → onclick="${btn.onclick}"`);
        console.log(`        Exception: ${newExceptions.map(e => e.message).join('; ')}`);
      } else if (newErrors.length > 0) {
        const relevantErrors = newErrors.filter(e => !e.text.includes('favicon') && !e.text.includes('404'));
        if (relevantErrors.length) {
          failedButtons.push({
            ...btn,
            reason: 'Console error: ' + relevantErrors.map(e => e.text).join('; ')
          });
          console.log(`  WARN [${btn.tag}${btn.id ? '#' + btn.id : ''}] "${btn.text}" → onclick="${btn.onclick}"`);
          console.log(`        Console: ${relevantErrors.map(e => e.text).join('; ')}`);
        } else {
          workingButtons.push(btn);
        }
      } else {
        workingButtons.push(btn);
      }
    } catch (e) {
      failedButtons.push({ ...btn, reason: 'Click failed: ' + e.message });
      console.log(`  FAIL [${btn.tag}${btn.id ? '#' + btn.id : ''}] "${btn.text}" → onclick="${btn.onclick}"`);
      console.log(`        ${e.message}`);
    }
  }

  // Also check for functions referenced in onclick that don't exist on window
  console.log('\n=== CHECKING FOR UNDEFINED FUNCTIONS ===');
  const undefinedFns = await page.evaluate(() => {
    const missing = [];
    document.querySelectorAll('[onclick]').forEach(el => {
      const onclick = el.getAttribute('onclick');
      // Extract function name(s) from onclick
      const fnNames = onclick.match(/([a-zA-Z_$][a-zA-Z0-9_$]*)\s*\(/g);
      if (fnNames) {
        fnNames.forEach(fn => {
          const name = fn.replace('(', '').trim();
          if (name === 'event' || name === 'this' || name === 'parseInt' || name === 'JSON' || name === 'confirm' || name === 'prompt' || name === 'alert' || name === 'setTimeout') return;
          if (typeof window[name] !== 'function') {
            missing.push({
              fn: name,
              onclick,
              element: el.tagName + (el.id ? '#' + el.id : ''),
              text: (el.textContent || '').trim().slice(0, 30)
            });
          }
        });
      }
    });
    return missing;
  });

  if (undefinedFns.length) {
    console.log(`Found ${undefinedFns.length} references to undefined functions:`);
    undefinedFns.forEach(f => {
      console.log(`  MISSING: ${f.fn}() in ${f.element} "${f.text}" → onclick="${f.onclick}"`);
    });
  } else {
    console.log('All onclick functions are defined on window. ✓');
  }

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('=== SCAN SUMMARY ===');
  console.log('='.repeat(60));
  console.log(`Total onclick elements:    ${buttons.length}`);
  console.log(`Visible (tested):          ${visibleButtons.length}`);
  console.log(`Hidden (not tested):       ${buttons.length - visibleButtons.length}`);
  console.log(`Working:                   ${workingButtons.length}`);
  console.log(`Failed/errored:            ${failedButtons.length}`);
  console.log(`Undefined function refs:   ${undefinedFns.length}`);
  console.log(`Console errors on load:    ${errors.length}`);
  console.log(`Uncaught exceptions:       ${uncaughtExceptions.length}`);

  if (failedButtons.length) {
    console.log('\n=== FAILED BUTTONS DETAIL ===');
    failedButtons.forEach((b, i) => {
      console.log(`\n${i + 1}. [${b.tag}${b.id ? '#' + b.id : ''}] "${b.text}"`);
      console.log(`   onclick: ${b.onclick}`);
      console.log(`   reason:  ${b.reason}`);
      if (b.stack) console.log(`   stack:   ${b.stack}`);
    });
  }

  await browser.close();
  console.log('\nDone.');
})();
