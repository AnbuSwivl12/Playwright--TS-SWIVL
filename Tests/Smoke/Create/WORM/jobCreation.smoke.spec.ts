import {test, expect } from '@playwright/test';
import { getCredentials } from '../../../../utils/credentials';
import { loginWithCredentials } from '../../../../utils/loginHelper';
import { randomalpha, selectRandomOption, selectMultipleRandomOptions } from '../../../../utils/randomhelper';
    test.describe('Job Creation Smoke Test', () => {
        test('Job Creation @smoke', async ({ page }) => {
            const env = process.env.ENV || 'dev';
            const credentials = getCredentials(env);
            // Login using helper function
            await loginWithCredentials(page, env);
            // Navigate to Job Creation page
            await page.getByRole('button', { name: /Work Order/i }).click();
            await page.waitForTimeout(500);
            await page.getByRole('link', { name: /Jobs/i }).click();
            await page.waitForTimeout(500);
            await page.getByRole('button', { name: /Create New/i }).click();
            await page.waitForTimeout(1500);
           
            // Fill in Job Creation form
            // Field: Account Name (required per Confluence spec - WOM/1699741702)
            const customerName = page.locator('button[role="combobox"]');
            await customerName.first().waitFor({ state: 'visible', timeout: 5000 });
            await customerName.first().scrollIntoViewIfNeeded();
            await customerName.first().click({ force: true });
            await page.waitForTimeout(500);
            const customerOptions = page.locator('[role="option"]');
            await selectRandomOption(customerOptions);
            await page.waitForTimeout(500);

            // Fill Site Address (required per Confluence spec)
            const siteAddress = page.locator('button[role="combobox"]').filter({ hasText: /Select.*Site Address|Select an address/i });
            if (await siteAddress.count() > 0) {
                await siteAddress.first().waitFor({ state: 'visible', timeout: 5000 });
                await siteAddress.first().click({ force: true });
                await page.waitForTimeout(500);
                const addressOptions = page.locator('[role="option"]:visible');
                if (await addressOptions.count() > 0) {
                    await selectRandomOption(addressOptions);
                } else {
                    await page.keyboard.press('Escape');
                }
                await page.waitForTimeout(500);
            }

            // Fill Building/Unit (optional per Confluence spec)
            const buildingUnit = page.locator('button[role="combobox"]').filter({ hasText: /Select.*Building|Select.*Unit/i });
            if (await buildingUnit.count() > 0) {
                await buildingUnit.first().click({ force: true });
                await page.waitForTimeout(500);
                const buildingOptions = page.locator('[role="option"]:visible');
                if (await buildingOptions.count() > 0) {
                    await selectRandomOption(buildingOptions);
                } else {
                    await page.keyboard.press('Escape');
                }
                await page.waitForTimeout(500);
            }

            // Fill Site Contact
            const siteContact = page.locator('button[role="combobox"]').filter({ hasText: 'Select a Site Contact' });
            await siteContact.waitFor({ state: 'visible', timeout: 5000 });
            await siteContact.click({ force: true });
            const contactOptions = page.locator('[role="option"]:visible');
            const optionCount = await contactOptions.count();
            if (optionCount > 0) {
                await selectRandomOption(contactOptions);
            } else {
                await page.keyboard.press('Escape');
            }
            await page.waitForTimeout(500);

            // Fill Job Lead
            const jobLead = page.locator('button[role="combobox"]').filter({ hasText: 'Select a Job Lead' });
            await jobLead.waitFor({ state: 'visible', timeout: 5000 });
            await jobLead.click({ force: true });
            await page.waitForTimeout(500);
            const jobLeadOption= await page.locator('[role="option"]:visible');
            const jobLeadCount = await jobLeadOption.count();
            if (jobLeadCount > 0) {
                 await selectRandomOption(jobLeadOption);
            } else {
                 await page.keyboard.press('Escape');
            }
            
            // Fill Sales manager
            const salesManagerDropdown = page.locator('button[role="combobox"]').filter({ hasText: 'Select a Sales Manager' });
            await salesManagerDropdown.waitFor({ state: 'visible', timeout: 5000 });
            await salesManagerDropdown.click({ force: true });
            await page.waitForTimeout(500);
            const salesManagerOptions = page.locator('[role="option"]');
            const salesOption = await salesManagerOptions.count();
            if (salesOption > 0) {
                await selectRandomOption(salesManagerOptions);
            } else {
                await page.keyboard.press('Escape');
            }
            await page.waitForTimeout(500);

            // Fill Requested by
            const requestedBy = page.locator('button[role="combobox"]').filter({ hasText: 'Select or add a customer contact' });

            await requestedBy.waitFor({ state: 'visible', timeout: 5000 });
            await requestedBy.click({ force: true });

            const requestedByOptions = page.locator('[role="option"]:visible');
            const requestCount = await requestedByOptions.count();
            if (requestCount > 0) {
                await selectRandomOption(requestedByOptions);
            } else {
                await page.keyboard.press('Escape');
            }

            // Add tags to the job
            const tagDropdown = page.getByRole('button', { name: 'Select or add tags', exact: true });
            await tagDropdown.waitFor({ state: 'visible', timeout: 5000 });
            await tagDropdown.scrollIntoViewIfNeeded();
            await tagDropdown.click({ force: true });
            const tagOptions = page.locator('button[role="checkbox"]');
           
            await page.waitForTimeout(500);
            const tagCount = await tagOptions.count();
            if (tagCount > 0) {
            await selectRandomOption(tagOptions);
            await page.getByRole('button', { name: /^Save$/i }).click();
            } 
            else {
            await page.keyboard.press('Escape');
            }

            // Add Job name (required, max 50 chars per Confluence spec)
            const jobName = page.getByPlaceholder('Enter a clear job title');
            const jobTitle = `Job ${randomalpha(4)}`.slice(0, 50);
            await jobName.fill(jobTitle);
            await page.waitForTimeout(500);

            // Generate Description (Jobs 2.0 - AI assist)
            await page.getByRole('button', { name: 'Generate' }).click();
            await page.waitForTimeout(2000);

            // Click Save button
            const saveJobButton = page.getByRole('button', { name: /^Save( Job)?$/i });
            await expect(saveJobButton).toBeVisible({ timeout: 5000 });
            await expect(saveJobButton).toBeEnabled({ timeout: 5000 });
            await saveJobButton.click();
            await page.waitForTimeout(2000);

            // Verify Job creation success
            // Per Confluence spec: "Save Job CTA → Success pop-up → Navigate to Jobs list screen"
            await expect(page).toHaveURL(/jobs/i, { timeout: 10000 });
        });
    });