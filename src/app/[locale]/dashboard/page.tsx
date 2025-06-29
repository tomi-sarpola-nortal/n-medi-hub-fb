
"use client";

import { useAuth } from '@/context/auth-context';
import AppLayout from '@/components/layout/AppLayout';
import { Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';

import DentistDashboard from '@/components/dashboard/DentistDashboard';
import LkMemberDashboard from '@/components/dashboard/LkMemberDashboard';

// Helper for client-side translations
const getClientTranslations = (locale: string) => {
  try {
    const layout = locale === 'de' 
        ? require('../../../../locales/de/layout.json') 
        : require('../../../../locales/en/layout.json');
    const page = locale === 'de' 
        ? require('../../../../locales/de/dashboard.json') 
        : require('../../../../locales/en/dashboard.json');
    return { ...layout, ...page };
  } catch (e) {
    console.warn("Translation file not found for dashboard page, falling back to en");
    const layout = require('../../../../locales/en/layout.json');
    const page = require('../../../../locales/en/dashboard.json');
    return { ...layout, ...page };
  }
};

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const locale = typeof params.locale === 'string' ? params.locale : 'en';
  
  const [t, setT] = useState<Record<string, string> | null>(null);

  useEffect(() => {
    setT(getClientTranslations(locale));
  }, [locale]);

//Authentication commented out for demo mode
/*
  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.replace(`/${locale}/login`);
      } else if (user.status === 'pending') {
        router.replace(`/${locale}/settings`);
      }
    }
  }, [user, loading, router, locale]);


  if (loading || !user || !t || user.status === 'pending') {
    return (
      <AppLayout pageTitle="Dashboard" locale={locale}>
        <div className="flex-1 space-y-8 p-4 md:p-8 flex justify-center items-center">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
        </div>
      </AppLayout>
    );
  }
  */
  
  const pageTitle = t.page_title || "Dashboard";

  const renderDashboardByRole = () => {
    switch(user.role) {
      case 'dentist':
        return <DentistDashboard user={user} t={t!} />;
      case 'lk_member':
        return <LkMemberDashboard user={user} t={t!} locale={locale} />;
      // Add other roles here in the future
      default:
        // Fallback to a default view or dentist view if preferred
        return <DentistDashboard user={user} t={t!} />;
    }
  };

  return (
    <AppLayout pageTitle={pageTitle} locale={locale}>
      {renderDashboardByRole()}
    </AppLayout>
  );
}
