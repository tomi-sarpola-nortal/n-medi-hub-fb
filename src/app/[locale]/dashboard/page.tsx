
"use client";

import { useAuth } from '@/context/auth-context';
import AppLayout from '@/components/layout/AppLayout';
import { Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useClientTranslations } from '@/hooks/use-client-translations';

import DentistDashboard from '@/components/dashboard/DentistDashboard';
import LkMemberDashboard from '@/components/dashboard/LkMemberDashboard';

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const { t, isLoading: translationsLoading, locale } = useClientTranslations(['dashboard', 'layout', 'representations', 'member-overview']);

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.replace(`/${locale}/login`);
      } else if (user.status === 'pending') {
        router.replace(`/${locale}/settings`);
      }
    }
  }, [user, loading, router, locale]);

  // Show loading while translations are being loaded or during authentication
  if (loading || translationsLoading || !user || user.status === 'pending') {
    return (
      <AppLayout pageTitle="Dashboard" locale={locale}>
        <div className="flex-1 space-y-8 p-4 md:p-8 flex justify-center items-center">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
        </div>
      </AppLayout>
    );
  }
  
  const pageTitle = t('page_title');

  const renderDashboardByRole = () => {
    switch(user.role) {
      case 'dentist':
        return <DentistDashboard user={user} t={t} />;
      case 'lk_member':
        return <LkMemberDashboard user={user} t={t} locale={locale} />;
      // Add other roles here in the future
      default:
        // Fallback to a default view or dentist view if preferred
        return <DentistDashboard user={user} t={t} />;
    }
  };

  return (
    <AppLayout pageTitle={pageTitle} locale={locale}>
      {renderDashboardByRole()}
    </AppLayout>
  );
}
