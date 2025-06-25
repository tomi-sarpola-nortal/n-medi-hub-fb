"use client";

import { useAuth } from '@/context/auth-context';
import AppLayout from '@/components/layout/AppLayout';
import { Loader2, AlertTriangle } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import PersonalDataForm from '@/components/settings/PersonalDataForm';
import ProfessionalQualificationsForm from '@/components/settings/ProfessionalQualificationsForm';
import PracticeInformationForm from '@/components/settings/PracticeInformationForm';
import DeleteAccountSection from '@/components/settings/DeleteAccountSection';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

// Helper for client-side translations
const getClientTranslations = (locale: string) => {
  try {
    const page = locale === 'de' ? require('../../../../locales/de/settings.json') : require('../../../../locales/en/settings.json');
    const common = locale === 'de' ? require('../../../../locales/de/common.json') : require('../../../../locales/en/common.json');
    const register = locale === 'de' ? require('../../../../locales/de/register.json') : require('../../../../locales/en/register.json');
    return { ...page, ...common, ...register };
  } catch (e) {
    console.warn("Translation file not found for settings page, falling back to en");
    const page = require('../../../../locales/en/settings.json');
    const common = require('../../../../locales/en/common.json');
    const register = require('../../../../locales/en/register.json');
    return { ...page, ...common, ...register };
  }
};

export default function SettingsPage() {
  const { user, loading } = useAuth();
  const params = useParams();
  const locale = typeof params.locale === 'string' ? params.locale : 'en';

  const [t, setT] = useState<Record<string, string> | null>(null);

  useEffect(() => {
    setT(getClientTranslations(locale));
  }, [locale]);


  if (loading || !user || !t) {
    return (
      <AppLayout pageTitle={t?.settings_page_title || "Settings"} locale={locale}>
        <div className="flex-1 space-y-8 p-4 md:p-8 flex justify-center items-center">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
        </div>
      </AppLayout>
    );
  }

  const pageTitle = t.settings_page_title || "Settings";
  const isPendingRegistration = user.status === 'pending';
  const hasPendingDataChange = !!user.pendingData;

  const isFormDisabled = isPendingRegistration || hasPendingDataChange;

  return (
    <AppLayout pageTitle={pageTitle} locale={locale}>
      <div className="flex-1 space-y-6 p-4 md:p-8 max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold tracking-tight font-headline">{pageTitle}</h1>
        <p className="text-muted-foreground">{t.settings_page_description || "Update your personal and professional information."}</p>

        {isPendingRegistration && (
          <Alert variant="default" className="bg-amber-50 border-amber-300 text-amber-800 dark:bg-amber-950 dark:border-amber-800 dark:text-amber-200">
            <AlertTriangle className="h-4 w-4 !text-amber-600 dark:!text-amber-400" />
            <AlertTitle>{t.settings_pending_approval_title || "Account Pending Approval"}</AlertTitle>
            <AlertDescription>
              {t.settings_pending_approval_alert || "Your registration is waiting for approval. You can review your submitted data below, but no changes can be made until your account is approved."}
            </AlertDescription>
          </Alert>
        )}

        {hasPendingDataChange && !isPendingRegistration && (
           <Alert variant="default" className="bg-blue-50 border-blue-300 text-blue-800 dark:bg-blue-950 dark:border-blue-800 dark:text-blue-200">
             <div className="flex items-start gap-4">
                <AlertTriangle className="h-4 w-4 !text-blue-600 dark:!text-blue-400 mt-0.5 flex-shrink-0" />
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between w-full gap-2">
                  <div>
                    <AlertTitle>{t.settings_pending_changes_title || "Changes Pending Review"}</AlertTitle>
                    <AlertDescription>
                      {t.settings_pending_changes_desc || "Your recent data changes have been submitted for review. You cannot edit the forms again until the changes have been approved or rejected."}
                    </AlertDescription>
                  </div>
                  <Button asChild variant="outline" className="border-blue-400 text-blue-800 dark:border-blue-700 dark:text-blue-200 hover:bg-blue-100 dark:hover:bg-blue-900 w-full sm:w-auto flex-shrink-0">
                    <Link href={`/${locale}/settings/review`}>
                      {t.settings_view_changes_button || "View Changes"}
                    </Link>
                  </Button>
                </div>
              </div>
          </Alert>
        )}

        <Accordion type="single" collapsible className="w-full" defaultValue="item-1">
          <AccordionItem value="item-1">
            <AccordionTrigger className="font-headline text-lg">{t.settings_personal_data_title || "Personal Data"}</AccordionTrigger>
            <AccordionContent>
              <p className="text-sm text-muted-foreground mb-4">{t.settings_personal_data_desc || "Update your personal details and contact information."}</p>
              <PersonalDataForm user={user} t={t} isDisabled={isFormDisabled} />
            </AccordionContent>
          </AccordionItem>
          
          <AccordionItem value="item-2">
            <AccordionTrigger className="font-headline text-lg">{t.settings_prof_qual_title || "Professional Qualifications"}</AccordionTrigger>
            <AccordionContent>
              <p className="text-sm text-muted-foreground mb-4">{t.settings_prof_qual_desc || "Manage your professional titles, specializations, and qualifications."}</p>
              <ProfessionalQualificationsForm user={user} t={t} isDisabled={isFormDisabled} />
            </AccordionContent>
          </AccordionItem>
          
          <AccordionItem value="item-3">
            <AccordionTrigger className="font-headline text-lg">{t.settings_practice_info_title || "Practice Information"}</AccordionTrigger>
            <AccordionContent>
                <p className="text-sm text-muted-foreground mb-4">{t.settings_practice_info_desc || "Update the details for your primary practice or clinic."}</p>
                <PracticeInformationForm user={user} t={t} isDisabled={isFormDisabled} />
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        <DeleteAccountSection user={user} t={t} />
      </div>
    </AppLayout>
  );
}
