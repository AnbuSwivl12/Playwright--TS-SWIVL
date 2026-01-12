import {test, expect } from '@playwright/test';
import { getCredentials } from '../../../../utils/credentials';
import { loginWithCredentials } from '../../../../utils/loginHelper';
import { randomalpha, selectRandomOption, selectMultipleRandomOptions, selectRandomCalendarDay } from '../../../../utils/randomhelper';
    test.describe('Task Creation Smoke Test', () => {
        test('Task Creation @smoke', async ({ page }) => {
            const env = process.env.ENV || 'dev';
            const credentials = getCredentials(env);
            // Login using helper function
            await loginWithCredentials(page, env);

            // Navigate to Task Creation page
            await page.getByRole('button', { name: /Work Order/i }).click();
            await page.waitForTimeout(500);
            await page.getByRole('link', { name: /Task Scheduler/i }).click();
            await page.waitForTimeout(500);
            await page.getByRole('button', { name: /Create Task/i }).click();
            await page.waitForTimeout(1500);

            // Fill in Task Creation form
            const customerName = page.locator('button[role="combobox"]');
            await customerName.first().waitFor({ state: 'visible', timeout: 5000 });
            await customerName.first().scrollIntoViewIfNeeded();
            await customerName.first().click({ force: true });
            await page.waitForTimeout(500);
            const customerOptions = page.locator('[role="option"]');
            await selectRandomOption(customerOptions);
            await page.waitForTimeout(500);

            //Select job from the list
            const jobDropdown = page.locator('button[role="combobox"]').filter({ has: page.locator('span', { hasText: 'Search job by number' }) });
            await jobDropdown.waitFor({ state: 'visible', timeout: 5000 });
            await jobDropdown.scrollIntoViewIfNeeded();
            await jobDropdown.click({ force: true });
            await page.waitForTimeout(500);
            const jobOptions = page.getByRole('option');
            await jobOptions.first().waitFor({ state: 'visible', timeout: 10000 });
            await selectRandomOption(jobOptions);

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

             // Fill Requested by
            const requestedBy = page.locator('button[role="combobox"]').filter({ hasText: 'Select a requested by' });

            await requestedBy.waitFor({ state: 'visible', timeout: 5000 });
            await requestedBy.click({ force: true });

            const requestedByOptions = page.locator('[role="option"]:visible');
            const requestCount = await requestedByOptions.count();
            if (requestCount > 0) {
                await selectRandomOption(requestedByOptions);
            } else {
                await page.keyboard.press('Escape');
            }
            await page.waitForTimeout(500);

            // Fill Task Name
            const taskName = `Task ${randomalpha(3)}`;
            await page.locator('input[name="name"]').fill(taskName);
            await page.waitForTimeout(500);

            //Fill Task Description
            await page.getByRole('button', { name: 'Generate' }).click();
            await page.waitForTimeout(500);

            // Open Start Date picker and select date
            const startDatePicker = page.locator('button[aria-haspopup="dialog"]').filter({ has: page.locator('svg.lucide-calendar-days') }).nth(0);
            await startDatePicker.waitFor({ state: 'visible', timeout: 10000 });
            await startDatePicker.click();
            await selectRandomCalendarDay(page);
            await page.waitForTimeout(500);
            // Select Time
            const hourDropdown = page.locator('button[role="combobox"]').filter({ hasText: /^\d{2}$/ }).first();
            await hourDropdown.waitFor({ state: 'visible', timeout: 5000 });
            await hourDropdown.click();
            const hourOptions = page.locator('[role="option"]');
            await selectRandomOption(hourOptions);
            await page.waitForTimeout(500);

            const minuteDropdown = page.locator('button[role="combobox"]').filter({ hasText: /^\d{2}$/ }).nth(1); 
            await minuteDropdown.click();
            const minuteOptions = page.locator('[role="option"]');
            await selectRandomOption(minuteOptions);
            

            const meridiemDropdown = page.locator('button[role="combobox"]').filter({ hasText: /AM|PM/ }).first();
            await meridiemDropdown.click();
            const meridiemOptions = page.locator('[role="option"]');
            await selectRandomOption(meridiemOptions);
            await page.waitForTimeout(500);


            //Open End Date picker and select date
            const endDatePicker = page.locator('button[aria-haspopup="dialog"]').filter({ has: page.locator('svg.lucide-calendar-days') }).nth(1);
            await endDatePicker.waitFor({ state: 'visible', timeout: 10000 });
            await endDatePicker.click();
            const nextDay = page.locator('button.rdp-day:not([disabled])').first();
            await nextDay.waitFor({ state: 'visible', timeout: 5000 });
            await nextDay.click();
            await page.waitForTimeout(500);


               // Select Time
            const endHourDropdown = page.locator('button[role="combobox"]').filter({ hasText: /^\d{2}$/ }).first();
            await endHourDropdown.waitFor({ state: 'visible', timeout: 5000 });
            await endHourDropdown.click();
            const endHourOptions = page.locator('[role="option"]');
            await selectRandomOption(endHourOptions);
            await page.waitForTimeout(500);

            const endMinuteDropdown = page.locator('button[role="combobox"]').filter({ hasText: /^\d{2}$/ }).nth(1);
            await endMinuteDropdown.click();
            const endMinuteOptions = page.locator('[role="option"]');
            await selectRandomOption(endMinuteOptions);

            const endMeridiemDropdown = page.locator('button[role="combobox"]').filter({ hasText: /AM|PM/ }).first();
            await endMeridiemDropdown.click();
            const endMeridiemOptions = page.locator('[role="option"]');
            await selectRandomOption(endMeridiemOptions);
            await page.waitForTimeout(500); 

            //Selecting Technician
            const assignTaskButtons = page.locator('button', { hasText: 'Assign Task' });
            await assignTaskButtons.first().waitFor({state: 'attached',timeout: 10000});
            await selectRandomOption(assignTaskButtons);
            await page.waitForTimeout(500);

            // Save the Task
            await page.getByRole('button', { name: /^Save & Close$/ }).click();
            await page.waitForTimeout(2000);
        });
    });