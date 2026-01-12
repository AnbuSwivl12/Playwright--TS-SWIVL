import {test, expect } from '@playwright/test';
import { getCredentials } from '../../../../utils/credentials';
import { loginWithCredentials } from '../../../../utils/loginHelper';
import { randomalpha, selectRandomOption, selectMultipleRandomOptions, randomDigits } from '../../../../utils/randomhelper';
    test.describe('Job Estimate Creation Smoke Test', () => {
        test('Job Estimate Creation @smoke', async ({ page }) => {
            const env = process.env.ENV || 'dev';
            const credentials = getCredentials(env);
            // Login using helper function
            await loginWithCredentials(page, env);

            // Navigate to Estimate Creation page
            await page.getByRole('button', { name: /Work Order/i }).click();
            await page.waitForTimeout(500);
            await page.getByRole('link', { name: /Estimates/i }).click();
            await page.waitForTimeout(500);
            await page.getByRole('button', { name: /Create New/i }).click();
            await page.waitForTimeout(500);
            await page.getByTestId('manual-estimate-option').click();
            await page.waitForTimeout(1000);

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

            //Submit the Estimate Creation Form
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

           // Select Expiration Date
           const daysDropdown = page.getByRole('combobox').filter({ hasText: 'Days' }).first();
           await expect(daysDropdown).toBeVisible({ timeout: 15000 });
           await daysDropdown.click();
           const dayOptions = page.locator('[role="option"]');
           await expect(dayOptions.first()).toBeVisible({ timeout: 10000 });
           await selectRandomOption(dayOptions);
           await page.waitForTimeout(1000);

           //Add Deposit value
           const depositAmountInput = page.locator('input[name="info.depositAmount"]');
           await depositAmountInput.waitFor({ state: 'visible', timeout: 10000 });
           await depositAmountInput.click();
           await depositAmountInput.fill((20).toString());
           await page.waitForTimeout(1000);

           //Submit the Estimate Creation Form
           await page.getByRole('button', { name: /Review and Send/i }).click();
           await page.waitForTimeout(200);

           // Send the estimate
           await page.getByRole('button',{ name: /Send/i }).click();
           await page.waitForTimeout(200);

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