/**
 * Test Case: OpenCart Customer Registration - UI + Admin + MySQL End-to-End
 *
 * Tags: @master @sanity @regression @end-to-end @db
 *
 * Steps:
 * 1) Open the OpenCart storefront and navigate to My Account -> Register
 * 2) Verify the registration page is displayed
 * 3) Fill the registration form with dynamically generated unique customer data
 * 4) Accept the Privacy Policy, submit and verify the account-created confirmation
 * 5) Open the OpenCart Admin Portal and log in with the configured administrator credentials
 * 6) Navigate to Customers and search for the customer by the unique email
 * 7) Verify the customer exists with matching name, email and status
 * 8) Query the oc_customer MySQL table and validate firstname, lastname, email, status and date_added
 * 9) Confirm the same generated customer was validated in all three layers
 */


// using custom fixtures
import { test, expect } from '../../fixtures/pageFixtures';
import { RandomDataUtil } from '../../utils/dataGenerator';
import { executeQuery } from '../../utils/dbClient';
import { AdminLoginPage } from '../../pages/AdminLoginPage';
import { AdminCustomersPage } from '../../pages/AdminCustomersPage';
import dotenv from 'dotenv';

dotenv.config();

// ---------------------------------------------------------
// Configuration
// ---------------------------------------------------------

const ADMIN_PORTAL_URL =
    process.env.ADMIN_PORTAL_URL || 'http://localhost/opencart/upload/admin/index.php';

// The DB and admin layers point at the local OpenCart instance, so the storefront
// registration must target the same local instance for the record to be visible there.
const STOREFRONT_URL = process.env.STOREFRONT_URL || 'http://localhost/opencart/upload/';

const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin';

// This test depends on the local OpenCart + MySQL stack (admin portal and DB
// checks point at localhost/XAMPP), which is not provisioned on CI runners.
test.skip(process.env.CI === '1', 'Local OpenCart/MySQL stack is not available on CI');

test(
    'OpenCart Customer Registration - UI + Admin + MySQL validation @master @sanity @regression @end-to-end @db',
    async ({ browser, page, homePage, registerPage, accountSuccessPage }) => {
        // Dynamically generated unique customer data
        const customer = {
            firstname: RandomDataUtil.getFirstName(),
            lastname: RandomDataUtil.getLastName(),
            email: RandomDataUtil.getEmail(),
            telephone: RandomDataUtil.getPhoneNumber(),
            password: RandomDataUtil.getPassword(10),
        };

        await test.step('1) Open the application', async () => {
            await homePage.goTo(STOREFRONT_URL);
            expect(homePage).toBeDefined();
        });

        await test.step('2) Navigate to My Account -> Register and verify the registration page is displayed', async () => {
            await homePage.clickMyAccountOption('Register');
            const isRegisterPageDisplayed = await registerPage.isRegisterPageExists();
            expect(isRegisterPageDisplayed).toBeTruthy();
        });

        await test.step('3) Fill the registration form with dynamically generated unique customer data and submit', async () => {
            await registerPage.fillRegistrationForm({
                firstname: customer.firstname,
                lastname: customer.lastname,
                email: customer.email,
                telephone: customer.telephone,
                password: customer.password,
                confirm: customer.password,
            });
        });

        await test.step('4) Verify the account-created confirmation', async () => {
            const isAccountCreated = await accountSuccessPage.isAccountCreatedMessageExists();
            expect(isAccountCreated, 'Account created confirmation should be displayed').toBeTruthy();
        });

        await test.step('5) Open the OpenCart Admin Portal in an isolated context and log in', async () => {
            // Use a separate browser context so the storefront session cannot interfere with the admin session
            const adminContext = await browser.newContext();
            const adminPage = await adminContext.newPage();
            const adminLogin = new AdminLoginPage(adminPage);
            const adminCustomers = new AdminCustomersPage(adminPage);

            await adminPage.goto(ADMIN_PORTAL_URL);
            const isAdminLoginDisplayed = await adminLogin.isAdminLoginPageExists();
            expect(isAdminLoginDisplayed).toBeTruthy();
            await adminLogin.login(ADMIN_USERNAME, ADMIN_PASSWORD);

            await test.step('6) Navigate to Customers and search for the customer by the unique email', async () => {
                await adminCustomers.openCustomersSection();
                const isCustomersPageDisplayed = await adminCustomers.isCustomersPageExists();
                expect(isCustomersPageDisplayed).toBeTruthy();
                await adminCustomers.filterByEmail(customer.email);
            });

            await test.step('7) Verify the customer exists in the Admin Portal with matching details', async () => {
                const customerDetails = await adminCustomers.getCustomerDetails(customer.email);
                expect(customerDetails, `Admin customer record for ${customer.email} should exist`).not.toBeNull();
                expect(customerDetails!.name).toContain(customer.firstname);
                expect(customerDetails!.name).toContain(customer.lastname);
                expect(customerDetails!.email).toBe(customer.email);
                expect(customerDetails!.status).toBe('Enabled');
            });

            await adminContext.close();
        });

        await test.step('8) Query oc_customer in MySQL and validate the registered customer', async () => {
            const rows = (await executeQuery(
                'SELECT customer_id, firstname, lastname, email, telephone, status, date_added FROM oc_customer WHERE email = ?',
                [customer.email]
            )) as Array<{
                customer_id: number;
                firstname: string;
                lastname: string;
                email: string;
                telephone: string;
                status: number;
                date_added: Date | null;
            }>;

            // Exactly one matching customer record must exist
            expect(rows.length, `Expected exactly one customer row for ${customer.email} in oc_customer`).toBe(1);

            const row = rows[0];

            // Validate the customer data persisted in MySQL
            expect(row.firstname, 'DB firstname should match the generated first name').toBe(customer.firstname);
            expect(row.lastname, 'DB lastname should match the generated last name').toBe(customer.lastname);
            expect(row.email, 'DB email should match the generated email').toBe(customer.email);
            expect(row.status, 'DB status should match the expected registration status (1 = enabled)').toBe(1);
            expect(row.date_added, 'DB date_added should exist for the registered customer').toBeTruthy();

            console.log(`MySQL customer record validated: id=${row.customer_id}, email=${row.email}, status=${row.status}, date_added=${row.date_added}`);
        });

        await test.step('9) Confirm the same generated customer was validated in all three layers', async () => {
            expect(customer.email).toBeTruthy();
            console.log(`Customer ${customer.email} successfully registered, found in the Admin Portal and validated in MySQL`);
        });

        console.log('✅ ✔️ Completed successfully!');
    }
);
