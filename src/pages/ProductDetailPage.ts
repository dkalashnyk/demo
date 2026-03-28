import { Page, expect } from '@playwright/test';

import { BasePage } from './BasePage';
import { Header } from './components/Header';

export class ProductDetailPage extends BasePage {
  readonly header: Header;

  private readonly productName = this.page.getByTestId('inventory-item-name');
  private readonly backToProducts = this.page.getByTestId('back-to-products');

  constructor(page: Page) {
    super(page);
    this.header = new Header(page);
  }

  async assertOnProductDetailPage(): Promise<void> {
    await this.expectUrlContains('/inventory-item.html');
  }

  async expectProductName(name: string): Promise<void> {
    await expect(this.productName).toHaveText(name);
  }

  async clickBackToProducts(): Promise<void> {
    await this.backToProducts.click();
  }
}
