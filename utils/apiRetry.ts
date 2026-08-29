import { APIResponse } from '@playwright/test';

/**
 * Retries a request factory while the server returns a transient failure
 * (5xx or 403 from rate-limiting / IP blocking). Returns the last response.
 */
export async function postWithRetry(
    requestFactory: () => Promise<APIResponse>,
    attempts: number = 3
): Promise<APIResponse> {
    let response: APIResponse | undefined;
    for (let attempt = 1; attempt <= attempts; attempt++) {
        response = await requestFactory();
        const status = response.status();
        if (status < 500 && status !== 403) {
            return response;
        }
        if (attempt < attempts) {
            await new Promise((resolve) => setTimeout(resolve, 1000 * attempt));
        }
    }
    return response!;
}
