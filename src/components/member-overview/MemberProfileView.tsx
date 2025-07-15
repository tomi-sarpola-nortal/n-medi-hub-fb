
"use client";

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import AppLayout from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, AlertTriangle, FileText } from 'lucide-react';
import Link from 'next/link';
import { StatusBadge } from '@/components/ui/StatusBadge';
import type { Person, TrainingHistory, UserRole } from '@/lib/types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { format } from 'date-fns';
import MemberRepresentationsTab from '@/components/member-overview/MemberRepresentationsTab';
import MemberAdminActions from '@/components/member-overview/MemberInactiveAction';
import ResetPasswordButton from '@/components/member-overview/ResetPasswordButton';
import { useAuth } from '@/context/auth-context';
import { logGeneralAudit } from '@/app/actions/auditActions';

interface MemberProfileViewProps {
  person: Person;
  trainingHistory: TrainingHistory[];
  t: Record<string, string>;
  locale: string;
  defaultTab?: string;
}

const DataRow = ({ label, value }: { label: string; value?: string | null }) => (
  <div>
    <p className="text-xs text-muted-foreground">{label}</p>
    <p className="text-base font-medium">{value || '-'}</p>
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

export default function MemberProfileView({ person, trainingHistory, t, locale, defaultTab }: MemberProfileViewProps) {
  const { user: viewer } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState(defaultTab || 'stammdaten');
  const [repsViewLogged, setRepsViewLogged] = useState(false);

  useEffect(() => {
    // Log the initial view of master data and training history
    if (viewer && person && viewer.id !== person.id) {
        const auditor = { id: viewer.id, name: viewer.name, role: viewer.role as UserRole, bureau: viewer.stateBureauId || 'wien' };
        const impacted = { id: person.id, name: person.name };
        
        logGeneralAudit({
            auditor,
            impacted,
            operation: 'read',
            collectionName: 'persons',
            fieldName: ['profile', 'trainingHistory'],
            details: 'Viewed member profile page (master data, training history).'
        });
    }
  }, [viewer, person]);

  const handleTabChange = (tabValue: string) => {
    setActiveTab(tabValue);
    if (tabValue === 'vertretungen' && !repsViewLogged && viewer && person && viewer.id !== person.id) {
        const auditor = { id: viewer.id, name: viewer.name, role: viewer.role as UserRole, bureau: viewer.stateBureauId || 'wien' };
        const impacted = { id: person.id, name: person.name };

        logGeneralAudit({
            auditor,
            impacted,
            operation: 'read',
            collectionName: 'representations',
            fieldName: 'all',
            details: 'Viewed member representations tab.'
        });
        setRepsViewLogged(true);
    }
  };


  const pageTitle = t.member_review_page_title?.replace('{memberName}', person.name) || person.name;
  
  const statusKeyMap: Record<Person['status'], string> = {
      'active': 'member_list_status_active',
      'pending': 'member_list_status_pending',
      'inactive': 'member_list_status_inactive',
      'rejected': 'member_list_status_inactive',
  };

  const needsReview = person.status === 'pending' || !!person.pendingData;
  const isNewRegistration = person.status === 'pending' && !person.pendingData;

  return (
    <AppLayout pageTitle={pageTitle} locale={locale}>
        <div className="flex-1 space-y-6 p-4 md:p-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight font-headline flex items-center gap-2">
                        <Link href={`/${locale}/member-overview`} className="hidden lg:block">
                            <ArrowLeft className="h-6 w-6 text-muted-foreground"/>
                        </Link>
                        {pageTitle}
                    </h1>
                     <div className="text-sm text-muted-foreground mt-2">
                        <Link href={`/${locale}/dashboard`} className="hover:underline">{t.member_overview_breadcrumb_dashboard || "Dashboard"}</Link>
                        <span className="mx-1">/</span>
                        <Link href={`/${locale}/member-overview`} className="hover:underline">{t.member_overview_breadcrumb_current || "Member Overview"}</Link>
                        <span className="mx-1">/</span>
                        <span className="font-medium text-foreground">{person.name}</span>
                    </div>
                </div>
            </div>

             <Tabs defaultValue={activeTab} className="w-full" onValueChange={handleTabChange}>
                <TabsList className="grid w-full grid-cols-3 md:w-[400px]">
                    <TabsTrigger value="stammdaten">{t.member_review_stammdaten_tab || "Stammdaten"}</TabsTrigger>
                    <TabsTrigger value="fortbildungen">{t.member_review_fortbildungen_tab || "Fortbildungen"}</TabsTrigger>
                    <TabsTrigger value="vertretungen">{t.member_review_vertretungen_tab || "Vertretungen"}</TabsTrigger>
                </TabsList>
                <TabsContent value="stammdaten" className="mt-6">
                    <Card>
                        <CardContent className="p-4 grid grid-cols-2 md:grid-cols-5 gap-4 text-center">
                            <div>
                                <p className="text-xs font-semibold uppercase text-muted-foreground">{t.member_review_stats_id || "Doctor-ID"}</p>
                                <p className="text-lg font-bold">{person.dentistId || '-'}</p>
                            </div>
                             <div>
                                <p className="text-xs font-semibold uppercase text-muted-foreground">{t.member_review_stats_points || "Training Points"}</p>
                                <p className="text-lg font-bold">{person.educationPoints || '0'}/150</p>
                            </div>
                            <div>
                                <p className="text-xs font-semibold uppercase text-muted-foreground">{t.member_review_stats_hours || "Rep. Hours"}</p>
                                <p className="text-lg font-bold">{'-'}</p>
                            </div>
                            <div>
                                <p className="text-xs font-semibold uppercase text-muted-foreground">{t.member_review_stats_status || "Status"}</p>
                                <StatusBadge status={person.status}>{t[statusKeyMap[person.status]] || person.status}</StatusBadge>
                            </div>
                            <div>
                                <p className="text-xs font-semibold uppercase text-muted-foreground">{t.member_review_stats_last_update || "Last Data Confirmation"}</p>
                                <p className="text-lg font-bold">{person.updatedAt || '-'}</p>
                            </div>
                        </CardContent>
                    </Card>

                    {needsReview && (
                        <div className="mt-6 p-4 bg-amber-50 border border-amber-300 rounded-md flex flex-col sm:flex-row items-start sm:items-center gap-4">
                            <AlertTriangle className="h-8 w-8 text-amber-500 flex-shrink-0"/>
                            <div className="flex-grow">
                                <p className="font-medium">
                                    {isNewRegistration 
                                        ? (t.member_review_new_registration_alert_text || "This new member registration is awaiting approval. Please review the submitted data.") 
                                        : (t.member_review_alert_text || "This member has recently submitted changes to their master data. Please review them. You can still see the last approved data here.")
                                    }
                                </p>
                            </div>
                            <Button asChild className="bg-primary hover:bg-primary/90 w-full sm:w-auto mt-2 sm:mt-0">
                            <Link href={`/${locale}/member-overview/${person.id}/review`}>{t.member_review_alert_button || "PERFORM REVIEW"}</Link>
                            </Button>
                        </div>
                    )}


                    <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-1 space-y-6">
                            <Card>
                                <CardHeader><CardTitle>{t.member_review_personal_data_title || "Personal Data"}</CardTitle></CardHeader>
                                <CardContent className="space-y-4">
                                    <DataRow label={t.member_list_table_header_id || "Doctor-ID"} value={person.dentistId} />
                                    <DataRow label={t.register_step2_label_title || "Title"} value={person.title} />
                                    <DataRow label={t.register_step2_label_firstName || "First Name"} value={person.firstName} />
                                    <DataRow label={t.register_step2_label_lastName || "Last Name"} value={person.lastName} />
                                    <DataRow label={t.register_step2_label_dateOfBirth || "Date of Birth"} value={person.dateOfBirth} />
                                    <DataRow label={t.register_step2_label_placeOfBirth || "Place of Birth"} value={person.placeOfBirth} />
                                    <DataRow label={t.register_step2_label_nationality || "Region of Origin"} value={person.nationality} />
                                    <DataRow label={t.member_review_residential_address || "Residential Address"} value={`${person.streetAddress}, ${person.postalCode} ${person.city}`} />
                                    <DataRow label={t.register_step2_label_phoneNumber || "Phone Number"} value={person.phoneNumber} />
                                    <DataRow label={t.member_review_email_address || "Email Address"} value={person.email} />
                                    {viewer && viewer.role === 'lk_member' && (
                                        <ResetPasswordButton person={person} t={t} locale={locale} />
                                    )}
                                </CardContent>
                            </Card>

                             <Card>
                                <CardHeader><CardTitle>{t.member_review_documents_title || "Documents"}</CardTitle></CardHeader>
                                <CardContent className="space-y-4">
                                     <DocumentRow label={t.register_step2_label_idDocument || "ID Card or Passport"} docName={person.idDocumentName} docUrl={person.idDocumentUrl} />
                                     <DocumentRow label={t.register_step4_label_diploma || "Diploma / Certificate of Medical Studies"} docName={person.diplomaName} docUrl={person.diplomaUrl} />
                                     <DocumentRow label={t.register_step4_label_approbation_cert || "Approbation Certificate"} docName={person.approbationCertificateName} docUrl={person.approbationCertificateUrl} />
                                     <DocumentRow label={t.register_step4_label_specialist_recognition || "Medical Specialist Recognition"} docName={person.specialistRecognitionName} docUrl={person.specialistRecognitionUrl} />
                                </CardContent>
                            </Card>
                        </div>
                        <div className="lg:col-span-2 space-y-6">
                            <Card>
                                <CardHeader><CardTitle>{t.member_review_prof_qual_title || "Professional Qualifications"}</CardTitle></CardHeader>
                                <CardContent className="space-y-4">
                                    <DataRow label={t.register_step4_label_prof_title || "Current Professional Title"} value={person.currentProfessionalTitle} />
                                    <DataRow label={t.register_step4_label_specializations || "Specializations/Focus Areas"} value={person.specializations?.join(', ')} />
                                    <DataRow label={t.register_step4_label_languages || "Languages"} value={person.languages?.join(', ')} />
                                    <DataRow label={t.register_step4_label_graduation_date || "Date of Graduation"} value={person.graduationDate} />
                                    <DataRow label={t.register_step4_label_university || "University/College"} value={person.university} />
                                    <DataRow label={t.register_step4_label_approbation_number || "Approbation Number"} value={person.approbationNumber} />
                                    <DataRow label={t.register_step4_label_approbation_date || "Date of Approbation"} value={person.approbationDate} />
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader><CardTitle>{t.member_review_practice_info_title || "Practice Information"}</CardTitle></CardHeader>
                                <CardContent className="space-y-4">
                                    <DataRow label={t.register_step5_label_practiceName || "Name of Practice/Clinic"} value={person.practiceName} />
                                    <DataRow label={t.member_review_practice_address || "Practice Address"} value={`${person.practiceStreetAddress}, ${person.practicePostalCode} ${person.practiceCity}`} />
                                    <DataRow label={t.register_step5_label_practicePhoneNumber || "Practice Phone Number"} value={person.practicePhoneNumber} />
                                    <DataRow label={t.register_step5_label_practiceFaxNumber || "Practice Fax Number"} value={person.practiceFaxNumber} />
                                    <DataRow label={t.register_step5_label_practiceEmail || "Practice Email"} value={person.practiceEmail} />
                                    <DataRow label={t.register_step5_label_practiceWebsite || "Practice Website"} value={person.practiceWebsite} />
                                    <DataRow label={t.register_step5_label_healthInsuranceContracts || "Health Insurance Contracts"} value={person.healthInsuranceContracts?.join(', ')} />
                                </CardContent>
                            </Card>
                        </div>
                    </div>

                    <Card className="border-destructive mt-6">
                        <CardHeader>
                            <div className="flex items-center gap-3">
                            <AlertTriangle className="h-6 w-6 text-destructive" />
                            <CardTitle className="text-destructive">{t.settings_danger_zone_title || "Danger Zone"}</CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <MemberAdminActions member={person} t={t} />
                        </CardContent>
                    </Card>
                </TabsContent>
                <TabsContent value="fortbildungen" className="mt-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>{t.fortbildungshistorie_title || "Training History"}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>{t.fortbildungshistorie_table_date || "Date"}</TableHead>
                                        <TableHead>{t.fortbildungshistorie_table_title || "Training Title"}</TableHead>
                                        <TableHead>{t.fortbildungshistorie_table_category || "Category"}</TableHead>
                                        <TableHead className="text-right">{t.fortbildungshistorie_table_points || "Points"}</TableHead>
                                        <TableHead>{t.fortbildungshistorie_table_organizer || "Organizer"}</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {trainingHistory.length > 0 ? trainingHistory.map((item) => (
                                    <TableRow key={item.id}>
                                        <TableCell className="font-medium">{format(new Date(item.date), 'dd.MM.yyyy')}</TableCell>
                                        <TableCell>{item.title}</TableCell>
                                        <TableCell>{item.category}</TableCell>
                                        <TableCell className="text-right">{item.points}</TableCell>
                                        <TableCell>{item.organizer}</TableCell>
                                    </TableRow>
                                    )) : (
                                        <TableRow>
                                            <TableCell colSpan={5} className="h-24 text-center">
                                                No training history found for this member.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>
                <TabsContent value="vertretungen" className="mt-6">
                    <MemberRepresentationsTab member={person} t={t} />
                </TabsContent>
             </Tabs>
        </div>
    </AppLayout>
  );
}
