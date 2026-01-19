import { type Page, expect } from '@playwright/test';

export const verifyHeader = async (page: Page) => {
    const header = page.locator('header');

    // Navigation links
    const homeLink = header.getByText('Home', { exact: true });
    await expect(homeLink).toBeVisible();
    await expect(homeLink).toHaveAttribute('href', '/');
    const showcaseLink = header.getByText('Showcase', { exact: true });
    await expect(showcaseLink).toBeVisible();
    await expect(showcaseLink).toHaveAttribute('href', '/showcase');
    const resumeLink = header.getByText('Resume', { exact: true });
    await expect(resumeLink).toBeVisible();
    await expect(resumeLink).toHaveAttribute('href', '/resume');

    // Action buttons
    await expect(header.getByLabel('light theme')).toBeVisible();
    await expect(header.getByLabel('tutorial off')).toBeVisible();
};

export const verifyFooter = async (page: Page) => {
    const footer = page.locator('footer');

    // Powered by text and icons
    await expect(footer.getByText('Powered by')).toBeVisible();
    await expect(footer.getByLabel('AWS Amplify')).toBeVisible();
    await expect(footer.getByLabel('S3')).toBeVisible();
    await expect(footer.getByLabel('Vite')).toBeVisible();
    await expect(footer.getByLabel('React')).toBeVisible();
    await expect(footer.getByLabel('Playwright')).toBeVisible();
};
