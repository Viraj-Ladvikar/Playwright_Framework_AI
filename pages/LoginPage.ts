import { Page, Locator } from '@playwright/test';

/**
 * LoginPage - Page Object for the OpenCart customer login page.
 */
export class LoginPage {
  private readonly page: Page;

  // Locators
  private readonly txtEmail: Locator;
  private readonly txtPassword: Locator;
  private readonly btnLogin: Locator;

  constructor(page: Page) {
    this.page = page;

    // Initialize locators with CSS selectors
    this.txtEmail = page.locator('#input-email');
    this.txtPassword = page.locator('#input-password');
    this.btnLogin = page.locator('input[value="Login"]');
  }

  /**
   * Logs in with the given credentials
   * @param email - Customer email
   * @param password - Customer password
   */
  async login(email: string, password: string): Promise<void> {
    await this.txtEmail.fill(email);
    await this.txtPassword.fill(password);
    await this.btnLogin.click();
  }
}
