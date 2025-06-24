
'use client';

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Loader2 } from 'lucide-react';
import type { Representation } from '@/lib/types';
import { format } from 'date-fns';

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
    const [isSubmitting, setIsSubmitting] = React.useState<'confirm' | 'decline' | null>(null);

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


interface ConfirmRepresentationCardProps {
    requests: Representation[];
    t: Record<string, string>;
    onStatusChange: (id: string, status: 'confirmed' | 'declined') => void;
    className?: string;
}

export default function ConfirmRepresentationCard({ requests, t, onStatusChange, className }: ConfirmRepresentationCardProps) {
    return (
        <Card className={`shadow-lg ${className}`}>
            <CardHeader>
                <CardTitle className="text-xl font-medium font-headline">{t.confirm_reps_title || "Confirm Representations"}</CardTitle>
                <CardDescription>{t.confirm_reps_description || "Here you can confirm representations where you were represented."}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {requests.length > 0 ? requests.map((req, index) => (
                    <div key={req.id}>
                        <ConfirmationRequest request={req} t={t} onStatusChange={onStatusChange} />
                        {index < requests.length - 1 && <Separator className="my-4"/>}
                    </div>
                )) : (
                     <p className="text-sm text-muted-foreground text-center py-4">{t.member_review_no_pending || "No pending member reviews at the moment."}</p>
                )}
            </CardContent>
        </Card>
    );
}
