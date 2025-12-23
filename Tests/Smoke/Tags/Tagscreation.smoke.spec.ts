import {test, expect } from '@playwright/test';
import { getCredentials } from '../../../utils/credentials';
import { loginWithCredentials } from '../../../utils/loginHelper';
import { randomalpha, selectRandomOption } from '../../../utils/randomhelper';  
    test.describe('Tags Creation Smoke Test', () => {
        test('Tags Creation @smoke', async ({ page }) => {
            const env = process.env.ENV || 'dev';
            const credentials = getCredentials(env);
            // Login using helper function
            await loginWithCredentials(page, env);
            // Navigate to Tags Creation page
            await page.getByRole('button', { name: /Settings/i }).click();
                await page.getByRole('link', { name: /Tags & Service Areas/i }).click();
                await page.getByRole('button', { name: /New Tag/i }).click();
                await page.waitForTimeout(500);
                // Fill in Tags Creation form
                const tagName = `Tag ${randomalpha(3)}`;
                await page.locator('input[Placeholder="Type here"]').fill(tagName);
                await page.locator('input[Placeholder="Select from dropdown"]').click();
                const tagOptions = page.locator('[role = "option"]:visible');
                await page.waitForTimeout(500);
                await selectRandomOption(tagOptions);
                await page.waitForTimeout(500);

                // Click Add Tag button
                await page.getByRole('button', { name: /Add Tag/i }).click();
                await page.waitForTimeout(1000);

        });
    });