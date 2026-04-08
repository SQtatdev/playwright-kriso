/**
 * Part II — Page Object Model tests
 * Test suite: Navigate Products via Filters
 *
 * Rules:
 *   - No raw selectors in test files — all locators live in page classes
 *   - Use only: getByRole, getByText, getByPlaceholder, getByLabel
 */
import { test, expect } from '@playwright/test';
import type { Page } from '@playwright/test';
import { HomePage } from '../../pages/HomePage';
import { FiltersPage } from '../../pages/FiltersPage';

test.describe.configure({ mode: 'serial' });

let page: Page;
let homePage: HomePage;
let filtersPage: FiltersPage;
let countAfterEducation = 0;
let countAfterBandAndEnsemble = 0;

test.describe('Navigate Products via Filters (POM)', () => {

  test.beforeAll(async ({ browser }) => {
    const context = await browser.newContext();
    page = await context.newPage();

    homePage = new HomePage(page);
    filtersPage = new FiltersPage(page);

    await homePage.openUrl();
    await homePage.acceptCookies();
  });

  test.afterAll(async () => {
    await page.context().close();
  });

  test('Test logo is visible', async () => {
    await homePage.verifyLogo();
  });

  test('Test "Music Books" section is visible', async () => {
    await filtersPage.verifyMusicBooksSectionVisible();
  });

  test('Test clicking "Education" shows more than 1 product and URL reflects navigation', async () => {
    await filtersPage.openMusicBooks();
    await filtersPage.clickFilterByName('Education');

    await expect(page).toHaveURL(/musicsales|education|bic=02/i);

    countAfterEducation = await filtersPage.getResultsCount();
    await filtersPage.verifyResultsCountMoreThan(1);
  });

  test('Test clicking "Band and Ensemble" shows active filter and fewer products', async () => {
    await filtersPage.clickFilterByName('Band and Ensemble');

    await filtersPage.verifyFilterLabelVisible('Band and Ensemble');

    countAfterBandAndEnsemble = await filtersPage.getResultsCount();
    await filtersPage.verifyResultsReducedFrom(countAfterEducation);
  });

  test('Test clicking format "CD" shows active filter and fewer products', async () => {
    await filtersPage.clickFilterByName('CD');

    await filtersPage.verifyFilterLabelVisible('CD');

    await filtersPage.verifyResultsReducedFrom(countAfterBandAndEnsemble);
  });

});