
"use client";

import { useEffect, useState, useMemo } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { RepresentationStatusBadge } from '@/components/representations/RepresentationStatusBadge';
import Link from 'next/link';
import { PlusCircle, Loader2 } from 'lucide-react';
import { useAuth } from '@/context/auth-context';
import { getRepresentationsForUser, updateRepresentationStatus } from '@/services/representationService';
import type { Representation } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { useParams } from 'next/navigation';
import { format } from 'date-fns';
import ConfirmRepresentationCard from '@/components/representations/ConfirmRepresentationCard';

const getClientTranslations = (locale: string) => {
    try {
        const page = locale === 'de' ? require('../../../../locales/de/representations.json') : require('../../../../locales/en/representations.json');
        return page;
    } catch (e) {
        console.warn("Translation file not found, falling back to en");
        return require('../../../../locales/en/representations.json');
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


export default function RepresentationsPage() {
    const { user, loading: authLoading } = useAuth();
    const { toast } = useToast();
    const params = useParams();
    const locale = typeof params.locale === 'string' ? params.locale : 'en';

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
    }, [user, authLoading, toast]);

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

    const receivedRepresentations = useMemo(() => {
        return representations.wasRepresented
            .filter(r => r.status !== 'pending')
            .sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());
    }, [representations.wasRepresented]);
    
    const performedRepresentations = useMemo(() => {
         return [...representations.performed].sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());
    }, [representations.performed]);

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
                            <Link href={`/${locale}/dashboard`} className="hover:underline">{t.representations_breadcrumb_dashboard || "Dashboard"}</Link>
                            <span className="mx-1">/</span>
                            <span className="font-medium text-foreground">{t.representations_breadcrumb_current || "My Representations"}</span>
                        </div>
                    </div>
                </div>

                <ConfirmRepresentationCard 
                    requests={representations.pendingConfirmation}
                    t={t}
                    onStatusChange={handleStatusChange}
                />

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
                                {receivedRepresentations.length > 0 ? receivedRepresentations.map((rep) => (
                                    <TableRow key={rep.id}>
                                        <TableCell className="font-medium whitespace-pre-wrap">{formatPeriod(rep.startDate, rep.endDate)}</TableCell>
                                        <TableCell>{rep.representingPersonName}</TableCell>
                                        <TableCell>{rep.durationHours} Stunden</TableCell>
                                        <TableCell>
                                            <RepresentationStatusBadge status={rep.status as 'confirmed' | 'pending' | 'declined'}>
                                                {t[`representations_status_${rep.status}`] || rep.status}
                                            </RepresentationStatusBadge>
                                        </TableCell>
                                        <TableCell>{rep.confirmedAt ? format(new Date(rep.confirmedAt), 'dd.MM.yyyy') : '-'}</TableCell>
                                    </TableRow>
                                )) : (
                                    <TableRow>
                                        <TableCell colSpan={5} className="h-24 text-center">No representations found.</TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

                 <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                         <div>
                            <CardTitle className="text-xl font-headline">{t.representations_performed_title || "Overview of my performed representations"}</CardTitle>
                            <CardDescription>{t.representations_performed_desc || "Here you can see representations where you have covered for others."}</CardDescription>
                        </div>
                        <Button className="flex items-center gap-2 flex-shrink-0" asChild>
                            <Link href={`/${locale}/representations/new`}>
                                <PlusCircle className="h-5 w-5"/>
                                <span className="hidden sm:inline">{t.representations_new_button || "ENTER NEW REPRESENTATION"}</span>
                            </Link>
                        </Button>
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
                                {performedRepresentations.length > 0 ? performedRepresentations.map((rep) => (
                                    <TableRow key={rep.id}>
                                        <TableCell className="font-medium whitespace-pre-wrap">{formatPeriod(rep.startDate, rep.endDate)}</TableCell>
                                        <TableCell>{rep.representedPersonName}</TableCell>
                                        <TableCell>{rep.durationHours} Stunden</TableCell>
                                        <TableCell>
                                            <RepresentationStatusBadge status={rep.status as 'confirmed' | 'pending' | 'declined'}>
                                                {t[`representations_status_${rep.status}`] || rep.status}
                                            </RepresentationStatusBadge>
                                        </TableCell>
                                        <TableCell>{rep.confirmedAt ? format(new Date(rep.confirmedAt), 'dd.MM.yyyy') : '-'}</TableCell>
                                    </TableRow>
                                )) : (
                                    <TableRow>
                                        <TableCell colSpan={5} className="h-24 text-center">No representations found.</TableCell>
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
