
"use client";

import { useEffect, useState, useMemo } from 'react';
import { useAuth } from '@/context/auth-context';
import { getTrainingHistoryForUser } from '@/services/trainingHistoryService';
import { getAllTrainingCategories } from '@/services/trainingCategoryService';
import { getAllZfdGroups } from '@/services/zfdGroupService';
import type { TrainingHistory, TrainingCategory, ZfdGroup } from '@/lib/types';
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
    const [zfdGroups, setZfdGroups] = useState<ZfdGroup[]>([]);
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
                    const [history, categories, zfdGroupsData] = await Promise.all([
                        getTrainingHistoryForUser(user.id),
                        getAllTrainingCategories(),
                        getAllZfdGroups()
                    ]);
                    setTrainingHistory(history);
                    setAllCategories(categories);
                    setZfdGroups(zfdGroupsData);
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
        if (!trainingHistory || zfdGroups.length === 0 || Object.keys(t).length === 0) {
            const totalCurrent = trainingHistory.reduce((sum, record) => sum + (record.points || 0), 0);
            return { categories: [], total: { current: totalCurrent, total: 120 }};
        }
    
        // 1. Initialize progress data from the fetched ZFD groups
        const progressData: { [key: string]: { label: string; total: number; current: number; } } = {};
        zfdGroups.forEach(group => {
            progressData[group.id] = {
                label: t[group.nameKey] || group.nameKey,
                total: group.totalPoints,
                current: 0,
            };
        });
    
        // 2. Calculate current points for each ZFD group using the direct link
        trainingHistory.forEach(record => {
            if (record.zfdGroupId && progressData[record.zfdGroupId]) {
                progressData[record.zfdGroupId].current += record.points;
            }
        });
    
        // 3. Format for rendering
        const categoriesForDisplay = Object.values(progressData);
        const totalMaxPoints = zfdGroups.reduce((sum, group) => sum + group.totalPoints, 0);
        const totalCurrentPoints = trainingHistory.reduce((sum, record) => sum + (record.points || 0), 0);
        
        return {
            categories: categoriesForDisplay,
            total: { current: totalCurrentPoints, total: totalMaxPoints || 120 }
        };
    }, [trainingHistory, zfdGroups, t]);

    const progressColors = [
        'bg-[hsl(var(--zfd-color-1))]',
        'bg-[hsl(var(--zfd-color-2))]',
        'bg-[hsl(var(--zfd-color-3))]',
    ];

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
          <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center pt-6">
            <div className="md:col-span-1 flex justify-center">
                <CircularProgress 
                    value={zfdProgressData.total.total > 0 ? (zfdProgressData.total.current / zfdProgressData.total.total) * 100 : 0} 
                    radius={80} 
                    strokeWidth={12}
                    label={
                        <div className="text-center">
                            <p className="text-3xl font-bold font-headline">
                                {`${zfdProgressData.total.current}/${zfdProgressData.total.total}`}
                            </p>
                            <p className="text-sm text-muted-foreground mt-1">
                                {t.zfd_total_progress?.split(' ')[1] || "Points"}
                            </p>
                        </div>
                    }
                    showValue={false}
                    progressColor="hsl(var(--dark-blue))"
                />
            </div>
            <div className="md:col-span-2 space-y-4">
              {zfdProgressData.categories.map((category, index) => (
                <div key={category.label}>
                  <div className="mb-1 flex justify-between text-sm">
                    <span className="font-medium text-foreground">{category.label}</span>
                    <span className="text-muted-foreground">
                      {t.zfd_total_progress
                        ?.replace('{current}', category.current.toString())
                        .replace('{total}', category.total.toString())
                      }
                    </span>
                  </div>
                  <Progress 
                    value={(category.current / category.total) * 100}
                    indicatorClassName={progressColors[index % progressColors.length]}
                  />
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
                <CardContent className="p-6 flex flex-row items-center justify-between gap-4">
                  <div className="text-left">
                    <CardTitle className="text-lg font-medium font-headline">{diploma.title}</CardTitle>
                    <CardDescription>
                      {t.spezialdiplome_points?.replace('{currentPoints}', diploma.currentPoints.toString()).replace('{totalPoints}', diploma.totalPoints.toString())}
                    </CardDescription>
                  </div>
                  <div className="flex-shrink-0">
                    <CircularProgress 
                      value={diploma.percentage} 
                      radius={40} 
                      strokeWidth={8}
                      textClassName="text-base font-bold font-headline"
                      progressColor="hsl(var(--dark-blue))"
                    />
                  </div>
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
