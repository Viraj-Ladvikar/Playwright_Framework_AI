import { Page, Locator } from '@playwright/test';

/**
 * CartPage - Page Object for the OpenCart shopping cart page.
 */
export class CartPage {
  private readonly page: Page;

  // Locators
  private readonly heading: Locator;
  private readonly tableProductName: Locator;
  private readonly txtQuantity: Locator;
  private readonly productRow: Locator;
  private readonly tableUnitPrice: Locator;
  private readonly tableTotal: Locator;
  private readonly totalRow: Locator;

  constructor(page: Page) {
    this.page = page;

    // Initialize locators with CSS selectors
    this.heading = page.locator('#content h1');
    this.tableProductName = page.locator('.table-bordered a').filter({ hasText: 'MacBook' });
    this.txtQuantity = page.locator('input[name^="quantity["]');
    this.productRow = page.locator('table.table-bordered').nth(1).locator('tbody tr');
    this.tableUnitPrice = this.productRow.locator('td').nth(4);
    this.tableTotal = this.productRow.locator('td').nth(5);
    this.totalRow = page.locator('table.table-bordered').nth(2).locator('td').last();
  }

  /**
   * Verifies the shopping cart page is displayed
   * @returns Promise<boolean> - true if the page is displayed
   */
  async isCartPageExists(): Promise<boolean> {
    try {
      return await this.heading.isVisible();
    } catch (error) {
      console.log(`Error checking cart page: ${error}`);
      return false;
    }
  }

  /**
   * Verifies the expected product is present in the cart
   * @param productName - Expected product name
   * @returns Promise<boolean> - true if the product is present
   */
  async isProductInCart(productName: string): Promise<boolean> {
    try {
      return await this.tableProductName.filter({ hasText: productName }).isVisible();
    } catch (error) {
      console.log(`Error checking product in cart: ${error}`);
      return false;
    }
  }

  /**
   * Returns the quantity displayed in the cart
   * @returns Promise<string> - the displayed quantity
   */
  async getDisplayedQuantity(): Promise<string> {
    return (await this.txtQuantity.inputValue()) || '';
  }

  /**
   * Returns the unit price displayed in the cart
   * @returns Promise<string> - the displayed unit price
   */
  async getUnitPrice(): Promise<string> {
    return (await this.tableUnitPrice.textContent())?.trim() || '';
  }

  /**
   * Returns the line total displayed in the cart
   * @returns Promise<string> - the displayed line total
   */
  async getLineTotal(): Promise<string> {
    return (await this.tableTotal.textContent())?.trim() || '';
  }

  /**
   * Returns the cart grand total displayed in the totals table
   * @returns Promise<string> - the displayed grand total
   */
  async getTotalPrice(): Promise<string> {
    return (await this.totalRow.textContent())?.trim() || '';
  }
}
