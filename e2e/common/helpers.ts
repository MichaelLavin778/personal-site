import { type Page, expect } from '@playwright/test';

export const verifyHeader = async (page: Page) => {
    await expect(page.getByText('Home', { exact: true })).toBeVisible();
    await expect(page.getByText('Showcase', { exact: true })).toBeVisible();
    await expect(page.getByText('Resume', { exact: true })).toBeVisible();
};

export const verifyFooter = async (page: Page) => {
    await expect(page.getByText('Powered by')).toBeVisible();
};
