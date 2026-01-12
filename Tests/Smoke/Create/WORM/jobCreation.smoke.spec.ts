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
            const customerName = page.locator('button[role="combobox"]');
            await customerName.first().waitFor({ state: 'visible', timeout: 5000 });
            await customerName.first().scrollIntoViewIfNeeded();
            await customerName.first().click({ force: true });
            await page.waitForTimeout(500);
            const customerOptions = page.locator('[role="option"]');
            await selectRandomOption(customerOptions);
            await page.waitForTimeout(500);

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
            const tagDropdown = page.getByRole('button', {name: 'Select or add tags', exact: true});
            await tagDropdown.waitFor({ state: 'visible', timeout: 5000 });
            await tagDropdown.scrollIntoViewIfNeeded();
            await tagDropdown.click({ force: true });
            const tagOptions = page.locator('button[role="checkbox"]');
            await page.waitForTimeout(1000);
            await selectRandomOption(tagOptions);
            await page.waitForTimeout(500);
            const saveButton = page.getByRole('button', { name: 'Save' });
            await saveButton.waitFor({ state: 'visible', timeout: 5000 });
            await saveButton.click();
            await page.waitForTimeout(500);

            // Add Job name
            const jobName = page.getByPlaceholder('Enter a clear job title');
            const jobTitle = `Job ${randomalpha(4)}`;
            await jobName.fill(jobTitle);
            await page.waitForTimeout(500);

            // Generate Description
            await page.getByRole('button', { name: 'Generate' }).click();
            await page.waitForTimeout(2000);

            // Click Save button
            await page.getByRole('button', { name: /Save/i }).click();
            await page.waitForTimeout(2000);
        });
    });