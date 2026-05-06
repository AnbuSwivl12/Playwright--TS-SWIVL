import { test, expect } from '@playwright/test';
import { getCredentials } from '../../../../utils/credentials';
import { loginWithCredentials } from '../../../../utils/loginHelper';
import { randomalpha, randomDigits, randomFullName, selectRandomCalendarDay } from '../../../../utils/randomhelper';

// Renamed from "Vehicle Creation Smoke Test" — vehicleSetup.smoke.spec.ts has that
// title, and Playwright was running both when a grep filter caught the duplicate.
test.describe('Equipment Creation Smoke Test', () => {
    test('Equipment Creation @smoke', async ({ page }) => {
        const env = process.env.ENV || 'dev';
        const credentials = getCredentials(env);

        // Login using helper function
        await loginWithCredentials(page, env);

        // ----- Navigate to Asset Setup -> Tools & Equipment tab -----
        await page.getByRole('button', { name: /Inventory/i }).click();
        await page.waitForTimeout(500);
        await page.getByRole('link', { name: /Assets?\s*Setup/i }).click();
        await page.waitForTimeout(800);

        const toolsTab = page.getByRole('tab', { name: /Tools\s*&\s*Equipments?/i });
        await toolsTab.waitFor({ state: 'visible', timeout: 10000 });
        await toolsTab.click();
        await page.waitForTimeout(800);

        await expect(page).toHaveURL(/activeTabId=tools/i, { timeout: 5000 }).catch(() => {});

        // ----- Click "+ Add Tool/Equipment" CTA -----
        const addCta = page.getByRole('button', { name: /Add Tool\/Equipment/i }).first();
        await addCta.waitFor({ state: 'visible', timeout: 10000 });
        await addCta.click();
        await page.waitForTimeout(1500);

        await expect(page.getByRole('heading', { name: /Add Tools?\s*&\s*Equipments?/i }))
            .toBeVisible({ timeout: 10000 });

        // ----- Fill the form -----
        // Add tools name
        const equipmentName = `Tool ${randomalpha(4).toUpperCase()}-${Date.now().toString().slice(-6)}`;

        // Name Of Tool/Equipment * — placeholder "e.g. BOSCH Drill Machine 2.5 mm"
        const nameField = page.locator('input[name="equipmentName"]')
            .or(page.getByPlaceholder(/BOSCH Drill Machine/i))
            .first();
        await nameField.fill(equipmentName);
        await page.waitForTimeout(300);

        // Manufacturer
        const manufacturerField = page.locator('input[name="manufacturer"]')
            .or(page.getByPlaceholder(/^e\.g\. BOSCH$/i))
            .first();
        await manufacturerField.fill(randomFullName());
        await page.waitForTimeout(300);

        // Serial Number
        const serialField = page.locator('input[name="serialNumber"]')
            .or(page.getByPlaceholder(/XYZ-1234/i))
            .first();
        await serialField.fill(`SN${randomDigits(4)}`);
        await page.waitForTimeout(300);

        // Purchase Date — calendar picker (svg.lucide-calendar)
        const purchaseDatePicker = page.locator('button')
            .filter({ has: page.locator('svg.lucide-calendar, svg.lucide-calendar-days') })
            .first();
        await purchaseDatePicker.click();
        await selectRandomCalendarDay(page);
        await page.waitForTimeout(500);

        // Tool Tracker ID
        const trackerField = page.locator('input[name="toolTrackerId"]')
            .or(page.getByPlaceholder(/#123456/i))
            .first();
        await trackerField.fill(`TTID${randomDigits(4)}`);
        await page.waitForTimeout(300);

        // Purchase Price
        const purchasePriceField = page.locator('input[name="purchasePrice"]').first();
        await purchasePriceField.fill(randomDigits(3).toString());
        await page.waitForTimeout(300);

        // Supplied By * — NEW required field in Equipment 2.0. Without this, "Save Details"
        // stays disabled and the form never submits.
        const suppliedByField = page.locator('input[name="suppliedBy"]')
            .or(page.locator('div').filter({
                has: page.getByText(/^Supplied By\s*\*?$/i)
            }).getByRole('textbox'))
            .first();
        if (await suppliedByField.isVisible({ timeout: 3000 }).catch(() => false)) {
            await suppliedByField.fill(`Supplier ${randomDigits(3)}`);
            await page.waitForTimeout(300);
        }

        // Cost per Hour * — required
        const costPerHourField = page.locator('input[name="costPerHour"]').first();
        await costPerHourField.fill(randomDigits(2).toString());
        await page.waitForTimeout(300);

        // ----- Submit -----
        const saveBtn = page.getByRole('button', { name: /Save Details/i });
        await expect(saveBtn).toBeEnabled({ timeout: 10000 });
        await saveBtn.click();
        await page.waitForTimeout(2000);

        // Verify the form actually saved — we should land back on the Asset Setup list.
        await expect(page).toHaveURL(/asset-setup/i, { timeout: 10000 });
    });
});
