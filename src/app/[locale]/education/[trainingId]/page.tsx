
"use client";

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/auth-context';
import { getTrainingHistoryItem } from '@/services/trainingHistoryService';
import { getAllZfdGroups } from '@/services/zfdGroupService';
import type { TrainingHistory } from '@/lib/types';
import AppLayout from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, ArrowLeft, Calendar, Star, Building, Bookmark, BookOpen } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { format } from 'date-fns';
import Link from 'next/link';

// Helper for client-side translations
const getClientTranslations = (locale: string) => {
    try {
        const page = locale === 'de' ? require('../../../../../locales/de/education.json') : require('../../../../../locales/en/education.json');
        return page;
    } catch (e) {
        console.warn("Translation file not found, falling back to en");
        return require('../../../../../locales/en/education.json');
    }
};

const DetailRow = ({ icon: Icon, label, value }: { icon: React.ElementType, label: string, value: string | number | undefined }) => {
    if (!value && value !== 0) return null;
    return (
        <div className="flex items-start gap-4 py-3 border-b last:border-0">
            <Icon className="h-5 w-5 text-muted-foreground mt-1 flex-shrink-0" />
            <div>
                <p className="text-sm text-muted-foreground">{label}</p>
                <p className="font-medium">{value}</p>
            </div>
        </div>
    )
};


export default function TrainingDetailPage() {
    const { user, loading: authLoading } = useAuth();
    const params = useParams();
    const router = useRouter();
    const locale = typeof params.locale === 'string' ? params.locale : 'en';
    const trainingId = typeof params.trainingId === 'string' ? params.trainingId : null;
    
    const [t, setT] = useState<Record<string, string>>({});
    const [item, setItem] = useState<TrainingHistory | null>(null);
    const [zfdGroupName, setZfdGroupName] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        setT(getClientTranslations(locale));
    }, [locale]);

    useEffect(() => {
        if (user && trainingId && Object.keys(t).length > 0) {
            const fetchData = async () => {
                setIsLoading(true);
                try {
                    const [historyItem, allZfdGroups] = await Promise.all([
                        getTrainingHistoryItem(user.id, trainingId),
                        getAllZfdGroups()
                    ]);
                    
                    setItem(historyItem);

                    if (historyItem?.zfdGroupId) {
                        const group = allZfdGroups.find(g => g.id === historyItem.zfdGroupId);
                        if (group) {
                            setZfdGroupName(t[group.nameKey] || group.nameKey);
                        }
                    }
                } catch (error) {
                    console.error("Failed to fetch training data:", error);
                } finally {
                    setIsLoading(false);
                }
            };
            fetchData();
        } else if (!authLoading) {
            setIsLoading(false);
        }
    }, [user, trainingId, authLoading, t]);
    
    const pageTitle = item?.title || t.fortbildungshistorie_table_title || "Training Details";
    const pageIsLoading = authLoading || isLoading || Object.keys(t).length === 0;

    if (pageIsLoading) {
        return (
            <AppLayout pageTitle={pageTitle} locale={locale}>
                <div className="flex-1 space-y-8 p-4 md:p-8 flex justify-center items-center">
                    <Loader2 className="h-10 w-10 animate-spin text-primary" />
                </div>
            </AppLayout>
        );
    }
    
    if (!item) {
        return (
            <AppLayout pageTitle="Not Found" locale={locale}>
                <div className="flex-1 space-y-4 p-4 md:p-8 text-center">
                    <h1 className="text-2xl font-bold">Training not found</h1>
                    <p>The training you are looking for does not exist or you do not have permission to view it.</p>
                     <Button asChild><Link href="/education">Back to Trainings</Link></Button>
                </div>
            </AppLayout>
        );
    }
    
    const breadcrumbCurrent = t.education_breadcrumb_current || "My Advanced Trainings";

    return (
        <AppLayout pageTitle={item.title} locale={locale}>
            <div className="flex-1 space-y-6 p-4 md:p-8">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => router.back()}>
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <div>
                        <div className="text-sm text-muted-foreground">
                            <Link href={`/${locale}/dashboard`} className="hover:underline">{t.education_breadcrumb_dashboard || "Dashboard"}</Link>
                            <span className="mx-1">/</span>
                            <Link href={`/${locale}/education`} className="hover:underline">{breadcrumbCurrent}</Link>
                             <span className="mx-1">/</span>
                            <span className="font-medium text-foreground truncate">{item.title}</span>
                        </div>
                    </div>
                </div>

                <Card className="max-w-2xl mx-auto shadow-lg">
                    <CardHeader>
                        <CardTitle className="text-2xl font-bold font-headline">{item.title}</CardTitle>
                        <CardDescription>{t.fortbildungshistorie_title || "Training History"} Detail</CardDescription>
                    </CardHeader>
                    <CardContent className="pt-2">
                        <DetailRow icon={Calendar} label={t.fortbildungshistorie_table_date || "Date"} value={format(new Date(item.date), 'dd.MM.yyyy')} />
                        <DetailRow icon={BookOpen} label={t.fortbildungshistorie_table_category || "Category"} value={item.category} />
                        {zfdGroupName && (
                            <DetailRow icon={Bookmark} label={"ZFD Group"} value={zfdGroupName} />
                        )}
                        <DetailRow icon={Star} label={t.fortbildungshistorie_table_points || "Points"} value={item.points} />
                        <DetailRow icon={Building} label={t.fortbildungshistorie_table_organizer || "Organizer"} value={item.organizer} />
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
