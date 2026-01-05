import {test, expect } from '@playwright/test';
import { getCredentials } from '../../../utils/credentials';
import { loginWithCredentials } from '../../../utils/loginHelper';
import { randomalpha, selectRandomOption, selectMultipleRandomOptions, selectRandomRadio } from '../../../utils/randomhelper';
     test.describe('Product Creation Smoke Test', () => {
            test('Product Creation @smoke', async ({ page }) => {
                const env = process.env.ENV || 'dev';
                const credentials = getCredentials(env);
                // Login using helper function
                await loginWithCredentials(page, env);

                // Navigate to Pricebook page
                await page.getByRole('link', { name: 'Pricebook' }).click();
                await page.waitForTimeout(500);
                await page.getByRole('button', { name: /New Product\/Service/i }).click();
                await page.waitForTimeout(1500);

                // Fill in Product Creation form

                const Product = page.locator('input[name="name"]');
                await Product.fill(`Product ${randomalpha(4)}`);
                await page.waitForTimeout(500);

                //Fill Tier values
               
                const tier1 = Math.floor(Math.random() * 90) + 10;        // 10–99
                const tier2 = Math.floor(Math.random() * (tier1 - 10)) + 10;
                const tier3 = Math.floor(Math.random() * (tier2 - 10)) + 10;

                // Fill inputs
                await page.locator('input[name="tier1"]').fill(tier1.toString());
                await page.locator('input[name="tier2"]').fill(tier2.toString());
                await page.locator('input[name="tier3"]').fill(tier3.toString());
                await page.waitForTimeout(500);

                // Select Tier Category
                const radios = page.locator('[role="radio"]');
                await selectRandomRadio(radios);
                await page.waitForTimeout(500);

                // Generate Invoice description
                const invoiceSection = page.locator('textarea[name="invoiceDescription"]').locator('..').locator('..');
                await invoiceSection.locator('button:has-text("Generate")').click();
                await page.waitForTimeout(5000);

                // Generate Estimate Description
                const estimateSection = page.locator('textarea[name="estimateDescription"]').locator('..').locator('..');
                await estimateSection.locator('button:has-text("Generate")').click();
                await page.waitForTimeout(5000);

               //Click on Save Button
                const saveButton = page.getByRole('button', { name: 'Add Product\/Service' });
                await saveButton.click();
                await page.waitForTimeout(500);

            });
        });