import {test, expect } from '@playwright/test';
import { getCredentials } from '../../../utils/credentials';
import { loginWithCredentials } from '../../../utils/loginHelper';
import { randomalpha, selectRandomOption, selectMultipleRandomOptions } from '../../../utils/randomhelper';
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
            // Select a random job from the list
            const validJobRows = page.locator('tbody tr').filter({hasNotText: /Closed|Cancelled|Canceled/i});
            await expect(validJobRows.first()).toBeVisible({ timeout: 15000 });
            const count = await validJobRows.count();
            if (count === 0) {
            throw new Error('No open or active jobs found to select');
            }
            const randomIndex = Math.floor(Math.random() * count);
            await validJobRows.nth(randomIndex).locator('a[href*="job"]').first().click();

            //Edit the Job
            await page.getByRole('button', { name: /Edit/i }).click();
            await page.waitForTimeout(1500);

            const getDropdownByLabel = (label: string) => {
                return page.locator('div').filter({ hasText: label }).locator('button[role="combobox"]').first();
            };
            // Update Site Contact
            const comboBoxes = page.locator('button[role="combobox"]');
            const siteContact = comboBoxes.nth(0);
            await siteContact.click();
            const contactOptions = page.locator('[role="option"]:visible');
            const optionCount = await contactOptions.count();
            if (optionCount > 0) {
                await selectRandomOption(contactOptions);
            } else {
                await page.keyboard.press('Escape');
            }
            await page.waitForTimeout(500);

            // Update Job Lead
            const jobLead = comboBoxes.nth(1);
            await jobLead.click();
            const jobLeadOptions = page.locator('[role="option"]:visible');
            const jobLeadCount = await jobLeadOptions.count();
            if (jobLeadCount > 0) {
                await selectRandomOption(jobLeadOptions);
            } else {
                await page.keyboard.press('Escape');
            }
            await page.waitForTimeout(500);
           

            //update Sales manager
            const salesManager = comboBoxes.nth(2);
            await salesManager.click();
            const salesManagerOptions = page.locator('[role="option"]:visible');
            const salesManagerCount = await salesManagerOptions.count();
            if (salesManagerCount > 0) {
                await selectRandomOption(salesManagerOptions);
            } else {
                await page.keyboard.press('Escape');
            }
            await page.waitForTimeout(500);
         

            // Update Requested By
            const requestedBy = comboBoxes.nth(3);
            await requestedBy.click();
            const requestedByOptions = page.locator('[role="option"]:visible');
            const requestedByCount = await requestedByOptions.count();
            if (requestedByCount > 0) {
                await selectRandomOption(requestedByOptions);
            } else {
                await page.keyboard.press('Escape');
            }
            await page.waitForTimeout(500);
         

            // Update Job Tags
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

            // Update Job Name 
            const jobName = page.getByPlaceholder('Enter a clear job title');
            const jobTitle = `Updated Job ${randomalpha(4)}`;
            await jobName.fill(jobTitle);
            await page.waitForTimeout(500);

            // Update Generated Description
            await page.getByRole('button', { name: 'Generate' }).click();
            await page.waitForTimeout(2000);

            // Click Save button
            await page.getByRole('button', { name: /Save/i }).click();
            await page.waitForTimeout(2000);
            
        });
    });