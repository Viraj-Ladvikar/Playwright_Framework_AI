import { Page, Locator } from '@playwright/test';

/**
 * MyAccountPage - Page Object for the authenticated My Account area.
 */
export class MyAccountPage {
  private readonly page: Page;

  // Locators
  private readonly heading: Locator;
  private readonly btnContinue: Locator;

  constructor(page: Page) {
    this.page = page;

    // Initialize locators with CSS selectors
    this.heading = page.locator('#content h2').first();
    this.btnContinue = page.locator('#content a.btn-primary');
  }

  /**
   * Verifies the My Account page is displayed
   * @returns Promise<boolean> - true if the page is displayed
   */
  async isMyAccountPageExists(): Promise<boolean> {
    try {
      await this.heading.waitFor({ state: 'visible', timeout: 10000 });
      return true;
    } catch (error) {
      console.log(`Error checking my account page: ${error}`);
      return false;
    }
  }

  /**
   * Clicks the Continue button on the logout confirmation page to return to the homepage
   */
  async clickContinue(): Promise<void> {
    await this.btnContinue.click();
  }
}
