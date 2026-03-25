import { Page, expect } from '@playwright/test';

import { BasePage } from './BasePage';
import { Header } from './components/Header';

export class CheckoutStepOnePage extends BasePage {
  readonly header: Header;

  private readonly firstNameInput = this.page.getByTestId('firstName');
  private readonly lastNameInput = this.page.getByTestId('lastName');
  private readonly postalCodeInput = this.page.getByTestId('postalCode');
  private readonly continueButton = this.page.getByTestId('continue');
  private readonly errorMessage = this.page.getByTestId('error');

  constructor(page: Page) {
    super(page);
    this.header = new Header(page);
  }

  async assertOnCheckoutPage(): Promise<void> {
    await this.expectUrlContains('/checkout-step-one.html');
    await this.header.expectTitle('Checkout: Your Information');
  }

  async fillCheckoutInformation(
    firstName: string,
    lastName: string,
    postalCode: string,
  ): Promise<void> {
    await this.firstNameInput.fill(firstName);
    await this.lastNameInput.fill(lastName);
    await this.postalCodeInput.fill(postalCode);
  }

  async clickContinue(): Promise<void> {
    await this.continueButton.click();
  }

  async expectErrorMessage(message: string): Promise<void> {
    await expect(this.errorMessage).toHaveText(message);
  }
}
