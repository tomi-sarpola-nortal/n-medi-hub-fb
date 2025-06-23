
"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import LanguageSwitcher from '../layout/LanguageSwitcher';
import Logo from '../layout/Logo';

// Helper for client-side translations (consistent with login page)
const getClientTranslations = (locale: string) => {
  try {
    if (locale === 'de') {
      return require('../../../locales/de.json');
    }
    return require('../../../locales/en.json');
  } catch (e) {
    console.warn("Translation file not found for AuthLayout, falling back to en");
    return require('../../../locales/en.json'); // Fallback
  }
};

interface AuthLayoutProps {
  children: React.ReactNode;
  pageTitle: string;
  pageSubtitle?: string;
  showBackButton?: boolean;
  backButtonHref?: string;
  backButtonTextKey?: string; // e.g., "register_back_to_login"
}

export default function AuthLayout({
  children,
  pageTitle,
  pageSubtitle,
  showBackButton = false,
  backButtonHref = "/login",
  backButtonTextKey = "register_back_to_login",
}: AuthLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const potentialLocale = pathname.split('/')[1];
  const currentLocale = ['en', 'de'].includes(potentialLocale) ? potentialLocale : 'en';

  const [t, setT] = useState<Record<string, string> | null>(null);

  useEffect(() => {
    setT(getClientTranslations(currentLocale));
  }, [currentLocale]);

  if (!t) {
    return (
      <div className="flex min-h-screen flex-col bg-background text-foreground font-body items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  const translatedBackButtonText = t[backButtonTextKey] || "Back";

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground font-body">
      <header className="py-6 px-4 sm:px-8 border-b border-border">
        <div className="container mx-auto flex items-center justify-between">
          <Link href="/">
            <Logo iconSize={190} portalText={t.login_logo_text_portal || "Portal"} />
          </Link>
          <div className="flex items-center gap-4">
            {showBackButton && (
                <Button variant="outline" onClick={() => router.push(backButtonHref)} className="text-sm">
                <ArrowLeft className="mr-2 h-4 w-4" />
                {translatedBackButtonText}
                </Button>
            )}
            <div>
                <LanguageSwitcher />
            </div>
          </div>
        </div>
      </header>

      <main className="flex-grow flex flex-col items-center justify-center p-4">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold font-headline text-foreground">{pageTitle}</h2>
          {pageSubtitle && (
            <p className="text-md text-muted-foreground mt-2">{pageSubtitle}</p>
          )}
        </div>
        {children}
      </main>

      <footer className="py-8 text-center text-xs text-muted-foreground border-t border-border">
        <p className="mb-2">{t.login_footer_copyright || "© 2025 Österreichische Zahnärztekammer. Alle Rechte vorbehalten."}</p>
        <div className="space-x-4">
          <Link href="#" className="hover:text-primary hover:underline">{t.login_footer_privacy || "Datenschutz"}</Link>
          <Link href="#" className="hover:text-primary hover:underline">{t.login_footer_imprint || "Impressum"}</Link>
          <Link href="#" className="hover:text-primary hover:underline">{t.login_footer_contact || "Kontakt"}</Link>
        </div>
      </footer>
    </div>
  );
}
