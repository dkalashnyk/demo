import { Page, Download, expect } from '@playwright/test';

import { BasePage } from './BasePage';
import { env } from '../../config/env';

export class DownloadPage extends BasePage {
  private readonly heading = this.page.getByRole('heading', { name: /File Downloader/ });

  constructor(page: Page) {
    super(page);
  }

  private fileLink(name: string) {
    return this.page.locator(`xpath=//a[@data-testid="${name}"]`);
  }

  async open(): Promise<void> {
    await this.page.goto(env.practiceDownloadUrl, { timeout: 30_000 });
    await this.dismissAdOverlay();
  }

  async assertOnDownloadPage(): Promise<void> {
    await this.expectUrlContains('/download');
    await expect(this.heading).toBeVisible();
  }

  async downloadFileByName(filename: string): Promise<Download> {
    const downloadPromise = this.page.waitForEvent('download');
    await this.fileLink(filename).dispatchEvent('click');
    return downloadPromise;
  }

  async expectFileLinkVisible(filename: string): Promise<void> {
    await expect(this.fileLink(filename)).toBeVisible();
  }
}
