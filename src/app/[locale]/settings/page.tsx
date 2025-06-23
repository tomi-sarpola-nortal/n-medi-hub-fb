
"use client";

import { useAuth } from '@/context/auth-context';
import AppLayout from '@/components/layout/AppLayout';
import { Loader2 } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import PersonalDataForm from '@/components/settings/PersonalDataForm';
import ProfessionalQualificationsForm from '@/components/settings/ProfessionalQualificationsForm';
import PracticeInformationForm from '@/components/settings/PracticeInformationForm';
import DeleteAccountSection from '@/components/settings/DeleteAccountSection';
import { useEffect, useState } from 'react';

// Helper for client-side translations
const getClientTranslations = (locale: string) => {
  try {
    if (locale === 'de') {
      return require('../../../../locales/de.json');
    }
    return require('../../../../locales/en.json');
  } catch (e) {
    console.warn("Translation file not found for settings page, falling back to en");
    return require('../../../../locales/en.json');
  }
};

interface SettingsPageProps {
  params: { locale: string };
}

export default function SettingsPage({ params }: SettingsPageProps) {
  const { user, loading } = useAuth();
  const [t, setT] = useState<Record<string, string> | null>(null);

  useEffect(() => {
    setT(getClientTranslations(params.locale));
  }, [params.locale]);


  if (loading || !user || !t) {
    return (
      <AppLayout pageTitle={t?.settings_page_title || "Settings"} locale={params.locale}>
        <div className="flex-1 space-y-8 p-4 md:p-8 flex justify-center items-center">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
        </div>
      </AppLayout>
    );
  }

  const pageTitle = t.settings_page_title || "Settings";

  return (
    <AppLayout pageTitle={pageTitle} locale={params.locale}>
      <div className="flex-1 space-y-6 p-4 md:p-8 max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold tracking-tight font-headline">{pageTitle}</h1>
        <p className="text-muted-foreground">{t.settings_page_description || "Update your personal and professional information."}</p>

        <Accordion type="single" collapsible className="w-full" defaultValue="item-1">
          <AccordionItem value="item-1">
            <AccordionTrigger className="font-headline text-lg">{t.settings_personal_data_title || "Personal Data"}</AccordionTrigger>
            <AccordionContent>
              <p className="text-sm text-muted-foreground mb-4">{t.settings_personal_data_desc || "Update your personal details and contact information."}</p>
              <PersonalDataForm user={user} t={t} />
            </AccordionContent>
          </AccordionItem>
          
          <AccordionItem value="item-2">
            <AccordionTrigger className="font-headline text-lg">{t.settings_prof_qual_title || "Professional Qualifications"}</AccordionTrigger>
            <AccordionContent>
              <p className="text-sm text-muted-foreground mb-4">{t.settings_prof_qual_desc || "Manage your professional titles, specializations, and qualifications."}</p>
              <ProfessionalQualificationsForm user={user} t={t} />
            </AccordionContent>
          </AccordionItem>
          
          <AccordionItem value="item-3">
            <AccordionTrigger className="font-headline text-lg">{t.settings_practice_info_title || "Practice Information"}</AccordionTrigger>
            <AccordionContent>
                <p className="text-sm text-muted-foreground mb-4">{t.settings_practice_info_desc || "Update the details for your primary practice or clinic."}</p>
                <PracticeInformationForm user={user} t={t} />
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        <DeleteAccountSection user={user} t={t} />
      </div>
    </AppLayout>
  );
}
