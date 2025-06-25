
"use client";

import AppLayout from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, FileText, Loader2, GitMerge } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState, useMemo } from 'react';
import { Separator } from '@/components/ui/separator';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import type { Person } from '@/lib/types';
import { getPersonById, reviewPerson } from '@/services/personService';
import { useToast } from '@/hooks/use-toast';
import { useRouter, useParams } from 'next/navigation';

// Helper for client-side translations
const getClientTranslations = (locale: string) => {
  try {
    const page = locale === 'de' ? require('../../../../../../locales/de/member-overview.json') : require('../../../../../../locales/en/member-overview.json');
    const register = locale === 'de' ? require('../../../../../../locales/de/register.json') : require('../../../../../../locales/en/register.json');
    return {...page, ...register};
  } catch (e) {
    console.warn("Translation file not found, falling back to en");
    const page = require('../../../../../../locales/en/member-overview.json');
    const register = require('../../../../../../locales/en/register.json');
    return {...page, ...register};
  }
};

const DataRow = ({ label, value }: { label: string; value?: string | null | string[] }) => (
  <div className="py-2 border-b last:border-b-0">
    <p className="text-sm text-muted-foreground">{label}</p>
    <p className="text-base font-medium mt-1">
        {Array.isArray(value) ? value.join(', ') : (value || <span className="italic text-muted-foreground">Nicht angegeben</span>)}
    </p>
  </div>
);

const DocumentRow = ({ label, docName, docUrl }: { label: string; docName?: string | null; docUrl?: string | null }) => (
    <div>
        <p className="text-sm font-medium mb-1">{label}</p>
        {docName && docUrl ? (
        <a href={docUrl} target="_blank" rel="noopener noreferrer" className="bg-muted/50 p-3 rounded-md flex items-center gap-3 hover:bg-muted cursor-pointer">
            <FileText className="h-6 w-6 text-primary flex-shrink-0" />
            <div>
                <p className="text-sm font-semibold text-foreground">{docName}</p>
            </div>
        </a>
        ) : (
        <p className="text-sm text-muted-foreground italic">-</p>
        )}
    </div>
);

export default function DataReviewPage() {
  const params = useParams<{ memberId: string; locale: string }>();
  const { memberId, locale } = params;
  const router = useRouter();
  const { toast } = useToast();
  const [t, setT] = useState<Record<string, string>>({});
  
  const [person, setPerson] = useState<Person | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [reviewDecision, setReviewDecision] = useState('approve');
  const [justification, setJustification] = useState('');
  const [isConfirmed, setIsConfirmed] = useState(false);

  useEffect(() => {
    setT(getClientTranslations(locale));
    async function fetchPerson() {
        try {
            const fetchedPerson = await getPersonById(memberId);
            if (fetchedPerson && (fetchedPerson.status === 'pending' || !!fetchedPerson.pendingData)) {
                setPerson(fetchedPerson);
            } else {
                toast({ title: "Review Not Possible", description: "This member has no pending registration or data changes.", variant: "destructive" });
                router.replace(`/${locale}/member-overview`);
            }
        } catch (error) {
            console.error("Failed to fetch person data:", error);
            toast({ title: "Error", description: "Failed to load member data.", variant: "destructive" });
            router.replace(`/${locale}/member-overview`);
        } finally {
            setIsLoading(false);
        }
    }
    fetchPerson();
  }, [locale, memberId, router, toast]);

  const handleSubmit = async () => {
    if (!person || !isConfirmed) {
        if (!isConfirmed) {
             toast({ title: "Confirmation required", description: "You must confirm that you have checked the data.", variant: "destructive" });
        }
        return;
    }
    
    setIsSubmitting(true);
    try {
        await reviewPerson(person.id, reviewDecision as 'approve' | 'deny' | 'reject', justification);
        toast({ title: "Success", description: "The review has been submitted successfully." });
        router.push(`/${locale}/member-overview`);
    } catch (error) {
        console.error("Failed to submit review:", error);
        toast({ title: "Submission Failed", description: (error as Error).message || "An error occurred while submitting the review.", variant: "destructive" });
    } finally {
        setIsSubmitting(false);
    }
  };

  const changedFields = useMemo(() => {
    if (!person || !person.pendingData) return [];
    return Object.keys(person.pendingData).map(key => ({
      field: key,
      oldValue: (person as any)[key],
      newValue: (person.pendingData as any)[key],
    }));
  }, [person]);


  const pageTitle = (person?.pendingData ? t.member_review_page_title_review : "Registrierung prüfen") || "Review";

  if (isLoading || !person || !t) {
    return (
        <AppLayout pageTitle="Loading..." locale={locale}>
            <div className="flex-1 space-y-6 p-4 md:p-8 flex justify-center items-center">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
            </div>
        </AppLayout>
    );
  }

  const renderRegistrationReview = () => (
      <>
        {/* Same UI as before for registration review */}
        <div className="space-y-8">
            <section>
                <h3 className="text-lg font-semibold font-headline mb-3 text-primary">{t.member_review_personal_data_title || "Persönliche Daten"}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8">
                    <DataRow label={t.register_step2_label_title || "Title"} value={person.title} />
                    <DataRow label={t.register_step2_label_firstName || "First Name"} value={person.firstName} />
                    <DataRow label={t.register_step2_label_lastName || "Last Name"} value={person.lastName} />
                </div>
            </section>
        </div>
      </>
  );

  const renderDataChangeReview = () => {
    // Helper to format values for display
    const formatValue = (value: any) => {
        if (value === null || value === undefined || value === '') return <span className="italic text-muted-foreground">empty</span>;
        if (Array.isArray(value)) return value.join(', ');
        return String(value);
    };
    
    return (
        <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg font-headline">{t.member_review_info_name || "First and Last Name"}</CardTitle>
                    </CardHeader>
                    <CardContent>{person.name}</CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg font-headline">{t.member_review_info_id || "Dentist ID"}</CardTitle>
                    </CardHeader>
                    <CardContent>{person.dentistId || '-'}</CardContent>
                </Card>
            </div>
            
            <div className="mt-6 border rounded-lg">
                <div className="grid grid-cols-4 gap-4 px-4 py-2 font-semibold text-muted-foreground bg-muted/50 border-b">
                    <div className="col-span-1">{t.member_review_column_field || "Field"}</div>
                    <div className="col-span-1">{t.member_review_old_data || "Old"}</div>
                    <div className="col-span-1">{t.member_review_new_data || "New"}</div>
                    <div className="col-span-1">{t.member_review_column_status || "Status"}</div>
                </div>
                {changedFields.map(diff => {
                    const isUpdated = JSON.stringify(diff.oldValue) !== JSON.stringify(diff.newValue);
                    return (
                        <div key={diff.field} className="grid grid-cols-4 gap-4 px-4 py-3 border-b last:border-b-0 items-start">
                            <div className="col-span-1 text-sm font-medium text-foreground">{t[`register_step2_label_${diff.field}`] || t[`register_step4_label_${diff.field}`] || t[`register_step5_label_${diff.field}`] || diff.field}</div>
                            <div className="col-span-1 text-sm text-muted-foreground">{formatValue(diff.oldValue)}</div>
                            <div className="col-span-1 text-sm text-foreground">{formatValue(diff.newValue)}</div>
                            <div className={`col-span-1 text-sm ${isUpdated ? 'font-bold text-primary' : 'text-muted-foreground'}`}>
                                {isUpdated ? (t.member_review_status_updated || 'Updated') : (t.member_review_status_no_change || 'No Change')}
                            </div>
                        </div>
                    );
                })}
            </div>
        </>
    );
  };

  return (
    <AppLayout pageTitle={pageTitle} locale={locale}>
        <div className="flex-1 space-y-6 p-4 md:p-8">
             <div className="flex items-center justify-between">
                <div>
                     <h1 className="text-3xl font-bold tracking-tight font-headline flex items-center gap-2">
                        <Link href={`/${locale}/member-overview/${memberId}`} className="hidden lg:block">
                            <ArrowLeft className="h-6 w-6 text-muted-foreground"/>
                        </Link>
                        {pageTitle}
                    </h1>
                     <div className="text-sm text-muted-foreground mt-2">
                        <Link href={`/${locale}/dashboard`} className="hover:underline">{t.member_overview_breadcrumb_dashboard || "Dashboard"}</Link>
                        <span className="mx-1">/</span>
                        <Link href={`/${locale}/member-overview`} className="hover:underline">{t.member_overview_breadcrumb_current || "Member Overview"}</Link>
                        <span className="mx-1">/</span>
                        <Link href={`/${locale}/member-overview/${memberId}`} className="hover:underline">{person.name}</Link>
                        <span className="mx-1">/</span>
                        <span className="font-medium text-foreground">{t.member_review_breadcrumb_review || "Review Data Change"}</span>
                    </div>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="text-xl font-headline">{person.name}</CardTitle>
                    <CardDescription>{t.member_review_page_subtitle || "Bitte überprüfen Sie die Daten nach Vollständigkeit und Richtigkeit."}</CardDescription>
                </CardHeader>
                <CardContent>
                    {person.pendingData ? renderDataChangeReview() : renderRegistrationReview()}
                    
                    <Separator className="my-8" />

                    <div className="space-y-6">
                        <RadioGroup 
                            value={reviewDecision}
                            onValueChange={setReviewDecision}
                            className="flex flex-col sm:flex-row gap-4 sm:gap-8"
                        >
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="approve" id="r-approve" />
                                <Label htmlFor="r-approve">{t.member_review_approve_option || "Approve data change"}</Label>
                            </div>
                             <div className="flex items-center space-x-2">
                                <RadioGroupItem value="reject" id="r-reject" />
                                <Label htmlFor="r-reject">{t.member_review_reject_option || "Reject data change"}</Label>
                            </div>
                             <div className="flex items-center space-x-2">
                                <RadioGroupItem value="deny" id="r-deny" />
                                <Label htmlFor="r-deny">{t.member_review_deny_option || "Deny data change"}</Label>
                            </div>
                        </RadioGroup>

                        {reviewDecision !== 'approve' && (
                            <div>
                                <Label htmlFor="justification" className="font-semibold">{t.member_review_justification_label || "Begründung"}*</Label>
                                <Textarea 
                                    id="justification" 
                                    placeholder={t.member_review_justification_placeholder || "z. B. Fortbildungsnachweise fehlen"}
                                    className="mt-2"
                                    value={justification}
                                    onChange={(e) => setJustification(e.target.value)}
                                    required={reviewDecision !== 'approve'}
                                />
                            </div>
                        )}

                        <div className="flex items-center space-x-2">
                            <Checkbox id="confirm-check" checked={isConfirmed} onCheckedChange={(checked) => setIsConfirmed(checked as boolean)} />
                            <Label htmlFor="confirm-check" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                {t.member_review_confirm_checkbox || "Ich bestätige die Daten sorgfältig geprüft zu haben."}*
                            </Label>
                        </div>
                    </div>

                    <div className="flex justify-end gap-4 mt-8">
                        <Button variant="outline" asChild><Link href={`/${locale}/member-overview/${memberId}`}>{t.member_review_cancel_button || "ABBRECHEN"}</Link></Button>
                        <Button className="bg-primary hover:bg-primary/90" onClick={handleSubmit} disabled={isSubmitting || !isConfirmed}>
                            {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                            {t.member_review_submit_button || "PRÜFUNG ABSENDEN"}
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    </AppLayout>
  );
}

