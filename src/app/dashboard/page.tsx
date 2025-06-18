import AppLayout from '@/components/layout/AppLayout';
import WelcomeHeader from '@/components/dashboard/WelcomeHeader';
import RequestsSummary from '@/components/dashboard/RequestsSummary';
import RecentActions from '@/components/dashboard/RecentActions';
import SmartSuggestions from '@/components/dashboard/SmartSuggestions';
import { Separator } from '@/components/ui/separator';
import type { User } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ShieldAlert } from 'lucide-react';
import SeedButton from '@/components/dashboard/SeedButton';
import { getTranslations } from '@/lib/translations'; // For server-side translations

// Mock user data for the dashboard page.
const getCurrentUser = async (): Promise<User> => {
  return {
    id: 'user123',
    name: 'Dr. Sabine Müller',
    email: 'sabine.mueller@example.com',
    role: 'dentist',
    region: 'Bayern',
    avatarUrl: `https://placehold.co/100x100.png?text=SM`,
    dentistId: 'ZA-2025-0842',
  };
};

interface DashboardPageProps {
  params: { locale: string };
}

export default async function DashboardPage({ params }: DashboardPageProps) {
  const user = await getCurrentUser();
  const t = getTranslations(params.locale);

  const welcomeMessage = t.welcome_back.replace('{userName}', user.name);
  const pageTitle = t.dashboard_page_title || "Dashboard";

  const stats = [
    { title: "Active Cases", value: "12", change: "+5 this month", icon: ShieldAlert},
    { title: "Education Points", value: "150", change: "Target: 200", icon: ShieldAlert},
    { title: "Upcoming Events", value: "3", change: "View Calendar", icon: ShieldAlert},
  ];

  return (
    <AppLayout user={user} pageTitle={pageTitle} locale={params.locale}>
      <div className="flex-1 space-y-6 p-4 md:p-8">
        <WelcomeHeader translatedWelcomeMessage={welcomeMessage} />
        
        <Separator />
        
        {/* TEMPORARY SEED BUTTON - REMOVE AFTER USE */}
        <SeedButton />
        <Separator className="my-6 border-destructive border-dashed" />
        {/* END TEMPORARY SEED BUTTON */}

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {stats.map(stat => (
             <Card key={stat.title} className="shadow-lg hover:shadow-xl transition-shadow duration-300">
             <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
               <CardTitle className="text-sm font-medium font-headline">{stat.title}</CardTitle>
               <stat.icon className="h-4 w-4 text-muted-foreground" />
             </CardHeader>
             <CardContent>
               <div className="text-2xl font-bold">{stat.value}</div>
               <p className="text-xs text-muted-foreground">{stat.change}</p>
             </CardContent>
           </Card>
          ))}
          <RequestsSummary /> 
          <RecentActions />
        </div>
        
        <SmartSuggestions userRole={user.role} userRegion={user.region} />

      </div>
    </AppLayout>
  );
}
