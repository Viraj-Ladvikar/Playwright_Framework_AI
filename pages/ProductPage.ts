import { Page, Locator } from '@playwright/test';

/**
 * ProductPage - Page Object for the OpenCart product details page.
 */
export class ProductPage {
  private readonly page: Page;

  // Locators
  private readonly heading: Locator;
  private readonly txtQuantity: Locator;
  private readonly btnAddToCart: Locator;
  private readonly successAlert: Locator;

  constructor(page: Page) {
    this.page = page;

    // Initialize locators with CSS selectors
    this.heading = page.locator('#content h1');
    this.txtQuantity = page.locator('#input-quantity');
    this.btnAddToCart = page.locator('#button-cart');
    this.successAlert = page.locator('.alert-success');
  }

  /**
   * Verifies the product details page is displayed
   * @returns Promise<boolean> - true if the page is displayed
   */
  async isProductPageExists(): Promise<boolean> {
    try {
      return await this.heading.isVisible();
    } catch (error) {
      console.log(`Error checking product page: ${error}`);
      return false;
    }
  }

  /**
   * Sets the required quantity and clicks Add to Cart, waiting for the AJAX add request to complete
   * @param quantity - Quantity to add
   */
  async addToCart(quantity: string): Promise<void> {
    await this.txtQuantity.fill(quantity);
    const [response] = await Promise.all([
      this.page.waitForResponse(
        (res) => res.url().includes('route=checkout/cart/add') && res.status() === 200,
        { timeout: 15000 }
      ),
      this.btnAddToCart.click(),
    ]);
    await response.finished();
  }

  /**
   * Verifies the product-added success message is displayed
   * @param productName - Product name shown in the confirmation
   * @returns Promise<boolean> - true if the confirmation is displayed
   */
  async isAddToCartSuccessMessageExists(productName: string): Promise<boolean> {
    try {
      await this.successAlert.waitFor({ state: 'visible' });
      return (await this.successAlert.textContent())?.includes(productName) ?? false;
    } catch (error) {
      console.log(`Error checking add to cart message: ${error}`);
      return false;
    }
  }
}
