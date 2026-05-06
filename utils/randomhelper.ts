import { Page, expect, Locator } from '@playwright/test';

// Generates a random alphabetic string of specified length
export function randomalpha(count = 3): string {
  const letters = 'abcdefghijklmnopqrstuvwxyz';
  return Array.from({ length: count }, () =>
    letters[Math.floor(Math.random() * letters.length)]
  ).join('');
}

// Generates a random numeric value with specified number of digits
export function randomDigits(count = 4): number {
  const min = Math.pow(10, count - 1);
  const max = Math.pow(10, count) - 1;
  return Math.floor(min + Math.random() * (max - min));
}

// Generates a random number between 1 and 9
export function randomNum(): number {
  return Math.floor(Math.random() * 9) + 1;
}

// Generate a random 2 digit numbers
export function randomTwoDigitNum(): number {
  return Math.floor(Math.random() * 90) + 10;
}

// Generates a random email address with a given prefix
export function randomEmail(prefix = 'user'): string {
  const num = randomDigits(4);
  return `${prefix}${num}@yopmail.com`;
}

// Generates a random personal email address with a given prefix
export function personalEmail(prefix = 'personal'): string {
    const num = randomDigits(4);
    return `${prefix}${num}@yopmail.com`;
}

// Generates a random full name
export function randomFullName(): string {
  const num = randomDigits(4);
  return `Test User ${num}`;
}

// Generates a random phone number in a specific format
export function randomPhone(): string {
  return '+1' + Math.floor(1000000000 + Math.random() * 9000000000).toString();
}

// Selects a random option from a list of options and returns its text.
// Long listboxes (e.g. time pickers with 60 minute entries) render every option
// but only a handful are inside the viewport at any time — scrollIntoViewIfNeeded
// scrolls the listbox so the random pick is clickable instead of erroring with
// "Element is outside of the viewport".
export async function selectRandomOption(options: Locator): Promise<string> {
  const count = await options.count();
  if (count === 0) throw new Error('No options found');

  // Pages can keep hidden panels in the DOM (e.g. inactive tabs), so a naive
  // .nth(randomIndex) might land on a hidden element. Re-roll up to 5 times to
  // find a visible option before giving up.
  const tried = new Set<number>();
  let option: Locator | null = null;
  for (let i = 0; i < Math.min(5, count); i++) {
    let idx = Math.floor(Math.random() * count);
    while (tried.has(idx) && tried.size < count) {
      idx = Math.floor(Math.random() * count);
    }
    tried.add(idx);
    const candidate = options.nth(idx);
    if (await candidate.isVisible().catch(() => false)) {
      option = candidate;
      break;
    }
  }
  if (!option) {
    // Fallback: assert visibility on a fresh random pick so the assertion error
    // surfaces at the call site (matches old behaviour for callers that always
    // pass a fully-visible set).
    option = options.nth(Math.floor(Math.random() * count));
    await expect(option).toBeVisible({ timeout: 5000 });
  }
  const text = (await option.innerText()).trim();
  await option.scrollIntoViewIfNeeded().catch(() => {});
  await option.click({ force: true });

  return text;
}

// Selects a random option from a list of options and returns its text
export async function selectMultipleRandomOptions(checkboxes: Locator,countToSelect = 2): Promise<string[]> {

  await expect(checkboxes.first()).toBeVisible({ timeout: 5000 });

  const total = await checkboxes.count();
  if (total === 0) {
    throw new Error('No checkbox options found for multi-select');
  }
  
  const picks = Math.min(countToSelect, total);
  const selectedIndexes = new Set<number>();

  while (selectedIndexes.size < picks) {
    selectedIndexes.add(Math.floor(Math.random() * total));
  }

  const selectedTexts: string[] = [];

  for (const index of selectedIndexes) {
    const checkbox = checkboxes.nth(index);

    await checkbox.scrollIntoViewIfNeeded();
    await expect(checkbox).toBeVisible();
    if (!(await checkbox.isChecked())) {
      await checkbox.click({ force: true });
    }

    const labelText = await checkbox.locator('xpath=following-sibling::*').first().innerText().catch(() => '');
    selectedTexts.push(labelText.trim());
  }

  return selectedTexts;
}

export async function selectRandomRadio(radios: Locator): Promise<string | null> {
  const count = await radios.count();
  if (count === 0) return null;

  const index = Math.floor(Math.random() * count);
  const radio = radios.nth(index);

  await radio.click({ force: true });
  await expect(radio).toHaveAttribute('aria-checked', 'true');

  return await radio.getAttribute('value');
}

export async function selectRandomCalendarDay(page: Page) {
  const days = page.locator('button.rdp-day:not([disabled])');

  await expect(days.first()).toBeVisible({ timeout: 10000 });

  const count = await days.count();
  if (count === 0) {
    throw new Error('No calendar days available');
  }

  const randomIndex = Math.floor(Math.random() * count);
  await days.nth(randomIndex).click();
}

/**
 * Picks a calendar day a known number of days from today. Navigates the calendar
 * forward (or backward) until the target month is visible, then clicks the day
 * by matching aria-label fragments — which excludes outside-month spillover days
 * that look like the right number but belong to a neighbouring month.
 *
 * Use this instead of selectRandomCalendarDay when the test needs a future date
 * (e.g. End Date must be after Start Date).
 */
export async function selectCalendarDay(page: Page, daysFromToday: number) {
  const target = new Date();
  target.setDate(target.getDate() + daysFromToday);

  const monthName = target.toLocaleString('en-US', { month: 'long' });
  const year = target.getFullYear();
  const day = target.getDate();

  // Navigate the calendar to the target month. The header status reads e.g.
  // "May 2026" — keep clicking Next/Previous until that header matches.
  const expectedHeader = new RegExp(`^${monthName}\\s+${year}$`);
  for (let i = 0; i < 18; i++) {
    const headerText = await page.getByRole('status').first().innerText().catch(() => '');
    if (expectedHeader.test(headerText.trim())) break;

    // Decide direction by parsing the current header
    const cur = new Date(`${headerText.trim()} 1`);
    if (!isNaN(cur.getTime()) && cur.getTime() > target.getTime()) {
      await page.getByRole('button', { name: /Previous Month|Go to the Previous Month/i })
        .first().click();
    } else {
      await page.getByRole('button', { name: /Next Month|Go to the Next Month/i })
        .first().click();
    }
    await page.waitForTimeout(250);
  }

  // Click the target day. Filter buttons whose aria-label contains the target
  // month and year so spillover days from neighbouring months are excluded.
  const dayBtn = page.locator(
    `button[aria-label*="${monthName}"][aria-label*="${year}"]`
  ).filter({ hasText: new RegExp(`^\\s*${day}\\s*$`) }).first();
  await dayBtn.waitFor({ state: 'visible', timeout: 5000 });
  await dayBtn.click();
}

export const getDropdownByLabel = (page: Page, label: string) => {
  return page.locator('div').filter({ hasText: label }).locator('button[role="combobox"]').first();
}