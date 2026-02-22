import PDFDocument from "pdfkit";
import { reshape } from "arabic-persian-reshaper";
import bidiFactory from "bidi-js";

const bidi = bidiFactory();

/**
 * Reshapes and handles Bidi for Arabic text to work with PDFKit
 */
export function prepareArabicText(text: string): string {
  if (!text) return "";
  // 1. Reshape letters
  const reshaped = reshape(text);
  // 2. Handle Bidi (RTL)
  const bidiData = bidi.getDisplay(reshaped);
  return bidiData;
}

/**
 * Fetches an asset (font or image) from a URL
 */
export async function fetchAsset(url: string): Promise<Buffer> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch asset from ${url}: ${response.statusText}`);
  }
  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

// URLs for common assets
export const ASSETS = {
  // Use a reliable Arabic font URL
  ARABIC_FONT: "https://github.com/google/fonts/raw/main/ofl/amiri/Amiri-Regular.ttf",
  LOGO_RIGHT: "https://cdn.builder.io/api/v1/image/assets%2F18f62c6725dc4e4692b4078094995cb1%2F03dd7ee8ca894cb3bf67918e9642d94d?format=webp",
  LOGO_LEFT: "https://cdn.builder.io/api/v1/image/assets%2F18f62c6725dc4e4692b4078094995cb1%2F2518d3e2adc6405a8bdd08d2c86b2516?format=webp",
};

export const BISMILLAH = "بسم الله الرحمن الرحيم";
