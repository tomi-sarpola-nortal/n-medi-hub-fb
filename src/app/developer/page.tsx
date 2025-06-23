
"use client";

import AppLayout from '@/components/layout/AppLayout';
import SeedButton from '@/components/dashboard/SeedButton';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useEffect, useState } from 'react';
import { useAuth } from '@/context/auth-context';
import { Loader2, Database } from 'lucide-react';
import { useParams } from 'next/navigation';

const getClientTranslations = (locale: string) => {
  try {
    if (locale === 'de') {
      return require('../../../locales/de.json');
    }
    return require('../../../locales/en.json');
  } catch (e) {
    console.warn("Translation file not found for developer page, falling back to en");
    return require('../../../locales/en.json');
  }
};

export default function DeveloperPage() {
  const params = useParams();
  const locale = typeof params.locale === 'string' ? params.locale : 'en';

  const [t, setT] = useState<Record<string, string>>({});
  const { user, loading } = useAuth();

  useEffect(() => {
    setT(getClientTranslations(locale));
  }, [locale]);

  const pageTitle = t.developer_module_page_title || "Developer Module";

  if (loading || !user) {
    return (
      <AppLayout pageTitle={pageTitle} locale={locale}>
        <div className="flex-1 space-y-8 p-4 md:p-8 flex justify-center items-center">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout pageTitle={pageTitle} locale={locale}>
      <div className="flex-1 space-y-6 p-4 md:p-8">
        <h1 className="text-3xl font-bold tracking-tight font-headline">{pageTitle}</h1>
        <p className="text-muted-foreground">{t.developer_module_page_description || "Actions for development and testing."}</p>
        
        <Card className="mt-6 border-destructive/50 bg-destructive/5">
            <CardHeader>
                <div className="flex items-center gap-2">
                    <Database className="h-5 w-5 text-destructive" />
                    <CardTitle className="text-destructive">Database Seeding</CardTitle>
                </div>
                <CardDescription className="text-destructive/80">Populate Firestore collections with initial data. This only needs to be done once per collection. After successful seeding, this module can be removed.</CardDescription>
            </CardHeader>
            <CardContent>
                <SeedButton />
            </CardContent>
        </Card>

      </div>
    </AppLayout>
  );
}
