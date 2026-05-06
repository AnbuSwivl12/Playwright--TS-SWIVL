import { test, expect } from '@playwright/test';
import { getCredentials } from '../../../utils/credentials';
import { loginWithCredentials } from '../../../utils/loginHelper';
import { randomalpha, selectRandomOption } from '../../../utils/randomhelper';

test.describe('Job Creation Smoke Test', () => {
  test('Job Creation @smoke', async ({ page }) => {

    const env = process.env.ENV || 'dev';
    const credentials = getCredentials(env);

    await loginWithCredentials(page, env);

    await page.getByRole('button', { name: /Work Order/i }).click();
    await page.getByRole('link', { name: /Jobs/i }).click();

    const validJobRows = page.locator('tbody tr')
      .filter({ hasNotText: /Closed|Cancelled|Canceled/i });

    await expect(validJobRows.first()).toBeVisible({ timeout: 15000 });

    const count = await validJobRows.count();
    if (count === 0) {
      throw new Error('No open or active jobs found');
    }

    const randomIndex = Math.floor(Math.random() * count);
    await validJobRows
      .nth(randomIndex)
      .locator('a[href*="job"]')
      .first()
      .click();

    // edit option 
    const menuButtons = page.locator('button[aria-haspopup="menu"]');
    const menuCount = await menuButtons.count();

    let menuOpened = false;

    for (let i = 0; i < menuCount; i++) {
      await menuButtons.nth(i).click();

      const editOption = page.locator('[role="menuitem"]', { hasText: 'Edit Job' });

      if (await editOption.isVisible({ timeout: 1000 }).catch(() => false)) {
        await editOption.click();
        menuOpened = true;
        break;
      }

      await page.keyboard.press('Escape');
    }

    if (!menuOpened) {
      throw new Error('Could not find Edit Job option in any menu');
    }

    await page.waitForSelector('button[role="combobox"]');

    const getDropdownByLabel = (label: string) => {
      return page.locator('div')
        .filter({ hasText: label })
        .locator('button[role="combobox"]')
        .first();
    };

    const updateDropdown = async (label: string) => {
      const dropdown = getDropdownByLabel(label);
      await dropdown.click();

      const options = page.locator('[role="option"]:visible');
      const count = await options.count();

      if (count > 0) {
        await selectRandomOption(options);
      } else {
        await page.keyboard.press('Escape');
      }
    };

    await updateDropdown('Site Contact');
    await updateDropdown('Job Lead');
    await updateDropdown('Sales Manager');
    await updateDropdown('Requested By');

    const tagDropdown = page.getByRole('button', {
      name: 'Select or add tags',
      exact: true
    });

    await tagDropdown.click();

    const tagOptions = page.locator('button[role="checkbox"]');

    if (await tagOptions.count() > 0) {
      await selectRandomOption(tagOptions);
    }

    await page.keyboard.press('Escape');

    // Update Job Name (using stable locator)
    const jobNameInput = page.locator('input[name="name"]');
    const jobTitle = `Updated Job ${randomalpha(4)}`;
    await jobNameInput.fill(jobTitle);

    // Generate Description
    await page.getByRole('button', { name: 'Generate' }).click();

    // Save
    const saveButton = page.getByRole('button', { name: /^Save$/i });
    await saveButton.click();
    
  });
});