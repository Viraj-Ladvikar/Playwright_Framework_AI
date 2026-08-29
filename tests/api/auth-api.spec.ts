import { test, expect } from '@playwright/test';
import { Routes } from '../../api/endpoints/routes';
import dotenv from 'dotenv';

// override: true ensures the project .env values win over pre-existing
// OS-level environment variables (e.g. USERNAME on Windows)
dotenv.config({ override: true });

test.describe('Authentication API Tests', () => {

    // ---------------------------------------------------------
    // Configuration
    // ---------------------------------------------------------

    const BASE_URL = process.env.API_BASE_URL || Routes.BASE_URL;
    const USERNAME = process.env.USERNAME || 'mor_2314';
    const PASSWORD = process.env.PASSWORD || '83r5^_';

    // ---------------------------------------------------------
    // POST - Login
    // ---------------------------------------------------------

    test('POST - Successful Login @master @sanity @api', async ({ request }) => {

        const response = await request.post(`${BASE_URL}${Routes.AUTH_LOGIN}`, {
            data: {
                username: USERNAME,
                password: PASSWORD,
            },
        });

        expect(response.status(), 'Expected status 201 for a valid login').toBe(201);

        const responseBody = await response.json();

        expect(responseBody, 'Response body should contain a token field').toHaveProperty('token');
        expect(typeof responseBody.token, 'token should be a string').toBe('string');
        expect(responseBody.token.length, 'token should not be empty').toBeGreaterThan(0);
    });

    test('POST - Invalid Login @master @regression @api', async ({ request }) => {

        const response = await request.post(`${BASE_URL}${Routes.AUTH_LOGIN}`, {
            data: {
                username: 'invalid_username',
                password: 'invalid_password',
            },
        });

        expect(response.status(), 'Expected status 401 for invalid credentials').toBe(401);

        const responseBody = await response.text();

        expect(responseBody, 'Expected the API error message').toBe('username or password is incorrect');
    });
});
