import { Page, Locator } from '@playwright/test';

/**
 * HomePage - Page Object for the OpenCart storefront homepage.
 */
export class HomePage {
  private readonly page: Page;

  // Locators
  private readonly myAccountDropdown: Locator;
  private readonly txtSearch: Locator;
  private readonly btnSearch: Locator;
  private readonly linkShoppingCart: Locator;

  constructor(page: Page) {
    this.page = page;

    // Initialize locators with CSS selectors
    this.myAccountDropdown = page.locator('#top-links a.dropdown-toggle').filter({ hasText: 'My Account' });
    this.txtSearch = page.locator('input[name="search"]');
    this.btnSearch = page.locator('#search button');
    this.linkShoppingCart = page.locator('#top-links a').filter({ hasText: 'Shopping Cart' });
  }

  /**
   * Navigates to the application URL
   * @param url - Optional URL override; defaults to WEB_APP_URL from the environment
   */
  async goTo(url?: string): Promise<void> {
    await this.page.goto(url || process.env.WEB_APP_URL || 'http://localhost/opencart/upload/');
  }

  /**
   * Opens the My Account dropdown and clicks the given option
   * @param option - Dropdown option text: Register, Login or Logout
   */
  async clickMyAccountOption(option: string): Promise<void> {
    await this.myAccountDropdown.click();
    await this.page.locator('.dropdown-menu').getByRole('link', { name: option, exact: true }).click();
  }

  /**
   * Opens the shopping cart page
   */
  async clickShoppingCart(): Promise<void> {
    await this.linkShoppingCart.click();
  }

  /**
   * Searches for a product
   * @param productName - Product name to search for
   */
  async searchProduct(productName: string): Promise<void> {
    await this.txtSearch.fill(productName);
    await this.btnSearch.click();
  }
}
