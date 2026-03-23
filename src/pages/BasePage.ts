import { Page, expect } from '@playwright/test';

export abstract class BasePage {
  protected readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async open(url: string): Promise<void> {
    await this.page.goto(url);
  }

  async expectUrlContains(part: string): Promise<void> {
    await expect(this.page).toHaveURL(new RegExp(part));
  }
}
