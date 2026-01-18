import { type Page, expect } from "@playwright/test";

export const verifyHeader = async (page: Page) => {
    await expect(page.getByText('Home')).toBeVisible();
    await expect(page.getByText('Showcase')).toBeVisible();
    await expect(page.getByText('Resume')).toBeVisible();
};

export const verifyFooter = async (page: Page) => {
    await expect(page.getByText('Powered by')).toBeVisible();
};
