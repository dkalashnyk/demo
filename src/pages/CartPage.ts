import { Page } from '@playwright/test';

import { BasePage } from './BasePage';
import { Header } from './components/Header';
import { CartTable } from './components/CartTable';

export class CartPage extends BasePage {
  readonly header: Header;
  readonly cartTable: CartTable;

  constructor(page: Page) {
    super(page);
    this.header = new Header(page);
    this.cartTable = new CartTable(page);
  }

  private readonly checkoutButton = this.page.getByTestId('checkout');

  async openCartPage(): Promise<void> {
    await this.header.clickCartIcon();
  }

  async assertOnCartPage(): Promise<void> {
    await this.expectUrlContains('/cart.html');
    await this.header.expectTitle('Your Cart');
  }

  async openCheckoutPage(): Promise<void> {
    await this.checkoutButton.click();
  }

  async expectNumberOfCartItems(count: number): Promise<void> {
    await this.cartTable.expectNumberOfCartItems(count);
  }

  async expectCartItemVisible(
    name: string,
    expected: { price: string; description?: string; quantity: string },
  ): Promise<void> {
    await this.cartTable.expectCartItemVisible(name, expected);
  }
}
