import {test, expect } from '@playwright/test';
import { getCredentials } from '../../../../utils/credentials';
import { loginWithCredentials } from '../../../../utils/loginHelper';
import { randomalpha,randomEmail,randomFullName,randomPhone, personalEmail, randomNum, selectRandomOption, selectMultipleRandomOptions } from '../../../../utils/randomhelper';  
        test.describe('User Invite Smoke Test', () => {
            test('User Invite @smoke', async ({ page }) => {
                const env = process.env.ENV || 'dev';
                const credentials = getCredentials(env);

                // Login using helper function
                await loginWithCredentials(page, env);

                // Navigate to User Invite page
                await page.getByRole('button', { name: /Settings/i }).click();
                await page.getByRole('link', { name: /User & Roles/i }).click();
                await page.getByRole('button', { name: /Add New User/i }).click();

                
                // Fill in user invite form
                await page.getByRole('textbox', { name: /Cody Fisher/i }).fill(randomFullName());
                await page.getByRole('textbox', { name: /cody.12@example.com/i }).fill(randomEmail());
                await page.waitForTimeout(500);

                try {
                    const phoneNumber = page.locator('input[type="tel"]').first();
                    await phoneNumber.click();
                    await phoneNumber.fill(randomPhone());
                    await phoneNumber.blur();
                    await page.waitForTimeout(500);
                    await page.waitForTimeout(500);
                } catch (error) {
                    console.warn('Phone number field not found or could not be filled:', error);
                }
    
               // Select random Company Address from dropdown
                await page.locator('#companyAddressId').click();
                await page.waitForTimeout(100);
                const optionsLocator = page.getByRole('option');
                await selectRandomOption(optionsLocator);
                await page.waitForTimeout(500);
               
               //add personal details
               await page.getByRole('textbox', { name: /e.g. email@example.com/i }).fill(personalEmail());
               const personaladdressInput = page.locator('button[role="combobox"]', { hasText: 'Search address' });
               await personaladdressInput.click();
               //selecting random address
               const addressInput = page.locator('input[placeholder="Search..."]');
               await addressInput.waitFor({state: 'visible', timeout: 5000});
               await addressInput.fill(randomNum().toString());
               await page.waitForTimeout(1000);
               const addressOptions = page.locator('[role = "option"]:visible');
               await selectRandomOption(addressOptions);
               await page.waitForTimeout(500);

                // Click open the Roles and Salary dropdowns and select random options
              try {
                  const rolesExpandButton = page.locator('button[type="button"]:not([role="combobox"]):has(svg.lucide-chevron-down)').first();
                  await rolesExpandButton.click({ timeout: 2000 });
                  await page.waitForTimeout(500);
                  } 
                  catch (error) {
                    console.log('Roles section may already be expanded');
                  }

                 // Select random Role
                await page.locator('#role').click();
                await page.waitForTimeout(500);
                const roleOptions = page.getByRole('option');
                await selectRandomOption(roleOptions);
                await page.waitForTimeout(500);
                
                //adding compensation details
                const compensationDropdown = page.locator('#compensationType');
                await compensationDropdown.click();
                await page.waitForTimeout(500);
                const compensationOptions = page.getByRole('option');
                const comptype = await selectRandomOption(compensationOptions);
                await page.waitForTimeout(500);
                if (comptype === null || comptype === undefined) {
                 throw new Error("Compensation selection failed — no options found.");
                }   
                const selectedCompTypeText = comptype;

                //handling hourly compensation type
                switch (true) {
                case selectedCompTypeText.toLowerCase().includes('hourly'): {
                const hourlyRate = page.locator('#hourlyLabourCost');
                await expect(hourlyRate).toBeVisible();
                await hourlyRate.fill('100');
                await page.waitForTimeout(500);
                break;
                }
                // Salary type (Weekly, Monthly, etc)
                case selectedCompTypeText.toLowerCase().includes('salary'): {
                const salaryAmount = page.locator('#salaryAmount');
                await expect(salaryAmount).toBeVisible();
                await salaryAmount.fill('500');
                await page.waitForTimeout(500);

                const salaryType = page.locator('#salaryType');
                await salaryType.click();
                await page.waitForTimeout(500);

                const salaryTypeOptions = page.getByRole('option');
                await selectRandomOption(salaryTypeOptions);
                await page.waitForTimeout(500);

                 // Open working days dropdown and select multiple days
                const workingDaysDropdown = page.locator('button:has-text("Select working days")');
                await workingDaysDropdown.click();
                await page.waitForTimeout(500);

                // Select multiple working daya
                const dayChecks = page.locator('input[type="checkbox"]');
                await expect(dayChecks.first()).toBeVisible({ timeout: 5000 });
                await selectMultipleRandomOptions(dayChecks, 3);

                // Fill working hours
                const workingHours = page.locator('#hoursPerDay');
                await expect(workingHours).toBeVisible();
                await workingHours.fill('8');
                await page.waitForTimeout(500);
                break;
                }}

                //Home paid status
                await page.locator('#isHomePaid').click();
                await page.waitForTimeout(500);
                const homePaidOptions = page.getByRole('option');
                await selectRandomOption(homePaidOptions);
                await page.waitForTimeout(500);

                // Submit the form to invite user
                await page.locator('button[type="submit"]').click();
                await page.waitForTimeout(1000);

            });
        });