
"use client";

import { useEffect, useState, useMemo } from 'react';
import { useAuth } from '@/context/auth-context';
import { getTrainingHistoryForUser } from '@/services/trainingHistoryService';
import type { TrainingHistory } from '@/lib/types';
import AppLayout from '@/components/layout/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { CircularProgress } from '@/components/ui/circular-progress';
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { format } from 'date-fns';

// Helper for client-side translations
const getClientTranslations = (locale: string) => {
    try {
        if (locale === 'de') {
            return require('../../../locales/de.json');
        }
        return require('../../../locales/en.json');
    } catch (e) {
        console.warn("Translation file not found for education page, falling back to en");
        return require('../../../locales/en.json');
    }
};


interface ZfdProgressItem {
  label: string;
  current: number;
  total: number;
  color?: string;
}

interface SpecialDiplomaItem {
  id: string;
  title: string;
  currentPoints: number;
  totalPoints: number;
  percentage: number;
}

const mockZfdTotal = { current: 97, total: 120 };

const mockSpecialDiplomas: SpecialDiplomaItem[] = [
  { id: 'implant', title: "Implantologie", currentPoints: 45, totalPoints: 50, percentage: 90 },
  { id: 'kfo', title: "Kieferorthopädie", currentPoints: 30, totalPoints: 50, percentage: 60 },
  { id: 'paro', title: "Parodontologie", currentPoints: 15, totalPoints: 50, percentage: 30 },
];

const ITEMS_PER_PAGE = 7;

interface EducationPageProps {
  params: { locale: string };
}

export default function EducationPage({ params }: EducationPageProps) {
    const { user, loading: authLoading } = useAuth();
    const [t, setT] = useState<Record<string, string>>({});

    const [trainingHistory, setTrainingHistory] = useState<TrainingHistory[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);

    useEffect(() => {
        setT(getClientTranslations(params.locale));
    }, [params.locale]);
    
    useEffect(() => {
        if (user) {
            const fetchHistory = async () => {
                setIsLoading(true);
                try {
                    const history = await getTrainingHistoryForUser(user.id);
                    setTrainingHistory(history);
                } catch (error) {
                    console.error("Failed to fetch training history:", error);
                    // Optionally, show a toast notification
                } finally {
                    setIsLoading(false);
                }
            };
            fetchHistory();
        } else if (!authLoading) {
            // If user is not logged in and auth is resolved, maybe redirect
            // For now, it will just show a loader or empty state
            setIsLoading(false);
        }
    }, [user, authLoading]);

    const totalPages = Math.ceil(trainingHistory.length / ITEMS_PER_PAGE);
    const paginatedTrainingHistory = useMemo(() => {
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        return trainingHistory.slice(startIndex, startIndex + ITEMS_PER_PAGE);
    }, [trainingHistory, currentPage]);
  
    const pageTitle = t.education_page_title || "My Advanced Trainings";

    if (authLoading || Object.keys(t).length === 0) {
        return (
            <AppLayout pageTitle={pageTitle} locale={params.locale}>
                <div className="flex-1 space-y-8 p-4 md:p-8 flex justify-center items-center">
                    <Loader2 className="h-10 w-10 animate-spin text-primary" />
                </div>
            </AppLayout>
        );
    }
  
    const mockZfdCategories: ZfdProgressItem[] = [
        { label: t.zfd_category_berufsbezogen || "Job-related", current: 45, total: 60 },
        { label: t.zfd_category_frei || "Free Choice", current: 12, total: 15 },
        { label: t.zfd_category_literatur || "Literature/Webinars", current: 40, total: 45 },
    ];

  return (
    <AppLayout pageTitle={pageTitle} locale={params.locale}>
      <div className="flex-1 space-y-6 p-4 md:p-8">
        <div className="flex items-center justify-between space-y-2">
            <div>
                <span className="text-sm text-muted-foreground">{t.education_breadcrumb_dashboard || "Dashboard"} / </span>
                <span className="text-sm font-medium">{t.education_breadcrumb_current || "My Advanced Trainings"}</span>
            </div>
        </div>
        <h1 className="text-3xl font-bold tracking-tight font-headline">{pageTitle}</h1>
        
        <Separator />

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl font-medium font-headline">{t.zfd_fortbildung_title || "ZFD Advanced Training"}</CardTitle>
          </CardHeader>
          <CardContent className="grid md:grid-cols-3 gap-6 items-center">
            <div className="md:col-span-1 flex justify-center">
              <CircularProgress 
                value={(mockZfdTotal.current / mockZfdTotal.total) * 100} 
                radius={70} 
                strokeWidth={12}
                valueText={t.zfd_total_progress.replace('{current}', mockZfdTotal.current.toString()).replace('{total}', mockZfdTotal.total.toString())}
                textClassName="font-headline"
              />
            </div>
            <div className="md:col-span-2 space-y-4">
              {mockZfdCategories.map(category => (
                <div key={category.label}>
                  <div className="mb-1 flex justify-between">
                    <span className="text-sm font-medium">{category.label}</span>
                    <span className="text-sm text-muted-foreground">
                      {t.zfd_total_progress.replace('{current}', category.current.toString()).replace('{total}', category.total.toString())}
                    </span>
                  </div>
                  <Progress value={(category.current / category.total) * 100} className="h-3" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div>
          <h2 className="text-2xl font-semibold font-headline tracking-tight mb-4">{t.spezialdiplome_title || "Specialist Diplomas"}</h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {mockSpecialDiplomas.map(diploma => (
              <Card key={diploma.id} className="shadow-md hover:shadow-lg transition-shadow duration-300">
                <CardContent className="pt-6 flex flex-col items-center justify-center text-center">
                   <CircularProgress 
                    value={diploma.percentage} 
                    radius={50} 
                    strokeWidth={8}
                    textClassName="font-headline"
                  />
                  <CardTitle className="text-lg font-medium font-headline mt-4">{diploma.title}</CardTitle>
                  <CardDescription>
                    {t.spezialdiplome_points.replace('{currentPoints}', diploma.currentPoints.toString()).replace('{totalPoints}', diploma.totalPoints.toString())}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl font-medium font-headline">{t.fortbildungshistorie_title || "Training History"}</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
                <div className="flex justify-center items-center h-48">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            ) : (
                <>
                <Table>
                    <TableHeader>
                        <TableRow>
                        <TableHead className="w-[100px]">{t.fortbildungshistorie_table_date || "Date"}</TableHead>
                        <TableHead>{t.fortbildungshistorie_table_title || "Training Title"}</TableHead>
                        <TableHead>{t.fortbildungshistorie_table_category || "Category"}</TableHead>
                        <TableHead className="text-right">{t.fortbildungshistorie_table_points || "Points"}</TableHead>
                        <TableHead>{t.fortbildungshistorie_table_organizer || "Organizer"}</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {paginatedTrainingHistory.map((item) => (
                        <TableRow key={item.id}>
                            <TableCell className="font-medium">{format(new Date(item.date), 'dd.MM.yyyy')}</TableCell>
                            <TableCell>{item.title}</TableCell>
                            <TableCell>{item.category}</TableCell>
                            <TableCell className="text-right">{item.points}</TableCell>
                            <TableCell>{item.organizer}</TableCell>
                        </TableRow>
                        ))}
                    </TableBody>
                </Table>
                <div className="mt-6 flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">
                        {t.fortbildungshistorie_pagination_showing
                        .replace('{start}', (ITEMS_PER_PAGE * (currentPage - 1) + 1).toString())
                        .replace('{end}', Math.min(ITEMS_PER_PAGE * currentPage, trainingHistory.length).toString())
                        .replace('{total}', trainingHistory.length.toString())
                        }
                    </p>
                    <div className="flex space-x-2">
                        <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => p - 1)} disabled={currentPage === 1}>
                        <ChevronLeft className="mr-2 h-4 w-4" />
                        {t.fortbildungshistorie_pagination_back || "Back"}
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => p + 1)} disabled={currentPage >= totalPages}>
                        {t.fortbildungshistorie_pagination_next || "Next"}
                        <ChevronRight className="ml-2 h-4 w-4" />
                        </Button>
                    </div>
                </div>
                </>
            )}
          </CardContent>
        </Card>

        <p className="text-xs text-muted-foreground text-center pt-4">
          {t.fortbildungshistorie_footer_note || "The points displayed are based on the interface with the training platform..."}
        </p>

      </div>
    </AppLayout>
  );
}
