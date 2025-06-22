
"use client";

import AppLayout from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getTranslations } from '@/lib/translations';
import { ArrowLeft, FileText } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Separator } from '@/components/ui/separator';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';

// Helper for client-side translations
const getClientTranslations = (locale: string) => {
  try {
    if (locale === 'de') {
      return require('../../../../../locales/de.json');
    }
    return require('../../../../../locales/en.json');
  } catch (e) {
    console.warn("Translation file not found, falling back to en");
    return require('../../../../../locales/en.json');
  }
};

interface DataReviewPageProps {
  params: { memberId: string; locale: string };
}

// Mock data for Dr. Mehmet Yilmaz's review
const mockMember = {
  id: '3',
  name: 'Dr. Mehmet Yilmaz',
  dentistId: 'ZA-2024-0067',
  changeDate: '21.05.2026',
  chamber: 'ZK Wien',
};

const mockChanges = {
  personal: [
    {
      field: 'lastName',
      labelKey: 'register_step2_label_lastName',
      oldValue: 'Yilmaz',
      newValue: 'Yilmaz-Schneider',
    },
    {
      field: 'idDocument',
      labelKey: 'register_step2_label_idDocument',
      oldValue: null,
      newValue: {
        name: 'Yilmaz-Schneider-neu.pdf',
        size: '422.4 kB',
      },
    },
  ],
  professional: [
    {
      field: 'specializations',
      labelKey: 'register_step4_label_specializations',
      oldValue: 'Allgemeine Zahnheilkunde, Prothetik',
      newValue: 'Allgemeine Zahnheilkunde, Prothetik, Endodontie',
    },
  ],
};


const InfoRow = ({ label, value, href }: { label: string; value: string; href?: string }) => (
    <div className="flex justify-between items-center py-2">
        <p className="text-sm text-muted-foreground">{label}</p>
        {href ? (
             <Link href={href} className="text-sm font-medium text-primary hover:underline">{value}</Link>
        ) : (
            <p className="text-sm font-medium">{value}</p>
        )}
    </div>
);

const FileDisplay = ({ name, size }: { name: string; size: string }) => (
  <div className="bg-muted/50 p-3 rounded-md flex items-center gap-3 hover:bg-muted cursor-pointer">
    <FileText className="h-6 w-6 text-primary flex-shrink-0" />
    <div>
      <p className="text-sm font-semibold text-foreground">{name}</p>
      <p className="text-xs text-muted-foreground">{size}</p>
    </div>
  </div>
);

const DiffRow = ({ label, oldValue, newValue }: { label: string; oldValue: React.ReactNode; newValue: React.ReactNode }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2 py-4 border-b last:border-none">
      <div>
        <p className="text-sm text-muted-foreground mb-1">{label}</p>
        <div className="text-sm font-medium">{oldValue || <span className="italic text-muted-foreground">Nicht angegeben</span>}</div>
      </div>
       <div>
        <p className="text-sm text-muted-foreground mb-1">Neu</p>
        <div className="text-sm font-semibold text-primary">{newValue}</div>
      </div>
  </div>
);


export default function DataReviewPage({ params }: DataReviewPageProps) {
  const [t, setT] = useState<Record<string, string>>({});
  
  useEffect(() => {
    setT(getClientTranslations(params.locale));
  }, [params.locale]);

  const pageTitle = t.member_review_page_title_review || "Datenänderung prüfen";

  if (Object.keys(t).length === 0) {
      return <AppLayout pageTitle="Loading..." locale={params.locale}><div>Loading...</div></AppLayout>;
  }

  return (
    <AppLayout pageTitle={pageTitle} locale={params.locale}>
        <div className="flex-1 space-y-6 p-4 md:p-8">
             <div className="flex items-center justify-between">
                <div>
                     <h1 className="text-3xl font-bold tracking-tight font-headline flex items-center gap-2">
                        <Link href={`/member-overview/${params.memberId}`} className="hidden lg:block">
                            <ArrowLeft className="h-6 w-6 text-muted-foreground"/>
                        </Link>
                        {pageTitle}
                    </h1>
                     <div className="text-sm text-muted-foreground mt-2">
                        <Link href="/dashboard" className="hover:underline">{t.member_overview_breadcrumb_dashboard || "Dashboard"}</Link>
                        <span className="mx-1">/</span>
                        <Link href="/member-overview" className="hover:underline">{t.member_overview_breadcrumb_current || "Member Overview"}</Link>
                        <span className="mx-1">/</span>
                        <Link href={`/member-overview/${params.memberId}`} className="hover:underline">{mockMember.name}</Link>
                        <span className="mx-1">/</span>
                        <span className="font-medium text-foreground">{t.member_review_breadcrumb_review || "Datenänderung prüfen"}</span>
                    </div>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="text-xl font-headline">{mockMember.name}</CardTitle>
                    <CardDescription>{t.member_review_page_subtitle || "Bitte überprüfen Sie die Daten nach Vollständigkeit und Richtigkeit."}</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="bg-muted/30 p-4 rounded-lg">
                        <h3 className="font-semibold mb-2">{t.member_review_info_section_title || "Informationen zur Prüfung"}</h3>
                        <InfoRow label={t.member_review_info_name || "Vor- und Nachname"} value={mockMember.name} href={`/member-overview/${params.memberId}`} />
                        <InfoRow label={t.member_review_info_id || "Zahnarzt-ID"} value={mockMember.dentistId} />
                        <InfoRow label={t.member_review_info_change_date || "Datum der Datenänderung"} value={mockMember.changeDate} />
                        <InfoRow label={t.member_review_info_chamber || "Kammerzugehörigkeit"} value={mockMember.chamber} />
                    </div>

                    <Separator className="my-6" />

                    <div>
                        <h3 className="text-lg font-semibold mb-2">{t.member_review_personal_data_title || "Persönliche Daten"}</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2 py-4 border-b">
                            <div><p className="text-sm font-semibold text-muted-foreground">Feld</p></div>
                            <div className="grid grid-cols-2">
                                <p className="text-sm font-semibold text-muted-foreground">Alt</p>
                                <p className="text-sm font-semibold text-muted-foreground">Neu</p>
                            </div>
                        </div>
                        {mockChanges.personal.map(change => (
                            <div key={change.field} className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2 py-4 border-b last:border-none">
                                <p className="text-sm font-medium">{t[change.labelKey] || change.labelKey}</p>
                                <div className="grid grid-cols-2 items-center">
                                    <div className="text-sm">{change.oldValue || <i className="text-muted-foreground">Nicht zutreffend</i>}</div>
                                    <div className="text-sm font-semibold text-primary">
                                        {change.newValue && typeof change.newValue === 'object' ? (
                                            <FileDisplay name={change.newValue.name} size={change.newValue.size} />
                                        ) : (
                                            change.newValue
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                     <Separator className="my-6" />

                    <div>
                        <h3 className="text-lg font-semibold mb-2">{t.member_review_prof_qual_title || "Berufliche Qualifikationen"}</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2 py-4 border-b">
                            <div><p className="text-sm font-semibold text-muted-foreground">Feld</p></div>
                            <div className="grid grid-cols-2">
                                <p className="text-sm font-semibold text-muted-foreground">Alt</p>
                                <p className="text-sm font-semibold text-muted-foreground">Neu</p>
                            </div>
                        </div>
                        {mockChanges.professional.map(change => (
                            <div key={change.field} className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2 py-4 border-b last:border-none">
                                <p className="text-sm font-medium">{t[change.labelKey] || change.labelKey}</p>
                                <div className="grid grid-cols-2 items-center">
                                    <div className="text-sm">{change.oldValue}</div>
                                    <div className="text-sm font-semibold text-primary">{change.newValue}</div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <Separator className="my-6" />

                    <div className="space-y-6">
                        <RadioGroup defaultValue="reject" className="flex flex-col sm:flex-row gap-4 sm:gap-8">
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="approve" id="r-approve" />
                                <Label htmlFor="r-approve">{t.member_review_approve_option || "Datenänderung genehmigen"}</Label>
                            </div>
                             <div className="flex items-center space-x-2">
                                <RadioGroupItem value="reject" id="r-reject" />
                                <Label htmlFor="r-reject">{t.member_review_reject_option || "Datenänderung zurückweisen"}</Label>
                            </div>
                             <div className="flex items-center space-x-2">
                                <RadioGroupItem value="deny" id="r-deny" />
                                <Label htmlFor="r-deny">{t.member_review_deny_option || "Datenänderung ablehnen"}</Label>
                            </div>
                        </RadioGroup>

                        <div>
                            <Label htmlFor="justification" className="font-semibold">{t.member_review_justification_label || "Begründung"}*</Label>
                            <Textarea 
                                id="justification" 
                                placeholder={t.member_review_justification_placeholder || "z. B. Fortbildungsnachweise fehlen"}
                                className="mt-2"
                                defaultValue={"z. B. Fortbildungsnachweise fehlen"}
                            />
                        </div>

                        <div className="flex items-center space-x-2">
                            <Checkbox id="confirm-check" />
                            <Label htmlFor="confirm-check" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                {t.member_review_confirm_checkbox || "Ich bestätige die Daten sorgfältig geprüft zu haben."}*
                            </Label>
                        </div>
                    </div>

                    <div className="flex justify-end gap-4 mt-8">
                        <Button variant="outline">{t.member_review_cancel_button || "ABBRECHEN"}</Button>
                        <Button className="bg-primary hover:bg-primary/90">{t.member_review_submit_button || "PRÜFUNG ABSENDEN"}</Button>
                    </div>

                </CardContent>
            </Card>
        </div>
    </AppLayout>
  );
}
