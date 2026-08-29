import { Page, Locator } from '@playwright/test';

/**
 * AccountSuccessPage - Page Object for the account-created confirmation page.
 */
export class AccountSuccessPage {
  private readonly page: Page;

  // Locators
  private readonly heading: Locator;
  private readonly btnContinue: Locator;

  constructor(page: Page) {
    this.page = page;

    // Initialize locators with CSS selectors
    this.heading = page.locator('#content h1');
    this.btnContinue = page.locator('#content a.btn-primary');
  }

  /**
   * Verifies the account created confirmation is displayed
   * @returns Promise<boolean> - true if the confirmation is displayed
   */
  async isAccountCreatedMessageExists(): Promise<boolean> {
    try {
      await this.heading.waitFor({ state: 'visible' });
      return (await this.heading.textContent())?.includes('Your Account Has Been Created!') ?? false;
    } catch (error) {
      console.log(`Error checking account created message: ${error}`);
      return false;
    }
  }

  /**
   * Clicks the Continue button to reach the My Account page
   */
  async clickContinue(): Promise<void> {
    await this.btnContinue.click();
  }
}
