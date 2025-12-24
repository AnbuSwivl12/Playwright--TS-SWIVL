import {test, expect } from '@playwright/test';
import { getCredentials } from '../../../utils/credentials';
import { loginWithCredentials } from '../../../utils/loginHelper';
import { randomalpha,randomEmail,randomFullName,randomPhone, personalEmail, randomNum, randomTwoDigitNum, selectRandomOption, selectMultipleRandomOptions } from '../../../utils/randomhelper';
    test.describe('Customer Creation Smoke Test', () => {
        test('Customer Creation @smoke', async ({ page }) => {
            const env = process.env.ENV || 'dev';
            const credentials = getCredentials(env);
            // Login using helper function
            await loginWithCredentials(page, env);
            // Navigate to Customer Creation page
            await page.getByRole('link', { name: /Customers/i }).click();
            await page.waitForTimeout(500);
            await page.getByRole('button', { name: /Customer Account/i }).click();
            await page.waitForTimeout(500);
            // Fill in Customer Creation form
            const customerName = `Customer ${randomNum()}`;
            await page.locator('input[name="name"]').fill(customerName);
            await page.waitForTimeout(500);
          
            // Fill in Address details
            const addressDropdown = page.locator('button[role="combobox"]');
            await addressDropdown.first().waitFor({ state: 'visible', timeout: 5000 });
            await addressDropdown.first().scrollIntoViewIfNeeded();
            await addressDropdown.first().click({ force: true });
            await page.waitForTimeout(500);
            const customerAddress = page.getByPlaceholder('Search...');
            await customerAddress.waitFor({ state: 'visible', timeout: 5000 });
            await customerAddress.fill(randomNum().toString());
            await page.waitForTimeout(500);
            const addressOptions = page.locator('[role="option"]');
            await addressOptions.first().waitFor({ state: 'visible', timeout: 5000 });
            await selectRandomOption(addressOptions);
            await page.waitForTimeout(500);

            // Fill Building Units
            const buildingUnitsInput = page.locator('input[placeholder="Building / Unit / Floor"]');
            await buildingUnitsInput.fill(`Unit ${randomTwoDigitNum()}`);
            await page.waitForTimeout(500);

            // Fill in Address Notes
            await page.getByRole('textbox', { name: /Address Notes/i }).fill(`Notes for ${customerName}`);
            await page.waitForTimeout(500);

            //Fill in Contact Details
            await page.locator('input[placeholder="Enter contact name"]').fill(customerName);
            await page.waitForTimeout(500);
            await page.locator('input[placeholder="Role/Title"]').fill(randomalpha(4));
            await page.waitForTimeout(500);
            await page.locator('input[placeholder="Office Number"]').fill(randomPhone());
            await page.waitForTimeout(500);
            await page.locator('input[placeholder="Enter phone number"]').fill(randomPhone());
            await page.waitForTimeout(500);
            await page.locator('input[placeholder="Enter Email ID"]').fill(randomEmail('customer'));
            await page.waitForTimeout(500);

            // Adding Sales Manager to Customer
            const salesManagerDropdown = page.locator('button[role="combobox"]').filter({ hasText: 'Select Sales Manager' });
            await salesManagerDropdown.waitFor({ state: 'visible', timeout: 5000 });
            await salesManagerDropdown.click();
            await page.waitForTimeout(500);
            const salesManagerOptions = page.locator('[role="option"]');
            await selectRandomOption(salesManagerOptions);
            await page.waitForTimeout(500);

            //Adding Account Manager to Customer
            const accountManagerDropdown = page.locator('button[role="combobox"]').filter({ hasText: 'Select Account Manager' });
            await accountManagerDropdown.waitFor({ state: 'visible', timeout: 5000 });
            await accountManagerDropdown.click();
            await page.waitForTimeout(500);
            const accountManagerOptions = page.locator('[role="option"]');
            await selectRandomOption(accountManagerOptions);
            await page.waitForTimeout(500);

            // Add Customer Tags
            const tagDropdown = page.getByText('Select or Add a Tag', { exact: true }).locator('..').locator('..');
            await tagDropdown.waitFor({ state: 'visible', timeout: 5000 });
            await tagDropdown.scrollIntoViewIfNeeded();
            await tagDropdown.click({ force: true });
            const tagOptions = page.locator('button[role="checkbox"]');
            await page.waitForTimeout(1000);
            await selectMultipleRandomOptions(tagOptions, 2);
            await page.waitForTimeout(500);
            await page.keyboard.press('Escape');
            await page.waitForTimeout(500);

            //Add Social Profiles
            
            const tiles = page.locator('div.cursor-pointer.rounded-lg.bg-accent');
            await tiles.first().waitFor({ state: 'visible' });
            await tiles.first().click(); 
            await page.waitForTimeout(500);
            const websiteInput = page.locator('input[placeholder="Enter Website URL"]');
            await websiteInput.waitFor({ state: 'visible', timeout: 5000 });
            await websiteInput.fill(`www.${randomalpha(5)}.com`);
            const facebookInput = page.locator('input[placeholder="Enter Facebook Profile URL"]');
            await facebookInput.waitFor({ state: 'visible', timeout: 5000 });
            await facebookInput.fill(`www.facebook.com/${randomalpha(5)}`);
            const instagramInput = page.locator('input[placeholder="Enter Instagram Profile URL"]');
            await instagramInput.waitFor({ state: 'visible', timeout: 5000 });
            await instagramInput.fill(`www.instagram.com/${randomalpha(5)}`); 
            const twitterInput = page.locator('input[placeholder="Enter X Profile URL"]');
            await twitterInput.waitFor({ state: 'visible', timeout: 5000 });
            await twitterInput.fill(`www.x.com/${randomalpha(5)}`);
            await page.waitForTimeout(500);
            await page.locator('button:has-text("Save All Links")').click();
            await page.waitForTimeout(500);

            // Click Create Customer button
            const saveButton = page.getByRole('button', { name: /^Save$/ });
            await expect(saveButton).toBeVisible({ timeout: 5000 });
            await expect(saveButton).toBeEnabled({ timeout: 5000 });
            await saveButton.scrollIntoViewIfNeeded();
            await saveButton.click();
            await page.waitForTimeout(2000);

        });
    });