
"use client";

import { useEffect, useState, useMemo, useCallback } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import AppLayout from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { PlusCircle, Search, Loader2, MoreHorizontal, FilePen } from 'lucide-react';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Separator } from '@/components/ui/separator';
import Link from 'next/link';
import { getPersonsPaginated, getPersonsToReview, setPersonStatus } from '@/services/personService';
import { getAllRepresentations } from '@/services/representationService';
import { useToast } from '@/hooks/use-toast';
import type { Person } from '@/lib/types';
import { format } from 'date-fns';
import { useClientTranslations } from '@/hooks/use-client-translations';

interface AugmentedPerson extends Person {
  totalRepHours: number;
}

export default function MemberOverviewPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t, isLoading: translationsLoading, locale } = useClientTranslations(['member-overview', 'common']);
  const { toast } = useToast();

  const parseSearchParam = (paramName: string, defaultValue: any) => searchParams.get(paramName) || defaultValue;

  // State initialization from URL params
  const [page, setPage] = useState(() => Number(parseSearchParam('page', '1')));
  const [pageSize, setPageSize] = useState(() => Number(parseSearchParam('pageSize', '10')));
  const [statusFilter, setStatusFilter] = useState(() => parseSearchParam('status', 'all'));
  const [pointsFilter, setPointsFilter] = useState(() => parseSearchParam('points', 'all'));
  const [repsFilter, setRepsFilter] = useState(() => parseSearchParam('reps', 'all'));
  const [searchTerm, setSearchTerm] = useState(() => parseSearchParam('search', ''));
  
  const [augmentedPersons, setAugmentedPersons] = useState<AugmentedPerson[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [personToDeactivate, setPersonToDeactivate] = useState<AugmentedPerson | null>(null);
  const [personToActivate, setPersonToActivate] = useState<AugmentedPerson | null>(null);
  const [totalCount, setTotalCount] = useState(0);
  const [membersToReview, setMembersToReview] = useState<Person[]>([]);

  const updateUrl = useCallback((newParams: Record<string, string | number>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(newParams).forEach(([key, value]) => {
      if (value === '' || value === 'all' || (key === 'page' && value === 1)) {
        params.delete(key);
      } else {
        params.set(key, String(value));
      }
    });
    router.push(`/${locale}/member-overview?${params.toString()}`);
  }, [searchParams, router, locale]);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const filters: Record<string, any> = {};
      if (statusFilter !== 'all') filters.status = statusFilter;
      
      const { data: persons, total } = await getPersonsPaginated({
        page,
        pageSize,
        orderBy: { field: 'name', direction: 'asc' },
        filters,
      });
      
      setTotalCount(total);

      const allReps = await getAllRepresentations();
      const repHoursMap = new Map<string, number>();
      allReps.forEach(rep => {
        if (rep.status === 'confirmed') {
          const currentHours = repHoursMap.get(rep.representedPersonId) || 0;
          repHoursMap.set(rep.representedPersonId, currentHours + rep.durationHours);
        }
      });

      const augmented = persons.map(person => ({
        ...person,
        totalRepHours: repHoursMap.get(person.id) || 0,
      }));
      setAugmentedPersons(augmented);

      const personsToReview = await getPersonsToReview();
      setMembersToReview(personsToReview);
    } catch (error) {
      console.error("Failed to fetch member data:", error);
      toast({ title: "Error", description: "Failed to load member data.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  }, [page, pageSize, statusFilter, toast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchTerm !== (searchParams.get('search') || '')) {
        updateUrl({ search: searchTerm, page: 1 });
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm, searchParams, updateUrl]);

  const handleDeactivateConfirm = async () => {
    if (!personToDeactivate) return;
    setIsSubmitting(true);
    const result = await setPersonStatus(personToDeactivate.id, 'inactive');
    if (result.success) {
      toast({ title: "Success", description: result.message });
      fetchData();
    } else {
      toast({ title: "Error", description: result.message, variant: "destructive" });
    }
    setPersonToDeactivate(null);
    setIsSubmitting(false);
  };

  const handleActivateConfirm = async () => {
    if (!personToActivate) return;
    setIsSubmitting(true);
    const result = await setPersonStatus(personToActivate.id, 'active');
    if (result.success) {
      toast({ title: "Success", description: result.message });
      fetchData();
    } else {
      toast({ title: "Error", description: result.message, variant: "destructive" });
    }
    setPersonToActivate(null);
    setIsSubmitting(false);
  };
  
  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    updateUrl({ page: newPage });
  };
  
  const handlePageSizeChange = (newSize: number) => {
    setPageSize(newSize);
    setPage(1);
    updateUrl({ pageSize: newSize, page: 1 });
  };

  const filteredMembers = useMemo(() => {
    return augmentedPersons.filter(person => {
      const pointsMatch = (() => {
        if (pointsFilter === 'all') return true;
        const points = person.educationPoints || 0;
        if (pointsFilter === '0-75') return points >= 0 && points <= 75;
        if (pointsFilter === '76-150') return points > 75 && points <= 150;
        if (pointsFilter === '150+') return points > 150;
        return true;
      })();

      const repsMatch = (() => {
        if (repsFilter === 'all') return true;
        const hours = person.totalRepHours || 0;
        if (repsFilter === '0') return hours === 0;
        if (repsFilter === '1-20') return hours >= 1 && hours <= 20;
        if (repsFilter === '21-50') return hours > 20 && hours <= 50;
        if (repsFilter === '50+') return hours > 50;
        return true;
      })();
      
      const searchMatch = !searchTerm ||
        (person.name && person.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (person.dentistId && person.dentistId.toLowerCase().includes(searchTerm.toLowerCase()));

      return pointsMatch && repsMatch && searchMatch;
    });
  }, [augmentedPersons, pointsFilter, repsFilter, searchTerm]);

  const pageTitle = t('member_overview_page_title');
  if (translationsLoading) {
    return (
      <AppLayout pageTitle="Loading..." locale={locale}>
        <div className="flex-1 space-y-8 p-4 md:p-8 flex justify-center items-center">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
        </div>
      </AppLayout>
    );
  }

  const totalPages = Math.ceil(totalCount / pageSize);
  const startIndex = (page - 1) * pageSize + 1;
  const endIndex = Math.min(startIndex + filteredMembers.length - 1, totalCount);
  
  const statusKeyMap: Record<string, string> = {
    'active': 'member_list_status_active',
    'pending': 'member_list_status_pending',
    'inactive': 'member_list_status_inactive',
    'rejected': 'member_list_status_inactive',
  };

  return (
    <AppLayout pageTitle={pageTitle} locale={locale}>
      <div className="flex-1 space-y-6 p-4 md:p-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight font-headline flex items-center gap-2">{pageTitle}</h1>
            <div className="text-sm text-muted-foreground mt-2">
              <Link href={`/${locale}/dashboard`} className="hover:underline">{t('member_overview_breadcrumb_dashboard')}</Link>
              <span className="mx-1">/</span>
              <span className="font-medium text-foreground">{t('member_overview_breadcrumb_current')}</span>
            </div>
          </div>
          <Button asChild className="flex items-center gap-2">
            <Link href={`/${locale}/member-overview/create`}>
              <PlusCircle className="h-5 w-5"/>
              <span className="hidden sm:inline">{t('member_overview_create_new_button')}</span>
            </Link>
          </Button>
        </div>

        {membersToReview.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-xl font-headline">{t('member_review_title')}</CardTitle>
              <CardDescription>{t('member_review_description')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {membersToReview.map((member, index) => (
                <div key={member.id}>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                      <p className="font-semibold">{member.name}</p>
                      <p className="text-sm text-muted-foreground flex items-center gap-2">
                        {member.updatedAt ? format(new Date(member.updatedAt), 'dd.MM.yyyy') : '-'}
                        <span className="bg-primary/10 text-primary px-2 py-0.5 rounded-full text-xs font-medium">
                          {member.pendingData ? t('data_change_label') : t('member_review_type_new_registration')}
                        </span>
                      </p>
                    </div>
                    <Button asChild variant="outline" className="w-full sm:w-auto">
                      <Link href={`/${locale}/member-overview/${member.id}/review`}>
                        <FilePen className="mr-2 h-4 w-4" />
                        {t('member_review_action_button')}
                      </Link>
                    </Button>
                  </div>
                  {index < membersToReview.length - 1 && <Separator className="mt-4"/>}
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="text-xl font-headline">{t('member_list_title')}</CardTitle>
            <CardDescription>{t('member_list_description')}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="relative flex-grow">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder={t('member_list_search_placeholder')} 
                  className="pl-10" 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="flex flex-col sm:flex-row gap-2">
                <Select value={statusFilter} onValueChange={(v) => updateUrl({ status: v, page: 1 })}>
                  <SelectTrigger className="w-full sm:w-[150px]"><SelectValue placeholder={t('member_list_filter_status')} /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t('member_list_filter_all')}</SelectItem>
                    <SelectItem value="active">{t('member_list_status_active')}</SelectItem>
                    <SelectItem value="pending">{t('member_list_status_pending')}</SelectItem>
                    <SelectItem value="inactive">{t('member_list_status_inactive')}</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={pointsFilter} onValueChange={(v) => updateUrl({ points: v, page: 1 })}>
                  <SelectTrigger className="w-full sm:w-[150px]"><SelectValue placeholder={t('member_list_filter_points')} /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t('member_list_filter_points_all')}</SelectItem>
                    <SelectItem value="0-75">{t('member_list_filter_points_low')}</SelectItem>
                    <SelectItem value="76-150">{t('member_list_filter_points_medium')}</SelectItem>
                    <SelectItem value="150+">{t('member_list_filter_points_high')}</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={repsFilter} onValueChange={(v) => updateUrl({ reps: v, page: 1 })}>
                  <SelectTrigger className="w-full sm:w-[150px]"><SelectValue placeholder={t('member_list_filter_reps')} /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t('member_list_filter_reps_all')}</SelectItem>
                    <SelectItem value="0">{t('member_list_filter_reps_none')}</SelectItem>
                    <SelectItem value="1-20">{t('member_list_filter_reps_low')}</SelectItem>
                    <SelectItem value="21-50">{t('member_list_filter_reps_medium')}</SelectItem>
                    <SelectItem value="50+">{t('member_list_filter_reps_high')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            {isLoading ? (
              <div className="flex justify-center items-center h-64"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
            ) : (
              <>
                <Table>
                  <TableHeader><TableRow>
                    <TableHead>{t('member_list_table_header_id')}</TableHead>
                    <TableHead>{t('member_list_table_header_name')}</TableHead>
                    <TableHead>{t('member_list_table_header_status')}</TableHead>
                    <TableHead>{t('member_list_table_header_last_update')}</TableHead>
                    <TableHead>{t('member_list_table_header_training_points')}</TableHead>
                    <TableHead>{t('member_list_table_header_rep_hours')}</TableHead>
                    <TableHead className="text-right">{t('member_list_table_header_action')}</TableHead>
                  </TableRow></TableHeader>
                  <TableBody>
                    {filteredMembers.length > 0 ? filteredMembers.map(member => (
                      <TableRow key={member.id} className="cursor-pointer" onClick={() => router.push(`/${locale}/member-overview/${member.id}`)}>
                        <TableCell>{member.dentistId || '-'}</TableCell>
                        <TableCell className="font-medium">{member.name}</TableCell>
                        <TableCell><StatusBadge status={member.status}>{t(statusKeyMap[member.status] || member.status)}</StatusBadge></TableCell>
                        <TableCell>{member.updatedAt ? format(new Date(member.updatedAt), 'dd.MM.yyyy') : '-'}</TableCell>
                        <TableCell>{member.educationPoints || 0}</TableCell>
                        <TableCell>{member.totalRepHours.toFixed(1)} h</TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu><DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0" onClick={(e) => e.stopPropagation()}><span className="sr-only">Open menu</span><MoreHorizontal className="h-4 w-4" /></Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); router.push(`/${locale}/member-overview/${member.id}`); }}>{t('member_list_table_action_view_profile')}</DropdownMenuItem>
                            <DropdownMenuSeparator />
                            {member.status === 'active' ? (
                                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); setPersonToDeactivate(member); }} className="text-destructive focus:bg-destructive/10 focus:text-destructive">
                                {t('member_list_table_action_set_inactive')}
                                </DropdownMenuItem>
                            ) : member.status === 'inactive' ? (
                                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); setPersonToActivate(member); }} className="text-green-600 focus:bg-green-100 focus:text-green-700 dark:text-green-400 dark:focus:bg-green-900/50 dark:focus:text-green-400">
                                {t('member_list_table_action_set_active')}
                                </DropdownMenuItem>
                            ) : null}
                          </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    )) : (
                      <TableRow><TableCell colSpan={7} className="text-center h-24">No members found.</TableCell></TableRow>
                    )}
                  </TableBody>
                </Table>
                
                <div className="flex items-center justify-between mt-4">
                  <div className="text-sm text-muted-foreground">{t('member_list_pagination_showing', { start: startIndex, end: endIndex, total: totalCount })}</div>
                  <div className="flex items-center space-x-2">
                    <Select value={String(pageSize)} onValueChange={(v) => handlePageSizeChange(Number(v))}><SelectTrigger className="h-8 w-[70px]"><SelectValue placeholder={pageSize} /></SelectTrigger><SelectContent side="top">
                      {[10, 20, 50].map((size) => (<SelectItem key={size} value={String(size)}>{size}</SelectItem>))}
                    </SelectContent></Select>
                    <Button variant="outline" size="sm" onClick={() => handlePageChange(page - 1)} disabled={page <= 1}>{t('member_list_pagination_back')}</Button>
                    <span className="text-sm">{page} / {totalPages}</span>
                    <Button variant="outline" size="sm" onClick={() => handlePageChange(page + 1)} disabled={page >= totalPages}>{t('member_list_pagination_next')}</Button>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <AlertDialog open={!!personToDeactivate} onOpenChange={(open) => !open && setPersonToDeactivate(null)}>
          <AlertDialogContent>
            <AlertDialogHeader><AlertDialogTitle>{t('member_list_deactivate_dialog_title')}</AlertDialogTitle><AlertDialogDescription>
              {t('member_list_deactivate_dialog_desc', { memberName: personToDeactivate?.name || 'this user' })}
            </AlertDialogDescription></AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isSubmitting}>{t('member_list_deactivate_dialog_cancel')}</AlertDialogCancel>
              <AlertDialogAction onClick={handleDeactivateConfirm} disabled={isSubmitting} className="bg-destructive hover:bg-destructive/90">
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {t('member_list_deactivate_dialog_confirm')}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <AlertDialog open={!!personToActivate} onOpenChange={(open) => !open && setPersonToActivate(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{t('member_list_activate_dialog_title')}</AlertDialogTitle>
              <AlertDialogDescription>
                {t('member_list_activate_dialog_desc', { memberName: personToActivate?.name || 'this user' })}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isSubmitting}>{t('member_list_deactivate_dialog_cancel')}</AlertDialogCancel>
              <AlertDialogAction onClick={handleActivateConfirm} disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {t('member_list_activate_dialog_confirm')}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </AppLayout>
  );
}
    
