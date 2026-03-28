import fs from 'fs';

// eslint-disable-next-line @typescript-eslint/no-require-imports
const pdfParse = require('pdf-parse');

async function parsePdf(filePath: string) {
  const buffer = fs.readFileSync(filePath);
  return await pdfParse(buffer);
}

export async function extractPdfText(filePath: string): Promise<string> {
  const data = await parsePdf(filePath);
  return data.text;
}

export async function extractPdfPageCount(filePath: string): Promise<number> {
  const data = await parsePdf(filePath);
  return data.numpages;
}

export async function extractPdfData(
  filePath: string,
): Promise<{ text: string; pageCount: number }> {
  const data = await parsePdf(filePath);
  return { text: data.text, pageCount: data.numpages };
}
