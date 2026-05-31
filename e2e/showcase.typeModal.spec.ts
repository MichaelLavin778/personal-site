import { expect, test } from '@playwright/test';
import { openMockedShowcase } from './common/showcase';

test('type modal defaults to Pokemon types, calculates dual-type matchups, and clears its second type', async ({ page }) => {
    await openMockedShowcase(page);

    await page.getByRole('button', { name: 'Open type matchup info for grass and poison' }).click();

    const dialog = page.getByRole('dialog');
    const primaryType = dialog.getByRole('combobox', { name: 'Primary type' });
    const secondaryType = dialog.getByRole('combobox', { name: 'Secondary type' });

    await expect(dialog.getByText('Type matchups', { exact: true })).toBeVisible();
    await expect(primaryType).toHaveValue('');
    await expect(secondaryType).toHaveValue('');
    await expect(primaryType).toHaveAttribute('readonly', '');
    await expect(secondaryType).toHaveAttribute('readonly', '');
    await expect(
        primaryType.locator('xpath=..').getByLabel('Grass type').locator('img')
    ).toHaveAttribute('src', /grass-symbol/);
    await expect(
        secondaryType.locator('xpath=..').getByLabel('Poison type').locator('img')
    ).toHaveAttribute('src', /poison-symbol/);
    const grassOffensiveTable = dialog.getByRole('table', { name: 'grass offensive type matchups' });
    const poisonOffensiveTable = dialog.getByRole('table', { name: 'poison offensive type matchups' });
    await expect(grassOffensiveTable).toBeVisible();
    await expect(poisonOffensiveTable).toBeVisible();
    await expect(
        grassOffensiveTable.locator('thead').getByLabel('Grass type').locator('img')
    ).toHaveAttribute('src', /grass-symbol/);
    await expect(dialog.getByRole('table', { name: 'defensive type matchups' })).toBeVisible();

    const grassOffensiveBox = await grassOffensiveTable.boundingBox();
    const poisonOffensiveBox = await poisonOffensiveTable.boundingBox();
    expect(grassOffensiveBox).not.toBeNull();
    expect(poisonOffensiveBox).not.toBeNull();
    expect(Math.abs(grassOffensiveBox!.y - poisonOffensiveBox!.y)).toBeLessThanOrEqual(1);

    await primaryType.click();
    await page.getByRole('option', { name: 'Fire type', exact: true }).click();
    await secondaryType.click();
    await page.getByRole('option', { name: 'Flying type', exact: true }).click();
    await expect(dialog.getByTestId('defensive-x4').getByText('rock', { exact: true })).toBeVisible();

    await dialog.getByRole('button', { name: 'Clear' }).click();
    await expect(secondaryType).toHaveValue('');
    await expect(dialog.getByTestId('defensive-x2').getByText('rock', { exact: true })).toBeVisible();

    await dialog.getByRole('button', { name: 'close type matchup info' }).click();
    await expect(dialog).toBeHidden();
});
