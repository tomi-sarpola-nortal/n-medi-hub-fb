
"use client";

import * as React from 'react';
import type { Person } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FilePen, Loader2 } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { getPersonsToReview } from '@/services/personService';
import Link from 'next/link';
import { format } from 'date-fns';
import StateChamberInfo from './StateChamberInfo';

interface LkMemberDashboardProps {
    user: Person;
    t: Record<string, string>;
    locale: string;
}

export default function LkMemberDashboard({ user, t, locale }: LkMemberDashboardProps) {
    const [membersToReview, setMembersToReview] = React.useState<Person[]>([]);
    const [isLoading, setIsLoading] = React.useState(true);

    React.useEffect(() => {
        const fetchMembersToReview = async () => {
            try {
                const members = await getPersonsToReview(5);
                setMembersToReview(members);
            } catch (error) {
                console.error("Failed to fetch members for review:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchMembersToReview();
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
                <div className="lg:col-span-2">
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
                                    {membersToReview.map((member, index) => (
                                        <React.Fragment key={member.id}>
                                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 sm:p-6 gap-4">
                                                <div>
                                                    <p className="font-semibold text-base">{member.name}</p>
                                                    <p className="text-sm text-muted-foreground flex items-center gap-2">
                                                        {member.updatedAt ? format(new Date(member.updatedAt), 'dd.MM.yyyy') : '-'}
                                                        <span className="bg-primary/10 text-primary px-2 py-0.5 rounded-full text-xs font-medium">
                                                            {member.pendingData ? (t.data_change_label || "Data Change") : (t.member_list_status_pending || "New Registration")}
                                                        </span>
                                                    </p>
                                                </div>
                                                <Button asChild variant="outline" className="w-full sm:w-auto mt-2 sm:mt-0">
                                                    <Link href={`/${locale}/member-overview/${member.id}/review`}>
                                                        <FilePen className="mr-2 h-4 w-4" />
                                                        {t.perform_review_button || 'PERFORM REVIEW'}
                                                    </Link>
                                                </Button>
                                            </div>
                                            {index < membersToReview.length - 1 && <Separator />}
                                        </React.Fragment>
                                    ))}
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
