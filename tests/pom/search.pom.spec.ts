/**
 * Part II — Page Object Model tests
 * Test suite: Search for Books by Keywords
 *
 * Rules:
 *   - No raw selectors in test files — all locators live in page classes
 *   - Use only: getByRole, getByText, getByPlaceholder, getByLabel
 */
import { test, expect } from '@playwright/test';
import type { Page } from '@playwright/test';
import { HomePage } from '../../pages/HomePage';
 main
import { SearchPage } from '../../pages/SearchPage';

test.describe.configure({ mode: 'serial' });

let page: Page;
let homePage: HomePage;
let searchPage: SearchPage;


let page: Page;
let homePage: HomePage;
 main

test.describe('Search for Books by Keywords (POM)', () => {

  test.beforeAll(async ({ browser }) => {
main
    const context = await browser.newContext();
    page = await context.newPage();

    homePage = new HomePage(page);
    searchPage = new SearchPage(page);

    await homePage.openUrl();
    await homePage.acceptCookies();
  });

  test.afterAll(async () => {
    await page.context().close();
  });

  test('Test logo is visible', async () => {
    await homePage.verifyLogo();
  });

  test('Test search for "harry potter" returns multiple results', async () => {
    await homePage.searchByKeyword('harry potter');
    await homePage.verifyResultsCountMoreThan(1);
  });

  test('Test all visible results contain searched keyword in title', async () => {
    await searchPage.verifyProductTitlesContainKeyword('harry potter');
  });

  test('Test sort by price — results are in ascending order', async () => {
    await searchPage.sortByPriceAscending();
    await searchPage.verifyPricesSortedAscending();
  });

  test('Test filter by language "English" narrows results', async () => {
    await homePage.searchByKeyword('harry potter');
    const totalBefore = await searchPage.getResultsCount();

    await searchPage.clickFilterByName('English');

    await searchPage.verifyFilterLabelVisible('English');
    const totalAfter = await searchPage.getResultsCount();
    expect(totalAfter).toBeGreaterThan(0);
    expect(totalAfter).toBeLessThanOrEqual(totalBefore);
  });

  test('Test filter by format "Kõvakaaneline" returns fewer items', async () => {
    await homePage.searchByKeyword('harry potter');
    const totalBefore = await searchPage.getResultsCount();

    await searchPage.clickFilterByName('Kõvakaaneline');

    await searchPage.verifyFilterLabelVisible('Kõvakaaneline');
    const totalAfter = await searchPage.getResultsCount();
    expect(totalAfter).toBeLessThanOrEqual(totalBefore);
    expect(totalAfter).toBeGreaterThan(0);
  });

      const context = await browser.newContext();
      page = await context.newPage();
  
      homePage = new HomePage(page);
  
      await homePage.openUrl();
      await homePage.acceptCookies();
    });
  
    test.afterAll(async () => {
      await page.context().close();
    });
  
    test('Test logo is visible', async () => {
      await homePage.verifyLogo();
    }); 
 main

});