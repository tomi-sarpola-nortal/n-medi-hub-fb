// @ts-nocheck
// Disabling TypeScript checking for this file as fs/path imports can cause issues in client-side bundling
// This file is intended for server-side use only.

import fs from 'fs';
import path from 'path';

// This is a simplified loader for server components.
// In a real app, you might use a more robust i18n library.
export function getTranslations(locale: string | undefined): Record<string, string> {
  const effectiveLocale = locale || 'en'; // Fallback to 'en' if locale is undefined
  try {
    const filePath = path.join(process.cwd(), 'locales', `${effectiveLocale}.json`);
    const fileContents = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(fileContents);
  } catch (error) {
    console.warn(`Could not load translations for locale: ${effectiveLocale}. Falling back to default (en). Error: ${error}`);
    // Fallback to English if the locale file is not found or fails to parse
    try {
        const fallbackPath = path.join(process.cwd(), 'locales', `en.json`);
        const fallbackContents = fs.readFileSync(fallbackPath, 'utf8');
        return JSON.parse(fallbackContents);
    } catch (fallbackError) {
        console.error(`Failed to load fallback English translations: ${fallbackError}`);
        return {}; // Return empty if fallback also fails
    }
  }
}
