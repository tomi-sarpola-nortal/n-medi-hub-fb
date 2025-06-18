
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
import { cn } from '@/lib/utils'; // Import cn

const getClientTranslations = (locale: string) => {
  try {
    if (locale === 'de') {
      return require('../../../locales/de.json');
    }
    return require('../../../locales/en.json');
  } catch (e) {
    return require('../../../locales/en.json'); 
  }
};

type LanguageSwitcherProps = ComponentProps<'div'> & {
  initialLocale?: string;
};

export default function LanguageSwitcher({ initialLocale, className, ...props }: LanguageSwitcherProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  // Ensure currentLocale falls back to 'en' if router.locale is undefined during initial render
  const currentLocale = initialLocale || router.locale || 'en'; 
  
  const t = getClientTranslations(currentLocale);

  const handleChange = (newLocale: string) => {
    const currentPathWithoutLocale = pathname.startsWith(`/${currentLocale}`)
      ? pathname.substring(`/${currentLocale}`.length) || '/'
      : pathname;
    
    const newUrl = `${currentPathWithoutLocale}?${searchParams.toString()}`;
    router.push(newUrl, { locale: newLocale });
  };

  return (
    // Use cn to merge classes, allowing 'className' prop to override or extend
    <div className={cn("flex items-center space-x-2", className)} {...props}>
      <Globe className="h-5 w-5 text-muted-foreground group-data-[state=collapsed]:hidden" />
      <Label htmlFor="language-select" className="sr-only text-sm font-medium group-data-[state=collapsed]:hidden">
        {t.language_switcher_label || "Language"}
      </Label>
      <Select value={currentLocale} onValueChange={handleChange}>
        <SelectTrigger 
          id="language-select" 
          className="w-full min-w-[100px] h-9 text-xs group-data-[state=collapsed]:hidden" // Ensure it takes full width in its container
          aria-label={t.language_switcher_label || "Language"}
        >
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

