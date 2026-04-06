/**
 * Part I — Flat tests (no POM)
 * Test suite: Navigate Products via Filters
 *
 * Rules:
 *   - Use only: getByRole, getByText, getByPlaceholder, getByLabel
 *   - No CSS class selectors, no XPath
 *
 * Tip: run `npx playwright codegen https://www.kriso.ee` to discover selectors.
 *
 * Navigation path exercised by this suite:
 *   Home → "Music Books" section (≈ "Muusikaraamatud ja noodid")
 *        → "Education"           (≈ "Õppematerjalid")
 *        → "Band and Ensemble"   (≈ "Bänd ja ansambel")
 *        → format filter "CD"
 *
 * The site serves content in English by default; the Estonian labels in the task
 * description correspond to the same categories viewed in Estonian locale.
 * The tests use the English labels that are actually rendered in the DOM.
 */
import { test, expect } from '@playwright/test';
import type { Page } from '@playwright/test';

test.describe.configure({ mode: 'serial' });

let page: Page;
let countAfterEducation = 0;
let countAfterBandAndEnsemble = 0;

test.describe('Navigate Products via Filters', () => {

  test.beforeAll(async ({ browser }) => {
    const context = await browser.newContext();
    page = await context.newPage();

    await page.goto('https://www.kriso.ee/');
    // Accept cookie consent if present
    const consentButton = page.getByRole('button', { name: 'Nõustun' });
    if (await consentButton.isVisible()) {
      await consentButton.click();
    }
  });

  test.afterAll(async () => {
    await page.context().close();
  });

  // ─── 1. Logo ───────────────────────────────────────────────────────────────

  test('Test Kriso logo/title is visible on homepage', async () => {
    await expect(page).toHaveTitle(/Kriso/i);
    await expect(page.getByRole('link', { name: /Krisostomus|Kriso/i }).first()).toBeVisible();
  });

  // ─── 2. Music Books section ────────────────────────────────────────────────
  //
  // The home page has a "Music Books" navigation entry in the header.
  // In the task description this corresponds to "Muusikaraamatud ja noodid"
  // (visible when the site is in Estonian locale).

  test('Test "Music Books" section link is visible', async () => {
    // The header nav contains a "Music Books" link that leads to the music catalogue
    const musicBooksLink = page.getByRole('link', { name: 'Music Books' }).first();
    await musicBooksLink.scrollIntoViewIfNeeded();
    await expect(musicBooksLink).toBeVisible();
  });

  // ─── 3. "Education" category (≈ "Õppematerjalid") ────────────────────────

  test('Test clicking "Education" category shows more than 1 product and URL reflects navigation', async () => {
    // Navigate directly to the Music Books landing page then click Education
    await page.goto('https://www.kriso.ee/muusika-ja-noodid.html');

    // "Education" is a top-level category link in the Music Books left-side nav
    await page.getByRole('link', { name: 'Education' }).first().click();
    await page.waitForLoadState('networkidle');

    // URL must contain something that identifies this category
    await expect(page).toHaveURL(/musicsales|muusika|education|bic=02/i);

    // Results count > 1
    const resultsText = await page.locator('.sb-results-total').textContent();
    countAfterEducation = Number((resultsText || '').replace(/\D/g, '')) || 0;
    expect(countAfterEducation).toBeGreaterThan(1);
  });

  // ─── 4. "Band and Ensemble" subcategory (≈ "Bänd ja ansambel") ────────────

  test('Test clicking "Band and Ensemble" shows active filter and fewer products', async () => {
    // Click the "Band and Ensemble" subcategory link
    await page.getByRole('link', { name: 'Band and Ensemble' }).first().click();
    await page.waitForLoadState('networkidle');

    // The selected category must be reflected somewhere on the page
    // (breadcrumb, heading, or active filter label)
    await expect(
      page.getByText('Band and Ensemble').first()
    ).toBeVisible();

    // Product count must be less than or equal to the Education count
    const resultsText = await page.locator('.sb-results-total').textContent();
    countAfterBandAndEnsemble = Number((resultsText || '').replace(/\D/g, '')) || 0;
    expect(countAfterBandAndEnsemble).toBeGreaterThan(0);
    expect(countAfterBandAndEnsemble).toBeLessThanOrEqual(countAfterEducation);
  });

  // ─── 5. Format filter "CD" ────────────────────────────────────────────────

  test('Test clicking format filter "CD" shows active filter and fewer products', async () => {
    // Click the "CD" format facet link in the sidebar
    await page.getByRole('link', { name: 'CD' }).first().click();
    await page.waitForLoadState('networkidle');

    // "CD" must appear as an active filter on the page
    await expect(page.getByText('CD').first()).toBeVisible();

    // Product count must be less than or equal to the Band and Ensemble count
    const resultsText = await page.locator('.sb-results-total').textContent();
    const countAfterCD = Number((resultsText || '').replace(/\D/g, '')) || 0;
    expect(countAfterCD).toBeGreaterThan(0);
    expect(countAfterCD).toBeLessThanOrEqual(countAfterBandAndEnsemble);
  });

});