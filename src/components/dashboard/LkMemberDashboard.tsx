
"use client";

import * as React from 'react';
import type { Person, Representation } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FilePen, Loader2, Users2, ShieldAlert } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { getAllPersons } from '@/services/personService';
import { getOldPendingRepresentations } from '@/services/representationService';
import Link from 'next/link';
import { format } from 'date-fns';
import StateBureauInfo from './StateChamberInfo';

interface LkMemberDashboardProps {
    user: Person;
    t: (key: string, replacements?: Record<string, string | number>) => string;
    locale: string;
}

interface OverdueRepGroup {
    personId: string;
    personName: string;
    count: number;
}

export default function LkMemberDashboard({ user, t, locale }: LkMemberDashboardProps) {
    const [registrationsToReview, setRegistrationsToReview] = React.useState<Person[]>([]);
    const [changesToReview, setChangesToReview] = React.useState<Person[]>([]);
    const [overdueRepsByPerson, setOverdueRepsByPerson] = React.useState<OverdueRepGroup[]>([]);
    const [isLoading, setIsLoading] = React.useState(true);

    const totalOverdueCount = React.useMemo(() => {
        return overdueRepsByPerson.reduce((sum, p) => sum + p.count, 0);
    }, [overdueRepsByPerson]);

    React.useEffect(() => {
        const fetchDashboardData = async () => {
            setIsLoading(true);
            try {
                const [allPersonsResult, oldRepsResult] = await Promise.allSettled([
                    getAllPersons(),
                    getOldPendingRepresentations(5)
                ]);

                if (allPersonsResult.status === 'fulfilled') {
                    const allReviewable = allPersonsResult.value
                        .filter(p => p.status === 'pending' || !!p.pendingData)
                        .sort((a, b) => new Date(b.updatedAt || 0).getTime() - new Date(a.updatedAt || 0).getTime());

                    setRegistrationsToReview(allReviewable.filter(p => p.status === 'pending' && !p.pendingData).slice(0, 5));
                    setChangesToReview(allReviewable.filter(p => !!p.pendingData).slice(0, 5));
                } else {
                    console.error("Failed to fetch persons for review:", allPersonsResult.reason);
                }

                if (oldRepsResult.status === 'fulfilled') {
                     const reps = oldRepsResult.value;
                     const grouped = reps.reduce((acc, rep) => {
                         if (!acc[rep.representedPersonId]) {
                             acc[rep.representedPersonId] = {
                                 personId: rep.representedPersonId,
                                 personName: rep.representedPersonName,
                                 count: 0,
                             };
                         }
                         acc[rep.representedPersonId].count++;
                         return acc;
                     }, {} as Record<string, OverdueRepGroup>);
                     
                     setOverdueRepsByPerson(Object.values(grouped));
                } else {
                     console.error("Failed to fetch overdue representations:", oldRepsResult.reason);
                }

            } catch (error) {
                console.error("An unexpected error occurred while fetching dashboard data:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    const fullName = [user.title, user.firstName, user.lastName].filter(Boolean).join(' ').trim() || user.name;
    const welcomeMessage = t('welcome_back', { userName: fullName });

    return (
        <div className="flex-1 space-y-8 p-4 md:p-8">
            <h2 className="text-3xl font-bold tracking-tight font-headline">
                {welcomeMessage}
            </h2>
            
            <div className="grid gap-8 lg:grid-cols-3 lg:items-start">
                <div className="lg:col-span-2 space-y-6">
                    {isLoading ? (
                        <div className="flex justify-center items-center h-48">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        </div>
                    ) : (
                        <>
                            {/* Review New Registrations */}
                            {registrationsToReview.length > 0 && (
                                <Card className="shadow-lg">
                                    <CardHeader>
                                        <div className="flex items-center gap-2">
                                            <FilePen className="h-5 w-5 text-primary" />
                                            <CardTitle className="font-headline text-xl">{t('review_registrations_title')}</CardTitle>
                                        </div>
                                        <CardDescription>{t('review_registrations_desc')}</CardDescription>
                                    </CardHeader>
                                    <CardContent className="p-0">
                                        <div className="space-y-0">
                                            {registrationsToReview.map((member, index) => (
                                                <React.Fragment key={member.id}>
                                                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 sm:p-6 gap-4">
                                                        <div>
                                                            <p className="font-semibold text-base">{member.name}</p>
                                                            <div className="flex items-center gap-2 mt-1">
                                                                <p className="text-sm text-muted-foreground">
                                                                    {member.updatedAt ? format(new Date(member.updatedAt), 'dd.MM.yyyy') : '-'}
                                                                </p>
                                                                <Badge variant="outline" className="bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/60 dark:text-orange-200 dark:border-orange-800">
                                                                    {t('member_review_type_new_registration')}
                                                                </Badge>
                                                            </div>
                                                        </div>
                                                        <Button asChild variant="outline" className="w-full sm:w-auto mt-2 sm:mt-0">
                                                            <Link href={`/${locale}/member-overview/${member.id}/review`}>
                                                                <FilePen className="mr-2 h-4 w-4" />
                                                                {t('member_overview_review_registration_button')}
                                                            </Link>
                                                        </Button>
                                                    </div>
                                                    {index < registrationsToReview.length - 1 && <Separator />}
                                                </React.Fragment>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>
                            )}

                             {/* Review Data Changes */}
                            {changesToReview.length > 0 && (
                                <Card className="shadow-lg">
                                    <CardHeader>
                                        <div className="flex items-center gap-2">
                                            <FilePen className="h-5 w-5 text-primary" />
                                            <CardTitle className="font-headline text-xl">{t('review_changes_title')}</CardTitle>
                                        </div>
                                        <CardDescription>{t('review_changes_desc')}</CardDescription>
                                    </CardHeader>
                                    <CardContent className="p-0">
                                        <div className="space-y-0">
                                            {changesToReview.map((member, index) => (
                                                <React.Fragment key={member.id}>
                                                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 sm:p-6 gap-4">
                                                        <div>
                                                            <p className="font-semibold text-base">{member.name}</p>
                                                            <div className="flex items-center gap-2 mt-1">
                                                                <p className="text-sm text-muted-foreground">
                                                                    {member.updatedAt ? format(new Date(member.updatedAt), 'dd.MM.yyyy') : '-'}
                                                                </p>
                                                                <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/60 dark:text-yellow-200 dark:border-yellow-800">
                                                                    {t('data_change_label')}
                                                                </Badge>
                                                            </div>
                                                        </div>
                                                        <Button asChild variant="outline" className="w-full sm:w-auto mt-2 sm:mt-0">
                                                            <Link href={`/${locale}/member-overview/${member.id}/review`}>
                                                                <FilePen className="mr-2 h-4 w-4" />
                                                                {t('member_overview_review_changes_button')}
                                                            </Link>
                                                        </Button>
                                                    </div>
                                                    {index < changesToReview.length - 1 && <Separator />}
                                                </React.Fragment>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>
                            )}

                            {/* Overdue Representations Card */}
                            {overdueRepsByPerson.length > 0 && (
                                <Card>
                                    <CardHeader>
                                        <div className="flex items-center gap-2">
                                            <ShieldAlert className="h-5 w-5 text-destructive" />
                                            <CardTitle>{t('dashboard_old_reps_title')}</CardTitle>
                                        </div>
                                        <CardDescription>
                                            {t('dashboard_old_reps_desc', { count: totalOverdueCount })}
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="p-0">
                                        <div className="space-y-0">
                                            {overdueRepsByPerson.map((item, index) => (
                                                <React.Fragment key={item.personId}>
                                                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 sm:p-6 gap-4">
                                                        <div>
                                                            <p className="font-semibold">{item.personName}</p>
                                                             <div className="flex items-center gap-2 mt-1">
                                                                <p className="text-sm text-muted-foreground">
                                                                    {t("dashboard_overdue_reps_for_person", { count: item.count })}
                                                                </p>
                                                                <Badge className="border border-destructive bg-destructive text-destructive-foreground">
                                                                    {t('representations_label_overdue')}
                                                                </Badge>
                                                            </div>
                                                        </div>
                                                        <Button asChild variant="outline" className="w-full sm:w-auto mt-2 sm:mt-0">
                                                            <Link href={`/${locale}/member-overview/${item.personId}?tab=vertretungen`}>
                                                                <Users2 className="mr-2 h-4 w-4" />
                                                                {t('dashboard_old_reps_button')}
                                                            </Link>
                                                        </Button>
                                                    </div>
                                                    {index < overdueRepsByPerson.length - 1 && <Separator />}
                                                </React.Fragment>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>
                            )}
                        </>
                    )}
                </div>
                
                <div className="lg:col-span-1">
                    <StateBureauInfo bureauId={user.stateBureauId} />
                </div>
            </div>
        </div>
    );
}
