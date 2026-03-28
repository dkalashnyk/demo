import { Page, expect } from '@playwright/test';

import { BasePage } from './BasePage';
import { env } from '../../config/env';

export class UploadPage extends BasePage {
  private readonly fileInput = this.page.locator('[data-testid="file-input"]');
  private readonly submitButton = this.page.locator('[data-testid="file-submit"]');
  private readonly successHeading = this.page.getByRole('heading', {
    name: 'File Uploaded!',
    level: 1,
  });
  private readonly uploadedFiles = this.page.locator('#uploaded-files');

  constructor(page: Page) {
    super(page);
  }

  async open(): Promise<void> {
    await this.page.goto(env.practiceUploadUrl, { timeout: 30_000 });
    await this.dismissAdOverlay();
  }

  async assertOnUploadPage(): Promise<void> {
    await this.expectUrlContains('/upload');
  }

  async uploadFile(filePath: string): Promise<void> {
    await this.fileInput.setInputFiles(filePath);
    await this.dismissAdOverlay();
    await Promise.all([
      this.page.waitForNavigation({ timeout: 15_000 }),
      this.submitButton.click(),
    ]);
    await expect(this.successHeading).toBeVisible({ timeout: 10_000 });
  }

  async getUploadedFileName(): Promise<string> {
    const rawText = await this.uploadedFiles.textContent();
    // Extract the renamed filename (timestamp_originalname) from the element text,
    // ignoring ad-injected content that may appear in the same container
    const match = (rawText ?? '').match(/\d{13}_[\w.-]+/);
    if (!match) {
      throw new Error(
        `Could not extract renamed filename from upload confirmation. Raw text: "${rawText}"`,
      );
    }
    return match[0];
  }
}
