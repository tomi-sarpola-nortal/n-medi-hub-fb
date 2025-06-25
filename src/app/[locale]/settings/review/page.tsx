"use client";

import AppLayout from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader } from '@/components/ui/card';
import { ArrowLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';

// Helper for client-side translations (reuse from member-overview)
const getClientTranslations = (locale: string) => {
  try {
    const page = locale === 'de' ? require('../../../../../locales/de/member-overview.json') : require('../../../../../locales/en/member-overview.json');
    const register = locale === 'de' ? require('../../../../../locales/de/register.json') : require('../../../../../locales/en/register.json');
    const settings = locale === 'de' ? require('../../../../../locales/de/settings.json') : require('../../../../../locales/en/settings.json');
    return {...page, ...register, ...settings};
  } catch (e) {
    console.warn("Translation file not found, falling back to en");
    const page = require('../../../../../locales/en/member-overview.json');
    const register = require('../../../../../locales/en/register.json');
    const settings = require('../../../../../locales/en/settings.json');
    return {...page, ...register, ...settings};
  }
};

export default function UserDataReviewPage() {
  const params = useParams<{ locale: string }>();
  const { locale } = params;
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  
  const [t, setT] = useState<Record<string, string>>({});

  useEffect(() => {
    setT(getClientTranslations(locale));
  }, [locale]);
  
  const changedFields = useMemo(() => {
    if (!user || !user.pendingData) return [];
    return Object.keys(user.pendingData).map(key => ({
      field: key,
      oldValue: (user as any)[key],
      newValue: (user.pendingData as any)[key],
    }));
  }, [user]);

  const pageTitle = t.settings_pending_changes_title || "Review Your Submitted Changes";
  const isLoading = authLoading || Object.keys(t).length === 0 || !user;

  if (isLoading) {
    return (
        <AppLayout pageTitle="Loading..." locale={locale}>
            <div className="flex-1 space-y-6 p-4 md:p-8 flex justify-center items-center">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
            </div>
        </AppLayout>
    );
  }

  if (!user.pendingData) {
      router.replace(`/${locale}/settings`);
      return null;
  }
  
  // Helper to format values for display, defined inside the component
  const formatValue = (value: any) => {
    if (value === null || value === undefined || value === '') return <span className="italic text-muted-foreground">empty</span>;
    if (Array.isArray(value)) return value.join(', ');
    return String(value);
  };

  return (
    <AppLayout pageTitle={pageTitle} locale={locale}>
        <div className="flex-1 space-y-6 p-4 md:p-8 max-w-4xl mx-auto">
             <div className="flex items-center justify-between">
                <div>
                     <h1 className="text-3xl font-bold tracking-tight font-headline flex items-center gap-2">
                        {pageTitle}
                    </h1>
                     <div className="text-sm text-muted-foreground mt-2">
                        <Link href={`/${locale}/settings`} className="hover:underline">{t.settings_page_title || "Settings"}</Link>
                        <span className="mx-1">/</span>
                        <span className="font-medium text-foreground">{t.settings_pending_changes_title || "Pending Changes"}</span>
                    </div>
                </div>
            </div>

            <Card>
                <CardContent className="p-6 space-y-6">
                    <div className="bg-amber-50 border border-amber-300 dark:bg-amber-950/20 dark:border-amber-800 rounded-lg p-4">
                        <p className="text-sm text-muted-foreground">{t.settings_pending_changes_desc || "Your recent data changes have been submitted for review."}</p>
                        <p className="text-sm text-muted-foreground mt-2">{t.member_review_info_change_date || "Date of Data Change"}: {user.updatedAt ? new Date(user.updatedAt).toLocaleDateString() : 'N/A'}</p>
                    </div>

                     <div className="border rounded-lg">
                        <div className="grid grid-cols-4 gap-4 px-4 py-2 font-semibold text-muted-foreground bg-black/5 dark:bg-white/5 border-b">
                            <div className="col-span-1">{t.member_review_column_field || "Field"}</div>
                            <div className="col-span-1">{t.member_review_old_data || "Old"}</div>
                            <div className="col-span-1">{t.member_review_new_data || "New"}</div>
                            <div className="col-span-1">{t.member_review_column_status || "Status"}</div>
                        </div>
                        {changedFields.length > 0 ? changedFields.map(diff => {
                            const isUpdated = JSON.stringify(diff.oldValue) !== JSON.stringify(diff.newValue);
                            return (
                                <div key={diff.field} className="grid grid-cols-4 gap-4 px-4 py-3 border-b last:border-b-0 items-start">
                                    <div className="col-span-1 text-sm font-medium text-foreground">{t[`register_step2_label_${diff.field}`] || t[`register_step4_label_${diff.field}`] || t[`register_step5_label_${diff.field}`] || diff.field}</div>
                                    <div className="col-span-1 text-sm text-muted-foreground">{formatValue(diff.oldValue)}</div>
                                    <div className="col-span-1 text-sm text-foreground">{formatValue(diff.newValue)}</div>
                                    <div className={`col-span-1 text-sm ${isUpdated ? 'font-bold text-primary' : 'text-muted-foreground'}`}>
                                        {isUpdated ? (t.member_review_status_updated || 'Updated') : (t.member_review_status_no_change || 'No Change')}
                                    </div>
                                </div>
                            );
                        }) : (
                            <p className="text-muted-foreground text-center p-4">No changes were found in the submission.</p>
                        )}
                    </div>
                    <div className="flex justify-end">
                        <Button asChild>
                            <Link href={`/${locale}/settings`}>
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                {t.register_back_button || "Back to Settings"}
                            </Link>
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    </AppLayout>
  );
}