/**
 * Test Case: End-to-End Shopping Flow
 *
 * Tags: @master @sanity @regression @e2e @end-to-end @web
 *
 * Steps:
 * 1) Open the application
 * 2) Register a new customer using dynamically generated unique data
 * 3) Verify successful registration
 * 4) Log out
 * 5) Log in again using the newly created credentials
 * 6) Verify successful authentication
 * 7) Search for a known product
 * 8) Open the product details page
 * 9) Add the product to the cart
 * 10) Open the shopping cart
 * 11) Verify the correct product
 * 12) Verify the quantity
 * 13) Verify the product price
 * 14) Verify the applicable cart total
 * 15) Verify the complete journey finishes without errors
 */

// using custom fixtures
import { test, expect } from '../../fixtures/pageFixtures';
import { RandomDataUtil } from '../../utils/dataGenerator';
import { Helper } from '../../utils/helper';

test('End-to-End Shopping Flow test @master @sanity @regression @e2e @end-to-end @web', async ({
    homePage,
    registerPage,
    loginPage,
    accountSuccessPage,
    myAccountPage,
    logoutPage,
    searchResultsPage,
    productPage,
    cartPage,
}) => {
    // Dynamically generated unique customer data
    const customer = {
        firstname: RandomDataUtil.getFirstName(),
        lastname: RandomDataUtil.getLastName(),
        email: RandomDataUtil.getEmail(),
        telephone: RandomDataUtil.getPhoneNumber(),
        password: RandomDataUtil.getPassword(10),
    };

    // Known product details from the fixed-data helper
    const { productName, productQuantity, totalPrice } = Helper.getProductDetails();

    await test.step('1) Open the application', async () => {
        await homePage.goTo();
        expect(homePage).toBeDefined();
    });

    await test.step('2) Register a new customer using dynamically generated unique data', async () => {
        await homePage.clickMyAccountOption('Register');
        const isRegisterPageDisplayed = await registerPage.isRegisterPageExists();
        expect(isRegisterPageDisplayed).toBeTruthy();
        await registerPage.fillRegistrationForm({
            firstname: customer.firstname,
            lastname: customer.lastname,
            email: customer.email,
            telephone: customer.telephone,
            password: customer.password,
            confirm: customer.password,
        });
    });

    await test.step('3) Verify successful registration', async () => {
        const isAccountCreated = await accountSuccessPage.isAccountCreatedMessageExists();
        expect(isAccountCreated).toBeTruthy();
        await accountSuccessPage.clickContinue();
    });

    await test.step('4) Log out', async () => {
        await homePage.clickMyAccountOption('Logout');
        const isLogoutPageDisplayed = await logoutPage.isLogoutPageExists();
        expect(isLogoutPageDisplayed).toBeTruthy();
        await myAccountPage.clickContinue();
    });

    await test.step('5) Log in again using the newly created credentials', async () => {
        await homePage.clickMyAccountOption('Login');
        await loginPage.login(customer.email, customer.password);
    });

    await test.step('6) Verify successful authentication', async () => {
        const isMyAccountDisplayed = await myAccountPage.isMyAccountPageExists();
        expect(isMyAccountDisplayed).toBeTruthy();
    });

    await test.step('7) Search for a known product', async () => {
        await homePage.searchProduct(productName);
        const isSearchResultsDisplayed = await searchResultsPage.isSearchResultsPageExists();
        expect(isSearchResultsDisplayed).toBeTruthy();
        const isProductFound = await searchResultsPage.isProductDisplayed(productName);
        expect(isProductFound).toBeTruthy();
    });

    await test.step('8) Open the product details page', async () => {
        await searchResultsPage.openFirstProduct();
        const isProductPageDisplayed = await productPage.isProductPageExists();
        expect(isProductPageDisplayed).toBeTruthy();
    });

    await test.step('9) Add the product to the cart', async () => {
        await productPage.addToCart(productQuantity);
        const isAddedMessageDisplayed = await productPage.isAddToCartSuccessMessageExists(productName);
        expect(isAddedMessageDisplayed).toBeTruthy();
    });
    await test.step('10) Open the shopping cart', async () => {
        await homePage.clickShoppingCart();
        const isCartPageDisplayed = await cartPage.isCartPageExists();
        expect(isCartPageDisplayed).toBeTruthy();
    });

    await test.step('11) Verify the correct product', async () => {
        const isProductPresent = await cartPage.isProductInCart(productName);
        expect(isProductPresent).toBeTruthy();
    });

    await test.step('12) Verify the quantity', async () => {
        const displayedQuantity = await cartPage.getDisplayedQuantity();
        expect(displayedQuantity).toBe(productQuantity);
    });

    await test.step('13) Verify the product price', async () => {
        const unitPrice = await cartPage.getUnitPrice();
        expect(unitPrice).toBe(totalPrice);
    });

    await test.step('14) Verify the applicable cart total', async () => {
        const lineTotal = await cartPage.getLineTotal();
        expect(lineTotal).toBe(totalPrice);
        const cartTotal = await cartPage.getTotalPrice();
        expect(cartTotal).toBe(totalPrice);
    });

    await test.step('15) Verify that the complete journey finishes without errors', async () => {
        const isCartPageStillDisplayed = await cartPage.isCartPageExists();
        expect(isCartPageStillDisplayed).toBeTruthy();
    });

    console.log('✅ ✔️ Completed successfully!');
});
