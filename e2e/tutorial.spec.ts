import { Page, expect, test } from "@playwright/test";

export const verifyTutorial = async (page: Page) => {
    let pageContext: '' | 'showcase' | 'resume' = '';
    if (page.url().includes('/showcase')) 
        pageContext = 'showcase';
     else if (page.url().includes('/resume')) 
        pageContext = 'resume';
    
    let tutorialText = 'unknown page';
    switch (pageContext) {
        case 'showcase':
            tutorialText = 'All data is pulled from PokéAPI. Moves table uses a DataGrid which dynamically sizes between the bottom of the left column and the bottom of the page.';
            break;
        case 'resume':
            tutorialText = 'My resume was pulled from an S3 bucket and stored in the state. This way the resume can be updated without needing to redeploy the site.';
            break;
        case '':
            tutorialText = 'Welcome to my personal website! These popovers are here to explain some of the technical details behind how the site was built. If you\'d like to disable them, use the';
            break;
        default:
            tutorialText = 'unknown page';
    }

    // General Locators
    const header = page.locator('header');
    const tutorialPopover = page.getByRole('presentation').getByText(tutorialText);
    const tutorialOn = header.getByRole('button', { name: 'tutorial on' });
    const tutorialOff = header.getByRole('button', { name: 'tutorial off' });
    const toggleTutorial = header.getByRole('button', { name: /tutorial (on|off)/ });

    // Initial state: tutorial disaabled via storageState in playwright.config.ts
    await expect(tutorialOff).toBeVisible();
    await expect(tutorialOn).toBeHidden();
    await expect(tutorialPopover).toBeHidden();

    // Enable tutorial
    await toggleTutorial.click();
    await expect(tutorialPopover).toBeVisible();

    // Dismiss tutorial
    await page.keyboard.press('Escape');
    await expect(tutorialOn).toBeVisible();
    await expect(tutorialOff).toBeHidden();
    await expect(tutorialPopover).toBeHidden();

    // Turn off tutorial
    await toggleTutorial.click();
    await expect(tutorialOff).toBeVisible();
    await expect(tutorialOn).toBeHidden();
    await expect(tutorialPopover).toBeHidden();

    // Re-enable tutorial
    await toggleTutorial.click();
    await expect(tutorialPopover).toBeHidden();

    // Tutorial should be seen again after reload
    await page.reload();
    await expect(tutorialPopover).toBeVisible();

    // Dismiss tutorial again
    await page.keyboard.press('Escape');
    await toggleTutorial.click();
};

test('tutorial functionality', async ({ page }) => {
    // home
    await page.goto('/');
    await page.getByText('FULL-STACK DEVELOPER').waitFor(); // Ensure page is loaded
    await verifyTutorial(page);

    // showcase
    await page.goto('/showcase');
    await page.getByText('Abilities').waitFor(); // Ensure page is loaded
    await verifyTutorial(page);

    // resume
    await page.goto('/resume');
    await page.getByText('Powered by').waitFor(); // Ensure page is loaded
    await verifyTutorial(page);
});
