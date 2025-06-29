
"use client";

import { useState, useEffect } from 'react';
import type { Person, Representation } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CalendarCheck } from 'lucide-react';
import Link from 'next/link';
import StateChamberInfo from './StateChamberInfo';
import { getConfirmedRepresentationHours, getRepresentationsForUser, updateRepresentationStatus } from '@/services/representationService';
import { Skeleton } from '@/components/ui/skeleton';
import { CircularProgress } from '@/components/ui/circular-progress';
import ConfirmRepresentationCard from '../representations/ConfirmRepresentationCard';
import { useToast } from '@/hooks/use-toast';

interface DentistDashboardProps {
    user: Person;
    t: (key: string, replacements?: Record<string, string | number>) => string;
}

const LoadingSkeleton = () => (
    <div className="grid gap-8 lg:grid-cols-3 lg:items-start">
      <div className="lg:col-span-2 space-y-6">
        <div className="grid gap-6 md:grid-cols-2">
            {/* Training Card Skeleton */}
            <Card>
                <CardHeader>
                    <Skeleton className="h-5 w-3/4" />
                </CardHeader>
                <CardContent className="flex items-center justify-center pt-6 pb-2">
                    <Skeleton className="h-[140px] w-[140px] rounded-full" />
                </CardContent>
                <CardFooter>
                    <Skeleton className="h-10 w-full" />
                </CardFooter>
            </Card>

            {/* Representation Card Skeleton */}
            <Card>
                <CardHeader>
                    <Skeleton className="h-5 w-3/4" />
                </CardHeader>
                <CardContent className="flex items-center justify-between">
                    <div>
                        <Skeleton className="h-10 w-24 mb-2" />
                        <Skeleton className="h-4 w-32" />
                    </div>
                    <Skeleton className="h-14 w-14 rounded-full" />
                </CardContent>
                <CardFooter>
                    <Skeleton className="h-10 w-full" />
                </CardFooter>
            </Card>
        </div>
        <Card>
            <CardHeader>
                <Skeleton className="h-5 w-1/2" />
                <Skeleton className="h-4 w-3/4" />
            </CardHeader>
            <CardContent className="space-y-4">
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
            </CardContent>
        </Card>
      </div>
      <div className="lg:col-span-1">
        <Card>
             <CardHeader>
                <Skeleton className="h-5 w-3/4" />
            </CardHeader>
            <CardContent className="space-y-3">
                <Skeleton className="h-5 w-3/4" />
                 <div className="flex items-start gap-3">
                    <Skeleton className="h-4 w-4 mt-1" />
                    <div className='space-y-1 w-full'>
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-1/2" />
                    </div>
                </div>
                 <div className="flex items-center gap-3">
                    <Skeleton className="h-4 w-4" />
                    <Skeleton className="h-4 w-2/3" />
                </div>
                <div className="flex items-center gap-3">
                    <Skeleton className="h-4 w-4" />
                    <Skeleton className="h-4 w-4/5" />
                </div>
                <div className="flex items-start gap-3">
                    <Skeleton className="h-4 w-4 mt-1" />
                    <div className='space-y-1 w-full'>
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-1/2" />
                    </div>
                </div>
            </CardContent>
        </Card>
      </div>
    </div>
);


export default function DentistDashboard({ user, t }: DentistDashboardProps) {
    const { toast } = useToast();
    const [representationHours, setRepresentationHours] = useState(0);
    const [pendingRequests, setPendingRequests] = useState<Representation[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    
    const fetchDashboardData = async () => {
        if (!user) return;
        // Don't set loading to true here to avoid flicker on refetch
        try {
            const [confirmedHours, representationData] = await Promise.all([
                getConfirmedRepresentationHours(user.id),
                getRepresentationsForUser(user.id)
            ]);
            setRepresentationHours(confirmedHours);
            setPendingRequests(representationData.pendingConfirmation);
        } catch (error) {
            console.error("Failed to fetch dashboard data:", error);
            setRepresentationHours(0);
            setPendingRequests([]);
        } finally {
            setIsLoading(false);
        }
    };
    
    useEffect(() => {
        setIsLoading(true);
        fetchDashboardData();
    }, [user]);

    const handleStatusChange = async (representationId: string, status: 'confirmed' | 'declined') => {
        try {
            await updateRepresentationStatus(representationId, status);
            toast({
                title: "Success",
                description: `Representation has been ${status}.`,
            });
            // Refetch data to update the UI
            fetchDashboardData();
        } catch (error) {
            console.error(`Failed to ${status} representation:`, error);
            toast({
                title: "Error",
                description: "Could not update representation status.",
                variant: "destructive"
            });
        }
    };

    const fullName = [user.title, user.firstName, user.lastName].filter(Boolean).join(' ').trim() || user.name;
    const welcomeMessage = t('welcome_back', { userName: fullName });
    const TRAINING_TARGET_POINTS = 120;
    const trainingPoints = user.educationPoints || 0;

    return (
        <div className="flex-1 space-y-8 p-4 md:p-8">
            <h2 className="text-3xl font-bold tracking-tight font-headline">
                {welcomeMessage}
            </h2>
            
            {isLoading ? <LoadingSkeleton /> : (
                <div className="grid gap-8 lg:grid-cols-3 lg:items-start">
                    <div className="lg:col-span-2 space-y-6">
                        <div className="grid gap-6 md:grid-cols-2">
                            {/* Training Status Card */}
                            <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
                                <CardHeader>
                                    <CardTitle className="text-lg font-medium font-headline">{t('training_status_title')}</CardTitle>
                                </CardHeader>
                                <CardContent className="flex items-center justify-center pt-6 pb-2">
                                     <CircularProgress
                                        value={(trainingPoints / TRAINING_TARGET_POINTS) * 100}
                                        radius={70}
                                        strokeWidth={10}
                                        label={
                                            <div className="text-center">
                                                <p className="text-2xl font-bold font-headline">{`${trainingPoints}/${TRAINING_TARGET_POINTS}`}</p>
                                                <p className="text-xs text-muted-foreground">{t('training_status_points')}</p>
                                            </div>
                                        }
                                        showValue={false}
                                    />
                                </CardContent>
                                <CardFooter>
                                    <Button variant="outline" className="w-full" asChild>
                                        <Link href="/education">{t('training_status_button')}</Link>
                                    </Button>
                                </CardFooter>
                            </Card>

                            {/* Representation Status Card */}
                            <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
                                <CardHeader>
                                    <CardTitle className="text-lg font-medium font-headline">{t('representation_status_title')}</CardTitle>
                                </CardHeader>
                                <CardContent className="flex items-center justify-between">
                                    <div>
                                        <p className="text-4xl font-bold">{representationHours}</p>
                                        <p className="text-sm text-muted-foreground">{t('representation_status_hours')}</p>
                                    </div>
                                    <div className="p-3 bg-accent rounded-full">
                                        <CalendarCheck className="h-8 w-8 text-primary"/>
                                    </div>
                                </CardContent>
                                <CardFooter>
                                    <Button variant="outline" className="w-full" asChild>
                                        <Link href="/representations">{t('representation_status_button')}</Link>
                                    </Button>
                                </CardFooter>
                            </Card>
                        </div>
                        
                        {/* Representation Requests Card */}
                        {pendingRequests.length > 0 && (
                             <ConfirmRepresentationCard
                                requests={pendingRequests}
                                t={t}
                                onStatusChange={handleStatusChange}
                            />
                        )}
                    </div>

                    <div className="lg:col-span-1">
                        {/* Chamber Info Card */}
                        <StateChamberInfo chamberId={user.stateChamberId} />
                    </div>
                </div>
            )}
        </div>
    );
}
