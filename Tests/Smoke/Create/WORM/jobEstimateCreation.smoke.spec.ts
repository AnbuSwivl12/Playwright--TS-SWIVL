import { test, expect, Page, Locator } from '@playwright/test';
import { getCredentials } from '../../../../utils/credentials';
import { loginWithCredentials } from '../../../../utils/loginHelper';
import { randomalpha, selectRandomOption, randomDigits } from '../../../../utils/randomhelper';
async function clickNextAndWaitForStep(
    page: Page,
    nextStepIndicator: Locator,
    label = 'next step'
): Promise<void> {
    if (await nextStepIndicator.isVisible({ timeout: 1000 }).catch(() => false)) {
        return; // already advanced — nothing to do
    }
    const nextBtn = page.getByRole('button', { name: /^Next$/i }).last();
    for (let attempt = 0; attempt < 3; attempt++) {
        await expect(nextBtn, `Next button not enabled before ${label}`)
            .toBeEnabled({ timeout: 8000 });
        await nextBtn.scrollIntoViewIfNeeded();
        await nextBtn.click({ force: true });
        if (await nextStepIndicator.isVisible({ timeout: 6000 }).catch(() => false)) {
            return;
        }
    }
    throw new Error(`Failed to advance to ${label} after 3 Next clicks`);
}

    test.describe('Job Estimate Creation Smoke Test', () => {
    test('Job Estimate Creation @smoke', async ({ page }) => {
        const env = process.env.ENV || 'dev';
        const credentials = getCredentials(env);

        // Login using helper function
        await loginWithCredentials(page, env);

        // Navigate to Jobs list
        await page.getByRole('button', { name: /Work Order/i }).click();
        await page.waitForTimeout(500);
        await page.getByRole('link', { name: /^Jobs$/i }).click();
        await page.waitForTimeout(1000);

        // Find an Open / action-required job (skip Closed and Cancelled rows)
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

        let estimateOption = page.getByRole('menuitem', { name: /Create New Estimate/i }).first();
        for (let attempt = 0; attempt < 3; attempt++) {
            await createCta.click();
            await page.waitForTimeout(600);
            if (await estimateOption.isVisible({ timeout: 2000 }).catch(() => false)) {
                break;
            }
            await page.keyboard.press('Escape').catch(() => {});
            await page.waitForTimeout(300);
        }
        if (!(await estimateOption.isVisible({ timeout: 1000 }).catch(() => false))) {
            estimateOption = page.locator('[role="menuitem"]:visible, [role="option"]:visible')
                .filter({ hasText: /Create New Estimate/i })
                .first();
        }
        await estimateOption.waitFor({ state: 'visible', timeout: 10000 });
        await estimateOption.click();
        await page.waitForTimeout(1500);

        const manualOptionByTestId = page.getByTestId('manual-estimate-option');
        if (await manualOptionByTestId.isVisible({ timeout: 1500 }).catch(() => false)) {
            await manualOptionByTestId.click();
            await page.waitForTimeout(1500);
        } else {
            const manualByText = page.getByText(/Create Manually/i).first();
            if (await manualByText.isVisible({ timeout: 1500 }).catch(() => false)) {
                await manualByText.click();
                await page.waitForTimeout(1500);
            }
        }
        // ----- Step 1: Customer & Job Details -----
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

        // Step 1 -> Step 2: success signal is the Product & Services combobox.
        const productDropdown = page.getByRole('combobox')
            .filter({ hasText: /Type or [sS]elect from dropdown/i })
            .first();
        await clickNextAndWaitForStep(page, productDropdown, 'Product & Services step');

        // ----- Step 2: Product & Services -----
        await productDropdown.scrollIntoViewIfNeeded();
        await productDropdown.click({ force: true });
        const productOptions = page.locator('[role="option"]:visible');
        await expect(productOptions.first()).toBeVisible({ timeout: 10000 });
        await selectRandomOption(productOptions);
        await page.waitForTimeout(1200);

        // Step 2 -> Step 3: success signal is the Expiration "X Days" combobox.
        const expirationDaysDropdown = page.getByRole('combobox')
            .filter({ hasText: /^\s*\d+\s*Days\s*$/i })
            .first();
        await clickNextAndWaitForStep(page, expirationDaysDropdown, 'Terms & Media step');

        //Set Term
        await expirationDaysDropdown.waitFor({ state: 'visible', timeout: 15000 });
        await expirationDaysDropdown.scrollIntoViewIfNeeded();
        await expirationDaysDropdown.click({ force: true });
        await page.waitForTimeout(500);

        const dayOptions = page.locator('[role="option"]:visible');
        if (await dayOptions.count() > 0) {
            await selectRandomOption(dayOptions);
        } else {
            await page.keyboard.press('Escape');
        }
        await page.waitForTimeout(1000);

        const depositInput = page.locator('input[name="info.depositAmount"]');
        if (await depositInput.isVisible({ timeout: 5000 }).catch(() => false)) {
            await depositInput.click();
            await depositInput.fill('20');
            await page.waitForTimeout(500);
        }

        
        const customerMessage = page.getByPlaceholder(/Write a short message to appear on the estimate/i);
        if (await customerMessage.isVisible({ timeout: 3000 }).catch(() => false)) {
            await customerMessage.fill(`Automation message ${randomalpha(5)}`);
            await page.waitForTimeout(300);
        }


        await page.getByRole('button', { name: /Review & Send|Review and Send/i }).click();
        await page.waitForTimeout(2500);
         // Per Estimate 2.0: Review & Send navigates to /estimates/{id}/view-detail
        await expect(page).toHaveURL(/estimates?\/.+\/view-detail|estimate/i, { timeout: 15000 });

        // ----- Send the estimate from the View Estimate page -----
        const sendButton = page.getByRole('button', { name: /^Send$/i }).first();
        if (await sendButton.isVisible({ timeout: 5000 }).catch(() => false)) {
            await sendButton.scrollIntoViewIfNeeded();
            await sendButton.click({ force: true });
            await page.waitForTimeout(1200);

            // Send Estimate side panel: type email, then either press Enter or click "+"
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

                // Final Send (inside the Send Estimate panel)
                const finalSend = page.getByRole('button', { name: /^Send$/i }).last();
                await finalSend.waitFor({ state: 'visible', timeout: 5000 });
                await finalSend.scrollIntoViewIfNeeded();
                await finalSend.click({ force: true });
                await page.waitForTimeout(2500);

                // Dismiss "Your estimate has been sent successfully!" modal
                const okButton = page.getByRole('button', { name: /^Ok$/i });
                if (await okButton.isVisible({ timeout: 7000 }).catch(() => false)) {
                    await okButton.click();
                    await page.waitForTimeout(800);
                }
            }
        }

        // Verify the estimate flow ended on an estimate-related page
        await expect(page).toHaveURL(/estimate/i, { timeout: 10000 });
    });
});
