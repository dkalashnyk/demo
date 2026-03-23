import { Page } from '@playwright/test';

import { BasePage } from './BasePage';
import { Header } from './components/Header';
import type { CheckoutFormData } from '../test-context/scenarioContext';

export class CheckoutStepOnePage extends BasePage {
  constructor(page: Page) {
    super(page);
    this.header = new Header(page);
  }

  readonly header: Header;

  private readonly firstNameInput = this.page.getByTestId('firstName');
  private readonly lastNameInput = this.page.getByTestId('lastName');
  private readonly postalCodeInput = this.page.getByTestId('postalCode');
  private readonly continueButton = this.page.getByTestId('continue');

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

  async fillRandomCheckoutInformation(data: CheckoutFormData): Promise<void> {
    await this.fillCheckoutInformation(data.firstName, data.lastName, data.zip);
  }

  async clickContinue(): Promise<void> {
    await this.continueButton.click();
  }
}
