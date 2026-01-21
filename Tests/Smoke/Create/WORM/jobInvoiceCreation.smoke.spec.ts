import {test, expect } from '@playwright/test';
import { getCredentials } from '../../../../utils/credentials';
import { loginWithCredentials } from '../../../../utils/loginHelper';
import { randomalpha, selectRandomOption, selectMultipleRandomOptions, randomDigits } from '../../../../utils/randomhelper';
import { env } from 'process';
    test.describe('Job Invoice Creation Smoke Test', () => {
        test('Create Job Invoice', async ({ page }) => {
            const env = process.env.ENV || 'dev';
            const credentials = getCredentials(env);
            // Login using helper function
            await loginWithCredentials(page, env);

            //Navigate to Invoice Creation page
            await page.getByRole('button', { name: /Work Order/i }).click();
            await page.waitForTimeout(500);
            await page.getByRole('link', { name: /Invoices/i }).click();
            await page.waitForTimeout(500);
            await page.getByRole('button', { name: /Create New/i }).click();
            await page.waitForTimeout(500);

            //Select Customer
            const customerSearch = page.getByRole('combobox').filter({ hasText: 'Type to search customer' }).first();
            await customerSearch.waitFor({ state: 'visible', timeout: 10000 });
            await customerSearch.click();
            const customerOptions = page.locator('[role="option"]');
            await expect(customerOptions.first()).toBeVisible({ timeout: 10000 });
            await selectRandomOption(customerOptions);
            await page.waitForTimeout(100);

            //Add description
            const description = `Automation Description ${randomalpha(5)}`;
            await page.locator('textarea[name="jobInfo.description"]').fill(description);
            await page.waitForTimeout(100);

            //Select Job
            const jobSelect = page.getByRole('combobox').filter({ hasText: 'Select a job' }).first();
            await jobSelect.waitFor({ state: 'visible', timeout: 10000 });
            await jobSelect.click();
            const jobOptions = page.locator('[role="option"]');
            await expect(jobOptions.first()).toBeVisible({ timeout: 10000 });
            await selectRandomOption(jobOptions);
            await page.waitForTimeout(100);

            //Submit the Invoice Creation Form
            await page.getByRole('button', { name: /Save and Next/i }).click();
            await page.waitForTimeout(2000);

            // Add Product and Service
           const dropdown = page.getByRole('combobox').filter({ hasText: 'Type or Select from dropdown' });
           await dropdown.waitFor({ state: 'visible', timeout: 10000 });
           await dropdown.click();
           const dropdownOptions = page.locator('[role="option"]');
           await expect(dropdownOptions.first()).toBeVisible({ timeout: 10000 });
           await selectRandomOption(dropdownOptions);
           await page.waitForTimeout(1000);

           //Select Due Date
           const daysDropdown = page.getByRole('combobox').filter({ has: page.locator('svg.lucide-chevron-down') }).first();
           await expect(daysDropdown).toBeVisible({ timeout: 10000 });
           await daysDropdown.click();
           const dayOptions = page.locator('[role="option"]');
           await expect(dayOptions.first()).toBeVisible({ timeout: 10000 });
           await selectRandomOption(dayOptions);
           await page.waitForTimeout(1000);

           //Submit the Invoice Creation Form
           await page.getByRole('button', { name: /Review and Send/i }).click();
           await page.waitForTimeout(1000);

           //Send Invoice via Email
           await page.getByRole('button', { name: /Send/i }).click();
           await page.waitForTimeout(500);
           
           //Add email
           const emailInput = page.locator('input[placeholder="Start typing to search or add manually"]').first();
           await emailInput.waitFor({ state: 'visible', timeout: 10000 });
           await emailInput.click();
           const uniqueEmail = `auto${randomDigits(3)}@yopmail.com`;
           await emailInput.fill(uniqueEmail);
           await page.waitForTimeout(500);
           await emailInput.press('Enter');
           await page.waitForTimeout(500);
           console.log('Email added:', uniqueEmail);
           
           // Final Send
           await page.getByRole('button',{ name: /Send/i }).click();
           await page.waitForTimeout(2000);

        });
    });