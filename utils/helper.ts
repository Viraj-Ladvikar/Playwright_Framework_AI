/**
 * Helper class with reusable utilities for Playwright automation.
 */
export class Helper {
  /**
   * Removes all characters from the input except digits and the decimal point,
   * then converts the resulting string to a number.
   */
  static convertPriceToNumber(price: string): number {
    const cleanedPrice = price.replace(/[^0-9.]/g, '');
    return Number(cleanedPrice);
  }

  /**
   * Returns fixed product details used in tests.
   */
  static getProductDetails() {
    return {
      productName: 'MacBook',
      productQuantity: '1',
      totalPrice: '$602.00',
    };
  }

  /**
   * Returns fixed login details used in tests.
   */
  static getLoginDetails() {
    return {
      email: 'pavanol@xyz.com',
      password: 'test@123',
    };
  }
}
