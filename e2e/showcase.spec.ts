import { expect, test } from '@playwright/test';
import { verifyFooter, verifyHeader } from './common/helpers';
import { expectSearchParam, getPokemonSelector, openMockedShowcase } from './common/showcase';

test('showcase page renders core UX controls and details', async ({ page }) => {
    await openMockedShowcase(page, { pokemon: 'pikachu' });

    await expect(page.getByRole('button', { name: 'Previous Pokemon: Arbok' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Next Pokemon: Raichu' })).toBeVisible();

    for (const label of [
        'Type',
        'Abilities',
        'Stats',
        'Base Experience',
        'Height',
        'Weight',
        'Cries',
        'Moves',
    ])
        await expect(page.locator('label').getByText(label, { exact: true })).toBeVisible();

    await expect(page.getByRole('button', { name: 'series Base' })).toHaveAttribute('aria-pressed', 'true');
    await page.getByRole('button', { name: 'series Max' }).click();
    await expect(page.getByRole('button', { name: 'series Max' })).toHaveAttribute('aria-pressed', 'true');

    await expect(page.getByRole('button', { name: 'Latest' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Legacy' })).toBeVisible();
    await expect(page.getByRole('slider', { name: 'Volume' })).toBeVisible();

    await verifyHeader(page);
    await verifyFooter(page);
});

test('previous and next Pokemon controls update the URL and selector', async ({ page }) => {
    await openMockedShowcase(page, { pokemon: 'pikachu' });

    await page.getByRole('button', { name: 'Next Pokemon: Raichu' }).click();
    await expectSearchParam(page, 'pokemon', 'raichu');
    await expect(getPokemonSelector(page)).toHaveValue(/raichu/i);

    await page.getByRole('button', { name: 'Previous Pokemon: Pikachu' }).click();
    await expectSearchParam(page, 'pokemon', 'pikachu');
    await expect(getPokemonSelector(page)).toHaveValue(/pikachu/i);
});

test('Pokemon selector updates the URL and details', async ({ page }) => {
    await openMockedShowcase(page);

    const selector = getPokemonSelector(page);
    await selector.fill('charmander');
    await page.getByRole('option', { name: 'Charmander', exact: true }).click();

    await expectSearchParam(page, 'pokemon', 'charmander');
    await expect(selector).toHaveValue(/charmander/i);
    await expect(page.getByLabel('Open ability info for Blaze')).toBeVisible();
});
