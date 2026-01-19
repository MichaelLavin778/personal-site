import { expect, test } from '@playwright/test';
import { verifyFooter, verifyHeader } from './common/helpers';

test('home page renders core content and navigation', async ({ page }) => {
    await page.goto('/');

    // Title set by Home.tsx
    await expect(page).toHaveTitle(/Michael Lavin/i);

    // Core content
    await expect(page.getByText('Michael Lavin')).toBeVisible();
    await expect(page.getByText('FULL-STACK DEVELOPER')).toBeVisible();
    await expect(page.getByAltText('Michael Lavin')).toBeVisible();
    const LinkedInButton = page.getByLabel('LinkedIn');
    await expect(LinkedInButton).toBeVisible();
    await expect(LinkedInButton).toHaveAttribute('href', 'https://www.linkedin.com/in/michael-lavin-2373b7198');
    const GitHubButton = page.getByLabel('GitHub');
    await expect(GitHubButton).toBeVisible();
    await expect(GitHubButton).toHaveAttribute('href', 'https://github.com/MichaelLavin778');

    // Header navigation links
    await verifyHeader(page);

    // Footer content
    await verifyFooter(page);
});
