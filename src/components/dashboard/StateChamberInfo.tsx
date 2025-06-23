
import { getStateChamberById } from '@/services/stateChamberService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin, Phone, Mail, Clock } from 'lucide-react';
import type { StateChamber } from '@/lib/types';

interface StateChamberInfoProps {
  chamberId?: string;
  t: Record<string, string>;
}

export default async function StateChamberInfo({ chamberId, t }: StateChamberInfoProps) {
  if (!chamberId) {
    return null; // Or a fallback card if you prefer
  }

  const chamber = await getStateChamberById(chamberId);

  if (!chamber) {
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
