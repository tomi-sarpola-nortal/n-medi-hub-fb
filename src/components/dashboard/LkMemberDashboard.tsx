
"use client";

import * as React from 'react';
import type { Person, Representation } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FilePen, Loader2, Users2, ShieldAlert } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { getAllPersons } from '@/services/personService';
import { getOldPendingRepresentations } from '@/services/representationService';
import Link from 'next/link';
import { format } from 'date-fns';
import StateChamberInfo from './StateChamberInfo';
import { cn } from '@/lib/utils';

interface LkMemberDashboardProps {
    user: Person;
    t: Record<string, string>;
    locale: string;
}

export default function LkMemberDashboard({ user, t, locale }: LkMemberDashboardProps) {
    const [registrationsToReview, setRegistrationsToReview] = React.useState<Person[]>([]);
    const [changesToReview, setChangesToReview] = React.useState<Person[]>([]);
    const [oldRepresentations, setOldRepresentations] = React.useState<Representation[]>([]);
    const [isLoading, setIsLoading] = React.useState(true);

    React.useEffect(() => {
        const fetchDashboardData = async () => {
            setIsLoading(true);
            try {
                const results = await Promise.allSettled([
                    getAllPersons(),
                    getOldPendingRepresentations(5)
                ]);

                const allPersonsResult = results[0];
                const oldRepsResult = results[1];

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
                    setOldRepresentations(oldRepsResult.value);
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
    const welcomeMessage = t.welcome_back?.replace('{userName}', fullName) || `Welcome, ${fullName}!`;

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
                                        <CardTitle className="font-headline text-xl">{t.review_registrations_title || 'Review New Registrations'}</CardTitle>
                                        <CardDescription>{t.review_registrations_desc || 'Review and approve new member registrations.'}</CardDescription>
                                    </CardHeader>
                                    <CardContent className="p-0">
                                        <div className="space-y-0">
                                            {registrationsToReview.map((member, index) => (
                                                <React.Fragment key={member.id}>
                                                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 sm:p-6 gap-4">
                                                        <div>
                                                            <p className="font-semibold text-base">{member.name}</p>
                                                            <p className="text-sm text-muted-foreground flex items-center gap-2">
                                                                {member.updatedAt ? format(new Date(member.updatedAt), 'dd.MM.yyyy') : '-'}
                                                                <span className="bg-orange-100 text-orange-800 dark:bg-orange-900/60 dark:text-orange-200 px-2 py-0.5 rounded-full text-xs font-medium">
                                                                    {t.member_review_type_new_registration || "New Registration"}
                                                                </span>
                                                            </p>
                                                        </div>
                                                        <Button asChild variant="outline" className="w-full sm:w-auto mt-2 sm:mt-0">
                                                            <Link href={`/${locale}/member-overview/${member.id}/review`}>
                                                                <FilePen className="mr-2 h-4 w-4" />
                                                                {t.member_overview_review_registration_button || 'Review Registration'}
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
                                        <CardTitle className="font-headline text-xl">{t.review_changes_title || 'Review Data Changes'}</CardTitle>
                                        <CardDescription>{t.review_changes_desc || 'Review and approve data changes from existing members.'}</CardDescription>
                                    </CardHeader>
                                    <CardContent className="p-0">
                                        <div className="space-y-0">
                                            {changesToReview.map((member, index) => (
                                                <React.Fragment key={member.id}>
                                                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 sm:p-6 gap-4">
                                                        <div>
                                                            <p className="font-semibold text-base">{member.name}</p>
                                                            <p className="text-sm text-muted-foreground flex items-center gap-2">
                                                                {member.updatedAt ? format(new Date(member.updatedAt), 'dd.MM.yyyy') : '-'}
                                                                <span className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/60 dark:text-yellow-200 px-2 py-0.5 rounded-full text-xs font-medium">
                                                                    {t.data_change_label || "Data Change"}
                                                                </span>
                                                            </p>
                                                        </div>
                                                        <Button asChild variant="outline" className="w-full sm:w-auto mt-2 sm:mt-0">
                                                            <Link href={`/${locale}/member-overview/${member.id}/review`}>
                                                                <FilePen className="mr-2 h-4 w-4" />
                                                                {t.member_overview_review_changes_button || 'Review Changes'}
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
                            {oldRepresentations.length > 0 && (
                                <Card>
                                    <CardHeader>
                                        <div className="flex items-center gap-2">
                                            <ShieldAlert className="h-5 w-5 text-destructive" />
                                            <CardTitle className="text-destructive">{t.dashboard_old_reps_title || 'Overdue Representation Requests'}</CardTitle>
                                        </div>
                                        <CardDescription className="text-destructive/80">
                                            {(t.dashboard_old_reps_desc || '{count} representation requests are older than 5 days and require review.').replace('{count}', oldRepresentations.length.toString())}
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <Button asChild variant="outline" className="border-destructive text-destructive hover:bg-destructive/10 hover:text-destructive">
                                        <Link href={`/${locale}/member-overview`}>
                                            <Users2 className="mr-2 h-4 w-4" />
                                            {t.dashboard_old_reps_button || "REVIEW REPRESENTATIONS"}
                                        </Link>
                                        </Button>
                                    </CardContent>
                                </Card>
                            )}
                        </>
                    )}
                </div>
                
                <div className="lg:col-span-1">
                    <StateChamberInfo chamberId={user.stateChamberId} t={t} />
                </div>
            </div>
        </div>
    );
}
