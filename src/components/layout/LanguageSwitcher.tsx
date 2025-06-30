"use client";

import { useEffect, useState } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { ComponentProps } from 'react';
import { cn } from '@/lib/utils';
import { Skeleton } from '../ui/skeleton';
import { useClientTranslations } from '@/hooks/use-client-translations';

// Using inline SVGs for flags to avoid adding new image files.
const GermanFlagIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 5 3" {...props}>
        <rect width="5" height="1" y="0" fill="#000000"/>
        <rect width="5" height="1" y="1" fill="#DD0000"/>
        <rect width="5" height="1" y="2" fill="#FFCE00"/>
    </svg>
);

const UKFlagIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 5 3" {...props}>
        <rect width="5" height="3" fill="#012169"/>
        <path d="M0,0 L5,3 M5,0 L0,3" stroke="#FFF" strokeWidth=".6"/>
        <path d="M0,0 L5,3 M5,0 L0,3" stroke="#C8102E" strokeWidth=".4"/>
        <path d="M0,1.5 H5 M2.5,0 V3" stroke="#FFF" strokeWidth="1"/>
        <path d="M0,1.5 H5 M2.5,0 V3" stroke="#C8102E" strokeWidth=".6"/>
    </svg>
);

type LanguageSwitcherProps = ComponentProps<'div'> & {
  initialLocale?: string;
};

const languages = [
    { value: 'en', label: 'English', Flag: (props: any) => <UKFlagIcon {...props} /> },
    { value: 'de', label: 'Deutsch', Flag: (props: any) => <GermanFlagIcon {...props} /> },
];

export default function LanguageSwitcher({ initialLocale, className, ...props }: LanguageSwitcherProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const potentialLocale = pathname.split('/')[1];
  const calculatedLocale = ['en', 'de'].includes(potentialLocale) ? potentialLocale : 'en';
  const currentLocale = initialLocale || calculatedLocale;
  
  const { t, isLoading } = useClientTranslations(['layout']);

  const handleChange = (newLocale: string) => {
    // pathname will now be /en/dashboard or /de/settings etc.
    // We want to replace the first path segment with the new locale.
    const pathWithoutLocale = pathname.replace(/^\/(en|de)/, '');
    let newPath = `/${newLocale}${pathWithoutLocale}`;
    
    // Ensure the root path is handled correctly
    if (newPath === `/${newLocale}`) {
        newPath = `/${newLocale}/`;
    }
    
    const query = searchParams.toString();
    if (query) {
      newPath += `?${query}`;
    }

    // Use router.push for client-side navigation without a full page reload.
    router.push(newPath);
  };
  
  if (isLoading) {
    return <Skeleton className="w-[120px] h-8" />;
  }
  
  const CurrentFlag = languages.find(lang => lang.value === currentLocale)?.Flag;
  const currentLabel = languages.find(lang => lang.value === currentLocale)?.label;

  return (
    <div className={cn("", className)} {...props}>
      <Select value={currentLocale} onValueChange={handleChange}>
        <SelectTrigger 
          className="h-9 w-full px-3 text-sm"
          aria-label={t('language_switcher_label')}
        >
            <div className="flex items-center gap-2">
                {CurrentFlag && <CurrentFlag className="h-4 w-6 rounded-sm" />}
                <SelectValue asChild>
                    <span>{currentLabel}</span>
                </SelectValue>
            </div>
        </SelectTrigger>
        <SelectContent>
            {languages.map(({ value, label, Flag }) => (
                 <SelectItem key={value} value={value}>
                    <div className="flex items-center gap-2">
                        <Flag className="h-4 w-6 rounded-sm" />
                        <span>{label}</span>
                    </div>
                </SelectItem>
            ))}
        </SelectContent>
      </Select>
    </div>
  );
}
