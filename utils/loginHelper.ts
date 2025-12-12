import { Page } from '@playwright/test';
import { getCredentials } from './credentials';
export async function loginWithCredentials(page: Page, env: string = 'dev') {
  const credentials = getCredentials(env);
  
  await page.goto("/", { waitUntil: "networkidle" });
  await page.getByLabel(/email address/i).fill(credentials.email);
  await page.getByRole("textbox", { name: "Password" }).fill(credentials.password);
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  
  // Wait for login to complete (adjust selector as needed)
  await page.waitForURL(/dashboard|home/); // or whatever comes after login
}