import { test, expect } from '@playwright/test';
import { Routes } from '../../api/endpoints/routes';
import { DataProvider } from '../../utils/DataReader';
import Ajv from 'ajv';
import dotenv from 'dotenv';

// override: true ensures the project .env values win over pre-existing
// OS-level environment variables (e.g. USERNAME on Windows)
dotenv.config({ override: true });

test.describe('JSON Schema Validation Tests', () => {

    // ---------------------------------------------------------
    // Configuration
    // ---------------------------------------------------------

    const BASE_URL = process.env.API_BASE_URL || Routes.BASE_URL;
    const PRODUCT_ID = Number(process.env.PRODUCT_ID ?? 1);
    const USER_ID = Number(process.env.USER_ID ?? 1);
    const CART_ID = Number(process.env.CART_ID ?? 1);

    // ---------------------------------------------------------
    // Product Response Schema
    // ---------------------------------------------------------

    test('GET - Validate Product Response Schema @master @regression @api', async ({ request }) => {

        const response = await request.get(
            `${BASE_URL}${Routes.GET_PRODUCT_BY_ID.replace('{id}', String(PRODUCT_ID))}`
        );

        expect(response.status(), 'Expected status 200').toBe(200);

        const responseBody = await response.json();
        const productSchema = DataProvider.readJson('./api/schemas/product_api_schema.json');

        const ajv = new Ajv();
        const validate = ajv.compile(productSchema);
        const isValid = validate(responseBody);

        if (!isValid) {
            console.log('Schema validation errors:', JSON.stringify(validate.errors, null, 2));
        }

        expect(isValid, 'Product response should conform to the expected JSON schema').toBeTruthy();
    });

    // ---------------------------------------------------------
    // User Response Schema
    // ---------------------------------------------------------

    test('GET - Validate User Response Schema @master @regression @api', async ({ request }) => {

        const response = await request.get(
            `${BASE_URL}${Routes.GET_USER_BY_ID.replace('{id}', String(USER_ID))}`
        );

        expect(response.status(), 'Expected status 200').toBe(200);

        const responseBody = await response.json();
        const userSchema = DataProvider.readJson('./api/schemas/user_api_schema.json');

        const ajv = new Ajv();
        const validate = ajv.compile(userSchema);
        const isValid = validate(responseBody);

        if (!isValid) {
            console.log('Schema validation errors:', JSON.stringify(validate.errors, null, 2));
        }

        expect(isValid, 'User response should conform to the expected JSON schema').toBeTruthy();
    });

    // ---------------------------------------------------------
    // Cart Response Schema
    // ---------------------------------------------------------

    test('GET - Validate Cart Response Schema @master @regression @api', async ({ request }) => {

        const response = await request.get(
            `${BASE_URL}${Routes.GET_CART_BY_ID.replace('{id}', String(CART_ID))}`
        );

        expect(response.status(), 'Expected status 200').toBe(200);

        const responseBody = await response.json();
        const cartSchema = DataProvider.readJson('./api/schemas/cart_api_schema.json');

        const ajv = new Ajv();
        const validate = ajv.compile(cartSchema);
        const isValid = validate(responseBody);

        if (!isValid) {
            console.log('Schema validation errors:', JSON.stringify(validate.errors, null, 2));
        }

        expect(isValid, 'Cart response should conform to the expected JSON schema').toBeTruthy();
    });
});
