import path from 'path';
import os from 'os';
import fs from 'fs';

import { test, expect } from '../../src/fixtures/test';
import annotations from '../../src/utils/annotations';
import { INVOICE_PDF } from '../../src/test-data/pdfExpectedData';
import { extractPdfData } from '../../src/utils/pdfParser';
import { env } from '../../config/env';

test.describe('PDF File Download and Content Verification', () => {
  test('@ui @smoke P-2 User downloads PDF and verifies content', async ({
    downloadPage,
    uploadPage,
  }) => {
    await annotations.epic('File Download');
    await annotations.feature('PDF Verification');
    await annotations.story('Upload, download and verify PDF content');

    test.setTimeout(60_000);

    const fixturePath = path.join(__dirname, '../../src/test-data', INVOICE_PDF.fixtureFilename);
    let savePath: string | undefined;

    try {
      await annotations.step('Navigate to upload page', async () => {
        await uploadPage.open();
        await uploadPage.assertOnUploadPage();
      });

      await annotations.step('Upload invoice PDF', async () => {
        await uploadPage.uploadFile(fixturePath);
      });

      let renamedFilename: string;

      await annotations.step('Capture renamed filename from upload confirmation', async () => {
        renamedFilename = await uploadPage.getUploadedFileName();
        expect(renamedFilename).toBeTruthy();
        expect(renamedFilename).toContain(INVOICE_PDF.fixtureFilename);
      });

      await annotations.step('Navigate to download page', async () => {
        await downloadPage.open();
        await downloadPage.assertOnDownloadPage();
      });

      await annotations.step('Download the file', async () => {
        const download = await downloadPage.downloadFileByName(renamedFilename!);
        expect(download).toBeTruthy();

        savePath = path.join(os.tmpdir(), renamedFilename!);
        await download.saveAs(savePath);

        const stats = fs.statSync(savePath);
        expect(stats.size).toBeGreaterThan(0);
      });

      const { text: pdfText } = await extractPdfData(savePath!);

      await annotations.step('Verify PDF contains expected invoice data', async () => {
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

    await annotations.epic('File Download');
    await annotations.feature('PDF Verification');
    await annotations.story('Non-existent file returns error');

    const response = await page.goto(env.practiceDownloadUrl + '/nonexistent-file.pdf', {
      timeout: 30_000,
    });

    expect(response).toBeTruthy();
    expect(response!.status()).toBe(404);

    const contentType = response!.headers()['content-type'] ?? '';
    expect(contentType).not.toContain('application/pdf');
  });

  test('@ui @negative N-3 PDF parsing utility throws on invalid file', async ({}) => {
    await annotations.epic('File Download');
    await annotations.feature('PDF Verification');
    await annotations.story('Invalid PDF throws error');

    const fakePdfPath = path.join(os.tmpdir(), 'fake-test.pdf');
    fs.writeFileSync(fakePdfPath, 'not a pdf');
    try {
      await expect(extractPdfData(fakePdfPath)).rejects.toThrow();
    } finally {
      if (fs.existsSync(fakePdfPath)) fs.unlinkSync(fakePdfPath);
    }
  });
});
