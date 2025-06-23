"use client";

import { useEffect, useState } from 'react';
import { getStateChamberById } from '@/services/stateChamberService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin, Phone, Mail, Clock } from 'lucide-react';
import type { StateChamber } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';

interface StateChamberInfoProps {
  chamberId?: string;
  t: Record<string, string>;
}

const LoadingSkeleton = ({ t }: { t: Record<string, string> }) => (
    <Card className="shadow-lg">
        <CardHeader>
            <CardTitle className="text-lg font-medium font-headline">{t.dashboard_chamber_info_title || 'Your State Chamber'}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
            <Skeleton className="h-5 w-3/4" />
            <div className="flex items-start gap-3">
                <MapPin className="h-4 w-4 mt-1 text-muted-foreground flex-shrink-0"/>
                <div className='space-y-1 w-full'>
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-1/2" />
                </div>
            </div>
             <div className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-muted-foreground flex-shrink-0"/>
                <Skeleton className="h-4 w-2/3" />
            </div>
            <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-muted-foreground flex-shrink-0"/>
                <Skeleton className="h-4 w-4/5" />
            </div>
             <div className="flex items-start gap-3">
                <Clock className="h-4 w-4 mt-1 text-muted-foreground flex-shrink-0"/>
                 <div className='space-y-1 w-full'>
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-1/2" />
                </div>
            </div>
        </CardContent>
    </Card>
);

export default function StateChamberInfo({ chamberId, t }: StateChamberInfoProps) {
  const [chamber, setChamber] = useState<StateChamber | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!chamberId) {
      setIsLoading(false);
      return;
    }

    const fetchChamber = async () => {
      setIsLoading(true);
      try {
        const chamberData = await getStateChamberById(chamberId);
        setChamber(chamberData);
      } catch (error) {
        console.error("Failed to fetch state chamber info:", error);
        setChamber(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchChamber();
  }, [chamberId]);

  if (isLoading) {
    return <LoadingSkeleton t={t} />;
  }
  
  if (!chamberId || !chamber) {
    return (
        <Card className="shadow-lg">
            <CardHeader><CardTitle>{t.dashboard_chamber_info_title || 'Your State Chamber'}</CardTitle></CardHeader>
            <CardContent><p>Chamber information not found.</p></CardContent>
        </Card>
    );
  }

  return (
    <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
        <CardHeader>
            <CardTitle className="text-lg font-medium font-headline">{t.dashboard_chamber_info_title || 'Your State Chamber'}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
            <p className="font-semibold">{chamber.name}</p>
            <div className="flex items-start gap-3">
                <MapPin className="h-4 w-4 mt-1 text-muted-foreground flex-shrink-0"/>
                <span className="whitespace-pre-line">{chamber.address}</span>
            </div>
            <div className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-muted-foreground flex-shrink-0"/>
                <span>{chamber.phone}</span>
            </div>
            <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-muted-foreground flex-shrink-0"/>
                <span>{chamber.email}</span>
            </div>
            <div className="flex items-start gap-3">
                <Clock className="h-4 w-4 mt-1 text-muted-foreground flex-shrink-0"/>
                <span className="whitespace-pre-line">{t[chamber.officeHours] || chamber.officeHours}</span>
            </div>
        </CardContent>
    </Card>
  );
}
