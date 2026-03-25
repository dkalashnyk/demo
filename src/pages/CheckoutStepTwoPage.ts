import { Page, expect } from '@playwright/test';

import { BasePage } from './BasePage';
import { Header } from './components/Header';
import { CartTable } from './components/CartTable';

export class CheckoutStepTwoPage extends BasePage {
  readonly header: Header;
  readonly cartTable: CartTable;

  private readonly finishButton = this.page.getByTestId('finish');
  private readonly itemTotalLabel = this.page.getByTestId('subtotal-label');
  private readonly taxTotalLabel = this.page.getByTestId('tax-label');
  private readonly totalLabel = this.page.getByTestId('total-label');

  constructor(page: Page) {
    super(page);
    this.header = new Header(page);
    this.cartTable = new CartTable(page);
  }

  async assertOnCheckoutPage(): Promise<void> {
    await this.expectUrlContains('/checkout-step-two.html');
    await this.header.expectTitle('Checkout: Overview');
  }

  async clickFinish(): Promise<void> {
    await this.finishButton.click();
  }

  async expectNumberOfCartItems(count: number): Promise<void> {
    await this.cartTable.expectNumberOfCartItems(count);
  }

  async expectItemInCart(
    name: string,
    expected: { price: string; description?: string; quantity: string },
  ): Promise<void> {
    await this.cartTable.expectCartItemVisible(name, expected);
  }

  async expectCartItemVisible(
    name: string,
    expected: { price: string; description?: string; quantity: string },
  ): Promise<void> {
    await this.cartTable.expectCartItemVisible(name, expected);
  }

  async expectItemTotal(expected: string): Promise<void> {
    await expect(this.itemTotalLabel).toHaveText(`Item total: ${expected}`);
  }

  async expectTaxTotal(expected: string): Promise<void> {
    await expect(this.taxTotalLabel).toHaveText(`Tax: ${expected}`);
  }

  async expectTotal(expected: string): Promise<void> {
    await expect(this.totalLabel).toHaveText(`Total: ${expected}`);
  }
}
