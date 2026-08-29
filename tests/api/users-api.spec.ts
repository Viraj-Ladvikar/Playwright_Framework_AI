import { test, expect } from '@playwright/test';
import { Routes } from '../../api/endpoints/routes';
import { RandomDataUtil } from '../../utils/dataGenerator';
import dotenv from 'dotenv';

// override: true ensures the project .env values win over pre-existing
// OS-level environment variables (e.g. USERNAME on Windows)
dotenv.config({ override: true });

test.describe('Users API Tests', () => {

    // ---------------------------------------------------------
    // Configuration
    // ---------------------------------------------------------

    const BASE_URL = process.env.API_BASE_URL || Routes.BASE_URL;
    const USER_ID = Number(process.env.USER_ID ?? 1);
    const LIMIT = Number(process.env.LIMIT ?? 3);

    // ---------------------------------------------------------
    // GET - All Users
    // ---------------------------------------------------------

    test('GET - All Users @master @sanity @api', async ({ request }) => {

        const response = await request.get(`${BASE_URL}${Routes.GET_ALL_USERS}`);

        expect(response.status(), 'Expected status 200').toBe(200);

        const responseBody = await response.json();

        expect(Array.isArray(responseBody), 'Response body should be an array').toBeTruthy();
        expect(responseBody.length, 'User array should not be empty').toBeGreaterThan(0);
    });

    // ---------------------------------------------------------
    // GET - User by ID
    // ---------------------------------------------------------

    test('GET - User by ID @master @regression @api', async ({ request }) => {

        const response = await request.get(
            `${BASE_URL}${Routes.GET_USER_BY_ID.replace('{id}', String(USER_ID))}`
        );

        expect(response.status(), 'Expected status 200').toBe(200);

        const responseBody = await response.json();

        expect(responseBody.id, 'Returned id should match the requested id').toBe(USER_ID);
        expect(responseBody.username.length, 'username should not be empty').toBeGreaterThan(0);
        expect(responseBody.email.length, 'email should not be empty').toBeGreaterThan(0);
    });

    // ---------------------------------------------------------
    // GET - Users with Limit
    // ---------------------------------------------------------

    test('GET - Users with Limit @master @regression @api', async ({ request }) => {

        const response = await request.get(
            `${BASE_URL}${Routes.GET_USERS_WITH_LIMIT.replace('{limit}', String(LIMIT))}`
        );

        expect(response.status(), 'Expected status 200').toBe(200);

        const responseBody = await response.json();

        expect(Array.isArray(responseBody), 'Response body should be an array').toBeTruthy();
        expect(responseBody.length, `Expected exactly ${LIMIT} users`).toBe(LIMIT);
    });

    // ---------------------------------------------------------
    // GET - Users Sorted
    // ---------------------------------------------------------

    test('GET - Users Sorted Ascending @master @regression @api', async ({ request }) => {

        const response = await request.get(
            `${BASE_URL}${Routes.GET_USERS_SORTED.replace('{order}', 'asc')}`
        );

        expect(response.status(), 'Expected status 200').toBe(200);

        const responseBody = await response.json();

        const userIds = responseBody.map((user: { id: number }) => user.id);

        const isAscending = userIds.every(
            (id: number, index: number) => index === 0 || userIds[index - 1] <= id
        );

        expect(isAscending, 'User IDs should be in ascending order').toBeTruthy();
    });

    test('GET - Users Sorted Descending @master @regression @api', async ({ request }) => {

        const response = await request.get(
            `${BASE_URL}${Routes.GET_USERS_SORTED.replace('{order}', 'desc')}`
        );

        expect(response.status(), 'Expected status 200').toBe(200);

        const responseBody = await response.json();

        const userIds = responseBody.map((user: { id: number }) => user.id);

        const isDescending = userIds.every(
            (id: number, index: number) => index === 0 || userIds[index - 1] >= id
        );

        expect(isDescending, 'User IDs should be in descending order').toBeTruthy();
    });

    // ---------------------------------------------------------
    // POST - Create User
    // ---------------------------------------------------------

    test('POST - Create User @master @regression @api', async ({ request }) => {

        const payload = RandomDataUtil.generateUserPayload();

        const response = await request.post(`${BASE_URL}${Routes.CREATE_USER}`, {
            data: payload,
        });

        expect(response.status(), 'Expected status 201').toBe(201);

        const responseBody = await response.json();

        expect(responseBody.id, 'Created user should return an id').toBeTruthy();
    });

    // ---------------------------------------------------------
    // PUT - Update User
    // ---------------------------------------------------------

    test('PUT - Update User @master @regression @api', async ({ request }) => {

        const payload = RandomDataUtil.generateUserUpdatePayload();

        const response = await request.put(
            `${BASE_URL}${Routes.UPDATE_USER.replace('{id}', String(USER_ID))}`,
            { data: payload }
        );

        expect(response.status(), 'Expected status 200').toBe(200);

        const responseBody = await response.json();

        expect(responseBody.username, 'Response should contain the updated username').toBe(payload.username);
        expect(responseBody.email, 'Response should contain the updated email').toBe(payload.email);
        expect(responseBody.name.firstname, 'Response should contain the updated first name').toBe(payload.name.firstname);
    });

    // ---------------------------------------------------------
    // DELETE - Delete User
    // ---------------------------------------------------------

    test('DELETE - Delete User @master @regression @api', async ({ request }) => {

        const response = await request.delete(
            `${BASE_URL}${Routes.DELETE_USER.replace('{id}', String(USER_ID))}`
        );

        expect(response.status(), 'Expected status 200').toBe(200);

        const responseBody = await response.json();

        expect(responseBody.id, 'Response body should contain the deleted user id').toBe(USER_ID);
    });
});
