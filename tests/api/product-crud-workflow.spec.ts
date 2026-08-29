import { test, expect } from '@playwright/test';
import { Routes } from '../../api/endpoints/routes';
import { RandomDataUtil } from '../../utils/dataGenerator';
import { postWithRetry } from '../../utils/apiRetry';
import dotenv from 'dotenv';

// override: true ensures the project .env values win over pre-existing
// OS-level environment variables (e.g. USERNAME on Windows)
dotenv.config({ override: true });

test.describe('Product CRUD Workflow Tests', () => {

    // ---------------------------------------------------------
    // Configuration
    // ---------------------------------------------------------

    const BASE_URL = process.env.API_BASE_URL || Routes.BASE_URL;

    test('E2E - Product Create, Update and Delete Workflow @master @e2e @end-to-end @api', async ({ request }) => {

        const createPayload = RandomDataUtil.generateProductPayload();
        const updatedPayload = RandomDataUtil.generateUpdatedProductPayload();

        // Create a product and capture the generated ID
        const createResponse = await postWithRetry(() =>
            request.post(`${BASE_URL}${Routes.CREATE_PRODUCT}`, {
                data: createPayload,
            })
        );

        expect(createResponse.status(), 'Create should return status 201').toBe(201);

        const createdProduct = await createResponse.json();

        expect(createdProduct.id, 'Create response should return a product ID').toBeTruthy();

        const productId = createdProduct.id;

        // Update the same product using the captured ID
        const updateResponse = await request.put(
            `${BASE_URL}${Routes.UPDATE_PRODUCT.replace('{id}', String(productId))}`,
            { data: updatedPayload }
        );

        expect(updateResponse.status(), 'Update should return status 200').toBe(200);

        const updatedProduct = await updateResponse.json();

        expect(updatedProduct.id, 'Update response ID should match the created product ID').toBe(productId);
        expect(updatedProduct.title, 'Update response should contain the updated title').toBe(updatedPayload.title);
        expect(updatedProduct.price, 'Update response should contain the updated price').toBe(updatedPayload.price);

        // Delete the same product using the captured ID
        const deleteResponse = await request.delete(
            `${BASE_URL}${Routes.DELETE_PRODUCT.replace('{id}', String(productId))}`
        );

        expect(deleteResponse.status(), 'Delete should return status 200').toBe(200);

        // FakeStore returns the deleted object for seeded resources, but an
        // empty/null body for newly-created (non-persisted) ones - validate
        // the body only when the API contract provides one
        const deleteBodyText = await deleteResponse.text();
        const deletedProduct = deleteBodyText ? JSON.parse(deleteBodyText) : null;

        if (deletedProduct) {
            expect(deletedProduct.id, 'Delete response ID should match the created product ID').toBe(productId);
        }
    });
});
