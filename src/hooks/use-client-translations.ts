import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';

/**
 * Custom hook to load client-side translations based on the current locale
 * @param namespaces Array of translation namespaces to load (e.g., ['common', 'login'])
 * @returns Object containing translations and loading state
 */
export function useClientTranslations(namespaces: string[] = []) {
  const params = useParams();
  const locale = typeof params.locale === 'string' ? params.locale : 'en';
  
  const [translations, setTranslations] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Create a stable key from the namespaces array to use as a dependency.
  const namespacesKey = namespaces.join(',');

  useEffect(() => {
    async function loadTranslations() {
      setIsLoading(true);
      setError(null);
      
      try {
        const loadedTranslations: Record<string, string> = {};
        
        // If no namespaces provided, load 'common' by default
        const namespacesToLoad = namespaces.length > 0 ? namespaces : ['common'];
        
        for (const namespace of namespacesToLoad) {
          try {
            // Dynamic import of translation files
            const translationModule = locale === 'de' 
              ? await import(`../../locales/de/${namespace}.json`)
              : await import(`../../locales/en/${namespace}.json`);
              
            // Merge translations from this namespace
            Object.assign(loadedTranslations, translationModule);
          } catch (e) {
            console.warn(`Translation file not found for namespace '${namespace}' in locale '${locale}', falling back to en`);
            
            try {
              // Fallback to English
              const fallbackModule = await import(`../../locales/en/${namespace}.json`);
              Object.assign(loadedTranslations, fallbackModule);
            } catch (fallbackError) {
              console.error(`Failed to load fallback English translations for namespace '${namespace}'`, fallbackError);
            }
          }
        }
        
        setTranslations(loadedTranslations);
      } catch (e) {
        console.error('Failed to load translations:', e);
        setError(e instanceof Error ? e : new Error('Unknown error loading translations'));
      } finally {
        setIsLoading(false);
      }
    }
    
    loadTranslations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [locale, namespacesKey]);

  /**
   * Translation function that returns the translation for a key or the key itself if not found
   * @param key The translation key to look up
   * @param replacements Optional object with key-value pairs for string replacements
   */
  const t = (key: string, replacements?: Record<string, string | number>): string => {
    let text = translations[key] || key;
    
    if (replacements) {
      Object.entries(replacements).forEach(([placeholder, value]) => {
        text = text.replace(new RegExp(`{${placeholder}}`, 'g'), String(value));
      });
    }
    
    return text;
  };

  return { t, translations, isLoading, error, locale };
}
