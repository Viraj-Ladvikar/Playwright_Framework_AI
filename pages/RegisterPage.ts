import { Page, Locator } from '@playwright/test';

/**
 * RegisterPage - Page Object for the OpenCart customer registration page.
 */
export class RegisterPage {
  private readonly page: Page;

  // Locators
  private readonly txtFirstname: Locator;
  private readonly txtLastname: Locator;
  private readonly txtEmail: Locator;
  private readonly txtTelephone: Locator;
  private readonly txtPassword: Locator;
  private readonly txtConfirm: Locator;
  private readonly chkAgree: Locator;
  private readonly btnContinue: Locator;
  private readonly heading: Locator;

  constructor(page: Page) {
    this.page = page;

    // Initialize locators with CSS selectors
    this.txtFirstname = page.locator('#input-firstname');
    this.txtLastname = page.locator('#input-lastname');
    this.txtEmail = page.locator('#input-email');
    this.txtTelephone = page.locator('#input-telephone');
    this.txtPassword = page.locator('#input-password');
    this.txtConfirm = page.locator('#input-confirm');
    this.chkAgree = page.locator('input[name="agree"]');
    this.btnContinue = page.locator('input[value="Continue"]');
    this.heading = page.locator('#content h1');
  }

  /**
   * Verifies the registration page is displayed
   * @returns Promise<boolean> - true if the page is displayed
   */
  async isRegisterPageExists(): Promise<boolean> {
    try {
      await this.heading.waitFor({ state: 'visible' });
      return true;
    } catch (error) {
      console.log(`Error checking register page: ${error}`);
      return false;
    }
  }

  /**
   * Fills the registration form
   * @param userData - Object with firstname, lastname, email, telephone, password and confirm fields
   */
  async fillRegistrationForm(userData: {
    firstname: string;
    lastname: string;
    email: string;
    telephone: string;
    password: string;
    confirm: string;
  }): Promise<void> {
    await this.txtFirstname.fill(userData.firstname);
    await this.txtLastname.fill(userData.lastname);
    await this.txtEmail.fill(userData.email);
    await this.txtTelephone.fill(userData.telephone);
    await this.txtPassword.fill(userData.password);
    await this.txtConfirm.fill(userData.confirm);
    await this.chkAgree.check();
    await this.btnContinue.click();
  }
}
