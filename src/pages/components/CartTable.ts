import { Page, Locator, expect } from '@playwright/test';

export class CartTable {
  private readonly cartItems: Locator;

  constructor(private readonly page: Page) {
    this.cartItems = this.page.getByTestId('inventory-item');
  }

  private cartItem(name: string): Locator {
    return this.cartItems.filter({
      has: this.page.getByTestId('inventory-item-name').filter({ hasText: name }),
    });
  }

  private cartItemDescription(name: string): Locator {
    return this.cartItem(name).getByTestId('inventory-item-desc');
  }

  private cartItemPrice(name: string): Locator {
    return this.cartItem(name).getByTestId('inventory-item-price');
  }

  private cartItemQuantity(name: string): Locator {
    return this.cartItem(name).getByTestId('item-quantity');
  }

  async expectCartItemVisible(
    name: string,
    expected: { price: string; description?: string; quantity: string },
  ): Promise<void> {
    await expect(this.cartItemPrice(name)).toContainText(expected.price);
    if (expected.description) {
      await expect(this.cartItemDescription(name)).toHaveText(expected.description);
    }
    await expect(this.cartItemQuantity(name)).toHaveText(expected.quantity);
  }

  async expectNumberOfCartItems(count: number): Promise<void> {
    await expect(this.cartItems).toHaveCount(count);
  }
}
