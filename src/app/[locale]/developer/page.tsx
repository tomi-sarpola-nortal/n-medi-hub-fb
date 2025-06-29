"use client";

import AppLayout from '@/components/layout/AppLayout';
import SeedButton from '@/components/dashboard/SeedButton';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useEffect, useState } from 'react';
import { useAuth } from '@/context/auth-context';
import { Loader2, Database, BookMarked, UserCog } from 'lucide-react';
import { useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { setSabineMuellerToPending } from '@/app/actions/seedActions';

const getClientTranslations = (locale: string) => {
  try {
    const layout = locale === 'de' ? require('../../../../locales/de/layout.json') : require('../../../../locales/en/layout.json');
    const page = locale === 'de' ? require('../../../../locales/de/developer.json') : require('../../../../locales/en/developer.json');
    return { ...layout, ...page };
  } catch (e) {
    console.warn("Translation file not found for developer page, falling back to en");
    const layout = require('../../../../locales/en/layout.json');
    const page = require('../../../../locales/en/developer.json');
    return { ...layout, ...page };
  }
};

export default function DeveloperPage() {
  const params = useParams();
  const locale = typeof params.locale === 'string' ? params.locale : 'en';
  const [t, setT] = useState<Record<string, string>>({});
  const { user, loading } = useAuth();
  const { toast } = useToast();
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  useEffect(() => {
    setT(getClientTranslations(locale));
  }, [locale]);

  const handleUpdateStatus = async () => {
    setIsUpdatingStatus(true);
    try {
      const result = await setSabineMuellerToPending();
      if (result.success) {
        toast({
          title: "Status Updated",
          description: result.message,
        });
      } else {
        toast({
          title: "Update Failed",
          description: result.message,
          variant: "destructive",
        });
      }
    } catch (error) {
       const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred.";
       toast({
        title: "Client-side Error",
        description: `Failed to execute action: ${errorMessage}`,
        variant: "destructive",
      });
    }
    setIsUpdatingStatus(false);
  };

  const pageTitle = t.developer_module_page_title || "Developer Module";

  // Remove the loading check that depends on user authentication
  if (Object.keys(t).length === 0) {
    return (
      <AppLayout pageTitle={pageTitle} locale={locale}>
        <div className="flex-1 space-y-8 p-4 md:p-8 flex justify-center items-center">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout pageTitle={pageTitle} locale={locale}>
      <div className="flex-1 space-y-6 p-4 md:p-8">
        <h1 className="text-3xl font-bold tracking-tight font-headline">{pageTitle}</h1>
        <p className="text-muted-foreground">{t.developer_module_page_description || "Actions for development and testing."}</p>
        
        <div className="space-y-6">
            <Card className="border-destructive/50 bg-destructive/5">
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <Database className="h-5 w-5 text-destructive" />
                        <CardTitle className="text-destructive">Database Seeding</CardTitle>
                    </div>
                    <CardDescription className="text-destructive/80">Populate Firestore collections with initial data. This only needs to be done once per collection. After successful seeding, this module can be removed.</CardDescription>
                </CardHeader>
                <CardContent>
                    <SeedButton />
                </CardContent>
            </Card>

            {user && (
              <Card>
                  <CardHeader>
                      <div className="flex items-center gap-2">
                          <UserCog className="h-5 w-5 text-primary" />
                          <CardTitle>User State Testing</CardTitle>
                      </div>
                      <CardDescription>Set specific users to certain states for testing UI and logic flows.</CardDescription>
                  </CardHeader>
                  <CardContent>
                      <Button onClick={handleUpdateStatus} disabled={isUpdatingStatus}>
                          {isUpdatingStatus && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                          Set sabine.mueller@example.com to Pending
                      </Button>
                  </CardContent>
              </Card>
            )}

            <Card>
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <BookMarked className="h-5 w-5 text-primary" />
                        <CardTitle>{t.developer_module_project_history_title || "Project History"}</CardTitle>
                    </div>
                    <CardDescription>{t.developer_module_project_history_desc || "View a summary of implemented features and project history."}</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-wrap gap-4">
                        <Button asChild variant="outline">
                            <Link href="/docs/project-history.md" target="_blank">
                                {t.developer_module_show_project_history_button || "Show Project History"}
                            </Link>
                        </Button>
                         <Button asChild variant="outline">
                            <Link href="/docs/prompt_history.md" target="_blank">
                                {t.developer_module_show_prompt_history_button || "Show Prompt History"}
                            </Link>
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>

      </div>
    </AppLayout>
  );
}