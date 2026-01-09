import {test, expect } from '@playwright/test';
import { getCredentials } from '../../../utils/credentials';
import { loginWithCredentials } from '../../../utils/loginHelper';
import { randomNum, selectRandomCalendarDay, randomDigits, randomFullName } from '../../../utils/randomhelper';
    test.describe('Equipments Creation Smoke Test', () => {
        test('Equipments Creation @smoke', async ({ page }) => {
            const env = process.env.ENV || 'dev';
            const credentials = getCredentials(env);
            // Login using helper function
            await loginWithCredentials(page, env);

            // Navigate to Equipment Setup page
            await page.getByRole('button', { name: /Inventory/i }).click();
            await page.waitForTimeout(500);
            await page.getByRole('link', { name: /Assets Setup/i }).click();
            await page.waitForTimeout(500);
            await page.getByRole('tab', { name: 'Tools & Equipments' }).click();
            await page.waitForTimeout(500);

            //Add new Equipment
            await page.locator('button:has-text("Add Tool/Equipment")').click();
            await page.waitForTimeout(1500);

            // Fill in Equipment Creation form
            const equipmentName = `Tool ${randomNum()}`;
            await page.locator('input[name="equipmentName"]').fill(equipmentName);
            await page.waitForTimeout(500);
            await page.locator('input[name="manufacturer"]').fill(randomFullName());
            await page.waitForTimeout(500);
            await page.locator('input[name="serialNumber"]').fill(`SN${randomDigits(4)}`);
            await page.waitForTimeout(500);
            
            // Open the Purchase date picker
            const PurchaseDatePicker = page.locator('button').filter({ has: page.locator('svg.lucide-calendar') }).first();
            await PurchaseDatePicker.click();
            // Select random date from calendar
            await selectRandomCalendarDay(page);
            await page.waitForTimeout(500);

            await page.locator('input[name="toolTrackerId"]').fill(`TTID${randomDigits(4)}`);
            await page.waitForTimeout(500);
            await page.locator('input[name="purchasePrice"]').fill(randomDigits(3).toString());
            await page.waitForTimeout(500);
            // Fill Cost Per Hour 
            await page.locator('input[name="costPerHour"]').fill(randomDigits(2).toString());
            await page.waitForTimeout(500);
            
            // Click on Save Equipment button
            await page.getByRole('button', { name: /Save Details/i }).click();
            await page.waitForTimeout(2000);

        });
    });

