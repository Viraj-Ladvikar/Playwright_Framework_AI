import { test, expect } from '@playwright/test';
import { Routes } from '../../api/endpoints/routes';
import { RandomDataUtil } from '../../utils/dataGenerator';
import dotenv from 'dotenv';

// override: true ensures the project .env values win over pre-existing
// OS-level environment variables (e.g. USERNAME on Windows)
dotenv.config({ override: true });

test.describe('Carts API Tests', () => {

    // ---------------------------------------------------------
    // Configuration
    // ---------------------------------------------------------

    const BASE_URL = process.env.API_BASE_URL || Routes.BASE_URL;
    const CART_ID = Number(process.env.CART_ID ?? 1);
    const USER_ID = Number(process.env.USER_ID ?? 1);
    const LIMIT = Number(process.env.LIMIT ?? 3);
    const START_DATE = process.env.START_DATE || '2019-12-10';
    const END_DATE = process.env.END_DATE || '2020-10-10';

    // ---------------------------------------------------------
    // GET - All Carts
    // ---------------------------------------------------------

    test('GET - All Carts @master @sanity @api', async ({ request }) => {

        const response = await request.get(`${BASE_URL}${Routes.GET_ALL_CARTS}`);

        expect(response.status(), 'Expected status 200').toBe(200);

        const responseBody = await response.json();

        expect(Array.isArray(responseBody), 'Response body should be an array').toBeTruthy();
        expect(responseBody.length, 'Cart array should not be empty').toBeGreaterThan(0);
    });

    // ---------------------------------------------------------
    // GET - Cart by ID
    // ---------------------------------------------------------

    test('GET - Cart by ID @master @regression @api', async ({ request }) => {

        const response = await request.get(
            `${BASE_URL}${Routes.GET_CART_BY_ID.replace('{id}', String(CART_ID))}`
        );

        expect(response.status(), 'Expected status 200').toBe(200);

        const responseBody = await response.json();

        expect(responseBody.id, 'Returned id should match the requested id').toBe(CART_ID);
        expect(responseBody.userId, 'Cart should have a userId field').toBeTruthy();
        expect(Array.isArray(responseBody.products), 'Cart should have a products array').toBeTruthy();
    });

    // ---------------------------------------------------------
    // GET - Carts by Date Range
    // ---------------------------------------------------------

    test('GET - Carts by Date Range @master @regression @api', async ({ request }) => {

        const response = await request.get(
            `${BASE_URL}${Routes.GET_CARTS_BY_DATE_RANGE
                .replace('{startdate}', START_DATE)
                .replace('{enddate}', END_DATE)}`
        );

        expect(response.status(), 'Expected status 200').toBe(200);

        const responseBody = await response.json();

        expect(Array.isArray(responseBody), 'Response body should be an array').toBeTruthy();

        const startTimestamp = new Date(START_DATE).getTime();
        const endTimestamp = new Date(END_DATE).getTime();

        responseBody.forEach((cart: { date: string }) => {
            const cartDate = new Date(cart.date).getTime();
            expect(
                cartDate >= startTimestamp && cartDate <= endTimestamp,
                `Cart date ${cart.date} should fall within the requested range`
            ).toBeTruthy();
        });
    });

    // ---------------------------------------------------------
    // GET - User Cart
    // ---------------------------------------------------------

    test('GET - User Cart @master @regression @api', async ({ request }) => {

        const response = await request.get(
            `${BASE_URL}${Routes.GET_USER_CART.replace('{userId}', String(USER_ID))}`
        );

        expect(response.status(), 'Expected status 200').toBe(200);

        const responseBody = await response.json();

        expect(Array.isArray(responseBody), 'Response body should be an array').toBeTruthy();

        responseBody.forEach((cart: { userId: number }) => {
            expect(cart.userId, 'Every cart should belong to the requested user').toBe(USER_ID);
        });
    });

    // ---------------------------------------------------------
    // GET - Carts with Limit
    // ---------------------------------------------------------

    test('GET - Carts with Limit @master @regression @api', async ({ request }) => {

        const response = await request.get(
            `${BASE_URL}${Routes.GET_CARTS_WITH_LIMIT.replace('{limit}', String(LIMIT))}`
        );

        expect(response.status(), 'Expected status 200').toBe(200);

        const responseBody = await response.json();

        expect(Array.isArray(responseBody), 'Response body should be an array').toBeTruthy();
        expect(responseBody.length, `Expected exactly ${LIMIT} carts`).toBe(LIMIT);
    });

    // ---------------------------------------------------------
    // GET - Carts Sorted
    // ---------------------------------------------------------

    test('GET - Carts Sorted Ascending @master @regression @api', async ({ request }) => {

        const response = await request.get(
            `${BASE_URL}${Routes.GET_CARTS_SORTED.replace('{order}', 'asc')}`
        );

        expect(response.status(), 'Expected status 200').toBe(200);

        const responseBody = await response.json();

        const cartIds = responseBody.map((cart: { id: number }) => cart.id);

        const isAscending = cartIds.every(
            (id: number, index: number) => index === 0 || cartIds[index - 1] <= id
        );

        expect(isAscending, 'Cart IDs should be in ascending order').toBeTruthy();
    });

    test('GET - Carts Sorted Descending @master @regression @api', async ({ request }) => {

        const response = await request.get(
            `${BASE_URL}${Routes.GET_CARTS_SORTED.replace('{order}', 'desc')}`
        );

        expect(response.status(), 'Expected status 200').toBe(200);

        const responseBody = await response.json();

        const cartIds = responseBody.map((cart: { id: number }) => cart.id);

        const isDescending = cartIds.every(
            (id: number, index: number) => index === 0 || cartIds[index - 1] >= id
        );

        expect(isDescending, 'Cart IDs should be in descending order').toBeTruthy();
    });

    // ---------------------------------------------------------
    // POST - Create Cart
    // ---------------------------------------------------------

    test('POST - Create Cart @master @regression @api', async ({ request }) => {

        const payload = RandomDataUtil.generateCartPayload(USER_ID);

        const response = await request.post(`${BASE_URL}${Routes.CREATE_CART}`, {
            data: payload,
        });

        expect(response.status(), 'Expected status 201').toBe(201);

        const responseBody = await response.json();

        expect(responseBody.id, 'Created cart should return an id').toBeTruthy();
        expect(responseBody.userId, 'Response should echo the submitted userId').toBe(USER_ID);
        expect(Array.isArray(responseBody.products), 'Response should contain a products array').toBeTruthy();
        expect(responseBody.products.length, 'Products array should match the submitted products').toBe(payload.products.length);
    });

    // ---------------------------------------------------------
    // PUT - Update Cart
    // ---------------------------------------------------------

    test('PUT - Update Cart @master @regression @api', async ({ request }) => {

        const payload = RandomDataUtil.generateUpdatedCartPayload(USER_ID);

        const response = await request.put(
            `${BASE_URL}${Routes.UPDATE_CART.replace('{id}', String(CART_ID))}`,
            { data: payload }
        );

        expect(response.status(), 'Expected status 200').toBe(200);

        const responseBody = await response.json();

        expect(responseBody.id, 'Returned id should match the requested id').toBe(CART_ID);
        expect(responseBody.products[0].quantity, 'Response should reflect the updated quantity').toBe(payload.products[0].quantity);
    });

    // ---------------------------------------------------------
    // DELETE - Delete Cart
    // ---------------------------------------------------------

    test('DELETE - Delete Cart @master @regression @api', async ({ request }) => {

        const response = await request.delete(
            `${BASE_URL}${Routes.DELETE_CART.replace('{id}', String(CART_ID))}`
        );

        expect(response.status(), 'Expected status 200').toBe(200);

        const responseBody = await response.json();

        expect(responseBody.id, 'Response body should contain the deleted cart id').toBe(CART_ID);
    });
});
