"use client";

import { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import LanguageSwitcher from '../layout/LanguageSwitcher';
import Logo from '../layout/Logo';
import { ThemeToggle } from '../layout/ThemeToggle';
import { useClientTranslations } from '@/hooks/use-client-translations';

interface AuthLayoutProps {
  children: React.ReactNode;
  pageTitle: string;
  pageSubtitle?: string;
  showBackButton?: boolean;
  backButtonHref?: string;
  backButtonTextKey?: string; // e.g., "register_back_to_login"
  locale: string;
}

export default function AuthLayout({
  children,
  pageTitle,
  pageSubtitle,
  showBackButton = false,
  backButtonHref = "/login",
  backButtonTextKey = "register_back_to_login",
  locale,
}: AuthLayoutProps) {
  const router = useRouter();
  const { t, isLoading } = useClientTranslations(['layout', 'register']);

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col bg-background text-foreground font-body items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  const translatedBackButtonText = t(backButtonTextKey) || "Back";

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground font-body">
      <header className="py-6 px-4 sm:px-8 border-b border-border">
        <div className="container mx-auto flex items-center justify-between">
          <Link href={`/${locale}/`}>
            <Logo iconSize={190} />
          </Link>
          <div className="flex items-center gap-4">
            {showBackButton && (
                <Button variant="outline" onClick={() => router.push(backButtonHref)} className="text-sm">
                <ArrowLeft className="mr-2 h-4 w-4" />
                {translatedBackButtonText}
                </Button>
            )}
            <div className="flex items-center gap-2">
                <LanguageSwitcher />
                <ThemeToggle />
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
        <p className="mb-2">{t('login_footer_copyright')}</p>
        <div className="space-x-4">
          <Link href="#" className="hover:text-primary hover:underline">{t('login_footer_privacy')}</Link>
          <Link href="#" className="hover:text-primary hover:underline">{t('login_footer_imprint')}</Link>
          <Link href="#" className="hover:text-primary hover:underline">{t('login_footer_contact')}</Link>
        </div>
      </footer>
    </div>
  );
}