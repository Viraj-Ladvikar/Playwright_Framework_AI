import { test, expect } from '@playwright/test';
import { Routes } from '../../api/endpoints/routes';
import { RandomDataUtil } from '../../utils/dataGenerator';
import { postWithRetry } from '../../utils/apiRetry';
import dotenv from 'dotenv';

// override: true ensures the project .env values win over pre-existing
// OS-level environment variables (e.g. USERNAME on Windows)
dotenv.config({ override: true });

test.describe('User CRUD Workflow Tests', () => {

    // ---------------------------------------------------------
    // Configuration
    // ---------------------------------------------------------

    const BASE_URL = process.env.API_BASE_URL || Routes.BASE_URL;

    test('E2E - User Create, Update and Delete Workflow @master @end-to-end @api', async ({ request }) => {

        const createPayload = RandomDataUtil.generateUserPayload();
        const updatedPayload = RandomDataUtil.generateUserUpdatePayload();

        // Create a user and capture the generated ID
        const createResponse = await postWithRetry(() =>
            request.post(`${BASE_URL}${Routes.CREATE_USER}`, {
                data: createPayload,
            })
        );

        expect(createResponse.status(), 'Create should return status 201').toBe(201);

        const createdUser = await createResponse.json();

        expect(createdUser.id, 'Create response should return a user ID').toBeTruthy();

        const userId = createdUser.id;

        // Update the same user using the captured ID
        const updateResponse = await request.put(
            `${BASE_URL}${Routes.UPDATE_USER.replace('{id}', String(userId))}`,
            { data: updatedPayload }
        );

        expect(updateResponse.status(), 'Update should return status 200').toBe(200);

        const updatedUser = await updateResponse.json();

        expect(updatedUser.username, 'Update response should contain the updated username').toBe(updatedPayload.username);
        expect(updatedUser.email, 'Update response should contain the updated email').toBe(updatedPayload.email);
        expect(updatedUser.name.firstname, 'Update response should contain the updated first name').toBe(updatedPayload.name.firstname);

        // Delete the same user using the captured ID
        const deleteResponse = await request.delete(
            `${BASE_URL}${Routes.DELETE_USER.replace('{id}', String(userId))}`
        );

        expect(deleteResponse.status(), 'Delete should return status 200').toBe(200);

        // FakeStore returns the deleted object for seeded resources, but an
        // empty/null body for newly-created (non-persisted) ones - validate
        // the body only when the API contract provides one
        const deleteBodyText = await deleteResponse.text();
        const deletedUser = deleteBodyText ? JSON.parse(deleteBodyText) : null;

        if (deletedUser) {
            expect(deletedUser.id, 'Delete response ID should match the created user ID').toBe(userId);
        }
    });
});
