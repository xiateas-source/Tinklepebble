import { test, expect } from '@playwright/test';
import fs from 'fs';

test.describe('D&D App UX Audit', () => {
  const SELECTORS = {
    narrativeTab: '#chat-tab-narrative',
    rulesTab: '#chat-tab-ooc',
    oocTab: '#chat-tab-party',
    readMoreBtn: '.read-more',
    showLessBtn: '.show-less',
    commandInput: '#chat-quick-input',
    sendBtn: '.chat-quick-send',
    sheetNav: '#nav-btn-party',
    logisticsNav: '#nav-btn-logistics',
    systemsNav: '#nav-btn-systems',
    mechBadgeHdr: '.mech-badge-hdr',
    mechPills: '.mech-pills',
    mechPill: '.mech-pill',
    suggestChip: '.chat-suggest-chip',
    consequenceDelete: '[aria-label="Delete consequence"]',
    consequenceResolve: '[aria-label="Mark consequence resolved"]',
    clearResolved: '[aria-label="Clear all resolved consequences"]',
    navBtn: '.nav-btn',
    navBtnLbl: '.nav-btn-lbl',
    chatTabBtn: '.chat-tab-btn',
  };

  test('Audit critical user paths for mobile UX friction', async ({ page }) => {
    const auditLog = [];
    const W = 412, H = 915;
    await page.setViewportSize({ width: W, height: H });

    await page.goto('http://localhost:5173/Tinklepebble/');
    await page.waitForLoadState('networkidle');

    auditLog.push(`[INIT] Mobile viewport ${W}x${H}`);
    await page.screenshot({ path: 'audit_01_landing.png' });

    // --- PHASE 1: Chat input & message truncation ---
    auditLog.push('\n--- PHASE 1: Chat Input & Truncation ---');

    const inputVisible = await page.isVisible(SELECTORS.commandInput);
    auditLog.push(`Chat input visible: ${inputVisible}`);
    expect(inputVisible).toBeTruthy();

    const inputBox = await page.locator(SELECTORS.commandInput).boundingBox();
    auditLog.push(`Chat input size: ${JSON.stringify(inputBox)}`);

    if (await page.isVisible(SELECTORS.readMoreBtn)) {
      auditLog.push('[OK] Read more truncation present');
      await page.click(SELECTORS.readMoreBtn);
      if (await page.isVisible(SELECTORS.showLessBtn)) {
        auditLog.push('[OK] Show less collapse available');
      } else {
        auditLog.push('[UX Alert] No collapse option after expanding');
      }
      await page.screenshot({ path: 'audit_02_expanded_narrative.png' });
    }

    // --- PHASE 2: Chat tabs & tap targets ---
    auditLog.push('\n--- PHASE 2: Chat Tab Tap Targets ---');
    const chatTabs = page.locator(SELECTORS.chatTabBtn);
    const tabCount = await chatTabs.count();
    for (let i = 0; i < tabCount; i++) {
      const box = await chatTabs.nth(i).boundingBox();
      if (box) {
        const ok = box.height >= 36;
        auditLog.push(`Chat tab ${i}: ${box.width.toFixed(0)}x${box.height.toFixed(0)}px ${ok ? '✓' : '⚠ too small'}`);
      }
    }

    for (const tab of [SELECTORS.narrativeTab, SELECTORS.rulesTab, SELECTORS.oocTab]) {
      if (await page.isVisible(tab)) {
        await page.click(tab);
        await page.waitForTimeout(200);
      }
    }
    await page.click(SELECTORS.narrativeTab);

    // --- PHASE 3: Bottom nav tap targets ---
    auditLog.push('\n--- PHASE 3: Bottom Nav Audit ---');
    const navBtns = page.locator(SELECTORS.navBtn);
    const navCount = await navBtns.count();
    for (let i = 0; i < navCount; i++) {
      const box = await navBtns.nth(i).boundingBox();
      if (box) {
        const ok = box.height >= 44;
        auditLog.push(`Nav btn ${i}: ${box.width.toFixed(0)}x${box.height.toFixed(0)}px ${ok ? '✓' : '⚠ below 44px recommended'}`);
      }
    }

    // --- PHASE 4: Suggestion chips ---
    auditLog.push('\n--- PHASE 4: Suggestion Chips ---');
    const chips = page.locator(SELECTORS.suggestChip);
    const chipCount = await chips.count();
    auditLog.push(`Suggestion chips visible: ${chipCount}`);
    if (chipCount > 0) {
      const chipBox = await chips.first().boundingBox();
      auditLog.push(`First chip size: ${JSON.stringify(chipBox)}`);
    }

    // --- PHASE 5: Character Sheet ---
    auditLog.push('\n--- PHASE 5: Character Sheet ---');
    if (await page.isVisible(SELECTORS.sheetNav)) {
      await page.click(SELECTORS.sheetNav);
      await page.waitForTimeout(300);
      await page.screenshot({ path: 'audit_03_character_sheet.png' });
      auditLog.push('[OK] Character sheet accessible');
    } else {
      auditLog.push('[ERROR] Sheet nav not found');
    }

    // --- PHASE 6: Consequences ---
    auditLog.push('\n--- PHASE 6: Consequence Management ---');
    if (await page.isVisible(SELECTORS.logisticsNav)) {
      await page.click(SELECTORS.logisticsNav);
      await page.waitForTimeout(300);
      await page.screenshot({ path: 'audit_04_logistics.png' });

      const hasDelete = await page.isVisible(SELECTORS.consequenceDelete);
      const hasResolve = await page.isVisible(SELECTORS.consequenceResolve);
      const hasClearAll = await page.isVisible(SELECTORS.clearResolved);
      auditLog.push(`Delete action: ${hasDelete ? '✓' : '—'}`);
      auditLog.push(`Resolve action: ${hasResolve ? '✓' : '—'}`);
      auditLog.push(`Clear resolved: ${hasClearAll ? '✓' : '—'}`);
    }

    // --- PHASE 7: Mechanic pills ---
    auditLog.push('\n--- PHASE 7: Mechanic Pills ---');
    await page.click('#nav-btn-log');
    await page.waitForTimeout(200);
    const mechHeaders = page.locator(SELECTORS.mechBadgeHdr);
    const mechCount = await mechHeaders.count();
    auditLog.push(`Mechanic badge headers: ${mechCount}`);
    if (mechCount > 0) {
      const mechBox = await mechHeaders.first().boundingBox();
      auditLog.push(`Mech badge tap target: ${JSON.stringify(mechBox)}`);
    }

    fs.writeFileSync('ux_audit_report.txt', auditLog.join('\n'));
    console.log('UX audit complete. See ux_audit_report.txt and screenshots.');
  });
});
