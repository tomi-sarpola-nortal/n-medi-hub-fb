
"use client";

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import AppLayout from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Info, FileText } from 'lucide-react';
import RegistrationStepper from '@/components/auth/RegistrationStepper';
import { getRegistrationData, clearRegistrationData, TITLES_MAP, NATIONALITIES_MAP, STATES_MAP, PROFESSIONAL_TITLES, DENTAL_SPECIALIZATIONS, HEALTH_INSURANCE_CONTRACTS, getTranslationKey, getTranslationKeysForArray, type RegistrationData } from '@/lib/registrationStore';
import { createMemberByAdmin } from '@/app/actions/adminActions';
import type { PersonCreationData } from '@/lib/types';
import { format } from 'date-fns';

const getClientTranslations = (locale: string) => {
  try {
    const page = locale === 'de' ? require('../../../../../../locales/de/member-overview.json') : require('../../../../../../locales/en/member-overview.json');
    const register = locale === 'de' ? require('../../../../../../locales/de/register.json') : require('../../../../../../locales/en/register.json');
    const common = locale === 'de' ? require('../../../../../../locales/de/common.json') : require('../../../../../../locales/en/common.json');
    return { ...page, ...register, ...common };
  } catch (e) {
    return { ...require('../../../../../../locales/en/member-overview.json'), ...require('../../../../../../locales/en/register.json'), ...require('../../../../../../locales/en/common.json')};
  }
};

interface ReviewSectionProps { title: string; data: { label: string; value?: string | string[] | null | Date }[]; locale: string; t: Record<string, string>; }
const ReviewSection: React.FC<ReviewSectionProps> = ({ title, data, t }) => {
  const renderValue = (value?: any) => {
    if (!value || (Array.isArray(value) && value.length === 0)) return <span className="text-muted-foreground italic">{t.register_review_not_provided}</span>;
    if (value instanceof Date) return format(value, 'dd.MM.yyyy');
    if (Array.isArray(value)) return value.join(', ');
    if (typeof value === 'string' && (value.endsWith('.pdf') || value.endsWith('.jpg') || value.endsWith('.png'))) return <div className="flex items-center space-x-2"><FileText className="h-4 w-4 text-primary" /><span>{value}</span></div>;
    return String(value);
  };
  return (<div className="mb-6"><h3 className="text-lg font-semibold mb-3">{title}</h3><div className="space-y-2">{data.map((item, index) => (<div key={index} className="flex justify-between py-2 border-b"><p className="text-sm text-muted-foreground">{item.label}:</p><div className="text-sm text-right">{renderValue(item.value)}</div></div>))}</div></div>);
};

export default function CreateMemberStep5Page() {
  const router = useRouter();
  const params = useParams();
  const locale = typeof params.locale === 'string' ? params.locale : 'en';
  
  const [t, setT] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [registrationData, setRegistrationData] = useState<RegistrationData | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    setT(getClientTranslations(locale));
    const storedData = getRegistrationData();
    if (!storedData.email || !storedData.practiceName) {
      toast({ title: "Missing Information", variant: "destructive" });
      router.replace(`/${locale}/member-overview/create`);
    } else {
      setRegistrationData(storedData);
    }
  }, [locale, router, toast]);

  const handleSubmit = async () => {
    if (!registrationData) { toast({ title: "Error", description: "Registration data is missing.", variant: "destructive" }); return; }
    setIsLoading(true);
    
    const personData: PersonCreationData = {
      name: `${registrationData.title || ''} ${registrationData.firstName} ${registrationData.lastName}`.trim(),
      email: registrationData.email!, role: 'dentist', region: registrationData.stateOrProvince!, status: 'active',
      otpEnabled: false, notificationSettings: { inApp: true, email: false }, stateChamberId: 'wien',
      ...registrationData,
      dateOfBirth: registrationData.dateOfBirth ? format(new Date(registrationData.dateOfBirth), 'yyyy-MM-dd') : undefined,
      graduationDate: registrationData.graduationDate ? format(new Date(registrationData.graduationDate), 'yyyy-MM-dd') : undefined,
      approbationDate: registrationData.approbationDate ? format(new Date(registrationData.approbationDate), 'yyyy-MM-dd') : undefined,
    };
    
    const result = await createMemberByAdmin(personData, registrationData.sessionId!, locale);

    if (result.success) {
      clearRegistrationData();
      toast({ title: t.toast_success_title, description: t.create_member_success_toast });
      router.push(`/${locale}/member-overview/create/success`);
    } else {
      toast({ title: t.toast_error_title, description: result.message, variant: "destructive" });
    }
    setIsLoading(false);
  };

  const pageTitle = t.create_member_page_title || "Create New Member";
  if (!registrationData || Object.keys(t).length === 0) { return <AppLayout pageTitle={pageTitle} locale={locale}><div className="flex-1 p-8 flex justify-center items-center"><Loader2 className="h-10 w-10 animate-spin" /></div></AppLayout>; }
  
  const personalDataItems = [ { label: t.register_step2_label_title, value: t[getTranslationKey(registrationData.title, TITLES_MAP) || ''] }, { label: t.register_step2_label_firstName, value: registrationData.firstName }, { label: t.register_step2_label_lastName, value: registrationData.lastName }, { label: t.register_step2_label_dateOfBirth, value: registrationData.dateOfBirth }, { label: t.register_step2_label_placeOfBirth, value: registrationData.placeOfBirth }, { label: t.register_step2_label_nationality, value: t[getTranslationKey(registrationData.nationality, NATIONALITIES_MAP) || ''] }, { label: t.register_step2_label_streetAddress, value: registrationData.streetAddress }, { label: t.register_step2_label_postalCode, value: registrationData.postalCode }, { label: t.register_step2_label_city, value: registrationData.city }, { label: t.register_step2_label_stateOrProvince, value: t[getTranslationKey(registrationData.stateOrProvince, STATES_MAP) || ''] }, { label: t.register_step2_label_phoneNumber, value: registrationData.phoneNumber }, { label: t.register_label_email, value: registrationData.email }, { label: t.register_step2_label_idDocument, value: registrationData.idDocumentName }, ];
  const profQualDataItems = [ { label: t.register_step4_label_prof_title, value: t[getTranslationKeysForArray([registrationData.currentProfessionalTitle!], PROFESSIONAL_TITLES)[0]] }, { label: t.register_step4_label_specializations, value: getTranslationKeysForArray(registrationData.specializations, DENTAL_SPECIALIZATIONS).map(key => t[key]).join(', ') }, { label: t.register_step4_label_languages, value: registrationData.languages?.join(', ') }, { label: t.register_step4_label_graduation_date, value: registrationData.graduationDate }, { label: t.register_step4_label_university, value: registrationData.university }, { label: t.register_step4_label_approbation_number, value: registrationData.approbationNumber }, { label: t.register_step4_label_approbation_date, value: registrationData.approbationDate }, { label: t.register_step4_label_diploma, value: registrationData.diplomaName }, { label: t.register_step4_label_approbation_cert, value: registrationData.approbationCertificateName }, { label: t.register_step4_label_specialist_recognition, value: registrationData.specialistRecognitionName }, ];
  const practiceInfoDataItems = [ { label: t.register_step5_label_practiceName, value: registrationData.practiceName }, { label: t.register_step5_label_practiceStreetAddress, value: registrationData.practiceStreetAddress }, { label: t.register_step5_label_practicePostalCode, value: registrationData.practicePostalCode }, { label: t.register_step5_label_practiceCity, value: registrationData.practiceCity }, { label: t.register_step5_label_practicePhoneNumber, value: registrationData.practicePhoneNumber }, { label: t.register_step5_label_practiceFaxNumber, value: registrationData.practiceFaxNumber }, { label: t.register_step5_label_practiceEmail, value: registrationData.practiceEmail }, { label: t.register_step5_label_practiceWebsite, value: registrationData.practiceWebsite }, { label: t.register_step5_label_healthInsuranceContracts, value: getTranslationKeysForArray(registrationData.healthInsuranceContracts, HEALTH_INSURANCE_CONTRACTS).map(key => t[key]).join(', ') }, ];

  return (
    <AppLayout pageTitle={pageTitle} locale={locale}>
      <div className="flex-1 space-y-6 p-4 md:p-8 max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold tracking-tight font-headline">{t.register_step6_card_title}</h1>
        <RegistrationStepper currentStep={5} totalSteps={5} />
        <Card>
          <CardHeader><CardDescription>{t.register_step6_card_description}</CardDescription></CardHeader>
          <CardContent className="space-y-8">
            <div className="p-4 bg-accent/50 border rounded-md flex items-start space-x-3"><Info className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" /><p className="text-sm text-foreground">{t.create_member_review_info}</p></div>
            <ReviewSection title={t.register_step2_card_title} data={personalDataItems} locale={locale} t={t} />
            <ReviewSection title={t.register_step4_card_title} data={profQualDataItems} locale={locale} t={t}/>
            <ReviewSection title={t.register_step5_card_title} data={practiceInfoDataItems} locale={locale} t={t}/>
            <div className="flex justify-between pt-6">
              <Button type="button" variant="outline" onClick={() => router.push(`/${locale}/member-overview/create/step4`)} disabled={isLoading}>{t.register_back_button}</Button>
              <Button type="button" onClick={handleSubmit} disabled={isLoading}>{isLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : t.create_member_submit_button}</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
