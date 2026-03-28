import path from 'path';
import os from 'os';
import fs from 'fs';

import { test, expect } from '../../src/fixtures/test';
import allure from '../../src/utils/allure';
import { DownloadPage } from '../../src/pages/DownloadPage';
import { UploadPage } from '../../src/pages/UploadPage';
import { INVOICE_PDF } from '../../src/test-data/pdfExpectedData';
import { extractPdfData } from '../../src/utils/pdfParser';
import { env } from '../../config/env';

test.describe('PDF File Download and Content Verification', () => {
  test('@ui @smoke P-2 User downloads PDF and verifies content', async ({ page }) => {
    await allure.epic('File Download');
    await allure.feature('PDF Verification');
    await allure.story('Upload, download and verify PDF content');

    test.setTimeout(60_000);

    const uploadPage = new UploadPage(page);
    const downloadPage = new DownloadPage(page);
    const fixturePath = path.join(__dirname, '../fixtures', INVOICE_PDF.fixtureFilename);
    let savePath: string | undefined;

    try {
      await allure.step('Navigate to upload page', async () => {
        await uploadPage.open();
        await uploadPage.assertOnUploadPage();
      });

      await allure.step('Upload invoice PDF', async () => {
        await uploadPage.uploadFile(fixturePath);
      });

      let renamedFilename: string;

      await allure.step('Capture renamed filename from upload confirmation', async () => {
        renamedFilename = await uploadPage.getUploadedFileName();
        expect(renamedFilename).toBeTruthy();
        expect(renamedFilename).toContain(INVOICE_PDF.fixtureFilename);
      });

      await allure.step('Navigate to download page', async () => {
        await downloadPage.open();
        await downloadPage.assertOnDownloadPage();
      });

      await allure.step('Download the file', async () => {
        const download = await downloadPage.downloadFileByName(renamedFilename!);
        expect(download).toBeTruthy();

        savePath = path.join(os.tmpdir(), renamedFilename!);
        await download.saveAs(savePath);

        const stats = fs.statSync(savePath);
        expect(stats.size).toBeGreaterThan(0);
      });

      const { text: pdfText } = await extractPdfData(savePath!);

      await allure.step('Verify PDF contains expected invoice data', async () => {
        expect(pdfText).toContain(INVOICE_PDF.totalDue);
        expect(pdfText).toContain(INVOICE_PDF.invoiceDate);
      });
    } finally {
      if (savePath && fs.existsSync(savePath)) {
        fs.unlinkSync(savePath);
      }
    }
  });

  test('@ui @negative N-1 Download link for non-existent file returns error', async ({ page }) => {
    test.setTimeout(30_000);

    await allure.epic('File Download');
    await allure.feature('PDF Verification');
    await allure.story('Non-existent file returns error');

    const response = await page.goto(env.practiceDownloadUrl + '/nonexistent-file.pdf', {
      timeout: 30_000,
    });

    expect(response).toBeTruthy();
    expect(response!.status()).toBe(404);

    const contentType = response!.headers()['content-type'] ?? '';
    expect(contentType).not.toContain('application/pdf');
  });

  test('@ui @negative N-3 PDF parsing utility throws on invalid file', async ({}) => {
    await allure.epic('File Download');
    await allure.feature('PDF Verification');
    await allure.story('Invalid PDF throws error');

    const fakePdfPath = path.join(os.tmpdir(), 'fake-test.pdf');
    fs.writeFileSync(fakePdfPath, 'not a pdf');
    try {
      await expect(extractPdfData(fakePdfPath)).rejects.toThrow();
    } finally {
      if (fs.existsSync(fakePdfPath)) fs.unlinkSync(fakePdfPath);
    }
  });
});
