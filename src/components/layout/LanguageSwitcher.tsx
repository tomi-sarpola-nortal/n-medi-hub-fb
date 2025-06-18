'use client';

import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Globe } from 'lucide-react';
import type { ComponentProps } from 'react';

// A simple way to get translations on the client for this specific component
// In a larger app, you might use a context or a dedicated i18n client library
const getClientTranslations = (locale: string) => {
  try {
    if (locale === 'de') {
      return require('../../../locales/de.json');
    }
    return require('../../../locales/en.json');
  } catch (e) {
    return require('../../../locales/en.json'); // Fallback
  }
};

type LanguageSwitcherProps = ComponentProps<'div'> & {
  initialLocale?: string;
};

export default function LanguageSwitcher({ initialLocale, className, ...props }: LanguageSwitcherProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentLocale = initialLocale || router.locale || 'en';
  
  const t = getClientTranslations(currentLocale);

  const handleChange = (newLocale: string) => {
    // Rebuild the path with the new locale, keeping the original pathname without locale prefix
    // For example, if current path is /en/dashboard, newPathname becomes /dashboard
    // Then router.push will prepend the newLocale
    const currentPathWithoutLocale = pathname.startsWith(`/${currentLocale}`)
      ? pathname.substring(`/${currentLocale}`.length) || '/'
      : pathname;
    
    const newUrl = `${currentPathWithoutLocale}?${searchParams.toString()}`;
    router.push(newUrl, { locale: newLocale });
  };

  return (
    <div className={className ? className : "flex items-center space-x-2"} {...props}>
      <Globe className="h-5 w-5 text-muted-foreground" />
      <Label htmlFor="language-select" className="sr-only text-sm font-medium">
        {t.language_switcher_label || "Language"}
      </Label>
      <Select value={currentLocale} onValueChange={handleChange}>
        <SelectTrigger id="language-select" className="w-[100px] h-9 text-xs">
          <SelectValue placeholder={t.language_switcher_label || "Language"} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="en">English</SelectItem>
          <SelectItem value="de">Deutsch</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
