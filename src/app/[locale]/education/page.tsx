
"use client";

import { useEffect, useState, useMemo } from 'react';
import { useAuth } from '@/context/auth-context';
import { getTrainingHistoryForUser } from '@/services/trainingHistoryService';
import { getAllTrainingCategories } from '@/services/trainingCategoryService';
import type { TrainingHistory, TrainingCategory } from '@/lib/types';
import AppLayout from '@/components/layout/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { CircularProgress } from '@/components/ui/circular-progress';
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { useParams } from 'next/navigation';

// Helper for client-side translations
const getClientTranslations = (locale: string) => {
    try {
        if (locale === 'de') {
            return require('../../../../locales/de.json');
        }
        return require('../../../../locales/en.json');
    } catch (e) {
        console.warn("Translation file not found for education page, falling back to en");
        return require('../../../../locales/en.json');
    }
};

interface SpecialDiplomaItem {
  id: string;
  title: string;
  currentPoints: number;
  totalPoints: number;
  percentage: number;
}

const ITEMS_PER_PAGE = 7;

export default function EducationPage() {
    const { user, loading: authLoading } = useAuth();
    const params = useParams();
    const locale = typeof params.locale === 'string' ? params.locale : 'en';

    const [t, setT] = useState<Record<string, string>>({});

    const [trainingHistory, setTrainingHistory] = useState<TrainingHistory[]>([]);
    const [allCategories, setAllCategories] = useState<TrainingCategory[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);

    useEffect(() => {
        setT(getClientTranslations(locale));
    }, [locale]);
    
    useEffect(() => {
        if (user) {
            const fetchData = async () => {
                setIsLoading(true);
                try {
                    const [history, categories] = await Promise.all([
                        getTrainingHistoryForUser(user.id),
                        getAllTrainingCategories()
                    ]);
                    setTrainingHistory(history);
                    setAllCategories(categories);
                } catch (error) {
                    console.error("Failed to fetch education data:", error);
                } finally {
                    setIsLoading(false);
                }
            };
            fetchData();
        } else if (!authLoading) {
            setIsLoading(false);
        }
    }, [user, authLoading]);

    // Calculate ZFD progress dynamically
    const zfdProgressData = useMemo(() => {
        if (!trainingHistory || allCategories.length === 0 || Object.keys(t).length === 0) {
            return { categories: [], total: { current: 0, total: 0 }};
        }

        // 1. Build ZFD group definitions from the fetched categories
        const zfdGroups: { [key: string]: { label: string; total: number; current: number; childAbbrs: string[] } } = {};
        const categoryToZfdGroupMap: { [key: string]: string } = {};

        allCategories.forEach(cat => {
            if (cat.zfdGroupName && cat.zfdGroupPoints) {
                if (!zfdGroups[cat.zfdGroupName]) {
                    zfdGroups[cat.zfdGroupName] = {
                        label: t[cat.zfdGroupName] || cat.zfdGroupName,
                        total: cat.zfdGroupPoints,
                        current: 0,
                        childAbbrs: []
                    };
                }
                zfdGroups[cat.zfdGroupName].childAbbrs.push(cat.abbreviation);
                categoryToZfdGroupMap[cat.abbreviation] = cat.zfdGroupName;
            }
        });

        // 2. Calculate points for each group
        trainingHistory.forEach(record => {
            const zfdGroupName = categoryToZfdGroupMap[record.category];
            if (zfdGroupName && zfdGroups[zfdGroupName]) {
                zfdGroups[zfdGroupName].current += record.points;
            }
        });

        // 3. Format for rendering
        const categories = Object.values(zfdGroups);
        const totalCurrent = categories.reduce((sum, cat) => sum + cat.current, 0);
        const totalMax = categories.reduce((sum, cat) => sum + cat.total, 0);
        
        return {
            categories,
            total: { current: totalCurrent, total: totalMax }
        };
    }, [trainingHistory, allCategories, t]);

    // Calculate specialist diplomas dynamically
    const specialistDiplomas = useMemo(() => {
        if (!trainingHistory || Object.keys(t).length === 0) return [];

        const categoryPoints: { [key: string]: number } = {};
        
        const diplomaCategoryMap: { [key: string]: string } = {
            'IMPL': t.register_step4_spec_implantologie || 'Implantology',
            'KFO': t.register_step4_spec_kieferorthopaedie || 'Orthodontics',
            'PARO': t.register_step4_spec_parodontologie || 'Periodontology',
            'ZMK': t.register_step4_spec_allgemeine_zahnheilkunde || 'General Dentistry',
        };
        const diplomaCategoryAbbrs = Object.keys(diplomaCategoryMap);

        trainingHistory.forEach(record => {
            if (diplomaCategoryAbbrs.includes(record.category)) {
                if (!categoryPoints[record.category]) {
                    categoryPoints[record.category] = 0;
                }
                categoryPoints[record.category] += record.points;
            }
        });

        const totalPointsForDiploma = 50;

        const diplomas: SpecialDiplomaItem[] = Object.entries(categoryPoints).map(([categoryAbbr, currentPoints]) => ({
            id: categoryAbbr,
            title: diplomaCategoryMap[categoryAbbr] || categoryAbbr,
            currentPoints,
            totalPoints: totalPointsForDiploma,
            percentage: (currentPoints / totalPointsForDiploma) * 100,
        }));

        // Sort by points descending and take top 3
        return diplomas.sort((a, b) => b.currentPoints - a.currentPoints).slice(0, 3);

    }, [trainingHistory, t]);

    const totalPages = Math.ceil(trainingHistory.length / ITEMS_PER_PAGE);
    const paginatedTrainingHistory = useMemo(() => {
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        return trainingHistory.slice(startIndex, startIndex + ITEMS_PER_PAGE);
    }, [trainingHistory, currentPage]);
  
    const pageTitle = t.education_page_title || "My Advanced Trainings";

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

  return (
    <AppLayout pageTitle={pageTitle} locale={locale}>
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
          <CardContent className="flex flex-col items-center justify-center gap-6 pt-6">
             <CircularProgress 
                value={zfdProgressData.total.total > 0 ? (zfdProgressData.total.current / zfdProgressData.total.total) * 100 : 0} 
                radius={80} 
                strokeWidth={14}
                valueText={t.zfd_total_progress?.replace('{current}', zfdProgressData.total.current.toString()).replace('{total}', zfdProgressData.total.total.toString()) || ''}
                textClassName="font-headline"
              />
            <div className="w-full max-w-lg space-y-4">
              {zfdProgressData.categories.map(category => (
                <div key={category.label}>
                  <div className="mb-1 flex justify-between">
                    <span className="text-sm font-medium">{category.label}</span>
                    <span className="text-sm text-muted-foreground">
                      {t.zfd_total_progress?.replace('{current}', category.current.toString()).replace('{total}', category.total.toString())}
                    </span>
                  </div>
                  <Progress value={category.total > 0 ? (category.current / category.total) * 100 : 0} className="h-3" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div>
          <h2 className="text-2xl font-semibold font-headline tracking-tight mb-4">{t.spezialdiplome_title || "Specialist Diplomas"}</h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {specialistDiplomas.map(diploma => (
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
                    {t.spezialdiplome_points?.replace('{currentPoints}', diploma.currentPoints.toString()).replace('{totalPoints}', diploma.totalPoints.toString())}
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
                        ?.replace('{start}', (ITEMS_PER_PAGE * (currentPage - 1) + 1).toString())
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
