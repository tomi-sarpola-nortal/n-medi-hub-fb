
"use client";

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import AppLayout from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle2, Loader2 } from 'lucide-react';

const getClientTranslations = (locale: string) => {
  try {
    return locale === 'de' ? require('../../../../../../locales/de/member-overview.json') : require('../../../../../../locales/en/member-overview.json');
  } catch (e) {
    return require('../../../../../../locales/en/member-overview.json');
  }
};

export default function CreateMemberSuccessPage() {
  const router = useRouter();
  const params = useParams();
  const locale = typeof params.locale === 'string' ? params.locale : 'en';
  
  const [t, setT] = useState<Record<string, string>>({});

  useEffect(() => {
    setT(getClientTranslations(locale));
  }, [locale]);

  const pageTitle = t.create_member_success_page_title || "Member Created";

  if (Object.keys(t).length === 0) {
    return (
        <AppLayout pageTitle="Loading..." locale={locale}>
             <div className="flex-1 p-8 flex justify-center items-center">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
            </div>
        </AppLayout>
    )
  }

  return (
    <AppLayout pageTitle={pageTitle} locale={locale}>
      <div className="flex-1 p-4 flex items-center justify-center">
        <Card className="shadow-xl text-center w-full max-w-md">
          <CardContent className="p-8 space-y-6">
            <CheckCircle2 className="h-20 w-20 text-green-500 mx-auto" data-ai-hint="success checkmark" />
            <h2 className="text-3xl font-bold font-headline">{t.create_member_success_card_title || "Success!"}</h2>
            <p className="text-muted-foreground">{t.create_member_success_toast || "User created successfully. A password reset email has been sent."}</p>
            <Button
              onClick={() => router.push(`/${locale}/member-overview`)}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground h-11 text-base mt-4"
            >
              {t.create_member_success_button || "Back to Member Overview"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
