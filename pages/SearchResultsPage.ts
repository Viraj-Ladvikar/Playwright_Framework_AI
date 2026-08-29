import { Page, Locator } from '@playwright/test';

/**
 * SearchResultsPage - Page Object for the OpenCart product search results page.
 */
export class SearchResultsPage {
  private readonly page: Page;

  // Locators
  private readonly heading: Locator;
  private readonly linkProduct: Locator;

  constructor(page: Page) {
    this.page = page;

    // Initialize locators with CSS selectors
    this.heading = page.locator('#content h1');
    this.linkProduct = page.locator('#content .product-thumb h4 a').first();
  }

  /**
   * Verifies the search results page is displayed
   * @returns Promise<boolean> - true if the page is displayed
   */
  async isSearchResultsPageExists(): Promise<boolean> {
    try {
      await this.heading.waitFor({ state: 'visible', timeout: 10000 });
      return true;
    } catch (error) {
      console.log(`Error checking search results page: ${error}`);
      return false;
    }
  }

  /**
   * Opens the first matching product's details page
   */
  async openFirstProduct(): Promise<void> {
    await this.linkProduct.click();
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Verifies the expected product appears in the results
   * @param productName - Expected product name
   * @returns Promise<boolean> - true if the product is displayed
   */
  async isProductDisplayed(productName: string): Promise<boolean> {
    try {
      await this.page
        .locator('#content .product-thumb h4 a')
        .filter({ hasText: productName })
        .first()
        .waitFor({ state: 'visible', timeout: 10000 });
      return true;
    } catch (error) {
      console.log(`Error checking product in results: ${error}`);
      return false;
    }
  }
}
