
"use client";

import AppLayout from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, FileText, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Separator } from '@/components/ui/separator';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import type { Person } from '@/lib/types';
import { getPersonById, reviewPerson } from '@/services/personService';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';

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


export default function DataReviewPage({ params }: DataReviewPageProps) {
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
            if (fetchedPerson && fetchedPerson.status === 'pending') {
                setPerson(fetchedPerson);
            } else {
                // Redirect if member not found or not pending review
                toast({ title: "Review Not Possible", description: "This member is not pending review.", variant: "destructive" });
                router.replace('/member-overview');
            }
        } catch (error) {
            console.error("Failed to fetch person data:", error);
            toast({ title: "Error", description: "Failed to load member data.", variant: "destructive" });
            router.replace('/member-overview');
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
        await reviewPerson(person.id, reviewDecision as any, justification);
        toast({ title: "Success", description: "The review has been submitted successfully." });
        router.push('/member-overview');
    } catch (error) {
        console.error("Failed to submit review:", error);
        toast({ title: "Submission Failed", description: "An error occurred while submitting the review.", variant: "destructive" });
    } finally {
        setIsSubmitting(false);
    }
  };


  const pageTitle = t.member_review_page_title_review || "Datenänderung prüfen";

  if (isLoading || !person) {
    return (
        <AppLayout pageTitle="Loading..." locale={locale}>
            <div className="flex-1 space-y-6 p-4 md:p-8 flex justify-center items-center">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
            </div>
        </AppLayout>
    );
  }

  return (
    <AppLayout pageTitle={pageTitle} locale={locale}>
        <div className="flex-1 space-y-6 p-4 md:p-8">
             <div className="flex items-center justify-between">
                <div>
                     <h1 className="text-3xl font-bold tracking-tight font-headline flex items-center gap-2">
                        <Link href={`/member-overview/${memberId}`} className="hidden lg:block">
                            <ArrowLeft className="h-6 w-6 text-muted-foreground"/>
                        </Link>
                        {pageTitle}
                    </h1>
                     <div className="text-sm text-muted-foreground mt-2">
                        <Link href="/dashboard" className="hover:underline">{t.member_overview_breadcrumb_dashboard || "Dashboard"}</Link>
                        <span className="mx-1">/</span>
                        <Link href="/member-overview" className="hover:underline">{t.member_overview_breadcrumb_current || "Member Overview"}</Link>
                        <span className="mx-1">/</span>
                        <Link href={`/member-overview/${memberId}`} className="hover:underline">{person.name}</Link>
                        <span className="mx-1">/</span>
                        <span className="font-medium text-foreground">{t.member_review_breadcrumb_review || "Datenänderung prüfen"}</span>
                    </div>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="text-xl font-headline">{person.name}</CardTitle>
                    <CardDescription>{t.member_review_page_subtitle || "Bitte überprüfen Sie die Daten nach Vollständigkeit und Richtigkeit."}</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-8">
                        {/* Personal Data Section */}
                        <section>
                            <h3 className="text-lg font-semibold font-headline mb-3 text-primary">{t.member_review_personal_data_title || "Persönliche Daten"}</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8">
                                <DataRow label={t.register_step2_label_title || "Title"} value={person.title} />
                                <DataRow label={t.register_step2_label_firstName || "First Name"} value={person.firstName} />
                                <DataRow label={t.register_step2_label_lastName || "Last Name"} value={person.lastName} />
                                <DataRow label={t.register_step2_label_dateOfBirth || "Date of Birth"} value={person.dateOfBirth} />
                                <DataRow label={t.register_step2_label_placeOfBirth || "Place of Birth"} value={person.placeOfBirth} />
                                <DataRow label={t.register_step2_label_nationality || "Nationality"} value={person.nationality} />
                                <DataRow label={t.register_step2_label_streetAddress || "Street and House Number"} value={person.streetAddress} />
                                <DataRow label={t.register_step2_label_postalCode || "Postal Code"} value={person.postalCode} />
                                <DataRow label={t.register_step2_label_city || "City"} value={person.city} />
                                <DataRow label={t.register_step2_label_stateOrProvince || "State/Province"} value={person.stateOrProvince} />
                                <DataRow label={t.register_step2_label_phoneNumber || "Phone Number"} value={person.phoneNumber} />
                                <DataRow label={t.member_review_email_address || "Email Address"} value={person.email} />
                            </div>
                        </section>

                        {/* Professional Qualifications Section */}
                        <section>
                            <h3 className="text-lg font-semibold font-headline mb-3 text-primary">{t.member_review_prof_qual_title || "Berufliche Qualifikationen"}</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8">
                                <DataRow label={t.register_step4_label_prof_title || "Current Professional Title"} value={person.currentProfessionalTitle} />
                                <DataRow label={t.register_step4_label_specializations || "Specializations"} value={person.specializations} />
                                <DataRow label={t.register_step4_label_languages || "Languages"} value={person.languages} />
                                <DataRow label={t.register_step4_label_graduation_date || "Graduation Date"} value={person.graduationDate} />
                                <DataRow label={t.register_step4_label_university || "University"} value={person.university} />
                                <DataRow label={t.register_step4_label_approbation_number || "Approbation Number"} value={person.approbationNumber} />
                                <DataRow label={t.register_step4_label_approbation_date || "Approbation Date"} value={person.approbationDate} />
                            </div>
                        </section>

                         {/* Practice Information Section */}
                        <section>
                            <h3 className="text-lg font-semibold font-headline mb-3 text-primary">{t.member_review_practice_info_title || "Informationen zur Ordination"}</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8">
                                <DataRow label={t.register_step5_label_practiceName || "Practice Name"} value={person.practiceName} />
                                <DataRow label={t.register_step5_label_practiceStreetAddress || "Practice Street Address"} value={person.practiceStreetAddress} />
                                <DataRow label={t.register_step5_label_practicePostalCode || "Practice Postal Code"} value={person.practicePostalCode} />
                                <DataRow label={t.register_step5_label_practiceCity || "Practice City"} value={person.practiceCity} />
                                <DataRow label={t.register_step5_label_practicePhoneNumber || "Practice Phone Number"} value={person.practicePhoneNumber} />
                                <DataRow label={t.register_step5_label_practiceFaxNumber || "Practice Fax Number"} value={person.practiceFaxNumber} />
                                <DataRow label={t.register_step5_label_practiceEmail || "Practice Email"} value={person.practiceEmail} />
                                <DataRow label={t.register_step5_label_practiceWebsite || "Practice Website"} value={person.practiceWebsite} />
                                <DataRow label={t.register_step5_label_healthInsuranceContracts || "Health Insurance Contracts"} value={person.healthInsuranceContracts} />
                            </div>
                        </section>
                        
                        {/* Documents Section */}
                        <section>
                            <h3 className="text-lg font-semibold font-headline mb-3 text-primary">{t.member_review_documents_title || "Dokumente"}</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <DocumentRow label={t.register_step2_label_idDocument || "ID Card or Passport"} docName={person.idDocumentName} docUrl={person.idDocumentUrl} />
                                <DocumentRow label={t.register_step4_label_diploma || "Diploma/Certificate"} docName={person.diplomaName} docUrl={person.diplomaUrl} />
                                <DocumentRow label={t.register_step4_label_approbation_cert || "Approbation Certificate"} docName={person.approbationCertificateName} docUrl={person.approbationCertificateUrl} />
                                <DocumentRow label={t.register_step4_label_specialist_recognition || "Specialist Recognition"} docName={person.specialistRecognitionName} docUrl={person.specialistRecognitionUrl} />
                            </div>
                        </section>
                    </div>

                    <Separator className="my-8" />

                    <div className="space-y-6">
                        <RadioGroup 
                            value={reviewDecision}
                            onValueChange={setReviewDecision}
                            className="flex flex-col sm:flex-row gap-4 sm:gap-8"
                        >
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
                        <Button variant="outline" asChild><Link href={`/member-overview/${memberId}`}>{t.member_review_cancel_button || "ABBRECHEN"}</Link></Button>
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
