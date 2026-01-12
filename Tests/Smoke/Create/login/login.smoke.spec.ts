import { test, expect } from "@playwright/test";
import { getCredentials } from "../../../../utils/credentials";

test.describe("Login Smoke Test", () => {
  test("Login @smoke", async ({ page }) => {
    const env = process.env.ENV || "dev";
    const credentials = getCredentials(env);

    // Navigate to the login page
    await page.goto("/", {
      waitUntil: "networkidle",
    });

    // Wait for and fill email - using label text as it's more reliable
    await page.getByLabel(/email address/i).fill(credentials.email);

    // Wait for and fill password - use getByRole to avoid matching the toggle button
    await page
      .getByRole("textbox", { name: "Password" })
      .fill(credentials.password);

    // Click Continue button - target the hidden form submit button
    await page.getByRole("button", { name: "Continue", exact: true }).click();

  });
});
