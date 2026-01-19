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
