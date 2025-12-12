
export function randomalpha(count = 3): string {
  const letters = 'abcdefghijklmnopqrstuvwxyz';
  return Array.from({ length: count }, () =>
    letters[Math.floor(Math.random() * letters.length)]
  ).join('');
}

export function randomDigits(count = 4): number {
  const min = Math.pow(10, count - 1);
  const max = Math.pow(10, count) - 1;
  return Math.floor(min + Math.random() * (max - min));
}
export function randomNum(): number {
    return Math.min(9, Number((Math.random() * 10).toFixed(0)));
}


export function randomEmail(prefix = 'user'): string {
  const num = randomDigits(4);
  return `${prefix}${num}@yopmail.com`;
}

export function personalEmail(prefix = 'personal'): string {
    const num = randomDigits(4);
    return `${prefix}${num}@yopmail.com`;
}

export function randomFullName(): string {
  const num = randomDigits(4);
  return `Test User ${num}`;
}

export function randomPhone(): string {
  return '+1' + Math.floor(1000000000 + Math.random() * 9000000000).toString();
}


export async function selectRandomOption(locator) {
    const count = await locator.count();

    if (count > 0) {
        const index = Math.floor(Math.random() * count);
        await locator.nth(index).click();
        return index;  
    } 
    else {
        console.warn('No options found for dropdown');
        return null;
    }
}
export async function selectMultipleRandomOptions(locator, countToSelect = 2) {
    // Only visible options
    const visibleOptions = locator.filter({ has: locator.page().locator(':visible') });

    const total = await visibleOptions.count();
    if (total === 0) {
        console.warn("No visible options available for multi-select.");
        return [];
    }

    const picks = Math.min(countToSelect, total);

    // choose unique random items
    const selectedIndexes = new Set<number>();
    while (selectedIndexes.size < picks) {
        selectedIndexes.add(Math.floor(Math.random() * total));
    }

    const selectedTexts: string[] = [];

    for (const index of selectedIndexes) {
        const option = visibleOptions.nth(index);

        await option.scrollIntoViewIfNeeded().catch(() => {});
        await option.waitFor({ state: 'visible' });
        await option.click();

        selectedTexts.push((await option.innerText()).trim());
    }

    return selectedTexts;
}