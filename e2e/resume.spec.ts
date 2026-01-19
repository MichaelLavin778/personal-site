import { expect, test } from '@playwright/test';
import { verifyFooter, verifyHeader } from './common/helpers';

test('resume page', async ({ page }) => {
    await page.goto('/resume');

    // Title
    await expect(page).toHaveTitle(/Resume/i);

    // Core content
    await expect(page.locator('object')).toHaveAttribute('type', 'application/pdf');

    // Header navigation links
    await verifyHeader(page);

    // Footer content
    await verifyFooter(page);
});
