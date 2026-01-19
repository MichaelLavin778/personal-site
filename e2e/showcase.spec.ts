import { expect, test } from '@playwright/test';
import { verifyFooter, verifyHeader } from './common/helpers';

test('showcase page', async ({ page }) => {
    await page.goto('/showcase');

    // Title
    await expect(page).toHaveTitle(/Showcase - Pokemon/i);

    // Core content
    // TODO

    // Header navigation links
    await verifyHeader(page);

    // Footer content
    await verifyFooter(page);
});
