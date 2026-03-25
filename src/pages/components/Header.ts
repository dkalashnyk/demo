import { Page, Locator, expect } from '@playwright/test';

export class Header {
  private readonly cartLink: Locator;
  private readonly cartBadge: Locator;
  private readonly title: Locator;

  constructor(private readonly page: Page) {
    this.cartLink = this.page.getByTestId('shopping-cart-link');
    this.cartBadge = this.page.getByTestId('shopping-cart-badge');
    this.title = this.page.getByTestId('title');
  }

  async expectTitle(title: string): Promise<void> {
    await expect(this.title).toHaveText(title);
  }

  async expectCartCount(count: number): Promise<void> {
    if (count === 0) {
      await expect(this.cartBadge).not.toBeVisible();
    } else {
      await expect(this.cartBadge).toHaveText(String(count));
    }
  }

  async clickCartIcon(): Promise<void> {
    await this.cartLink.click();
  }
}
