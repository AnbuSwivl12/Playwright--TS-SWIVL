import {test, expect} from '@playwright/test';
test.describe('Login Smoke Test', () => {
    test ('Login @smoke', async ({page}) => {
        await page.goto('/');
        await page.locator('input[name="email"]').fill('email');
        await page.locator('input[name="password"]').fill('password');
        await page.locator('button[type="submit"]').click();
        await page.waitForSelector('text=Dashboard');
    }   );
});