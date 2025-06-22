
"use client";

import { useAuth } from '@/context/auth-context';
import AppLayout from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { GraduationCap, CalendarCheck, MapPin, Phone, Mail, Clock, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

// Helper for client-side translations
const getClientTranslations = (locale: string) => {
  try {
    if (locale === 'de') {
      return require('../../../locales/de.json');
    }
    return require('../../../locales/en.json');
  } catch (e) {
    console.warn("Translation file not found for dashboard page, falling back to en");
    return require('../../../locales/en.json');
  }
};


const mockRepresentationRequests = [
    {
        id: '1',
        name: 'Dr. Lukas Hoffmann',
        details: ['10.05.2025, 08:30 Uhr - 17:00 Uhr (8,5 Stunden)', '11.05.2025, 15:00 Uhr - 18:00 Uhr (3 Stunden)']
    },
    {
        id: '2',
        name: 'Dr. Anna Schneider',
        details: ['02.05.2025, 10:00 Uhr - 17:00 Uhr (7 Stunden)']
    }
];

interface DashboardPageProps {
  params: { locale: string };
}

export default function DashboardPage({ params }: DashboardPageProps) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [t, setT] = useState<Record<string, string> | null>(null);

  useEffect(() => {
    setT(getClientTranslations(params.locale));
  }, [params.locale]);
  
  useEffect(() => {
    // If auth state is resolved and there's no user, redirect to login
    if (!loading && !user) {
      router.replace('/login');
    }
  }, [user, loading, router]);


  if (loading || !user || !t) {
    return (
      <AppLayout pageTitle="Dashboard" locale={params.locale}>
        <div className="flex-1 space-y-8 p-4 md:p-8 flex justify-center items-center">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
        </div>
      </AppLayout>
    );
  }
  
  const fullName = [user.title, user.firstName, user.lastName].filter(Boolean).join(' ').trim() || user.name;
  const welcomeMessage = t.welcome_back.replace('{userName}', fullName);
  const pageTitle = t.dashboard_page_title || "Dashboard";

  return (
    <AppLayout pageTitle={pageTitle} locale={params.locale}>
      <div className="flex-1 space-y-8 p-4 md:p-8">
        <h2 className="text-3xl font-bold tracking-tight font-headline">
          {welcomeMessage}
        </h2>
        
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {/* Training Status Card */}
            <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
                <CardHeader>
                    <CardTitle className="text-lg font-medium font-headline">{t.dashboard_training_status_title || "Ihr Fortbildungsstand"}</CardTitle>
                </CardHeader>
                <CardContent className="flex items-center justify-between">
                    <div>
                        <p className="text-4xl font-bold">97 / 120</p>
                        <p className="text-sm text-muted-foreground">{t.dashboard_training_status_points || "Fortbildungspunkten"}</p>
                    </div>
                    <div className="p-3 bg-accent rounded-full">
                        <GraduationCap className="h-8 w-8 text-primary"/>
                    </div>
                </CardContent>
                <CardFooter>
                    <Button variant="outline" className="w-full" asChild>
                        <Link href="/education">{t.dashboard_training_status_button || "MEINE FORTBILDUNGEN ANSEHEN"}</Link>
                    </Button>
                </CardFooter>
            </Card>

            {/* Representation Status Card */}
            <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
                <CardHeader>
                    <CardTitle className="text-lg font-medium font-headline">{t.dashboard_representation_status_title || "Ihre Vertretungen"}</CardTitle>
                </CardHeader>
                <CardContent className="flex items-center justify-between">
                    <div>
                        <p className="text-4xl font-bold">34</p>
                        <p className="text-sm text-muted-foreground">{t.dashboard_representation_status_hours || "Bestätigte Vertretungsstunden"}</p>
                    </div>
                     <div className="p-3 bg-accent rounded-full">
                        <CalendarCheck className="h-8 w-8 text-primary"/>
                    </div>
                </CardContent>
                <CardFooter>
                    <Button variant="outline" className="w-full">{t.dashboard_representation_status_button || "MEINE VERTRETUNGEN ANSEHEN"}</Button>
                </CardFooter>
            </Card>

            {/* Chamber Info Card */}
            <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
                <CardHeader>
                    <CardTitle className="text-lg font-medium font-headline">{t.dashboard_chamber_info_title || "Ihre Landeskammer"}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                    <p className="font-semibold">{t.dashboard_chamber_name || "Zahnärztekammer Wien"}</p>
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

        {/* Representation Requests Card */}
        <Card className="shadow-lg col-span-1 lg:col-span-3">
            <CardHeader>
                <CardTitle className="text-xl font-medium font-headline">{t.dashboard_confirm_reps_title || "Vertretungen bestätigen"}</CardTitle>
                <CardDescription>{t.dashboard_confirm_reps_description || "Hier können Sie Vertretungen bestätigen, bei denen Sie vertreten wurden."}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {mockRepresentationRequests.map((req) => (
                    <div key={req.id} className="p-4 border rounded-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div>
                            <p className="font-semibold">{req.name}</p>
                            <div className="text-sm text-muted-foreground">
                                {req.details.map((line, index) => <p key={index}>{line}</p>)}
                            </div>
                        </div>
                        <div className="flex gap-2 flex-shrink-0">
                            <Button>{t.dashboard_confirm_reps_confirm_button || "BESTÄTIGEN"}</Button>
                            <Button variant="outline">{t.dashboard_confirm_reps_decline_button || "ABLEHNEN"}</Button>
                        </div>
                    </div>
                ))}
            </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
