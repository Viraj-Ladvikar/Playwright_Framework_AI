import { Page, Locator } from '@playwright/test';

/**
 * AdminLoginPage - Page Object for the OpenCart Admin Portal login page.
 */
export class AdminLoginPage {
  private readonly page: Page;

  // Locators
  private readonly txtUsername: Locator;
  private readonly txtPassword: Locator;
  private readonly btnLogin: Locator;
  private readonly panelTitle: Locator;

  constructor(page: Page) {
    this.page = page;

    // Initialize locators with CSS selectors
    this.txtUsername = page.locator('#input-username');
    this.txtPassword = page.locator('#input-password');
    this.btnLogin = page.locator('button[type="submit"].btn-primary');
    this.panelTitle = page.locator('.panel-title');
  }

  /**
   * Verifies the admin login page is displayed
   * @returns Promise<boolean> - true if the login form is displayed
   */
  async isAdminLoginPageExists(): Promise<boolean> {
    try {
      return await this.panelTitle.isVisible();
    } catch (error) {
      console.log(`Error checking admin login page: ${error}`);
      return false;
    }
  }

  /**
   * Logs in to the OpenCart admin portal
   * @param username - Administrator username
   * @param password - Administrator password
   */
  async login(username: string, password: string): Promise<void> {
    await this.txtUsername.fill(username);
    await this.txtPassword.fill(password);
    await this.btnLogin.click();
  }
}
