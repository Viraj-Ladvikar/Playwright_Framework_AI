import { Page, Locator } from '@playwright/test';

/**
 * AdminCustomersPage - Page Object for the OpenCart Admin Customers section.
 */
export class AdminCustomersPage {
  private readonly page: Page;

  // Locators
  private readonly heading: Locator;
  private readonly menuCustomers: Locator;
  private readonly linkCustomers: Locator;
  private readonly txtFilterEmail: Locator;
  private readonly btnFilter: Locator;
  private readonly customerTable: Locator;
  private readonly modalSecurity: Locator;
  private readonly modalSecurityClose: Locator;

  constructor(page: Page) {
    this.page = page;

    // Initialize locators with CSS selectors
    this.heading = page.locator('#content .page-header h1');
    this.menuCustomers = page.locator('#menu-customer > a');
    this.linkCustomers = page.locator('#menu-customer a[href*="route=customer/customer"]').first();
    this.txtFilterEmail = page.locator('#input-email');
    this.btnFilter = page.locator('#button-filter');
    this.customerTable = page.locator('#form-customer table');
    this.modalSecurity = page.locator('#modal-security');
    this.modalSecurityClose = page.locator('#modal-security button.close');
  }

  /**
   * Dismisses the OpenCart storage-directory security notification modal when it is displayed
   */
  async dismissSecurityModalIfPresent(): Promise<void> {
    try {
      await this.modalSecurity.waitFor({ state: 'visible', timeout: 3000 }).catch(() => undefined);
      if (await this.modalSecurity.isVisible()) {
        await this.modalSecurityClose.click();
        await this.modalSecurity.waitFor({ state: 'hidden', timeout: 5000 }).catch(() => undefined);
      }
    } catch (error) {
      console.log(`Error dismissing security modal: ${error}`);
    }
  }

  /**
   * Navigates to the Customers section through the admin menu
   */
  async openCustomersSection(): Promise<void> {
    await this.dismissSecurityModalIfPresent();
    await this.menuCustomers.click();
    await this.linkCustomers.click();
  }

  /**
   * Verifies the Customers list page is displayed
   * @returns Promise<boolean> - true if the Customers page is displayed
   */
  async isCustomersPageExists(): Promise<boolean> {
    try {
      return await this.heading.isVisible();
    } catch (error) {
      console.log(`Error checking customers page: ${error}`);
      return false;
    }
  }

  /**
   * Searches for a customer by email using the filter panel
   * @param email - Customer email to search for
   */
  async filterByEmail(email: string): Promise<void> {
    await this.txtFilterEmail.fill(email);
    await this.btnFilter.click();
  }

  /**
   * Verifies a customer row exists for the given email in the customer list
   * @param email - Customer email to look for
   * @returns Promise<boolean> - true if a matching customer row is displayed
   */
  async isCustomerWithEmailExists(email: string): Promise<boolean> {
    try {
      await this.customerTable.waitFor({ state: 'visible' });
      const rows = this.customerTable.locator('tbody tr');
      const rowCount = await rows.count();
      for (let i = 0; i < rowCount; i++) {
        const rowEmail = (await rows.nth(i).locator('td').nth(2).textContent())?.trim() ?? '';
        if (rowEmail.toLowerCase() === email.toLowerCase()) {
          return true;
        }
      }
      return false;
    } catch (error) {
      console.log(`Error checking customer by email: ${error}`);
      return false;
    }
  }

  /**
   * Returns the details of the customer row matching the given email
   * @param email - Customer email to look for
   * @returns Promise<{ name: string; email: string; status: string } | null> - the
   * displayed name, email and status of the matching customer row, or null when not found
   */
  async getCustomerDetails(email: string): Promise<{ name: string; email: string; status: string } | null> {
    const rows = this.customerTable.locator('tbody tr');
    const rowCount = await rows.count();
    for (let i = 0; i < rowCount; i++) {
      const row = rows.nth(i);
      const rowEmail = (await row.locator('td').nth(2).textContent())?.trim() ?? '';
      if (rowEmail.toLowerCase() === email.toLowerCase()) {
        return {
          name: (await row.locator('td').nth(1).textContent())?.trim() ?? '',
          email: rowEmail,
          status: (await row.locator('td').nth(4).textContent())?.trim() ?? '',
        };
      }
    }
    return null;
  }
}
