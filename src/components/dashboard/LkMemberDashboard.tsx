
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
    const [membersToReview, setMembersToReview] = React.useState<Person[]>([]);
    const [oldRepresentations, setOldRepresentations] = React.useState<Representation[]>([]);
    const [isLoading, setIsLoading] = React.useState(true);

    React.useEffect(() => {
        const fetchDashboardData = async () => {
            setIsLoading(true);
            try {
                const [allPersons, oldReps] = await Promise.all([
                    getAllPersons(),
                    getOldPendingRepresentations(5)
                ]);
                
                const members = allPersons
                    .filter(p => p.status === 'pending' || !!p.pendingData)
                    .sort((a, b) => new Date(b.updatedAt || 0).getTime() - new Date(a.updatedAt || 0).getTime())
                    .slice(0, 5); // Apply limit here
                setMembersToReview(members);
                setOldRepresentations(oldReps);
            } catch (error) {
                console.error("Failed to fetch dashboard data:", error);
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
                {/* Main Content: Member Review */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Overdue Representations Card */}
                     {oldRepresentations.length > 0 && (
                        <Card className="border-destructive/50 bg-destructive/5">
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

                    <Card className="shadow-lg">
                        <CardHeader>
                            <CardTitle className="font-headline text-xl">{t.review_members_title || 'Review Members'}</CardTitle>
                            <CardDescription>{t.review_members_desc || 'Here you can review data changes from members.'}</CardDescription>
                        </CardHeader>
                        <CardContent className="p-0">
                             {isLoading ? (
                                <div className="flex justify-center items-center h-48">
                                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                                </div>
                            ) : membersToReview.length > 0 ? (
                                <div className="space-y-0">
                                    {membersToReview.map((member, index) => {
                                        const isDataChange = !!member.pendingData;
                                        return (
                                            <React.Fragment key={member.id}>
                                                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 sm:p-6 gap-4">
                                                    <div>
                                                        <p className="font-semibold text-base">{member.name}</p>
                                                        <p className="text-sm text-muted-foreground flex items-center gap-2">
                                                            {member.updatedAt ? format(new Date(member.updatedAt), 'dd.MM.yyyy') : '-'}
                                                            <span className={cn(
                                                                "px-2 py-0.5 rounded-full text-xs font-medium",
                                                                isDataChange
                                                                ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/60 dark:text-yellow-200"
                                                                : "bg-orange-100 text-orange-800 dark:bg-orange-900/60 dark:text-orange-200"
                                                            )}>
                                                                {isDataChange ? (t.data_change_label || "Data Change") : (t.member_review_type_new_registration || "New Registration")}
                                                            </span>
                                                        </p>
                                                    </div>
                                                    <Button asChild variant="outline" className="w-full sm:w-auto mt-2 sm:mt-0">
                                                        <Link href={`/${locale}/member-overview/${member.id}/review`}>
                                                            <FilePen className="mr-2 h-4 w-4" />
                                                            {isDataChange ? (t.member_overview_review_changes_button || 'Review Changes') : (t.member_overview_review_registration_button || 'Review Registration')}
                                                        </Link>
                                                    </Button>
                                                </div>
                                                {index < membersToReview.length - 1 && <Separator />}
                                            </React.Fragment>
                                        )
                                    })}
                                </div>
                             ) : (
                                <div className="p-6 text-center text-muted-foreground">
                                    <p>{t.member_review_no_pending || "No pending member reviews at the moment."}</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
                
                {/* Sidebar: Chamber Info */}
                <div className="lg:col-span-1">
                    <StateChamberInfo chamberId={user.stateChamberId} t={t} />
                </div>
            </div>
        </div>
    );
}
