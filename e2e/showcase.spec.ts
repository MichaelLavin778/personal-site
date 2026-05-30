import { expect, test } from '@playwright/test';
import { verifyFooter, verifyHeader } from './common/helpers';
import { expectSearchParam, getMovesGrid, getPokemonSelector, openMockedShowcase, waitForMoveRows } from './common/showcase';

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

test('returning to showcase reuses cached Pokemon API responses', async ({ page }) => {
    const apiRequestCounts = new Map<string, number>();
    page.on('request', (request) => {
        const { origin, pathname } = new URL(request.url());
        if (origin !== 'https://pokeapi.co') return;

        apiRequestCounts.set(pathname, (apiRequestCounts.get(pathname) ?? 0) + 1);
    });

    await openMockedShowcase(page);
    await waitForMoveRows(page);
    await expect.poll(
        () => [...apiRequestCounts.keys()].filter((pathname) => pathname.startsWith('/api/v2/move/')).length
    ).toBe(20);

    const firstVisitRequestCounts = new Map(apiRequestCounts);

    await page.locator('header').getByText('Home', { exact: true }).click();
    await expect(page).toHaveURL('/');
    await page.locator('header').getByText('Showcase', { exact: true }).click();
    await expect(getPokemonSelector(page)).toHaveValue(/bulbasaur/i);
    await expect(getMovesGrid(page).getByLabel('Open move info for Tackle')).toBeVisible();
    await page.waitForTimeout(250);

    expect(apiRequestCounts).toEqual(firstVisitRequestCounts);
});
