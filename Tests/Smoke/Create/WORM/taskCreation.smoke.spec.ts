import {test, expect } from '@playwright/test';
import { getCredentials } from '../../../../utils/credentials';
import { loginWithCredentials } from '../../../../utils/loginHelper';
import { randomalpha, selectRandomOption, selectMultipleRandomOptions, selectRandomCalendarDay, selectCalendarDay } from '../../../../utils/randomhelper';
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

            // Fill in Task Creation form — Customer + Job
            // The Job dropdown is scoped to the selected customer. If the picked customer
            // has no jobs (search returns "No items found" for J / 0 / empty), close the
            // listbox, reopen the customer combobox and pick a different one.
            const customerName = page.locator('button[role="combobox"]');
            await customerName.first().waitFor({ state: 'visible', timeout: 5000 });
            await customerName.first().scrollIntoViewIfNeeded();

            const jobDropdown = page.locator('button[role="combobox"]')
                .filter({ hasText: /Search job by number/i })
                .first();
            const jobSearchInput = page.getByRole('listbox').getByRole('textbox')
                .or(page.locator('input[placeholder="Search..."]'))
                .first();
            const jobOptions = page.getByRole('option');

            const triedCustomers = new Set<string>();
            const maxCustomerAttempts = 6;
            let jobSelected = false;

            for (let attempt = 0; attempt < maxCustomerAttempts && !jobSelected; attempt++) {
                // Open customer dropdown and pick a customer we haven't tried yet
                await customerName.first().click({ force: true });
                await page.waitForTimeout(500);
                const customerOptions = page.locator('[role="option"]:visible');
                await expect(customerOptions.first()).toBeVisible({ timeout: 10000 });

                const total = await customerOptions.count();
                let pickedIdx = Math.floor(Math.random() * total);
                let pickedText = (await customerOptions.nth(pickedIdx).innerText()).trim();
                for (let t = 0; t < 5 && triedCustomers.has(pickedText); t++) {
                    pickedIdx = Math.floor(Math.random() * total);
                    pickedText = (await customerOptions.nth(pickedIdx).innerText()).trim();
                }
                triedCustomers.add(pickedText);
                await customerOptions.nth(pickedIdx).click({ force: true });
                console.log(`Customer attempt ${attempt + 1}: ${pickedText}`);
                await page.waitForTimeout(800);

                // Open job dropdown and search
                await jobDropdown.waitFor({ state: 'visible', timeout: 5000 });
                await jobDropdown.scrollIntoViewIfNeeded();
                await jobDropdown.click({ force: true });
                await page.waitForTimeout(500);

                if (!(await jobSearchInput.isVisible({ timeout: 3000 }).catch(() => false))) {
                    await page.keyboard.press('Escape').catch(() => {});
                    continue;
                }

                for (const q of ['J', '0', '']) {
                    await jobSearchInput.fill('');
                    if (q) await jobSearchInput.fill(q);
                    await page.waitForTimeout(700);
                    if (await jobOptions.first().isVisible({ timeout: 1500 }).catch(() => false)) {
                        await selectRandomOption(jobOptions);
                        jobSelected = true;
                        break;
                    }
                }

                if (!jobSelected) {
                    console.log(`Customer "${pickedText}" has no jobs, trying another...`);
                    await page.keyboard.press('Escape').catch(() => {});
                    await page.waitForTimeout(400);
                }
            }

            if (!jobSelected) {
                throw new Error(
                    `Could not find a customer with jobs after ${maxCustomerAttempts} attempts. ` +
                    `Tried: ${[...triedCustomers].join(', ')}`
                );
            }
            await page.waitForTimeout(500);

            // Fill Site Contact (placeholder casing matters: 'Select a site contact')
            const siteContact = page.locator('button[role="combobox"]')
                .filter({ hasText: /Select a site contact/i });
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

            // Open Start Date picker and select a date 7 days from today (guaranteed
            // future, never lands on a spillover past-month day).
            const startDatePicker = page.locator('button[aria-haspopup="dialog"]').filter({ has: page.locator('svg.lucide-calendar-days') }).nth(0);
            await startDatePicker.waitFor({ state: 'visible', timeout: 10000 });
            await startDatePicker.click();
            await selectCalendarDay(page, 7);
            await page.waitForTimeout(500);

            // Start time pickers — scope to the popover that's currently open so we don't
            // accidentally hit some other combobox on the page.
            const startTimePopover = page.getByRole('dialog');
            const hourDropdown = startTimePopover.locator('button[role="combobox"]').filter({ hasText: /^\d{2}$/ }).first();
            await hourDropdown.waitFor({ state: 'visible', timeout: 5000 });
            await hourDropdown.click();
            await selectRandomOption(page.locator('[role="option"]:visible'));
            await page.waitForTimeout(500);

            const minuteDropdown = startTimePopover.locator('button[role="combobox"]').filter({ hasText: /^\d{2}$/ }).nth(1);
            await minuteDropdown.click();
            await selectRandomOption(page.locator('[role="option"]:visible'));
            await page.waitForTimeout(300);

            const meridiemDropdown = startTimePopover.locator('button[role="combobox"]').filter({ hasText: /AM|PM/ }).first();
            await meridiemDropdown.click();
            await selectRandomOption(page.locator('[role="option"]:visible'));
            await page.waitForTimeout(500);

            // Dismiss the Start time popover before opening the End picker, otherwise
            // .first() on the End time dropdowns will re-grab the Start time controls.
            await page.keyboard.press('Escape').catch(() => {});
            await page.waitForTimeout(300);

            // Open End Date picker. Pick a date 14 days from today — guaranteed to be
            // both in the future AND after the Start Date (which is today + 7).
            // The previous .first() approach was picking the first non-disabled cell,
            // which is often a spillover day from the previous month (e.g. Apr 26 in a
            // May 2026 calendar) — past dates that broke the form.
            const endDatePicker = page.locator('button[aria-haspopup="dialog"]').filter({ has: page.locator('svg.lucide-calendar-days') }).nth(1);
            await endDatePicker.waitFor({ state: 'visible', timeout: 10000 });
            await endDatePicker.click();
            await selectCalendarDay(page, 14);
            await page.waitForTimeout(500);

            // End time pickers — anchor inside the dialog popover that's currently open
            // (the Start one is already dismissed) so .first() targets End fields only.
            const endTimePopover = page.getByRole('dialog');
            const endHourDropdown = endTimePopover.locator('button[role="combobox"]').filter({ hasText: /^\d{2}$/ }).first();
            await endHourDropdown.waitFor({ state: 'visible', timeout: 5000 });
            await endHourDropdown.click();
            await selectRandomOption(page.locator('[role="option"]:visible'));
            await page.waitForTimeout(500);

            const endMinuteDropdown = endTimePopover.locator('button[role="combobox"]').filter({ hasText: /^\d{2}$/ }).nth(1);
            await endMinuteDropdown.click();
            await selectRandomOption(page.locator('[role="option"]:visible'));
            await page.waitForTimeout(300);

            const endMeridiemDropdown = endTimePopover.locator('button[role="combobox"]').filter({ hasText: /AM|PM/ }).first();
            await endMeridiemDropdown.click();
            await selectRandomOption(page.locator('[role="option"]:visible'));
            await page.waitForTimeout(500);

            // Close the End time popover too
            await page.keyboard.press('Escape').catch(() => {});
            await page.waitForTimeout(300);

            // Selecting Technician
            // Match Assign Task buttons by accessible name. getByRole already excludes
            // elements hidden via aria-hidden / display:none, so the inactive Subcontractor
            // and Bids panels are naturally filtered out without manual scoping.
            const assignTaskButtons = page.getByRole('button', { name: 'Assign Task', exact: true });
            await assignTaskButtons.first().waitFor({ state: 'visible', timeout: 10000 });

            // Pick a random visible technician and click. selectRandomOption already
            // re-rolls if it lands on a hidden element.
            await selectRandomOption(assignTaskButtons);
            await page.waitForTimeout(1000);

            // Save the Task
            const saveBtn = page.getByRole('button', { name: /^Save & Close$/ });
            await expect(saveBtn).toBeEnabled({ timeout: 10000 });
            await saveBtn.scrollIntoViewIfNeeded();
            await saveBtn.click();
            await page.waitForTimeout(2500);

            // Verify the task was saved — the Create New Task dialog should close and the
            // breadcrumb 'Create' should disappear (we land back on the scheduler/list view).
            await expect(page.getByRole('heading', { name: /Create New Task/i }))
                .not.toBeVisible({ timeout: 10000 });
        });
    });