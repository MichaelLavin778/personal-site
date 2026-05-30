import { expect, test } from '@playwright/test';
import { getMovesGrid, openMockedShowcase, waitForMoveRows } from './common/showcase';

test('moves table filters level, TM, egg, and tutor moves', async ({ page }) => {
    await openMockedShowcase(page);
    await waitForMoveRows(page);

    const grid = getMovesGrid(page);
    const level = page.getByRole('button', { name: 'Level', exact: true });
    const tm = page.getByRole('button', { name: 'TM', exact: true });
    const egg = page.getByRole('button', { name: 'Egg', exact: true });
    const tutor = page.getByRole('button', { name: 'Tutor', exact: true });

    await expect(level).toHaveAttribute('aria-pressed', 'true');
    await expect(grid.getByLabel('Open move info for Tackle')).toBeVisible();

    await tm.click();
    await expect(tm).toHaveAttribute('aria-pressed', 'true');
    await expect(grid.getByLabel('Open move info for Swords Dance')).toBeVisible();

    await egg.click();
    await expect(egg).toHaveAttribute('aria-pressed', 'true');
    await expect(grid.getByLabel('Open move info for Curse')).toBeVisible();

    await tutor.click();
    await expect(tutor).toHaveAttribute('aria-pressed', 'true');
    await expect(grid.getByLabel('Open move info for Grass Pledge')).toBeVisible();

    await level.click();
    await expect(level).toHaveAttribute('aria-pressed', 'true');
    await expect(grid.getByLabel('Open move info for Tackle')).toBeVisible();
});

test('moves table paginates with footer and wheel controls', async ({ page }) => {
    await openMockedShowcase(page);
    await waitForMoveRows(page);

    const grid = getMovesGrid(page);
    const previousPage = page.getByRole('button', { name: 'Go to previous page' });
    const nextPage = page.getByRole('button', { name: 'Go to next page' });

    await expect(previousPage).toBeDisabled();
    await expect(nextPage).toBeEnabled();

    await nextPage.click();
    await expect(previousPage).toBeEnabled();

    await previousPage.click();
    await expect(previousPage).toBeDisabled();

    await grid.dispatchEvent('wheel', { deltaY: 100 });
    await expect(previousPage).toBeEnabled();

    await grid.dispatchEvent('wheel', { deltaY: -100 });
    await expect(previousPage).toBeDisabled();
});
