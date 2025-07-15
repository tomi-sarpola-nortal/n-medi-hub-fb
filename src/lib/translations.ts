// @ts-nocheck
// Disabling TypeScript checking for this file as fs/path imports can cause issues in client-side bundling
// This file is intended for server-side use only.

import fs from 'fs';
import path from 'path';

/**
 * Loads and merges all translation JSON files for a given locale from its directory.
 * This is used by Server Components to get all available translation keys.
 * @param locale The locale to load translations for (e.g., 'en', 'de').
 * @returns A single object containing all merged translations for the locale.
 */
export function getTranslations(locale: string | undefined): Record<string, string> {
  const effectiveLocale = locale || 'en'; // Fallback to 'en' if locale is undefined
  const localeDir = path.join(process.cwd(), 'locales', effectiveLocale);

  try {
    const files = fs.readdirSync(localeDir);
    const translations = files.reduce((acc, file) => {
      if (file.endsWith('.json')) {
        const filePath = path.join(localeDir, file);
        const fileContents = fs.readFileSync(filePath, 'utf8');
        const json = JSON.parse(fileContents);
        return { ...acc, ...json };
      }
      return acc;
    }, {});
    return translations;
  } catch (error) {
    console.warn(`Could not load translations for locale: ${effectiveLocale}. Falling back to default (en). Error: ${error}`);
    // Fallback to English if the locale directory is not found or fails to parse
    const fallbackDir = path.join(process.cwd(), 'locales', 'en');
    try {
       const fallbackFiles = fs.readdirSync(fallbackDir);
        return fallbackFiles.reduce((acc, file) => {
            if (file.endsWith('.json')) {
                const filePath = path.join(fallbackDir, file);
                const fileContents = fs.readFileSync(filePath, 'utf8');
                const json = JSON.parse(fileContents);
                return { ...acc, ...json };
            }
            return acc;
        }, {});
    } catch (fallbackError) {
        console.error(`Failed to load fallback English translations: ${fallbackError}`);
        return {}; // Return empty if fallback also fails
    }
  }
}
