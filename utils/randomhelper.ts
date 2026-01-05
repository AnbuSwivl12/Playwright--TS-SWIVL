import { expect, Locator } from '@playwright/test';

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

// Selects a random option from a list of options and returns its text
export async function selectRandomOption(options: Locator): Promise<string> {
  const count = await options.count();
  if (count === 0) throw new Error('No options found');

  const randomIndex = Math.floor(Math.random() * count);
  const option = options.nth(randomIndex);
  await expect(option).toBeVisible({ timeout: 5000 });
  const text = (await option.innerText()).trim();
  await option.click({force: true});

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