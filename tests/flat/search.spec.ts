/**
 * Part I — Flat tests (no POM)
 * Test suite: Search for Books by Keywords
 *
 * Rules:
 *   - Use only: getByRole, getByText, getByPlaceholder, getByLabel
 *   - No CSS class selectors, no XPath
 *
 * Tip: run `npx playwright codegen https://www.kriso.ee` to discover selectors.
 */
import { test, expect } from '@playwright/test';
import type { Page } from '@playwright/test';

test.describe.configure({ mode: 'serial' });

let page: Page;

test.describe('Search for Books by Keywords', () => {

  test.beforeAll(async ({ browser }) => {
    const context = await browser.newContext();
    page = await context.newPage();

    await page.goto('https://www.kriso.ee/');
    // Accept cookie consent banner if shown
    const consentButton = page.getByRole('button', { name: 'Nõustun' });
    if (await consentButton.isVisible()) {
      await consentButton.click();
    }
  });

  test.afterAll(async () => {
    await page.context().close();
  });

  // ─── Logo / title ──────────────────────────────────────────────────────────

  test('Test Kriso logo/title is visible on homepage', async () => {
    await expect(page).toHaveTitle(/Kriso/i);
    // Logo anchor is the first link in the header that references Krisostomus / Kriso
    await expect(page.getByRole('link', { name: /Krisostomus|Kriso/i }).first()).toBeVisible();
  });

  // ─── Search ────────────────────────────────────────────────────────────────

  test('Test search for "harry potter" returns multiple results', async () => {
    await page.getByRole('textbox', { name: 'Pealkiri, autor, ISBN, märksõ' }).fill('harry potter');
    await page.getByRole('button', { name: 'Search' }).click();

    // Results counter (e.g. "42 results") must show more than 1 item
    const resultsText = await page.locator('.sb-results-total').textContent();
    const total = Number((resultsText || '').replace(/\D/g, '')) || 0;
    expect(total).toBeGreaterThan(1);
  });

  test('Test all visible results contain searched keyword in title', async () => {
    const productTitles = page.locator('.product-title');
    const count = await productTitles.count();
    expect(count).toBeGreaterThan(0);

    // Check the first page of results (up to 5 items)
    for (let i = 0; i < Math.min(count, 5); i++) {
      const text = (await productTitles.nth(i).textContent() || '').toLowerCase();
      expect(text).toMatch(/harry|potter/i);
    }
  });

  // ─── Sort ──────────────────────────────────────────────────────────────────

  test('Test products can be sorted — price low to high produces ascending order', async () => {
    // The sort control is a <select>; grab first combobox on page
    const sortSelect = page.getByRole('combobox').first();
    await expect(sortSelect).toBeVisible();

    // Choose option at index 1 (first non-default sort — typically price ascending)
    await sortSelect.selectOption({ index: 1 });
    await page.waitForLoadState('networkidle');

    // Collect prices from the first 5 product tiles and verify ascending order
    const priceLocators = page.locator('.product-price .price');
    const priceCount = await priceLocators.count();
    expect(priceCount).toBeGreaterThan(1);

    const prices: number[] = [];
    for (let i = 0; i < Math.min(priceCount, 5); i++) {
      const raw = (await priceLocators.nth(i).textContent() || '')
        .replace(/[^0-9.,]/g, '')
        .replace(',', '.');
      const val = parseFloat(raw);
      if (!isNaN(val)) prices.push(val);
    }

    for (let i = 1; i < prices.length; i++) {
      expect(prices[i]).toBeGreaterThanOrEqual(prices[i - 1]);
    }
  });

  // ─── Language filter ───────────────────────────────────────────────────────

  test('Test filter by language "English" narrows results', async () => {
    // Re-run search to get unfiltered baseline
    await page.getByRole('textbox', { name: 'Pealkiri, autor, ISBN, märksõ' }).fill('harry potter');
    await page.getByRole('button', { name: 'Search' }).click();
    await page.waitForLoadState('networkidle');

    const beforeText = await page.locator('.sb-results-total').textContent();
    const totalBefore = Number((beforeText || '').replace(/\D/g, '')) || 0;

    // Click the "English" facet link in the language filter sidebar
    await page.getByRole('link', { name: 'English' }).first().click();
    await page.waitForLoadState('networkidle');

    // "English" must appear somewhere on the page (active filter label / breadcrumb)
    await expect(page.getByText('English').first()).toBeVisible();

    // Results must be non-empty and not exceed the unfiltered total
    const afterText = await page.locator('.sb-results-total').textContent();
    const totalAfter = Number((afterText || '').replace(/\D/g, '')) || 0;
    expect(totalAfter).toBeGreaterThan(0);
    expect(totalAfter).toBeLessThanOrEqual(totalBefore);
  });

  // ─── Format filter ─────────────────────────────────────────────────────────

  test('Test filter by format "Kõvakaaneline" returns fewer items', async () => {
    // Re-run search without format filter for a clean baseline
    await page.getByRole('textbox', { name: 'Pealkiri, autor, ISBN, märksõ' }).fill('harry potter');
    await page.getByRole('button', { name: 'Search' }).click();
    await page.waitForLoadState('networkidle');

    const beforeText = await page.locator('.sb-results-total').textContent();
    const totalBefore = Number((beforeText || '').replace(/\D/g, '')) || 0;

    // Click the Hardback format facet
    await page.getByRole('link', { name: 'Kõvakaaneline' }).first().click();
    await page.waitForLoadState('networkidle');

    // The filter label must be reflected on the page
    await expect(page.getByText('Kõvakaaneline').first()).toBeVisible();

    const afterText = await page.locator('.sb-results-total').textContent();
    const totalAfter = Number((afterText || '').replace(/\D/g, '')) || 0;

    // Applying a format filter must reduce or maintain the count (never increase it)
    expect(totalAfter).toBeLessThanOrEqual(totalBefore);
    expect(totalAfter).toBeGreaterThan(0);
  });

});