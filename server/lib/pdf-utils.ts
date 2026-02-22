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
  LOGO_LEFT: "https://cdn.builder.io/api/v1/image/assets%2Fd8cf247061ae4e73b8c8529275e40675%2F1e55c030693d429b8a71a3a705492b5e?format=png",
  LOGO_RIGHT: "https://cdn.builder.io/api/v1/image/assets%2Fd8cf247061ae4e73b8c8529275e40675%2F1850b5e832b4437a9da2e8ba900aa4ce?format=png",
};

export const BISMILLAH = "بسم الله الرحمن الرحيم";
