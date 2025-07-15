"use client";

import { useEffect, useState } from 'react';
import { getStateBureauById } from '@/services/stateChamberService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin, Phone, Mail, Clock } from 'lucide-react';
import type { StateBureau } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { useClientTranslations } from '@/hooks/use-client-translations';
import { useToast } from '@/hooks/use-toast';

interface StateBureauInfoProps {
  bureauId?: string;
}

const LoadingSkeleton = () => (
  <Card className="shadow-lg">
    <CardHeader>
      <Skeleton className="h-5 w-3/4" />
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

export default function StateBureauInfo({ bureauId }: StateBureauInfoProps) {
  const [bureau, setBureau] = useState<StateBureau | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { t } = useClientTranslations(['dashboard']);
  const { toast } = useToast();

  useEffect(() => {
    if (!bureauId) {
      setIsLoading(false);
      return;
    }

    const fetchBureau = async () => {
      setIsLoading(true);
      try {
        const bureauData = await getStateBureauById(bureauId);
        setBureau(bureauData);
      } catch (error) {
        console.error("Failed to fetch state bureau info:", error);
        toast({
          title: "Error",
          description: "Failed to load bureau information. Please try again later.",
          variant: "destructive"
        });
        setBureau(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBureau();
  }, [bureauId, toast]);

  if (isLoading) {
    return <LoadingSkeleton />;
  }
  
  if (!bureauId || !bureau) {
    return (
      <Card className="shadow-lg">
        <CardHeader><CardTitle>{t('bureau_info_title')}</CardTitle></CardHeader>
        <CardContent><p>State Bureau information not found.</p></CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
      <CardHeader>
        <CardTitle className="text-lg font-medium font-headline">{t('bureau_info_title')}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        <p className="font-semibold">{bureau.name}</p>
        <div className="flex items-start gap-3">
          <MapPin className="h-4 w-4 mt-1 text-muted-foreground flex-shrink-0"/>
          <span className="whitespace-pre-line">{bureau.address}</span>
        </div>
        <div className="flex items-center gap-3">
          <Phone className="h-4 w-4 text-muted-foreground flex-shrink-0"/>
          <span className="break-words">{bureau.phone}</span>
        </div>
        <div className="flex items-center gap-3">
          <Mail className="h-4 w-4 text-muted-foreground flex-shrink-0"/>
          <span className="break-all">{bureau.email}</span>
        </div>
        <div className="flex items-start gap-3">
          <Clock className="h-4 w-4 mt-1 text-muted-foreground flex-shrink-0"/>
          <span className="whitespace-pre-line">{bureau.officeHours}</span>
        </div>
      </CardContent>
    </Card>
  );
}
