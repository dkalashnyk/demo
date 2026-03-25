import { Page, expect } from '@playwright/test';

import { BasePage } from './BasePage';
import { env } from '../../config/env';

export class LoginPage extends BasePage {
  private readonly usernameInput = this.page.getByTestId('username');
  private readonly passwordInput = this.page.getByTestId('password');
  private readonly loginButton = this.page.getByTestId('login-button');
  private readonly errorMessage = this.page.getByTestId('error-message');

  constructor(page: Page) {
    super(page);
  }

  async open(): Promise<void> {
    await this.page.goto(env.baseUrl);
  }

  async login(username: string, password: string): Promise<void> {
    await this.usernameInput.fill(username);
    await this.passwordInput.fill(password);
    await this.loginButton.click();
  }

  async expectErrorMessage(message: string): Promise<void> {
    await expect(this.errorMessage).toHaveText(message);
  }
}
