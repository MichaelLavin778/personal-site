import { expect, test } from '@playwright/test';
import { verifyFooter, verifyHeader } from './common/helpers';

test('resume page', async ({ page }) => {
    await page.goto('/resume');

    // Title
    await expect(page).toHaveTitle(/Resume/i);

    // Core content
    const resume = page.locator('object');
    await expect(resume).toHaveAttribute('type', 'application/pdf');
    await expect(resume).toHaveAttribute('data', 'https://personal--site.s3.us-east-2.amazonaws.com/resume.pdf');

    // Header navigation links
    await verifyHeader(page);

    // Footer content
    await verifyFooter(page);
});
