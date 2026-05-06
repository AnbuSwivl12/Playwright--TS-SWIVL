import {test, expect } from '@playwright/test';
import { getCredentials } from '../../../../utils/credentials';
import { loginWithCredentials } from '../../../../utils/loginHelper';
import { randomNum, selectRandomOption, randomDigits } from '../../../../utils/randomhelper';

/**
 * Generates a VIN that's valid by construction — same NHTSA check-digit algorithm
 * used by randomvin.com / VinAudit. Avoids the test depending on a 3rd-party
 * website at runtime (which is slow + flaky for smoke tests). Each call returns
 * a unique 17-character VIN with the correct check digit at position 9.
 */
function generateValidVIN(): string {
    const transliteration: Record<string, number> = {
        '0': 0, '1': 1, '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9,
        A: 1, B: 2, C: 3, D: 4, E: 5, F: 6, G: 7, H: 8,
        J: 1, K: 2, L: 3, M: 4, N: 5, P: 7, R: 9,
        S: 2, T: 3, U: 4, V: 5, W: 6, X: 7, Y: 8, Z: 9,
    };
    const weights = [8, 7, 6, 5, 4, 3, 2, 10, 0, 9, 8, 7, 6, 5, 4, 3, 2];
    const validChars = 'ABCDEFGHJKLMNPRSTUVWXYZ0123456789'; // I, O, Q excluded per NHTSA

    const chars: string[] = [];
    for (let i = 0; i < 17; i++) {
        chars.push(validChars[Math.floor(Math.random() * validChars.length)]);
    }

    let sum = 0;
    for (let i = 0; i < 17; i++) {
        sum += transliteration[chars[i]] * weights[i];
    }
    const checkValue = sum % 11;
    chars[8] = checkValue === 10 ? 'X' : String(checkValue);

    return chars.join('');
}

test.describe('Vehicle Creation Smoke Test', () => {
    // Extra tag (@vehicle) lets you run this without picking up equipmentSetup —
    // both share @smoke, so use --grep "@vehicle" to filter to just this test.
    test('Vehicle Creation @smoke @vehicle', async ({ page }) => {
        const env = process.env.ENV || 'dev';
        const credentials = getCredentials(env);

        // Login using helper function
        await loginWithCredentials(page, env);

        // ----- Navigate to Asset Setup -----
        await page.getByRole('button', { name: /Inventory/i }).click();
        await page.waitForTimeout(500);
        await page.getByRole('link', { name: /Assets?\s*Setup/i }).click();
        await page.waitForTimeout(800);

        // ----- Open Add Vehicle dialog -----
        await page.getByRole('button', { name: /Add New Vehicle/i }).click();
        await page.waitForTimeout(1500);

        // ----- Fill the VIN dialog -----
        // VIN must be unique per run AND structurally valid (correct check digit).
        // generateValidVIN() builds a fresh 17-char VIN with the right NHTSA check
        // digit, so the form's VIN validator accepts it.
        const VInumber = generateValidVIN();
        const VIN = page.locator('input[placeholder="Type here"]').first();
        await VIN.waitFor({ state: 'visible', timeout: 10000 });
        await VIN.fill(VInumber);
        await page.waitForTimeout(500);

        // Region dropdown
        const regionInput = page.getByPlaceholder('Select from dropdown').first();
        await expect(regionInput).toBeVisible({ timeout: 15000 });
        await regionInput.click();
        const regionOptions = page.locator('button.w-full:visible');
        await expect(regionOptions.first()).toBeVisible({ timeout: 10000 });
        await selectRandomOption(regionOptions);
        await page.waitForTimeout(400);

        // ----- Click "Save and Next" inside the popup -----
        // Robust locator: regex matches "Save and Next" / "Save & Next" / case variants.
        // Wait for it to be enabled (it's disabled until VIN + Region are valid),
        // scroll into view, then click. force:true as fallback for overlay timing.
        const saveAndNext = page.getByRole('button', { name: /Save\s*(and|&)\s*Next/i }).last();
        await saveAndNext.waitFor({ state: 'visible', timeout: 10000 });
        await expect(saveAndNext).toBeEnabled({ timeout: 10000 });
        await saveAndNext.scrollIntoViewIfNeeded();
        try {
            await saveAndNext.click({ timeout: 5000 });
        } catch {
            await saveAndNext.click({ force: true });
        }
        await page.waitForTimeout(2000);

        // Confirm the popup advanced — the Vehicle Name input only renders on the
        // next step. If "Save and Next" silently failed, this assertion catches it.
        const vehicleNameField = page.locator('input[name="name"]').first();
        await vehicleNameField.waitFor({ state: 'visible', timeout: 10000 });

        // ----- Vehicle details step -----
        const vehicleName = `Vehicle ${randomNum()}-${Date.now().toString().slice(-6)}`;
        await vehicleNameField.fill(vehicleName);
        await page.waitForTimeout(400);

        const expectedMileage = randomDigits(4);
        await page.locator('input[name="expectedLifetimeMileage"]').fill(expectedMileage.toString());
        await page.waitForTimeout(400);

        const currentMileage = randomDigits(2);
        await page.locator('input[name="currentMileage"]').fill(currentMileage.toString());
        await page.waitForTimeout(400);

        // ----- Click "Save Details" -----
        const saveDetails = page.getByRole('button', { name: /^Save Details$/i }).first();
        await saveDetails.waitFor({ state: 'visible', timeout: 10000 });
        await expect(saveDetails).toBeEnabled({ timeout: 10000 });
        await saveDetails.scrollIntoViewIfNeeded();
        try {
            await saveDetails.click({ timeout: 5000 });
        } catch {
            await saveDetails.click({ force: true });
        }
        await page.waitForTimeout(2500);

        // Verify the form actually saved — should land back on the Asset Setup list.
        await expect(page).toHaveURL(/asset-setup/i, { timeout: 10000 });
    });
});