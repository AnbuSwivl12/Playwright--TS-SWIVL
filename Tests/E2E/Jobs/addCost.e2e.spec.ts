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
            await page.waitForTimeout(500);

            // Click on Add Cost button
            const createButton = page.getByRole('button', { name: 'Create' });
            await expect(createButton).toBeVisible();
            await createButton.click();
            const addCostOption = page.getByRole('menuitem', { name: 'Add Cost' });
            await expect(addCostOption).toBeVisible();
            await addCostOption.click();
            await page.waitForTimeout(600);

            //Adding details in Add Cost form
            const laborsAccordion = page.getByRole('button', { name: /Labors/i });
            if (await laborsAccordion.getAttribute('aria-expanded') === 'false') {
            await laborsAccordion.click();
            }
            await page.waitForTimeout(500);
            const addCostButton = page.getByRole('button', { name: 'Add Cost' });
            await expect(addCostButton).toBeVisible();
            await addCostButton.click();
            await page.waitForTimeout(500);
            const laborsSection = page.getByRole('button', { name: /Labors/i }).locator('..').locator('..');
            const laborDropdown = laborsSection.locator('button[role="combobox"]').last();
            await laborDropdown.waitFor({ state: 'visible', timeout: 10000 });
            await laborDropdown.click();
            await page.waitForSelector('[role="listbox"]');
            const options = page.locator('[role="option"]:visible');
            await selectRandomOption(options);
            await page.waitForTimeout(5000);
            const labTimeInputs = page.locator('input[inputmode="numeric"][placeholder="00"]');
            await labTimeInputs.nth(0).fill('2');
            await labTimeInputs.nth(1).fill('10');
            await page.waitForTimeout(500);
            await page.getByRole('button', { name: /Save new labor/i }).click();
            await page.waitForTimeout(500);

            // Add Material cost
            const materialAccordion = page.getByRole('button', { name: /Material/i });
            if (await materialAccordion.getAttribute('aria-expanded') === 'false') {
            await materialAccordion.click();
            } 
            await page.waitForTimeout(500);
            const materialSection = materialAccordion.locator('..').locator('..');
            const materialAddCostButton = materialSection.getByRole('button', { name: 'Add Cost' }).last();
            await expect(materialAddCostButton).toBeVisible();
            await materialAddCostButton.click();
            await page.waitForTimeout(500);
            const supplierDropdown = materialSection.locator('button[role="combobox"]').last();
            await supplierDropdown.waitFor({ state: 'visible', timeout: 10000 });
            await supplierDropdown.click();
            await page.waitForSelector('[role="listbox"]');
            const supplierOptions = page.locator('[role="option"]:visible');
            await selectRandomOption(supplierOptions);
            await page.waitForTimeout(500);
            const materialCost = materialSection.locator('input[placeholder="0.00"]').last();
            await materialCost.fill('10.0');
            await page.locator('button:has(path[d="M20 6 9 17l-5-5"])').click();
            await page.waitForTimeout(500);

            // Add equipment cost
            const equipmentAccordion = page.getByRole('button', { name: /Equipment/i });
            if (await equipmentAccordion.getAttribute('aria-expanded') === 'false') {
            await equipmentAccordion.click();
            }
            await page.waitForTimeout(500);
            const equipmentSection = equipmentAccordion.locator('..').locator('..');
            const equipmentAddCostButton = equipmentSection.getByRole('button', { name: 'Add Cost' }).last();
            await expect(equipmentAddCostButton).toBeVisible();
            await equipmentAddCostButton.click();
            await page.waitForTimeout(500);
            const equipmentDropdown = equipmentSection.locator('button[role="combobox"]').last();
            await equipmentDropdown.waitFor({ state: 'visible', timeout: 10000 });
            await equipmentDropdown.click();
            await page.waitForSelector('[role="listbox"]');
            const equipmentOptions = page.locator('[role="option"]:visible');
            await selectRandomOption(equipmentOptions);
            await page.waitForTimeout(500);
            const eqTimeInputs = page.locator('input[inputmode="numeric"][placeholder="00"]');
            await eqTimeInputs.nth(0).fill('2'); 
            await eqTimeInputs.nth(1).fill('10');
            await page.waitForTimeout(500);
            await page.locator('button:has(path[d="M20 6 9 17l-5-5"])').click();
            await page.waitForTimeout(500);

            //Add Vehicle Cost
            const vehicleAccordion = page.getByRole('button', { name: /Vehicle/i });
            if (await vehicleAccordion.getAttribute('aria-expanded') === 'false') {
            await vehicleAccordion.click();
            }
            await page.waitForTimeout(500);
            const vehicleSection = vehicleAccordion.locator('..').locator('..');
            const vehicleAddCostButton = vehicleSection.getByRole('button', { name: 'Add Cost' }).last();
            await expect(vehicleAddCostButton).toBeVisible();
            await vehicleAddCostButton.click();
            await page.waitForTimeout(500);
            const vehicleDropdown = vehicleSection.locator('button[role="combobox"]').last();
            await vehicleDropdown.waitFor({ state: 'visible', timeout: 10000 });
            await vehicleDropdown.click();
            await page.waitForSelector('[role="listbox"]');
            const vehicleOptions = page.locator('[role="option"]:visible');
            await selectRandomOption(vehicleOptions);
            await page.waitForTimeout(500);
            await page.locator('input[inputmode="numeric"][placeholder="0.00"]').fill('5');
            await page.waitForTimeout(500);
            await page.locator('button:has(path[d="M20 6 9 17l-5-5"])').click();
            await page.waitForTimeout(500);
       

            // Add Subcontractor Cost
            const subcontractorAccordion = page.getByRole('button', { name: /Subcontractor/i });
            if (await subcontractorAccordion.getAttribute('aria-expanded') === 'false') {
            await subcontractorAccordion.click();
            }
            await page.waitForTimeout(500);
            const subcontractorSection = subcontractorAccordion.locator('..').locator('..');
            const subcontractorAddCostButton = subcontractorSection.getByRole('button', { name: 'Add Cost' }).last();
            await expect(subcontractorAddCostButton).toBeVisible();
            await subcontractorAddCostButton.click();
            await page.waitForTimeout(500);
            const subcontractorDropdown = subcontractorSection.locator('button[role="combobox"]').last();
            await subcontractorDropdown.waitFor({ state: 'visible', timeout: 10000 });
            await subcontractorDropdown.click();
            await page.waitForSelector('[role="listbox"]');
            const subcontractorOptions = page.locator('[role="option"]:visible');
            await selectRandomOption(subcontractorOptions);
            await page.waitForTimeout(500);
            const subcontractorCost = subcontractorSection.locator('input[placeholder="0.00"]').last();
            await subcontractorCost.fill('10.0');
            await page.waitForTimeout(500);
            await page.locator('button:has(path[d="M20 6 9 17l-5-5"])').click();
            await page.waitForTimeout(500);

             // Add Other Cost
             const otherAccordion = page.getByRole('button', { name: /Other/i });
             if (await otherAccordion.getAttribute('aria-expanded') === 'false') {
             await otherAccordion.click();
             }
            await page.waitForTimeout(500);
            const otherSection = otherAccordion.locator('..').locator('..');
            await otherSection.getByRole('button', { name: 'Add Cost' }).click();
            await page.locator('input[inputmode="decimal"][placeholder="0.00"]').fill('50');
            await page.waitForTimeout(500);
            await otherSection.locator('button:has(svg.lucide-check)').click();
            await page.waitForTimeout(500);
    });
});