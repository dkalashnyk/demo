import { Page, expect } from '@playwright/test';

import { BasePage } from './BasePage';
import { Header } from './components/Header';

const ORDER_COMPLETE_HEADER = 'Thank you for your order!';
const ORDER_COMPLETE_TEXT =
  'Your order has been dispatched, and will arrive just as fast as the pony can get there!';

export class CheckoutSummaryPage extends BasePage {
  readonly header: Header;

  private readonly backHomeButton = this.page.getByTestId('back-to-products');
  private readonly completeHeader = this.page.getByTestId('complete-header');
  private readonly completeText = this.page.getByTestId('complete-text');

  constructor(page: Page) {
    super(page);
    this.header = new Header(page);
  }

  async assertOnCheckoutPage(): Promise<void> {
    await this.expectUrlContains('/checkout-complete.html');
    await this.header.expectTitle('Checkout: Complete!');
  }

  async clickBackHome(): Promise<void> {
    await this.backHomeButton.click();
  }

  async expectOrderCompleteMessage(): Promise<void> {
    await expect(this.completeHeader).toHaveText(ORDER_COMPLETE_HEADER);
    await expect(this.completeText).toHaveText(ORDER_COMPLETE_TEXT);
  }
}
