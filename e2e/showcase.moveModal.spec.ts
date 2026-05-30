import { expect, test } from '@playwright/test';
import {
    expectSearchParam,
    getMovesGrid,
    getPokemonSelector,
    openMockedShowcase,
    waitForMoveRows,
} from './common/showcase';

test('move modal opens, navigates between moves, and closes', async ({ page }) => {
    await openMockedShowcase(page);
    await waitForMoveRows(page);

    await getMovesGrid(page).getByLabel('Open move info for Tackle').click();

    const dialog = page.getByRole('dialog');
    await expect(dialog.getByText('Tackle', { exact: true })).toBeVisible();
    await expectSearchParam(page, 'move', 'tackle');

    await dialog.getByRole('button', { name: 'next move' }).click();
    await expect.poll(() => new URL(page.url()).searchParams.get('move')).not.toBe('tackle');

    await dialog.getByRole('button', { name: 'close move info' }).click();
    await expect(dialog).toBeHidden();
    await expectSearchParam(page, 'move', null);
});

test('TM move deep link opens its modal while the Level table remains visible', async ({ page }) => {
    await openMockedShowcase(page, { pokemon: 'bulbasaur', move: 'swords-dance' });

    const dialog = page.getByRole('dialog');
    await expect(dialog.getByText('Swords Dance', { exact: true })).toBeVisible();
    await expectSearchParam(page, 'move', 'swords-dance');

    await dialog.getByRole('button', { name: 'close move info' }).click();
    await expectSearchParam(page, 'move', null);

    await expect(page.getByRole('button', { name: 'Level', exact: true })).toHaveAttribute('aria-pressed', 'true');
    await expect(getMovesGrid(page).getByLabel('Open move info for Tackle')).toBeVisible();
});

test('move modal Pokemon links navigate to another showcase entry', async ({ page }) => {
    await openMockedShowcase(page);
    await waitForMoveRows(page);

    await getMovesGrid(page).getByLabel('Open move info for Tackle').click();

    const dialog = page.getByRole('dialog');
    await dialog.getByLabel('Go to Ivysaur showcase page').click();

    await expectSearchParam(page, 'pokemon', 'ivysaur');
    await expectSearchParam(page, 'move', null);
    await expect(getPokemonSelector(page)).toHaveValue(/ivysaur/i);
});
