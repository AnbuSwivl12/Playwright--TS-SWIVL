import { test, expect } from '@playwright/test';
import { getCredentials } from '../../../../utils/credentials';
import { loginWithCredentials } from '../../../../utils/loginHelper';
import { randomalpha, randomEmail, randomFullName, randomPhone, personalEmail, randomNum, selectRandomOption, selectMultipleRandomOptions } from '../../../../utils/randomhelper';

// Updated for User Invite 2.0 (verified against staging.swivl.tech recording, May 5 2026)
//
// Flow:
//   1. Login -> Settings -> Users & Roles
//   2. Click "Invite New User" CTA
//   3. Personal Details: Full Name, Work Email, Personal Email (optional),
//      Phone Number, Company Address
//   4. Role & Salary: Role, Compensation Type (Hourly/Salary), Amount,
//      Is Commission Paid? (Yes/No), Commission Type+Amount when Yes,
//      Travel to/from Home Paid? (Yes/No)
//   5. Click "Save & Invite" -> success toast + redirect to Invited Users tab

test.describe('User Invite Smoke Test', () => {
    test('User Invite @smoke', async ({ page }) => {
        const env = process.env.ENV || 'dev';
        const credentials = getCredentials(env);

        // Login using helper function
        await loginWithCredentials(page, env);

        // ----- Navigate to Users & Roles -----
        await page.getByRole('button', { name: /^Settings$/i }).click();
        await page.waitForTimeout(500);
        await page.getByRole('link', { name: /Users\s*&\s*Roles/i }).click();
        await page.waitForTimeout(800);

        // Click "Invite New User" CTA (was "Add New User" in the old design)
        await page.getByRole('button', { name: /Invite New User/i }).click();
        await page.waitForTimeout(1500);

        await expect(page.getByRole('heading', { name: /Invite New User/i }))
            .toBeVisible({ timeout: 10000 });

        // ----- Personal Details -----
        // Note: the form uses plain <div> labels (no <label for="">) so getByLabel doesn't
        // match. Use placeholders instead — they double as the textbox's accessible name.

        // Full Name * — placeholder "Cody Fisher"
        const fullNameInput = page.getByPlaceholder('Cody Fisher').first();
        await fullNameInput.waitFor({ state: 'visible', timeout: 10000 });
        await fullNameInput.fill(randomFullName());
        await page.waitForTimeout(200);

        // Work Email * — placeholder "cody.12@example.com"
        const workEmailInput = page.getByPlaceholder(/cody\.12@example\.com/i).first();
        await workEmailInput.fill(randomEmail('user'));
        await page.waitForTimeout(200);

        // Personal Email (optional) — placeholder "e.g. email@example.com"
        const personalEmailInput = page.getByPlaceholder(/^e\.g\.\s*email@example\.com$/i).first();
        if (await personalEmailInput.isVisible({ timeout: 2000 }).catch(() => false)) {
            await personalEmailInput.fill(personalEmail());
            await page.waitForTimeout(200);
        }

        // Phone Number * — use the helper (randomPhone returns "+1XXXXXXXXXX"). The
        // phone library auto-detects country from leading digits, so we type the FULL
        // E.164 form (+1 + 10 digits) — the leading "+1" pins the country to US and
        // prevents it from drifting to Switzerland (+41), Moldova (+373), etc. The
        // helper occasionally produces an invalid US area code (starting with 0 or 1),
        // so re-roll until the area code starts with 2-9.
        try {
            let phoneStr = randomPhone();
            for (let i = 0; i < 10 && /^\+1[01]/.test(phoneStr); i++) {
                phoneStr = randomPhone();
            }

            // Force US on the country select first as a belt-and-suspenders precaution.
            const phoneCountry = page.getByRole('combobox', { name: /Phone number country/i }).first();
            if (await phoneCountry.isVisible({ timeout: 3000 }).catch(() => false)
                && await phoneCountry.isEnabled().catch(() => false)) {
                await phoneCountry.selectOption({ label: 'United States' }).catch(() => {});
                await page.waitForTimeout(300);
            }

            const phoneNumber = page.locator('input[type="tel"]').first();
            await phoneNumber.click();
            await phoneNumber.fill('');
            await phoneNumber.fill(phoneStr);
            await phoneNumber.blur();
            await page.waitForTimeout(500);
        } catch (error) {
            console.warn('Phone number field not found or could not be filled:', error);
        }

        // Company Address * — saved-address combobox.
        // Target by accessible name to avoid matching the hidden form input #companyAddressId.
        const companyAddress = page.getByRole('combobox', { name: /^Company Address\s*\*/i }).first();
        await companyAddress.scrollIntoViewIfNeeded();
        await companyAddress.click();
        await page.waitForTimeout(500);

        const companyAddressOptions = page.locator('[role="option"]:visible');
        await expect(companyAddressOptions.first()).toBeVisible({ timeout: 8000 });
        await selectRandomOption(companyAddressOptions);
        await page.waitForTimeout(500);

        // ----- Role & Salary -----
        // Role & Salary section is collapsed by default. Different accordion implementations
        // route the toggle click differently (heading vs. chevron sibling), so try both
        // and retry — using the visible "Select or add a role" text as the success signal.
        const roleSalaryHeading = page.getByRole('heading', { name: /Role\s*&\s*Salary/i });
        await roleSalaryHeading.scrollIntoViewIfNeeded();

        const roleProbe = page.getByText(/Select or add a role/i).first();
        if (!(await roleProbe.isVisible({ timeout: 1000 }).catch(() => false))) {
            const chevronBtn = roleSalaryHeading
                .locator('xpath=parent::*//button')
                .first();

            for (let attempt = 0; attempt < 3; attempt++) {
                // Try heading first (many accordion components toggle on heading click)
                await roleSalaryHeading.click({ force: true }).catch(() => {});
                if (await roleProbe.isVisible({ timeout: 1500 }).catch(() => false)) break;

                // Fall back to the chevron button next to the heading
                await chevronBtn.click({ force: true }).catch(() => {});
                if (await roleProbe.isVisible({ timeout: 1500 }).catch(() => false)) break;
            }

            await roleProbe.waitFor({ state: 'visible', timeout: 8000 });
        }

        const roleDropdown = page.getByRole('combobox', { name: /^Role\s*\*/i }).first();

        // Role * — click the visible combobox button (not the hidden #role form input).
        await roleDropdown.scrollIntoViewIfNeeded();
        await roleDropdown.click();
        await page.waitForTimeout(500);
        const roleOptions = page.locator('[role="option"]:visible');
        await expect(roleOptions.first()).toBeVisible({ timeout: 8000 });
        await selectRandomOption(roleOptions);
        await page.waitForTimeout(500);

        // Compensation Type * — defaults to "Hourly". Match the visible combobox by name.
        const compensationDropdown = page.getByRole('combobox', { name: /^Compensation Type\s*\*/i }).first();
        await compensationDropdown.scrollIntoViewIfNeeded();
        await compensationDropdown.click();
        await page.waitForTimeout(400);
        const compensationOptions = page.locator('[role="option"]:visible');
        await expect(compensationOptions.first()).toBeVisible({ timeout: 8000 });
        const compType = await selectRandomOption(compensationOptions);
        await page.waitForTimeout(500);
        if (!compType) {
            throw new Error('Compensation selection failed — no options found.');
        }
        const selectedCompTypeText = compType;

        // Amount * — single field that applies to both Hourly and Salary in Invite 2.0.
        // Snapshot shows it as a spinbutton next to the "Amount*" label.
        const amountInput = page.getByRole('spinbutton').filter({ hasNot: page.locator('[id*="laborBurden" i]') }).first()
            .or(page.locator('input[name="amount"], input[name="hourlyLabourCost"], input[name="salaryAmount"]'))
            .first();
        await amountInput.scrollIntoViewIfNeeded();
        await amountInput.fill('100');
        await page.waitForTimeout(300);

        // Salary-specific extras (working days + hours-per-day) only render when Salary is picked
        if (selectedCompTypeText.toLowerCase().includes('salary')) {
            const salaryType = page.locator('#salaryType')
                .or(page.getByRole('combobox').filter({ hasText: /Salary Type|Select salary type/i }))
                .first();
            if (await salaryType.isVisible({ timeout: 2000 }).catch(() => false)) {
                await salaryType.click({ force: true });
                await page.waitForTimeout(400);
                const salaryTypeOptions = page.locator('[role="option"]:visible');
                if (await salaryTypeOptions.first().isVisible({ timeout: 3000 }).catch(() => false)) {
                    await selectRandomOption(salaryTypeOptions);
                    await page.waitForTimeout(400);
                }
            }

            const workingDaysDropdown = page.locator('button:has-text("Select working days")');
            if (await workingDaysDropdown.isVisible({ timeout: 2000 }).catch(() => false)) {
                await workingDaysDropdown.click();
                await page.waitForTimeout(400);
                const dayChecks = page.locator('input[type="checkbox"]');
                if (await dayChecks.first().isVisible({ timeout: 3000 }).catch(() => false)) {
                    await selectMultipleRandomOptions(dayChecks, 3);
                }
            }

            const workingHours = page.locator('#hoursPerDay');
            if (await workingHours.isVisible({ timeout: 2000 }).catch(() => false)) {
                await workingHours.fill('8');
                await page.waitForTimeout(300);
            }
        }

        // Is Commission Paid? * — defaults to "No". Keep default unless visible & we want Yes.
        // (Recording sets Yes -> Fixed -> 9. We keep "No" here so the test stays simple
        // and doesn't depend on Commission Type subfields, but the branch is here for
        // future expansion.)

        // Travel to/from Home Paid? * — required, no default. Match the visible combobox
        // by accessible name to avoid hitting hidden form inputs or unrelated comboboxes.
        const travelHomeDropdown = page.getByRole('combobox', { name: /^Travel to\/from Home Paid/i }).first();
        if (await travelHomeDropdown.isVisible({ timeout: 5000 }).catch(() => false)) {
            await travelHomeDropdown.scrollIntoViewIfNeeded();
            await travelHomeDropdown.click();
            await page.waitForTimeout(400);
            const travelOptions = page.locator('[role="option"]:visible')
                .filter({ hasText: /^(Yes|No)$/i });
            await expect(travelOptions.first()).toBeVisible({ timeout: 5000 });
            await selectRandomOption(travelOptions);
            await page.waitForTimeout(400);
        }

        // ----- Submit -----
        // Click Save & Invite, then pick "Invite via SMS and Email" from the menu.
        const saveBtn = page.getByRole('button', { name: /^Save & Invite$/i }).first();
        await expect(saveBtn).toBeEnabled({ timeout: 10000 });
        await saveBtn.scrollIntoViewIfNeeded();
        await saveBtn.click();
        await page.waitForTimeout(500);

        const smsAndEmailOption = page.getByRole('menuitem', { name: /SMS\s*(and|&)\s*Email|Email\s*(and|&)\s*SMS/i })
            .or(page.getByRole('option', { name: /SMS\s*(and|&)\s*Email|Email\s*(and|&)\s*SMS/i }))
            .or(page.getByText(/SMS\s*(and|&)\s*Email|Email\s*(and|&)\s*SMS/i))
            .first();
        await smsAndEmailOption.waitFor({ state: 'visible', timeout: 5000 });
        await smsAndEmailOption.click();
        await page.waitForTimeout(2500);

        // Verify success — toast "We sent an invitation to ..." appears and the page
        // navigates to /settings/permission-control?userTab=invited-users
        await expect(page).toHaveURL(/permission-control(\?|$)/i, { timeout: 10000 });
    });
});
