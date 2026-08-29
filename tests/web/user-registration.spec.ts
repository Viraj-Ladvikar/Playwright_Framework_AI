/**
 * Test Case: User Registration Flow
 *
 * Tags: @master @sanity @regression @web
 *
 * Steps:
 * 1) Open the application
 * 2) Navigate to My Account -> Register
 * 3) Verify that the registration page is displayed
 * 4) Generate a unique customer email
 * 5) Enter valid values for First Name, Last Name, Email Address, Telephone, Password and Password Confirmation
 * 6) Accept the Privacy Policy and submit the registration form
 * 7) Verify that registration succeeds
 * 8) Verify the account-created confirmation message
 * 9) Verify that the newly created account is available through the expected account navigation
 */

// using custom fixtures
import { test, expect } from '../../fixtures/pageFixtures';
import { RandomDataUtil } from '../../utils/dataGenerator';

test('User Registration Flow test @master @sanity @regression @web', async ({
    homePage,
    registerPage,
    accountSuccessPage,
    myAccountPage,
}) => {
    // Dynamically generated unique customer data
    const customer = {
        firstname: RandomDataUtil.getFirstName(),
        lastname: RandomDataUtil.getLastName(),
        email: RandomDataUtil.getEmail(),
        telephone: RandomDataUtil.getPhoneNumber(),
        password: RandomDataUtil.getPassword(10),
    };

    await test.step('1) Open the application', async () => {
        await homePage.goTo();
        expect(homePage).toBeDefined();
    });

    await test.step('2) Navigate to My Account -> Register', async () => {
        await homePage.clickMyAccountOption('Register');
    });

    await test.step('3) Verify that the registration page is displayed', async () => {
        const isRegisterPageDisplayed = await registerPage.isRegisterPageExists();
        expect(isRegisterPageDisplayed).toBeTruthy();
    });

    await test.step('4) Enter valid values for First Name, Last Name, Email Address, Telephone, Password and Password Confirmation', async () => {
        await registerPage.fillRegistrationForm({
            firstname: customer.firstname,
            lastname: customer.lastname,
            email: customer.email,
            telephone: customer.telephone,
            password: customer.password,
            confirm: customer.password,
        });
    });

    await test.step('5) Verify that registration succeeds and the account-created confirmation is displayed', async () => {
        const isAccountCreated = await accountSuccessPage.isAccountCreatedMessageExists();
        expect(isAccountCreated).toBeTruthy();
        await accountSuccessPage.clickContinue();
    });

    await test.step('6) Verify that the newly created account is available through the expected account navigation', async () => {
        const isMyAccountDisplayed = await myAccountPage.isMyAccountPageExists();
        expect(isMyAccountDisplayed).toBeTruthy();
    });

    console.log('✅ ✔️ Completed successfully!');
});
