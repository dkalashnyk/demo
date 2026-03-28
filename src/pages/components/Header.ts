import { Page, Locator, expect } from '@playwright/test';

export class Header {
  private readonly cartLink: Locator;
  private readonly cartBadge: Locator;
  private readonly title: Locator;
  private readonly menuButton: Locator;
  private readonly resetAppStateButton: Locator;
  private readonly closeMenuButton: Locator;
  private readonly logoutLink: Locator;

  constructor(private readonly page: Page) {
    this.cartLink = this.page.getByTestId('shopping-cart-link');
    this.cartBadge = this.page.getByTestId('shopping-cart-badge');
    this.title = this.page.getByTestId('title');
    this.menuButton = this.page.getByRole('button', { name: 'Open Menu' });
    this.resetAppStateButton = this.page.getByRole('link', { name: 'Reset App State' });
    this.closeMenuButton = this.page.getByRole('button', { name: 'Close Menu' });
    this.logoutLink = this.page.getByTestId('logout-sidebar-link');
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

  async resetAppState(): Promise<void> {
    await this.menuButton.click();
    await this.resetAppStateButton.click();
  }

  async closeMenu(): Promise<void> {
    await this.closeMenuButton.click();
    await expect(this.resetAppStateButton).not.toBeVisible();
  }

  async logout(): Promise<void> {
    await this.menuButton.click();
    await this.logoutLink.click();
  }
}
