
"use client";

import { useAuth } from '@/context/auth-context';
import AppLayout from '@/components/layout/AppLayout';
import { Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

import DentistDashboard from '@/components/dashboard/DentistDashboard';
import LkMemberDashboard from '@/components/dashboard/LkMemberDashboard';

// Helper for client-side translations
const getClientTranslations = (locale: string) => {
  try {
    if (locale === 'de') {
      return require('../../../../locales/de.json');
    }
    return require('../../../../locales/en.json');
  } catch (e) {
    console.warn("Translation file not found for dashboard page, falling back to en");
    return require('../../../../locales/en.json');
  }
};

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
  
  const pageTitle = t.dashboard_page_title || "Dashboard";

  const renderDashboardByRole = () => {
    switch(user.role) {
      case 'dentist':
        return <DentistDashboard user={user} t={t!} />;
      case 'lk_member':
        return <LkMemberDashboard user={user} t={t!} />;
      // Add other roles here in the future
      default:
        // Fallback to a default view or dentist view if preferred
        return <DentistDashboard user={user} t={t!} />;
    }
  };

  return (
    <AppLayout pageTitle={pageTitle} locale={params.locale}>
      {renderDashboardByRole()}
    </AppLayout>
  );
}
