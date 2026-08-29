import { test, expect } from '@playwright/test';
import { Routes } from '../../api/endpoints/routes';
import { RandomDataUtil } from '../../utils/dataGenerator';
import { postWithRetry } from '../../utils/apiRetry';
import dotenv from 'dotenv';

// override: true ensures the project .env values win over pre-existing
// OS-level environment variables (e.g. USERNAME on Windows)
dotenv.config({ override: true });

test.describe('Cart CRUD Workflow Tests', () => {

    // ---------------------------------------------------------
    // Configuration
    // ---------------------------------------------------------

    const BASE_URL = process.env.API_BASE_URL || Routes.BASE_URL;
    const USER_ID = Number(process.env.USER_ID ?? 1);

    test('E2E - Cart Create, Update and Delete Workflow @master @e2e @end-to-end @api', async ({ request }) => {

        const createPayload = RandomDataUtil.generateCartPayload(USER_ID);
        const updatedPayload = RandomDataUtil.generateUpdatedCartPayload(USER_ID);

        // Create a cart and capture the generated ID
        const createResponse = await postWithRetry(() =>
            request.post(`${BASE_URL}${Routes.CREATE_CART}`, {
                data: createPayload,
            })
        );

        expect(createResponse.status(), 'Create should return status 201').toBe(201);

        const createdCart = await createResponse.json();

        expect(createdCart.id, 'Create response should return a cart ID').toBeTruthy();
        expect(createdCart.userId, 'Create response should echo the submitted userId').toBe(USER_ID);
        expect(Array.isArray(createdCart.products), 'Create response should contain a products array').toBeTruthy();

        const cartId = createdCart.id;

        // Update the same cart using the captured ID, changing a product quantity
        const updateResponse = await request.put(
            `${BASE_URL}${Routes.UPDATE_CART.replace('{id}', String(cartId))}`,
            { data: updatedPayload }
        );

        expect(updateResponse.status(), 'Update should return status 200').toBe(200);

        const updatedCart = await updateResponse.json();

        expect(updatedCart.id, 'Update response ID should match the created cart ID').toBe(cartId);
        expect(updatedCart.products[0].quantity, 'Update response should reflect the updated quantity').toBe(updatedPayload.products[0].quantity);

        // Delete the same cart using the captured ID
        const deleteResponse = await request.delete(
            `${BASE_URL}${Routes.DELETE_CART.replace('{id}', String(cartId))}`
        );

        expect(deleteResponse.status(), 'Delete should return status 200').toBe(200);

        // FakeStore returns the deleted object for seeded resources, but an
        // empty/null body for newly-created (non-persisted) ones - validate
        // the body only when the API contract provides one
        const deleteBodyText = await deleteResponse.text();
        const deletedCart = deleteBodyText ? JSON.parse(deleteBodyText) : null;

        if (deletedCart) {
            expect(deletedCart.id, 'Delete response ID should match the created cart ID').toBe(cartId);
        }
    });
});
