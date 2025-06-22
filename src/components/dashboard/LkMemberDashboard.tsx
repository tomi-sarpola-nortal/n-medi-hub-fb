
"use client";

import * as React from 'react';
import type { Person } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MapPin, Phone, Mail, Clock } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

interface LkMemberDashboardProps {
    user: Person;
    t: Record<string, string>;
}

const mockMembersToReview = [
    {
        id: '1',
        name: 'Dr. Anna Huber',
        date: '21.05.2025',
        changeType: 'Datenänderung',
    },
    {
        id: '2',
        name: 'Dr. Mehmet Yilmaz',
        date: '21.05.2025',
        changeType: 'Datenänderung',
    }
];

export default function LkMemberDashboard({ user, t }: LkMemberDashboardProps) {
    const fullName = user.name || `${user.firstName} ${user.lastName}`;
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
                            <CardTitle className="font-headline text-xl">{t.lk_dashboard_review_members_title || 'Mitglieder überprüfen'}</CardTitle>
                            <CardDescription>{t.lk_dashboard_review_members_desc || 'Hier können Sie Datenänderungen von Mitgliedern überprüfen.'}</CardDescription>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="space-y-0">
                                {mockMembersToReview.map((member, index) => (
                                    <React.Fragment key={member.id}>
                                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 sm:p-6 gap-4">
                                            <div>
                                                <p className="font-semibold text-base">{member.name}</p>
                                                <p className="text-sm text-muted-foreground">{member.date} | {member.changeType}</p>
                                            </div>
                                            <Button className="w-full sm:w-auto mt-2 sm:mt-0">
                                                {t.lk_dashboard_perform_review_button || 'PRÜFUNG VORNEHMEN'}
                                            </Button>
                                        </div>
                                        {index < mockMembersToReview.length - 1 && <Separator />}
                                    </React.Fragment>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>
                
                {/* Sidebar: Chamber Info */}
                <div className="lg:col-span-1">
                    <Card className="shadow-lg">
                        <CardHeader>
                            <CardTitle className="font-headline text-xl">{t.dashboard_chamber_info_title || 'Ihre Landeskammer'}</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4 text-sm pt-6">
                            <p className="font-semibold text-base">{t.dashboard_chamber_name || 'Zahnärztekammer Wien'}</p>
                            <div className="flex items-start gap-3">
                                <MapPin className="h-4 w-4 mt-1 text-muted-foreground flex-shrink-0"/>
                                <span>Kohlmarkt 11/6<br/>1010 Wien</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <Phone className="h-4 w-4 text-muted-foreground flex-shrink-0"/>
                                <span>+43 1 513 37 31</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <Mail className="h-4 w-4 text-muted-foreground flex-shrink-0"/>
                                <span>office@zahnaerztekammer.at</span>
                            </div>
                            <div className="flex items-start gap-3">
                                <Clock className="h-4 w-4 mt-1 text-muted-foreground flex-shrink-0"/>
                                <span className="whitespace-pre-line">{t.dashboard_chamber_office_hours || "Mo-Do: 8:00 - 16:30 Uhr\nFr: 8:00 - 14:00 Uhr"}</span>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
