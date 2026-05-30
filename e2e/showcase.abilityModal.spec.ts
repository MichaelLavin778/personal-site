import { expect, test } from '@playwright/test';
import { expectSearchParam, getPokemonSelector, openMockedShowcase } from './common/showcase';

test('ability modal opens, navigates between abilities, and closes', async ({ page }) => {
    await openMockedShowcase(page);

    await page.getByLabel('Open ability info for Overgrow').click();

    const dialog = page.getByRole('dialog');
    await expect(dialog.getByText('Overgrow', { exact: true })).toBeVisible();
    await expectSearchParam(page, 'ability', 'overgrow');

    await dialog.locator('.MuiDialogContent-root').dispatchEvent('wheel', { deltaY: 100 });
    await expect(dialog.getByText('Chlorophyll', { exact: true })).toBeVisible();
    await expectSearchParam(page, 'ability', 'chlorophyll');

    await dialog.getByRole('button', { name: 'close ability info' }).click();
    await expect(dialog).toBeHidden();
    await expectSearchParam(page, 'ability', null);
});

test('ability deep link opens its modal on refresh', async ({ page }) => {
    await openMockedShowcase(page, { pokemon: 'bulbasaur', ability: 'chlorophyll' });

    const dialog = page.getByRole('dialog');
    await expect(dialog.getByText('Chlorophyll', { exact: true })).toBeVisible();
    await expectSearchParam(page, 'ability', 'chlorophyll');
});

test('ability modal Pokemon links navigate to another showcase entry', async ({ page }) => {
    await openMockedShowcase(page);

    await page.getByLabel('Open ability info for Overgrow').click();

    const dialog = page.getByRole('dialog');
    await expect(dialog.getByLabel('Go to Ivysaur showcase page')).toBeVisible();
    await dialog.getByLabel('Go to Ivysaur showcase page').click();

    await expectSearchParam(page, 'pokemon', 'ivysaur');
    await expectSearchParam(page, 'ability', null);
    await expect(dialog).toBeHidden();
    await expect(getPokemonSelector(page)).toHaveValue(/ivysaur/i);
});
