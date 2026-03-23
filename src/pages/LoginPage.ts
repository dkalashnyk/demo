import { expect, Page } from '@playwright/test';

import { BasePage } from './BasePage';
import { env } from '../../config/env';

export class LoginPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  private readonly usernameInput = this.page.getByTestId('username');
  private readonly passwordInput = this.page.getByTestId('password');
  private readonly loginButton = this.page.getByTestId('login-button');
  private readonly title = this.page.getByTestId('title');

  async open(): Promise<void> {
    await this.page.goto(env.baseUrl);
  }

  async login(username: string, password: string): Promise<void> {
    await this.usernameInput.fill(username);
    await this.passwordInput.fill(password);
    await this.loginButton.click();
    await this.expectUrlContains('/inventory.html');
    await expect(this.title).toHaveText('Products');
  }
}
