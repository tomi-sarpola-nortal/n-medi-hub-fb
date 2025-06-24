
"use client";

import { useEffect, useState } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { RepresentationStatusBadge } from '@/components/representations/RepresentationStatusBadge';
import Link from 'next/link';
import { PlusCircle, Loader2 } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/context/auth-context';
import { getRepresentationsForUser, updateRepresentationStatus } from '@/services/representationService';
import type { Representation } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { useParams } from 'next/navigation';
import { format } from 'date-fns';

const getClientTranslations = (locale: string) => {
    try {
        if (locale === 'de') {
            return require('../../../locales/de.json');
        }
        return require('../../../locales/en.json');
    } catch (e) {
        console.warn("Translation file not found, falling back to en");
        return require('../../../locales/en.json');
    }
};

const formatPeriod = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    const isSameDay = format(start, 'yyyy-MM-dd') === format(end, 'yyyy-MM-dd');
    
    if (isSameDay) {
        return `${format(start, 'dd.MM.yyyy, HH:mm')} - ${format(end, 'HH:mm')} Uhr`;
    }
    
    return `${format(start, 'dd.MM.yyyy, HH:mm')} - ${format(end, 'dd.MM.yyyy, HH:mm')}`;
};

const ConfirmationRequest = ({ request, t, onStatusChange }: { request: Representation, t: Record<string, string>, onStatusChange: (id: string, status: 'confirmed' | 'declined') => void }) => {
    const [isSubmitting, setIsSubmitting] = useState<'confirm' | 'decline' | null>(null);

    const handleConfirm = async () => {
        setIsSubmitting('confirm');
        await onStatusChange(request.id, 'confirmed');
        setIsSubmitting(null);
    };

    const handleDecline = async () => {
        setIsSubmitting('decline');
        await onStatusChange(request.id, 'declined');
        setIsSubmitting(null);
    };

    const period = formatPeriod(request.startDate, request.endDate);
    const details = `${period} (${request.durationHours} Stunden)`;

    return (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
                <p className="font-semibold">{request.representingPersonName}</p>
                <div className="text-sm text-muted-foreground">
                    <p>{details}</p>
                </div>
            </div>
            <div className="flex gap-2 flex-shrink-0 w-full sm:w-auto">
                <Button onClick={handleConfirm} disabled={!!isSubmitting} className="flex-1 sm:flex-none">
                    {isSubmitting === 'confirm' && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {t.representations_confirm_button || "CONFIRM"}
                </Button>
                <Button onClick={handleDecline} disabled={!!isSubmitting} variant="outline" className="flex-1 sm:flex-none">
                    {isSubmitting === 'decline' && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {t.representations_decline_button || "DECLINE"}
                </Button>
            </div>
        </div>
    );
};


export default function RepresentationsPage() {
    const { user, loading: authLoading } = useAuth();
    const { toast } = useToast();
    const params = useParams();
    const locale = typeof params?.locale === 'string' ? params.locale : 'en';

    const [t, setT] = useState<Record<string, string>>({});
    const [isLoading, setIsLoading] = useState(true);
    const [representations, setRepresentations] = useState<{
        performed: Representation[],
        pendingConfirmation: Representation[],
        wasRepresented: Representation[],
    }>({ performed: [], pendingConfirmation: [], wasRepresented: [] });

    useEffect(() => {
        setT(getClientTranslations(locale));
    }, [locale]);
    
    const fetchRepresentations = async () => {
        if (!user) return;
        setIsLoading(true);
        try {
            const data = await getRepresentationsForUser(user.id);
            setRepresentations(data);
        } catch (error) {
            console.error("Failed to fetch representations:", error);
            toast({ title: "Error", description: "Could not fetch representation data.", variant: "destructive" });
        } finally {
            setIsLoading(false);
        }
    };
    
    useEffect(() => {
        if (user) {
            fetchRepresentations();
        } else if (!authLoading) {
            setIsLoading(false);
        }
    }, [user, authLoading]);

    const handleStatusChange = async (representationId: string, status: 'confirmed' | 'declined') => {
        try {
            await updateRepresentationStatus(representationId, status);
            toast({
                title: "Success",
                description: `Representation has been ${status}.`,
            });
            // Refetch data to update the UI
            fetchRepresentations();
        } catch (error) {
            console.error(`Failed to ${status} representation:`, error);
            toast({
                title: "Error",
                description: "Could not update representation status.",
                variant: "destructive"
            });
        }
    };
    
    const pageTitle = t.representations_page_title || "My Representations";
    const pageIsLoading = authLoading || isLoading || Object.keys(t).length === 0;

    if (pageIsLoading) {
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
                <div className="flex items-start justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight font-headline">
                            {pageTitle}
                        </h1>
                         <div className="text-sm text-muted-foreground mt-2">
                            <Link href="/dashboard" className="hover:underline">{t.representations_breadcrumb_dashboard || "Dashboard"}</Link>
                            <span className="mx-1">/</span>
                            <span className="font-medium text-foreground">{t.representations_breadcrumb_current || "My Representations"}</span>
                        </div>
                    </div>
                    <Button className="flex items-center gap-2">
                        <PlusCircle className="h-5 w-5"/>
                        <span className="hidden sm:inline">{t.representations_new_button || "ENTER NEW REPRESENTATION"}</span>
                    </Button>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-xl font-headline">{t.representations_performed_title || "Overview of my performed representations"}</CardTitle>
                        <CardDescription>{t.representations_performed_desc || "Here you can see representations where you have covered for others."}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-1/4">{t.representations_table_header_period || "Period"}</TableHead>
                                    <TableHead>{t.representations_table_header_person || "Represented Person"}</TableHead>
                                    <TableHead>{t.representations_table_header_duration || "Duration"}</TableHead>
                                    <TableHead>{t.representations_table_header_status || "Status"}</TableHead>
                                    <TableHead>{t.representations_table_header_confirmation_date || "Confirmation Date"}</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {representations.performed.length > 0 ? representations.performed.map((rep) => (
                                    <TableRow key={rep.id}>
                                        <TableCell className="font-medium whitespace-pre-wrap">{formatPeriod(rep.startDate, rep.endDate)}</TableCell>
                                        <TableCell>{rep.representedPersonName}</TableCell>
                                        <TableCell>{rep.durationHours} Stunden</TableCell>
                                        <TableCell>
                                            <RepresentationStatusBadge status={rep.status as 'confirmed' | 'pending'}>
                                                {rep.status === 'confirmed' ? (t.representations_status_confirmed || 'Confirmed') : (t.representations_status_pending || 'Pending')}
                                            </RepresentationStatusBadge>
                                        </TableCell>
                                        <TableCell>{rep.confirmedAt ? format(new Date(rep.confirmedAt), 'dd.MM.yyyy') : '-'}</TableCell>
                                    </TableRow>
                                )) : (
                                    <TableRow>
                                        <TableCell colSpan={5} className="h-24 text-center">No performed representations found.</TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-xl font-headline">{t.representations_confirm_title || "Confirm representations"}</CardTitle>
                        <CardDescription>{t.representations_confirm_desc || "Here you can confirm representations where you were represented."}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {representations.pendingConfirmation.length > 0 ? representations.pendingConfirmation.map((req, index) => (
                            <div key={req.id}>
                                <ConfirmationRequest request={req} t={t} onStatusChange={handleStatusChange} />
                                {index < representations.pendingConfirmation.length - 1 && <Separator className="my-4"/>}
                            </div>
                        )) : (
                             <p className="text-sm text-muted-foreground text-center py-4">No pending confirmations.</p>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-xl font-headline">{t.representations_my_title || "Overview of my representations"}</CardTitle>
                        <CardDescription>{t.representations_my_desc || "Here you can view representations where you were represented by others."}</CardDescription>
                    </CardHeader>
                    <CardContent>
                       <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-1/4">{t.representations_table_header_period || "Period"}</TableHead>
                                    <TableHead>{t.representations_table_header_representing_person || "Representing Person"}</TableHead>
                                    <TableHead>{t.representations_table_header_duration || "Duration"}</TableHead>
                                    <TableHead>{t.representations_table_header_status || "Status"}</TableHead>
                                    <TableHead>{t.representations_table_header_confirmation_date || "Confirmation Date"}</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {representations.wasRepresented.length > 0 ? representations.wasRepresented.map((rep) => (
                                    <TableRow key={rep.id}>
                                        <TableCell className="font-medium whitespace-pre-wrap">{formatPeriod(rep.startDate, rep.endDate)}</TableCell>
                                        <TableCell>{rep.representingPersonName}</TableCell>
                                        <TableCell>{rep.durationHours} Stunden</TableCell>
                                        <TableCell>
                                            <RepresentationStatusBadge status={rep.status as 'confirmed' | 'pending'}>
                                                {rep.status === 'confirmed' ? (t.representations_status_confirmed || 'Confirmed') : (t.representations_status_pending || 'Pending')}
                                            </RepresentationStatusBadge>
                                        </TableCell>
                                        <TableCell>{rep.confirmedAt ? format(new Date(rep.confirmedAt), 'dd.MM.yyyy') : '-'}</TableCell>
                                    </TableRow>
                                )) : (
                                    <TableRow>
                                        <TableCell colSpan={5} className="h-24 text-center">No representations found where you were represented.</TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

                 <p className="text-xs text-muted-foreground text-center pt-4">
                    {t.representations_footer_note || "Representations can only be confirmed by the represented person. Your state chamber also has access to this data."}
                </p>

            </div>
        </AppLayout>
    );
}
