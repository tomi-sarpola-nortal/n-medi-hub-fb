
"use client";

import { useEffect, useState, useMemo, useCallback } from 'react';
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
import { format } from 'date-fns';
import ConfirmRepresentationCard from '@/components/representations/ConfirmRepresentationCard';
import { Badge } from '@/components/ui/badge';
import { useClientTranslations } from '@/hooks/use-client-translations';

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
    const { t, isLoading: translationsLoading, locale } = useClientTranslations(['representations', 'dashboard']);

    const [isLoading, setIsLoading] = useState(true);
    const [representations, setRepresentations] = useState<{
        performed: Representation[],
        pendingConfirmation: Representation[],
        wasRepresented: Representation[],
    }>({ performed: [], pendingConfirmation: [], wasRepresented: [] });

    const fiveDaysAgo = useMemo(() => {
        const d = new Date();
        d.setDate(d.getDate() - 5);
        return d;
    }, []);

    const fetchRepresentations = useCallback(async () => {
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
    }, [user, toast]);
    
    useEffect(() => {
        if (user) {
            fetchRepresentations();
        } else if (!authLoading) {
            setIsLoading(false);
        }
    }, [user, authLoading, fetchRepresentations]);

    const handleStatusChange = async (representationId: string, status: 'confirmed' | 'declined') => {
        try {
            await updateRepresentationStatus(representationId, status, locale);
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

    const pageTitle = t('representations_page_title');
    const pageIsLoading = authLoading || isLoading || translationsLoading;

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
                            <Link href={`/${locale}/dashboard`} className="hover:underline">{t('representations_breadcrumb_dashboard')}</Link>
                            <span className="mx-1">/</span>
                            <span className="font-medium text-foreground">{t('representations_breadcrumb_current')}</span>
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
                        <CardTitle className="text-xl font-headline">{t('representations_my_title')}</CardTitle>
                        <CardDescription>{t('representations_my_desc')}</CardDescription>
                    </CardHeader>
                    <CardContent>
                       <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-1/4">{t('representations_table_header_period')}</TableHead>
                                    <TableHead>{t('representations_table_header_representing_person')}</TableHead>
                                    <TableHead>{t('representations_table_header_duration')}</TableHead>
                                    <TableHead>{t('representations_table_header_status')}</TableHead>
                                    <TableHead>{t('representations_table_header_confirmation_date')}</TableHead>
                                    <TableHead>{t('representations_table_header_created_date')}</TableHead>
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
                                                {t(`representations_status_${rep.status}`)}
                                            </RepresentationStatusBadge>
                                        </TableCell>
                                        <TableCell>{rep.confirmedAt ? format(new Date(rep.confirmedAt), 'dd.MM.yyyy') : '-'}</TableCell>
                                        <TableCell>{rep.createdAt ? format(new Date(rep.createdAt), 'dd.MM.yyyy') : '-'}</TableCell>
                                    </TableRow>
                                )) : (
                                    <TableRow>
                                        <TableCell colSpan={6} className="h-24 text-center">No representations found.</TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

                 <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                         <div>
                            <CardTitle className="text-xl font-headline">{t('representations_performed_title')}</CardTitle>
                            <CardDescription>{t('representations_performed_desc')}</CardDescription>
                        </div>
                        <Button className="flex items-center gap-2 flex-shrink-0" asChild>
                            <Link href={`/${locale}/representations/new`}>
                                <PlusCircle className="h-5 w-5"/>
                                <span className="hidden sm:inline">{t('representations_new_button')}</span>
                            </Link>
                        </Button>
                    </CardHeader>
                    <CardContent>
                       <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-1/4">{t('representations_table_header_period')}</TableHead>
                                    <TableHead>{t('representations_table_header_person')}</TableHead>
                                    <TableHead>{t('representations_table_header_duration')}</TableHead>
                                    <TableHead>{t('representations_table_header_status')}</TableHead>
                                    <TableHead>{t('representations_table_header_confirmation_date')}</TableHead>
                                    <TableHead>{t('representations_table_header_created_date')}</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {performedRepresentations.length > 0 ? performedRepresentations.map((rep) => {
                                    const isStartDateOverdue = rep.status === 'pending' && new Date(rep.startDate) < fiveDaysAgo;
                                    const isCreateDateOverdue = rep.createdAt ? rep.status === 'pending' && new Date(rep.createdAt) < fiveDaysAgo : false;

                                    return (
                                        <TableRow key={rep.id}>
                                            <TableCell className="font-medium whitespace-pre-wrap">
                                                <div className="flex items-center gap-2">
                                                    <span>{formatPeriod(rep.startDate, rep.endDate)}</span>
                                                    {isStartDateOverdue && (
                                                        <Badge variant="destructive" className="border border-destructive bg-destructive text-destructive-foreground">
                                                            {t('representations_label_overdue')}
                                                        </Badge>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell>{rep.representedPersonName}</TableCell>
                                            <TableCell>{rep.durationHours} Stunden</TableCell>
                                            <TableCell>
                                                <RepresentationStatusBadge status={rep.status as 'confirmed' | 'pending' | 'declined'}>
                                                    {t(`representations_status_${rep.status}`)}
                                                </RepresentationStatusBadge>
                                            </TableCell>
                                            <TableCell>{rep.confirmedAt ? format(new Date(rep.confirmedAt), 'dd.MM.yyyy') : '-'}</TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                  <span>{rep.createdAt ? format(new Date(rep.createdAt), 'dd.MM.yyyy') : '-'}</span>
                                                  {isCreateDateOverdue && (
                                                        <Badge variant="destructive" className="border border-destructive bg-destructive text-destructive-foreground">
                                                            {t('representations_label_overdue')}
                                                        </Badge>
                                                  )}
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    )
                                }) : (
                                    <TableRow>
                                        <TableCell colSpan={6} className="h-24 text-center">No representations found.</TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

                 <p className="text-xs text-muted-foreground text-center pt-4">
                    {t('representations_footer_note')}
                </p>

            </div>
        </AppLayout>
    );
}
