import { Page, expect } from '@playwright/test';

import { BasePage } from './BasePage';
import { Header } from './components/header';

export class CheckoutSummaryPage extends BasePage {
  readonly header: Header;

  constructor(page: Page) {
    super(page);
    this.header = new Header(page);
  }

  private readonly backHomeButton = this.page.getByTestId('back-to-products');
  private readonly completeHeader = this.page.getByTestId('complete-header');
  private readonly completeText = this.page.getByTestId('complete-text');

  async assertOnCheckoutPage(): Promise<void> {
    await this.expectUrlContains('/checkout-complete.html');
    await this.header.expectTitle('Checkout: Complete!');
  }

  async clickBackHome(): Promise<void> {
    await this.backHomeButton.click();
  }

  async expectOrderCompleteMessage(): Promise<void> {
    await expect(this.completeHeader).toHaveText('Thank you for your order!');
    await expect(this.completeText).toHaveText(
      'Your order has been dispatched, and will arrive just as fast as the pony can get there!',
    );
  }
}
