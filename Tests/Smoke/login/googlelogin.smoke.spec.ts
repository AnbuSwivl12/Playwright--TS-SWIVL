import {test, devices} from '@playwright/test';
import { getCredentials } from '../../../utils/credentials';

 test.describe('Google Login Smoke Test', () => {
   test('Google Login @smoke', async ({ page }) => {
     const env = process.env.ENV || 'dev';
     const Credentials = getCredentials(env);

     // Navigate to the login page
     await page.goto('/', {
       waitUntil: 'networkidle',
     });

     // Click on "Login with Google" button
     await page.getByRole('button', { name: /Continue with Google/i }).click();
        await page.waitForURL('**accounts.google.com**');
        
     // Fill in Google email
     await page.getByLabel('Email or phone').fill(Credentials.googleEmail);
     await page.getByRole('button', { name: 'Next' }).click();
        await page.waitForTimeout(2000); // Wait for password field to appear
        // Fill in Google password
        await page.getByLabel('Enter your password').fill(Credentials.googlePassword);
        await page.getByRole('button', { name: 'Next' }).click();
        await page.getByTitle('Dashboard').waitFor({ state: 'visible', timeout: 30000 });


   });
 });