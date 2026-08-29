import { Page, Locator } from '@playwright/test';

/**
 * LogoutPage - Page Object for the account logout confirmation page.
 */
export class LogoutPage {
  private readonly page: Page;

  // Locators
  private readonly heading: Locator;

  constructor(page: Page) {
    this.page = page;

    // Initialize locators with CSS selectors
    this.heading = page.locator('#content h1');
  }

  /**
   * Verifies the logout confirmation page is displayed
   * @returns Promise<boolean> - true if the page is displayed
   */
  async isLogoutPageExists(): Promise<boolean> {
    try {
      return await this.heading.isVisible();
    } catch (error) {
      console.log(`Error checking logout page: ${error}`);
      return false;
    }
  }
}
