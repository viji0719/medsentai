import { Buffer } from 'node:buffer';
import { extname } from 'node:path';
import { PDFParse } from 'pdf-parse';
import sharp from 'sharp';
import Tesseract from 'tesseract.js';

const normalizeWhitespace = (text) =>
  String(text || '')
    .replace(/\s+/g, ' ')
    .trim();

const getFileExtension = (fileName) => extname(fileName || '').toLowerCase();

const decodeBase64File = (file) => {
  if (!file?.base64) {
    return null;
  }

  return Buffer.from(file.base64, 'base64');
};

const normalizeImageForOcr = async (buffer) => {
  try {
    return await sharp(buffer)
      .flatten({ background: '#ffffff' })
      .grayscale()
      .normalize()
      .png()
      .toBuffer();
  } catch (error) {
    throw new Error(
      'This image format could not be prepared for OCR. Please upload a PNG, JPG, WEBP, or a clearer prescription image.'
    );
  }
};

const extractPdfText = async (buffer) => {
  const parser = new PDFParse({ data: buffer });

  try {
    const result = await parser.getText();
    const directText = normalizeWhitespace(result.text);

    if (directText) {
      return {
        extractedText: directText,
        source: 'pdf-text',
      };
    }

    const screenshots = await parser.getScreenshot({
      first: 3,
      scale: 1.5,
      imageBuffer: true,
      imageDataUrl: false,
    });

    const ocrPages = [];
    for (const page of screenshots.pages) {
      const pageBuffer = Buffer.from(page.data || []);
      if (pageBuffer.length === 0) {
        continue;
      }

      const pageText = await extractImageText(pageBuffer);
      if (pageText) {
        ocrPages.push(pageText);
      }
    }

    return {
      extractedText: normalizeWhitespace(ocrPages.join(' ')),
      source: 'pdf-ocr',
    };
  } finally {
    await parser.destroy();
  }
};

const extractImageText = async (buffer) => {
  try {
    const normalizedBuffer = await normalizeImageForOcr(buffer);
    const result = await Tesseract.recognize(normalizedBuffer, 'eng', {
      logger: () => {},
    });

    return normalizeWhitespace(result.data.text);
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }

    throw new Error(
      'OCR could not read this image. Please upload a clearer prescription image in PNG, JPG, or WEBP format.'
    );
  }
};

export const extractPrescriptionText = async ({ prescriptionText, file }) => {
  const typedText = normalizeWhitespace(prescriptionText);
  if (typedText) {
    return {
      extractedText: typedText,
      source: 'direct-text',
    };
  }

  if (!file) {
    return {
      extractedText: '',
      source: 'none',
    };
  }

  if (file.text) {
    return {
      extractedText: normalizeWhitespace(file.text),
      source: 'text-file',
    };
  }

  const buffer = decodeBase64File(file);
  if (!buffer) {
    return {
      extractedText: '',
      source: 'none',
    };
  }

  const extension = getFileExtension(file.name);
  const isPdf = file.type === 'application/pdf' || extension === '.pdf';
  const isImage = file.type?.startsWith('image/') || ['.png', '.jpg', '.jpeg', '.webp'].includes(extension);

  if (isPdf) {
    const pdfResult = await extractPdfText(buffer);

    if (pdfResult.extractedText) {
      return pdfResult;
    }

    throw new Error('This PDF could not be read. Please upload a clearer scanned PDF or image.');
  }

  if (isImage) {
    const imageText = await extractImageText(buffer);

    if (imageText) {
      return {
        extractedText: imageText,
        source: 'image-ocr',
      };
    }

    throw new Error(
      'OCR could not extract readable text from the image. Please try a clearer prescription photo or use PNG/JPG format.'
    );
  }

  throw new Error('Unsupported file type. Please upload an image, PDF, or text file.');
};
