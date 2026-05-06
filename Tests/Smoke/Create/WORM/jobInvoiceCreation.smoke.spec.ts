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
            // Navigate to Jobs list
            await page.getByRole('button', { name: /Work Order/i }).click();
            await page.waitForTimeout(500);
            await page.getByRole('link', { name: /^Jobs$/i }).click();
            await page.waitForTimeout(1000);

            // Open job
            const openJobRows = page.locator('tbody tr')
            .filter({ hasNotText: /Closed|Cancelled|Canceled/i });
            await expect(openJobRows.first()).toBeVisible({ timeout: 15000 });

            const openJobCount = await openJobRows.count();
            if (openJobCount === 0) {
            throw new Error('No open / action-required jobs found in Jobs list');
            }
            const randomIndex = Math.floor(Math.random() * Math.min(openJobCount, 10));
            await openJobRows.nth(randomIndex).locator('a[href*="job"]').first().click();
            await page.waitForTimeout(1500);

            const createCta = page.getByRole('button', { name: /^\+?\s*Create\s*$/i }).last();
            await createCta.waitFor({ state: 'visible', timeout: 10000 });
            await createCta.scrollIntoViewIfNeeded();
            //Select Invoice creation option
            let invoiceOption = page.getByRole('menuitem', { name: /Create New Invoice/i }).first();
            for (let attempt = 0; attempt < 3; attempt++) {
            await createCta.click();
            await page.waitForTimeout(600);
            if (await invoiceOption.isVisible({ timeout: 2000 }).catch(() => false)) {
            break;
            }
            await page.keyboard.press('Escape').catch(() => {});
            await page.waitForTimeout(300);
            }

            if (!(await invoiceOption.isVisible({ timeout: 1000 }).catch(() => false))) {
            invoiceOption = page.locator('[role="menuitem"]:visible, [role="option"]:visible')
            .filter({ hasText: /Create New Invoice/i })
            .first();
            }
            await invoiceOption.waitFor({ state: 'visible', timeout: 10000 });
            await invoiceOption.click();
            await page.waitForTimeout(1500);

            //Select Customer
             const customerSearch = page.getByRole('combobox')
                        .filter({ hasText: /Type or search customer|Type to search customer/i })
                        .or(page.getByPlaceholder(/Type or search customer|Type to search customer/i))
                        .first();
                    if (await customerSearch.isVisible({ timeout: 5000 }).catch(() => false)
                        && await customerSearch.isEnabled().catch(() => false)) {
                        await customerSearch.click();
                        const customerOptions = page.locator('[role="option"]:visible');
                        await expect(customerOptions.first()).toBeVisible({ timeout: 10000 });
                        await selectRandomOption(customerOptions);
                        await page.waitForTimeout(500);
                    }

                    // Link to Job — same idea: only pick one if the combobox is actually enabled.
                    const jobSelect = page.getByRole('combobox')
                        .filter({ hasText: /Select a job/i })
                        .first();
                    if (await jobSelect.isVisible({ timeout: 3000 }).catch(() => false)
                        && await jobSelect.isEnabled().catch(() => false)) {
                        await jobSelect.scrollIntoViewIfNeeded();
                        await jobSelect.click({ force: true });
                        const jobOptions = page.locator('[role="option"]:visible');
                        await expect(jobOptions.first()).toBeVisible({ timeout: 10000 });
                        await selectRandomOption(jobOptions);
                        await page.waitForTimeout(500);
                        }

            //Submit the Invoice Creation Form
            await page.getByRole('button', { name: /Save and Next|^Next$/i }).last().click();
            await page.waitForTimeout(2000);

           // Step 1 -> Step 2: success signal is the Product & Services combobox.
           const productDropdown = page.getByRole('combobox')
           .filter({ hasText: /Type or [sS]elect from dropdown/i })
           .first();
            await productDropdown.waitFor({ state: 'visible', timeout: 15000 });

            // Step 2: Product & Services - Select Product
            await productDropdown.scrollIntoViewIfNeeded();
            await productDropdown.click({ force: true });
            const productOptions = page.locator('[role="option"]:visible');
            await expect(productOptions.first()).toBeVisible({ timeout: 10000 });
            await selectRandomOption(productOptions);
            await page.waitForTimeout(1000);

            // Click Next to advance Step 2 -> Step 3 (Terms)
            const nextAfterProduct = page.getByRole('button', { name: /Save and Next|^Next$/i }).last();
            await expect(nextAfterProduct).toBeEnabled({ timeout: 10000 });
            await nextAfterProduct.scrollIntoViewIfNeeded();
            await nextAfterProduct.click({ force: true });
            await page.waitForTimeout(2000);

            // Step 3: Terms (+ Media and Documents)
            // Term combobox — default value is "Due on Receipt"; once a day option is picked
            // it shows "X Days". Match either so the locator works in both states.
            const termDropdown = page.getByRole('combobox')
                .filter({ hasText: /Due on Receipt|^\s*\d+\s*Days\s*$/i })
                .first();
            await termDropdown.waitFor({ state: 'visible', timeout: 15000 });
            await termDropdown.scrollIntoViewIfNeeded();
            await termDropdown.click({ force: true });
            await page.waitForTimeout(500);

            // Pick a "X Days" option (skip "Due on Receipt" / "Other" so Due Date auto-fills).
            const dayOptions = page.locator('[role="option"]:visible')
                .filter({ hasText: /^\s*\d+\s*Days\s*$/i });
            if (await dayOptions.first().isVisible({ timeout: 3000 }).catch(() => false)) {
                await selectRandomOption(dayOptions);
            } else {
                const anyOption = page.locator('[role="option"]:visible');
                if (await anyOption.first().isVisible({ timeout: 1000 }).catch(() => false)) {
                    await selectRandomOption(anyOption);
                } else {
                    await page.keyboard.press('Escape');
                }
            }
            await page.waitForTimeout(800);

            // Customer message (optional)
            const customerMessage = page.getByPlaceholder(/Write a short message to appear on the invoice/i);
            if (await customerMessage.isVisible({ timeout: 3000 }).catch(() => false)) {
                await customerMessage.fill(`Automation message ${randomalpha(5)}`);
                await page.waitForTimeout(300);
            }

            // Submit -> View Invoice page
            await page.getByRole('button', { name: /Review & Send|Review and Send/i }).click();
            await page.waitForTimeout(2500);

            // Per Invoice 2.0: Review & Send navigates to /invoices/{id}/view-detail
            await expect(page).toHaveURL(/invoices?\/.+\/view-detail|invoice/i, { timeout: 15000 });

            // Send the invoice from the View Invoice page
            const sendButton = page.getByRole('button', { name: /^Send$/i }).first();
            if (await sendButton.isVisible({ timeout: 5000 }).catch(() => false)) {
                await sendButton.scrollIntoViewIfNeeded();
                await sendButton.click({ force: true });
                await page.waitForTimeout(1200);

                // Send Invoice side panel: type email, then either press Enter or click "+"
                const emailInput = page.locator('input[placeholder="Start typing to search or add manually"]').first();
                if (await emailInput.isVisible({ timeout: 5000 }).catch(() => false)) {
                    const uniqueEmail = `auto${randomDigits(3)}@yopmail.com`;
                    await emailInput.click();
                    await emailInput.fill(uniqueEmail);
                    await page.waitForTimeout(500);
                    await emailInput.press('Enter');
                    await page.waitForTimeout(800);

                    // If the email chip didn't get added via Enter, click the adjacent "+" button.
                    const emailChip = page.getByText(new RegExp(`${uniqueEmail.split('@')[0]}.*(Other|Custom)`, 'i'));
                    const chipVisible = await emailChip.isVisible({ timeout: 1500 }).catch(() => false);
                    if (!chipVisible) {
                        const plusBtn = page.locator('button:has(svg.lucide-plus), button:has(svg.lucide-circle-plus)').last();
                        if (await plusBtn.isVisible({ timeout: 1000 }).catch(() => false)) {
                            await plusBtn.click({ force: true });
                            await page.waitForTimeout(800);
                        }
                    }
                    console.log('Email added:', uniqueEmail);

                    // Final Send (inside the Send Invoice panel)
                    const finalSend = page.getByRole('button', { name: /^Send$/i }).last();
                    await finalSend.waitFor({ state: 'visible', timeout: 5000 });
                    await finalSend.scrollIntoViewIfNeeded();
                    await finalSend.click({ force: true });
                    await page.waitForTimeout(2500);

                    // Dismiss "Your invoice has been sent successfully!" modal
                    const okButton = page.getByRole('button', { name: /^Ok$/i });
                    if (await okButton.isVisible({ timeout: 7000 }).catch(() => false)) {
                        await okButton.click();
                        await page.waitForTimeout(800);
                    }
                }
            }

            // Verify the invoice flow ended on an invoice-related page
            await expect(page).toHaveURL(/invoice/i, { timeout: 10000 });
        });
    });
