import { Page, expect } from '@playwright/test';

export abstract class BasePage {
  constructor(protected readonly page: Page) {}

  // You can override this method in child classes to specify different screenshot options or masks
  // mask: [this.page.getByTestId('item-price')],
  async assertVisual(): Promise<void> {
    await expect(this.page).toHaveScreenshot({
      fullPage: true,
      animations: 'disabled',
    });
  }

  async expectUrlContains(part: string): Promise<void> {
    await expect(this.page).toHaveURL(new RegExp(part));
  }
}
