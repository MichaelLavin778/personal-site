import { expect, test } from '@playwright/test';
import { verifyFooter, verifyHeader } from './common/helpers';

test('showcase page', async ({ page }) => {
    await page.goto('/showcase');

    // Title
    await expect(page).toHaveTitle(/Showcase - Pokemon/i);

    // Core content
    // Ensure we can deep-link to a specific pokemon via query param
    await page.goto('/showcase?pokemon=pikachu');

    // Current selection should reflect the URL param
    await expect(page.getByRole('combobox')).toHaveValue(/pikachu/i);

    // Header navigation links
    await verifyHeader(page);

    // Footer content
    await verifyFooter(page);
});

test('ability modal pokemon links navigate', async ({ page }) => {
    await page.goto('/showcase?pokemon=bulbasaur');

    // Open the first ability info dialog
    await page.getByLabel(/Open ability info for/i).first().click();
    await expect(page.getByText(/Pokémon with/i)).toBeVisible();

    // Click the first navigation link in the dialog (the current Pokémon is rendered as plain text)
    const firstNavLink = page.getByLabel(/Go to Ivysaur showcase page/i).first();
    await expect(firstNavLink).toBeVisible();
    const href = await firstNavLink.getAttribute('href');
    await firstNavLink.click();

    // URL should reflect the clicked Pokémon
    if (href) {
        const expectedUrl = new URL(href, page.url()).toString();
        await expect(page).toHaveURL(expectedUrl);
    }

    // MUI Dialog marks the underlying page aria-hidden, so close it before asserting the combobox.
    await page.keyboard.press('Escape');

    // Selection should update (regression: query-string change on the same route wasn't applied)
    await expect(page.getByRole('combobox')).not.toHaveValue(/bulbasaur/i);
});
