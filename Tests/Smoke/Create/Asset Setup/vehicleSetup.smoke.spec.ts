import {test, expect } from '@playwright/test';
import { getCredentials } from '../../../../utils/credentials';
import { loginWithCredentials } from '../../../../utils/loginHelper';
import { randomNum, selectRandomOption, randomDigits } from '../../../../utils/randomhelper';
    test.describe('Vehicle Creation Smoke Test', () => {
        test('Vehicle Creation @smoke', async ({ page }) => {
            const env = process.env.ENV || 'dev';
            const credentials = getCredentials(env);
            // Login using helper function
            await loginWithCredentials(page, env);

            // Navigate to Vehicle Setup page
            await page.getByRole('button', { name: /Inventory/i }).click();
            await page.waitForTimeout(500);
            await page.getByRole('link', { name: /Assets Setup/i }).click();
            await page.waitForTimeout(500);

            //Add new Vehicle
            await page.getByRole('button', { name: /Add New Vehicle/i }).click();
            await page.waitForTimeout(1500);

            // Fill in Vehicle Creation form
            const VInumber = `1GT125E89EF14${randomDigits(4)}`;
            const VIN = await page.locator('input[placeholder="Type here"]');
            await VIN.fill(VInumber);
            await page.waitForTimeout(500);

         // Open dropdown by clicking wrapper
            const regionInput = page.getByPlaceholder('Select from dropdown');
            await expect(regionInput).toBeVisible({ timeout: 15000 });
            await regionInput.click();
            const regionOptions = page.locator('button.w-full:visible');
            await expect(regionOptions.first()).toBeVisible({ timeout: 10000 });
            await selectRandomOption(regionOptions);

            // Save VIN details
            await page.locator('button:has-text("Save and Next")').click();
            await page.waitForTimeout(2000);
            
            // Fill Vehicle Name
            const vehicleName = `Vehicle ${randomNum()}`;
            await page.locator('input[name="name"]').fill(vehicleName);
            await page.waitForTimeout(500);

            // Enter expected mileage
            const expectedMileage = randomDigits(4);
            await page.locator('input[name="expectedLifetimeMileage"]').fill(expectedMileage.toString());
            await page.waitForTimeout(500);

            // Enter Current Mileage
            const currentMileage = randomDigits(2);
            await page.locator('input[name="currentMileage"]').fill(currentMileage.toString());
            await page.waitForTimeout(500);

            // Click on Save Vehicle button
            await page.getByRole('button', { name: /Save Details/i }).click();
            await page.waitForTimeout(2000);

        });
    });