import { test, expect } from '@playwright/test';
import { Routes } from '../../api/endpoints/routes';
import { RandomDataUtil } from '../../utils/dataGenerator';
import dotenv from 'dotenv';

// override: true ensures the project .env values win over pre-existing
// OS-level environment variables (e.g. USERNAME on Windows)
dotenv.config({ override: true });

test.describe('Products API Tests', () => {

    // ---------------------------------------------------------
    // Configuration
    // ---------------------------------------------------------

    const BASE_URL = process.env.API_BASE_URL || Routes.BASE_URL;
    const PRODUCT_ID = Number(process.env.PRODUCT_ID ?? 1);
    const LIMIT = Number(process.env.LIMIT ?? 3);

    // ---------------------------------------------------------
    // GET - All Products
    // ---------------------------------------------------------

    test('GET - All Products @master @sanity @api', async ({ request }) => {

        const response = await request.get(`${BASE_URL}${Routes.GET_ALL_PRODUCTS}`);

        expect(response.status(), 'Expected status 200').toBe(200);

        const responseBody = await response.json();

        expect(Array.isArray(responseBody), 'Response body should be an array').toBeTruthy();
        expect(responseBody.length, 'Product array should not be empty').toBeGreaterThan(0);

        const firstProduct = responseBody[0];
        expect(firstProduct, 'Product should have an id field').toHaveProperty('id');
        expect(typeof firstProduct.id, 'id should be a number').toBe('number');
        expect(firstProduct, 'Product should have a title field').toHaveProperty('title');
        expect(firstProduct.title.length, 'title should not be empty').toBeGreaterThan(0);
        expect(firstProduct, 'Product should have a price field').toHaveProperty('price');
        expect(typeof firstProduct.price, 'price should be a number').toBe('number');
        expect(firstProduct, 'Product should have a category field').toHaveProperty('category');
        expect(firstProduct.category.length, 'category should not be empty').toBeGreaterThan(0);
        expect(firstProduct, 'Product should have an image field').toHaveProperty('image');
        expect(firstProduct.image.length, 'image should not be empty').toBeGreaterThan(0);
    });

    // ---------------------------------------------------------
    // GET - Product by ID
    // ---------------------------------------------------------

    test('GET - Product by ID @master @regression @api', async ({ request }) => {

        const response = await request.get(
            `${BASE_URL}${Routes.GET_PRODUCT_BY_ID.replace('{id}', String(PRODUCT_ID))}`
        );

        expect(response.status(), 'Expected status 200').toBe(200);

        const responseBody = await response.json();

        expect(responseBody.id, 'Returned id should match the requested id').toBe(PRODUCT_ID);
        expect(responseBody.title.length, 'title should not be empty').toBeGreaterThan(0);
        expect(typeof responseBody.price, 'price should be a number').toBe('number');
        expect(responseBody.category.length, 'category should not be empty').toBeGreaterThan(0);
        expect(responseBody.image.length, 'image should not be empty').toBeGreaterThan(0);
    });

    // ---------------------------------------------------------
    // GET - Products with Limit
    // ---------------------------------------------------------

    test('GET - Products with Limit @master @regression @api', async ({ request }) => {

        const response = await request.get(
            `${BASE_URL}${Routes.GET_PRODUCTS_WITH_LIMIT.replace('{limit}', String(LIMIT))}`
        );

        expect(response.status(), 'Expected status 200').toBe(200);

        const responseBody = await response.json();

        expect(Array.isArray(responseBody), 'Response body should be an array').toBeTruthy();
        expect(responseBody.length, `Expected exactly ${LIMIT} products`).toBe(LIMIT);
    });

    // ---------------------------------------------------------
    // GET - Products Sorted
    // ---------------------------------------------------------

    test('GET - Products Sorted Ascending @master @regression @api', async ({ request }) => {

        const response = await request.get(
            `${BASE_URL}${Routes.GET_PRODUCTS_SORTED.replace('{order}', 'asc')}`
        );

        expect(response.status(), 'Expected status 200').toBe(200);

        const responseBody = await response.json();

        const productIds = responseBody.map((product: { id: number }) => product.id);

        const isAscending = productIds.every(
            (id: number, index: number) => index === 0 || productIds[index - 1] <= id
        );

        expect(isAscending, 'Product IDs should be in ascending order').toBeTruthy();
    });

    test('GET - Products Sorted Descending @master @regression @api', async ({ request }) => {

        const response = await request.get(
            `${BASE_URL}${Routes.GET_PRODUCTS_SORTED.replace('{order}', 'desc')}`
        );

        expect(response.status(), 'Expected status 200').toBe(200);

        const responseBody = await response.json();

        const productIds = responseBody.map((product: { id: number }) => product.id);

        const isDescending = productIds.every(
            (id: number, index: number) => index === 0 || productIds[index - 1] >= id
        );

        expect(isDescending, 'Product IDs should be in descending order').toBeTruthy();
    });

    // ---------------------------------------------------------
    // GET - All Categories
    // ---------------------------------------------------------

    test('GET - All Categories @master @regression @api', async ({ request }) => {

        const response = await request.get(`${BASE_URL}${Routes.GET_ALL_CATEGORIES}`);

        expect(response.status(), 'Expected status 200').toBe(200);

        const responseBody = await response.json();

        expect(Array.isArray(responseBody), 'Response body should be an array').toBeTruthy();
        expect(responseBody.length, 'Category list should not be empty').toBeGreaterThan(0);

        responseBody.forEach((category: string) => {
            expect(typeof category, 'Each category should be a string').toBe('string');
            expect(category.length, 'Each category should not be empty').toBeGreaterThan(0);
        });
    });

    // ---------------------------------------------------------
    // GET - Products by Category
    // ---------------------------------------------------------

    test('GET - Products by Category @master @regression @api', async ({ request }) => {

        const category = 'electronics';

        const response = await request.get(
            `${BASE_URL}${Routes.GET_PRODUCTS_BY_CATEGORY.replace('{category}', category)}`
        );

        expect(response.status(), 'Expected status 200').toBe(200);

        const responseBody = await response.json();

        expect(Array.isArray(responseBody), 'Response body should be an array').toBeTruthy();
        expect(responseBody.length, 'Category product array should not be empty').toBeGreaterThan(0);

        responseBody.forEach((product: { category: string }) => {
            expect(product.category, 'Every product should belong to the requested category').toBe(category);
        });
    });

    // ---------------------------------------------------------
    // POST - Create Product
    // ---------------------------------------------------------

    test('POST - Create Product @master @regression @api', async ({ request }) => {

        const payload = RandomDataUtil.generateProductPayload();

        const response = await request.post(`${BASE_URL}${Routes.CREATE_PRODUCT}`, {
            data: payload,
        });

        expect(response.status(), 'Expected status 201').toBe(201);

        const responseBody = await response.json();

        expect(responseBody.id, 'Created product should return an id').toBeTruthy();
        expect(responseBody.title, 'Response should echo the submitted title').toBe(payload.title);
        expect(responseBody.price, 'Response should echo the submitted price').toBe(payload.price);
        expect(responseBody.category, 'Response should echo the submitted category').toBe(payload.category);
    });

    // ---------------------------------------------------------
    // PUT - Update Product
    // ---------------------------------------------------------

    test('PUT - Update Product @master @regression @api', async ({ request }) => {

        const payload = RandomDataUtil.generateUpdatedProductPayload();

        const response = await request.put(
            `${BASE_URL}${Routes.UPDATE_PRODUCT.replace('{id}', String(PRODUCT_ID))}`,
            { data: payload }
        );

        expect(response.status(), 'Expected status 200').toBe(200);

        const responseBody = await response.json();

        expect(responseBody.id, 'Returned id should match the requested id').toBe(PRODUCT_ID);
        expect(responseBody.title, 'Response should contain the updated title').toBe(payload.title);
        expect(responseBody.price, 'Response should contain the updated price').toBe(payload.price);
        expect(responseBody.description, 'Response should contain the updated description').toBe(payload.description);
    });

    // ---------------------------------------------------------
    // DELETE - Delete Product
    // ---------------------------------------------------------

    test('DELETE - Delete Product @master @regression @api', async ({ request }) => {

        const response = await request.delete(
            `${BASE_URL}${Routes.DELETE_PRODUCT.replace('{id}', String(PRODUCT_ID))}`
        );

        expect(response.status(), 'Expected status 200').toBe(200);

        const responseBody = await response.json();

        expect(responseBody.id, 'Response body should contain the deleted product id').toBe(PRODUCT_ID);
    });
});
