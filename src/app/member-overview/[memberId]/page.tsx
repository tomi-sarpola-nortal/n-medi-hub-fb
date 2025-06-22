
"use client";

import AppLayout from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getTranslations } from '@/lib/translations';
import { ArrowLeft, AlertTriangle, FileText } from 'lucide-react';
import Link from 'next/link';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { useEffect, useState } from 'react';

// Helper for client-side translations
const getClientTranslations = (locale: string) => {
  try {
    if (locale === 'de') {
      return require('../../../../locales/de.json');
    }
    return require('../../../../locales/en.json');
  } catch (e) {
    console.warn("Translation file not found for member review page, falling back to en");
    return require('../../../../locales/en.json');
  }
};

interface MemberReviewPageProps {
  params: { memberId: string; locale: string };
}

// Mock data for Dr. Mehmet Yilmaz
const mockMember = {
  id: '3',
  name: 'Dr. Mehmet Yilmaz',
  dentistId: 'A-1029843',
  trainingPoints: '85/150',
  repHours: '34',
  status: 'in-review' as const,
  lastUpdate: '08.05.2023',
  title: 'Dr.',
  firstName: 'Mehmet',
  lastName: 'Yilmaz',
  dob: '12.03.1963',
  pob: 'Ankara',
  nationality: 'Türkei',
  address: 'Friedensstraße 22, 1200 Wien',
  phone: '+43 664 99887766',
  email: 'mehmet.yilmaz@aon.at',
  profTitle: 'Zahnarzt',
  specializations: 'Allgemeine Zahnheilkunde, Prothetik',
  languages: 'Deutsch, Türkisch, Englisch',
  gradDate: '1987',
  university: 'Universität Istanbul',
  approbationNumber: 'A-1987765',
  approbationDate: '1993',
  practiceName: 'Zahnarztpraxis Dr. Yilmaz',
  practiceAddress: 'Klosterneuburger Straße 75, 1200 Wien',
  practicePhone: '+43 1 3305566',
  practiceFax: '-',
  practiceEmail: 'praxis@yilmaz-zahnarzt.at',
  practiceWebsite: 'www.yilmaz-zahnarzt.at',
  contracts: 'ÖGK (Österreichische Gesundheitskasse), SVS (Sozialversicherung der Selbständigen)',
  documents: [
    { name: 'Yilmaz.pdf', size: '422.4 kB', type: 'id' },
    { name: 'Dr_Yilmaz_Diplom.pdf', size: '422.4 kB', type: 'diploma' },
    { name: 'Dr_Yilmaz_Diplom_Approbation.pdf', size: '422.4 kB', type: 'approbation' },
  ],
};

const DataRow = ({ label, value }: { label: string; value?: string | null }) => (
  <div>
    <p className="text-xs text-muted-foreground">{label}</p>
    <p className="text-base font-medium">{value || '-'}</p>
  </div>
);

const DocumentRow = ({ label, docName, docSize }: { label: string; docName?: string; docSize?: string }) => (
  <div>
    <p className="text-sm font-medium mb-1">{label}</p>
    {docName ? (
       <div className="bg-muted/50 p-3 rounded-md flex items-center gap-3 hover:bg-muted cursor-pointer">
          <FileText className="h-6 w-6 text-primary flex-shrink-0" />
          <div>
            <p className="text-sm font-semibold text-foreground">{docName}</p>
            <p className="text-xs text-muted-foreground">{docSize}</p>
          </div>
       </div>
    ) : (
      <p className="text-sm text-muted-foreground italic">-</p>
    )}
  </div>
);


export default function MemberReviewPage({ params }: MemberReviewPageProps) {
  const [t, setT] = useState<Record<string, string>>({});
  
  useEffect(() => {
    setT(getClientTranslations(params.locale));
  }, [params.locale]);

  // In a real app, you would fetch member data based on params.memberId
  const member = mockMember;
  const pageTitle = t.member_review_page_title?.replace('{memberName}', member.name) || member.name;
  
  const statusKeyMap = {
      'active': 'member_list_status_active',
      'in-review': 'member_list_status_in_review',
      'inactive': 'member_list_status_inactive',
  };

  if (Object.keys(t).length === 0) {
      return <AppLayout pageTitle="Loading..." locale={params.locale}><div>Loading...</div></AppLayout>;
  }

  return (
    <AppLayout pageTitle={pageTitle} locale={params.locale}>
        <div className="flex-1 space-y-6 p-4 md:p-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight font-headline flex items-center gap-2">
                        <Link href="/member-overview" className="hidden lg:block">
                            <ArrowLeft className="h-6 w-6 text-muted-foreground"/>
                        </Link>
                        {pageTitle}
                    </h1>
                     <div className="text-sm text-muted-foreground mt-2">
                        <Link href="/dashboard" className="hover:underline">{t.member_overview_breadcrumb_dashboard || "Dashboard"}</Link>
                        <span className="mx-1">/</span>
                        <Link href="/member-overview" className="hover:underline">{t.member_overview_breadcrumb_current || "Member Overview"}</Link>
                        <span className="mx-1">/</span>
                        <span className="font-medium text-foreground">{member.name}</span>
                    </div>
                </div>
            </div>

             <Tabs defaultValue="stammdaten" className="w-full">
                <TabsList className="grid w-full grid-cols-3 md:w-[400px]">
                    <TabsTrigger value="stammdaten">{t.member_review_stammdaten_tab || "Stammdaten"}</TabsTrigger>
                    <TabsTrigger value="fortbildungen" disabled>{t.member_review_fortbildungen_tab || "Fortbildungen"}</TabsTrigger>
                    <TabsTrigger value="vertretungen" disabled>{t.member_review_vertretungen_tab || "Vertretungen"}</TabsTrigger>
                </TabsList>
                <TabsContent value="stammdaten" className="mt-6">
                    <Card>
                        <CardContent className="p-4 grid grid-cols-2 md:grid-cols-5 gap-4 text-center">
                            <div>
                                <p className="text-xs font-semibold uppercase text-muted-foreground">{t.member_review_stats_id || "Zahnarzt-ID"}</p>
                                <p className="text-lg font-bold">{member.dentistId}</p>
                            </div>
                             <div>
                                <p className="text-xs font-semibold uppercase text-muted-foreground">{t.member_review_stats_points || "Fortbildungspunkte"}</p>
                                <p className="text-lg font-bold">{member.trainingPoints}</p>
                            </div>
                            <div>
                                <p className="text-xs font-semibold uppercase text-muted-foreground">{t.member_review_stats_hours || "Vertretungsstunden"}</p>
                                <p className="text-lg font-bold">{member.repHours}</p>
                            </div>
                            <div>
                                <p className="text-xs font-semibold uppercase text-muted-foreground">{t.member_review_stats_status || "Status"}</p>
                                <StatusBadge status={member.status}>{t[statusKeyMap[member.status]] || member.status}</StatusBadge>
                            </div>
                            <div>
                                <p className="text-xs font-semibold uppercase text-muted-foreground">{t.member_review_stats_last_update || "Letzte Datenbestätigung"}</p>
                                <p className="text-lg font-bold">{member.lastUpdate}</p>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="mt-6 p-4 bg-amber-50 border border-amber-300 rounded-md flex flex-col sm:flex-row items-start sm:items-center gap-4">
                        <AlertTriangle className="h-8 w-8 text-amber-500 flex-shrink-0"/>
                        <div className="flex-grow">
                            <p className="font-medium">{t.member_review_alert_text || "This member has recently submitted changes to their master data. Please review them. You can still see the last approved data here."}</p>
                        </div>
                        <Button asChild className="bg-primary hover:bg-primary/90 w-full sm:w-auto mt-2 sm:mt-0">
                           <Link href={`/member-overview/${params.memberId}/review`}>{t.member_review_alert_button || "PERFORM REVIEW"}</Link>
                        </Button>
                    </div>

                    <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-1 space-y-6">
                            <Card>
                                <CardHeader><CardTitle>{t.member_review_personal_data_title || "Persönliche Daten"}</CardTitle></CardHeader>
                                <CardContent className="space-y-4">
                                    <DataRow label={t.member_list_table_header_id || "Zahnarzt-ID"} value={member.dentistId} />
                                    <DataRow label={t.register_step2_label_title || "Titel"} value={member.title} />
                                    <DataRow label={t.register_step2_label_firstName || "Vorname"} value={member.firstName} />
                                    <DataRow label={t.register_step2_label_lastName || "Nachname"} value={member.lastName} />
                                    <DataRow label={t.register_step2_label_dateOfBirth || "Geburtsdatum"} value={member.dob} />
                                    <DataRow label={t.register_step2_label_placeOfBirth || "Geburtsort"} value={member.pob} />
                                    <DataRow label={t.register_step2_label_nationality || "Staatsbürgerschaft"} value={member.nationality} />
                                    <DataRow label={t.member_review_residential_address || "Wohnadresse"} value={member.address} />
                                    <DataRow label={t.register_step2_label_phoneNumber || "Telefonnummer"} value={member.phone} />
                                    <DataRow label={t.member_review_email_address || "E-Mail-Adresse"} value={member.email} />
                                </CardContent>
                            </Card>

                             <Card>
                                <CardHeader><CardTitle>{t.member_review_documents_title || "Dokumente"}</CardTitle></CardHeader>
                                <CardContent className="space-y-4">
                                     <DocumentRow label={t.register_step2_label_idDocument || "Personalausweis oder Reisepass"} docName={member.documents[0].name} docSize={member.documents[0].size} />
                                     <DocumentRow label={t.register_step4_label_diploma || "Diplom / Zeugnis des Zahnmedizinstudiums"} docName={member.documents[1].name} docSize={member.documents[1].size} />
                                     <DocumentRow label={t.register_step4_label_approbation_cert || "Approbationsurkunde"} docName={member.documents[2].name} docSize={member.documents[2].size} />
                                     <DocumentRow label={t.register_step4_label_specialist_recognition || "Fachzahnarztanerkennung"} />
                                </CardContent>
                            </Card>
                        </div>
                        <div className="lg:col-span-2 space-y-6">
                            <Card>
                                <CardHeader><CardTitle>{t.member_review_prof_qual_title || "Berufliche Qualifikationen"}</CardTitle></CardHeader>
                                <CardContent className="space-y-4">
                                    <DataRow label={t.register_step4_label_prof_title || "Aktuelle Berufsbezeichnung"} value={member.profTitle} />
                                    <DataRow label={t.register_step4_label_specializations || "Fachrichtungen/Schwerpunkte"} value={member.specializations} />
                                    <DataRow label={t.register_step4_label_languages || "Sprachen"} value={member.languages} />
                                    <DataRow label={t.register_step4_label_graduation_date || "Datum des Studienabschlusses"} value={member.gradDate} />
                                    <DataRow label={t.register_step4_label_university || "Universität/Hochschule"} value={member.university} />
                                    <DataRow label={t.register_step4_label_approbation_number || "Approbationsnummer"} value={member.approbationNumber} />
                                    <DataRow label={t.register_step4_label_approbation_date || "Datum des Approbation"} value={member.approbationDate} />
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader><CardTitle>{t.member_review_practice_info_title || "Informationen zur Ordination"}</CardTitle></CardHeader>
                                <CardContent className="space-y-4">
                                    <DataRow label={t.register_step5_label_practiceName || "Name der Ordination/Klinik"} value={member.practiceName} />
                                    <DataRow label={t.member_review_practice_address || "Adresse der Ordination"} value={member.practiceAddress} />
                                    <DataRow label={t.register_step5_label_practicePhoneNumber || "Telefonnummer der Ordination"} value={member.practicePhone} />
                                    <DataRow label={t.register_step5_label_practiceFaxNumber || "Faxnummer der Ordination"} value={member.practiceFax} />
                                    <DataRow label={t.register_step5_label_practiceEmail || "E-Mail der Ordination"} value={member.practiceEmail} />
                                    <DataRow label={t.register_step5_label_practiceWebsite || "Website der Ordination"} value={member.practiceWebsite} />
                                    <DataRow label={t.register_step5_label_healthInsuranceContracts || "Kassenverträge"} value={member.contracts} />
                                </CardContent>
                            </Card>
                        </div>
                    </div>

                </TabsContent>
             </Tabs>
        </div>
    </AppLayout>
  );
}
