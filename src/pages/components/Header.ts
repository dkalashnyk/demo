import { Page, Locator, expect } from '@playwright/test';

export class Header {
  private readonly cartIcon: Locator;
  private readonly title: Locator;

  constructor(private readonly page: Page) {
    this.cartIcon = this.page.getByTestId('shopping-cart-badge');
    this.title = this.page.getByTestId('title');
  }

  async expectTitle(title: string): Promise<void> {
    await expect(this.title).toHaveText(title);
  }

  async expectCartCount(count: number): Promise<void> {
    await expect(this.cartIcon).toHaveText(String(count));
  }

  async clickCartIcon(): Promise<void> {
    await this.cartIcon.click();
  }
}
