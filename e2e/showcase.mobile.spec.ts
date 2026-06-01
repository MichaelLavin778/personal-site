import { type Locator, expect, test } from '@playwright/test';
import {
    expectSearchParam,
    getMovesGrid,
    getPokemonSelector,
    openMockedShowcase,
    waitForMoveRows,
} from './common/showcase';

const expectWithinViewport = async (locator: Locator) => {
    const box = await locator.boundingBox();
    const viewport = locator.page().viewportSize();

    expect(box).not.toBeNull();
    expect(viewport).not.toBeNull();
    expect(box!.x).toBeGreaterThanOrEqual(0);
    expect(box!.x + box!.width).toBeLessThanOrEqual(viewport!.width);
};

const swipeLeft = async (locator: Locator) => {
    const box = await locator.boundingBox();
    expect(box).not.toBeNull();

    const y = box!.y + Math.min(120, box!.height / 2);
    await locator.dispatchEvent('pointerdown', {
        bubbles: true,
        clientX: box!.x + box!.width - 24,
        clientY: y,
        isPrimary: true,
        pointerId: 1,
        pointerType: 'touch',
    });
    await locator.dispatchEvent('pointerup', {
        bubbles: true,
        clientX: box!.x + 24,
        clientY: y,
        isPrimary: true,
        pointerId: 1,
        pointerType: 'touch',
    });
};

test('mobile header uses drawer navigation and footer carousel controls', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByText('FULL-STACK DEVELOPER')).toBeVisible();

    const header = page.locator('header');
    await expect(header.getByRole('button', { name: 'open navigation menu' })).toBeVisible();
    await expect(header.getByLabel('light theme')).toBeVisible();
    await expect(header.getByLabel(/tutorial (on|off)/)).toHaveCount(0);
    await expect(header.getByText('Home', { exact: true })).toBeHidden();

    const footer = page.locator('footer');
    const scrollLeft = footer.getByRole('button', { name: 'Scroll technologies left' });
    const scrollRight = footer.getByRole('button', { name: 'Scroll technologies right' });
    await expect(scrollLeft).toBeDisabled();
    await expect(scrollRight).toBeEnabled();
    await scrollRight.click();
    await expect(scrollLeft).toBeEnabled();

    await header.getByRole('button', { name: 'open navigation menu' }).click();
    const resumeLink = page.getByRole('link', { name: 'Resume', exact: true });
    await expect(resumeLink).toBeVisible();
    await resumeLink.click();
    await expect(page).toHaveURL(/\/resume$/);
});

test('mobile showcase stacks navigation and keeps moves controls within the viewport', async ({ page }) => {
    await openMockedShowcase(page, { pokemon: 'pikachu' });
    await waitForMoveRows(page);

    const selector = getPokemonSelector(page);
    const previousPokemon = page.getByRole('button', { name: 'Previous Pokemon: Arbok' });
    const nextPokemon = page.getByRole('button', { name: 'Next Pokemon: Raichu' });

    const selectorBox = await selector.boundingBox();
    const previousBox = await previousPokemon.boundingBox();
    const nextBox = await nextPokemon.boundingBox();

    expect(selectorBox).not.toBeNull();
    expect(previousBox).not.toBeNull();
    expect(nextBox).not.toBeNull();
    expect(selectorBox!.y + selectorBox!.height).toBeLessThan(previousBox!.y);
    expect(Math.abs(previousBox!.y - nextBox!.y)).toBeLessThanOrEqual(1);

    const grid = getMovesGrid(page);
    const gridBox = await grid.boundingBox();
    expect(gridBox).not.toBeNull();
    expect(gridBox!.height).toBeGreaterThanOrEqual(419);

    for (const name of ['Level', 'TM', 'Egg', 'Tutor']) {
        const filter = page.getByRole('button', { name, exact: true });
        await expect(filter).toBeVisible();
        await expectWithinViewport(filter);
    }

    await page.getByRole('button', { name: 'TM', exact: true }).click();
    await expect(grid.getByLabel('Open move info for Swords Dance')).toBeVisible();
});

test('mobile move modal fits the viewport and supports touch swipe navigation', async ({ page }) => {
    await openMockedShowcase(page);
    await waitForMoveRows(page);

    await getMovesGrid(page).getByLabel('Open move info for Tackle').click();

    const dialog = page.getByRole('dialog');
    await expect(dialog.getByText('Tackle', { exact: true })).toBeVisible();
    await expectWithinViewport(dialog);

    await swipeLeft(dialog.locator('.MuiDialogContent-root'));
    await expectSearchParam(page, 'move', 'growl');
    await expect(dialog.getByText('Growl', { exact: true })).toBeVisible();
});

test('mobile ability modal fits the viewport and supports touch swipe navigation', async ({ page }) => {
    await openMockedShowcase(page);

    await page.getByLabel('Open ability info for Overgrow').click();

    const dialog = page.getByRole('dialog');
    await expect(dialog.getByText('Overgrow', { exact: true })).toBeVisible();
    await expectWithinViewport(dialog);

    await swipeLeft(dialog.locator('.MuiDialogContent-root'));
    await expectSearchParam(page, 'ability', 'chlorophyll');
    await expect(dialog.getByText('Chlorophyll', { exact: true })).toBeVisible();
});

test('mobile type modal stacks matchup table columns vertically', async ({ page }) => {
    await openMockedShowcase(page);

    await page.getByRole('button', { name: 'Open type matchup info for grass and poison' }).click();

    const dialog = page.getByRole('dialog');
    await expect(dialog.getByRole('button', { name: 'Clear' })).toBeVisible();
    const expectCellsStacked = async (tableName: string, testIds: string[]) => {
        const table = dialog.getByRole('table', { name: tableName });
        const boxes = await Promise.all(testIds.map(async testId => {
            const cell = table.getByTestId(testId);
            await expect(cell).toBeVisible();
            return cell.boundingBox();
        }));

        boxes.forEach(box => expect(box).not.toBeNull());
        for (let index = 1; index < boxes.length; index += 1) {
            expect(boxes[index]!.y).toBeGreaterThan(boxes[index - 1]!.y);
            expect(Math.abs(boxes[index]!.x - boxes[index - 1]!.x)).toBeLessThanOrEqual(1);
        }
    };

    await expectCellsStacked(
        'grass offensive type matchups',
        ['offensive-x2', 'offensive-x0_5', 'offensive-x0']
    );
    await expectCellsStacked(
        'defensive type matchups',
        ['defensive-x2', 'defensive-x0_5', 'defensive-x0']
    );
});
