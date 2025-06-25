
"use client";

import { useEffect, useState, useMemo } from 'react';
import { useParams } from 'next/navigation';
import AppLayout from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { PlusCircle, Search, Loader2 } from 'lucide-react';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Separator } from '@/components/ui/separator';
import Link from 'next/link';
import { getAllPersons } from '@/services/personService';
import { getAllRepresentations } from '@/services/representationService';
import type { Person } from '@/lib/types';
import { format } from 'date-fns';

// Helper for client-side translations
const getClientTranslations = (locale: string) => {
  try {
    const page = locale === 'de' ? require('../../../../locales/de/member-overview.json') : require('../../../../locales/en/member-overview.json');
    const common = locale === 'de' ? require('../../../../locales/de/common.json') : require('../../../../locales/en/common.json');
    return { ...page, ...common };
  } catch (e) {
    console.warn("Translation file not found, falling back to en");
    const page = require('../../../../locales/en/member-overview.json');
    const common = require('../../../../locales/en/common.json');
    return { ...page, ...common };
  }
};

const statusKeyMap: Record<Person['status'], string> = {
    active: 'member_list_status_active',
    pending: 'member_list_status_pending',
    inactive: 'member_list_status_inactive',
    rejected: 'member_list_status_inactive',
};

interface AugmentedPerson extends Person {
  totalRepHours: number;
}

export default function MemberOverviewPage() {
  const params = useParams();
  const locale = typeof params.locale === 'string' ? params.locale : 'en';

  const [t, setT] = useState<Record<string, string>>({});
  const [augmentedPersons, setAugmentedPersons] = useState<AugmentedPerson[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [pointsFilter, setPointsFilter] = useState('all');
  const [repsFilter, setRepsFilter] = useState('all');

  useEffect(() => {
    setT(getClientTranslations(locale));
    
    const fetchAndProcessData = async () => {
      setIsLoading(true);
      try {
        const [persons, allReps] = await Promise.all([
            getAllPersons(),
            getAllRepresentations(),
        ]);

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
      } catch (error) {
        console.error("Failed to fetch member data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchAndProcessData();
  }, [locale]);

  const membersToReview = useMemo(() => {
    return augmentedPersons.filter(p => p.status === 'pending');
  }, [augmentedPersons]);

  const filteredMembers = useMemo(() => {
    return augmentedPersons.filter(person => {
      const statusMatch = statusFilter === 'all' || person.status === statusFilter;
      
      const searchMatch = !searchTerm ||
        (person.name && person.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (person.dentistId && person.dentistId.toLowerCase().includes(searchTerm.toLowerCase()));
      
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
        if (repsFilter === 'has_hours') return person.totalRepHours > 0;
        if (repsFilter === 'no_hours') return person.totalRepHours === 0;
        return true;
      })();

      return statusMatch && searchMatch && pointsMatch && repsMatch;
    });
  }, [augmentedPersons, searchTerm, statusFilter, pointsFilter, repsFilter]);
  
  const pageTitle = t.member_overview_page_title || "Member Overview";
  
  if (isLoading || Object.keys(t).length === 0) {
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
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight font-headline flex items-center gap-2">
                        {pageTitle}
                    </h1>
                    <div className="text-sm text-muted-foreground mt-2">
                        <Link href={`/${locale}/dashboard`} className="hover:underline">{t.member_overview_breadcrumb_dashboard || "Dashboard"}</Link>
                        <span className="mx-1">/</span>
                        <span className="font-medium text-foreground">{t.member_overview_breadcrumb_current || "Member Overview"}</span>
                    </div>
                </div>
                <Button className="flex items-center gap-2">
                    <PlusCircle className="h-5 w-5"/>
                    <span className="hidden sm:inline">{t.member_overview_create_new_button || "CREATE NEW MEMBER"}</span>
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="text-xl font-headline">{t.member_review_title || "Review Members"}</CardTitle>
                    <CardDescription>{t.member_review_description || "Here you can review data changes from members."}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {membersToReview.length > 0 ? membersToReview.map((member, index) => (
                        <div key={member.id}>
                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                                <div>
                                    <p className="font-semibold">{member.name}</p>
                                    <p className="text-sm text-muted-foreground">{member.updatedAt ? format(new Date(member.updatedAt), 'dd.MM.yyyy') : '-'} | {t.data_change_label || "Data Change"}</p>
                                </div>
                                <Button asChild variant="outline" className="w-full sm:w-auto">
                                   <Link href={`/${locale}/member-overview/${member.id}/review`}>{t.member_review_action_button || "PERFORM REVIEW"}</Link>
                                </Button>
                            </div>
                            {index < membersToReview.length - 1 && <Separator className="mt-4"/>}
                        </div>
                    )) : (
                        <p className="text-sm text-muted-foreground text-center py-4">{t.member_review_no_pending || "No pending member reviews at the moment."}</p>
                    )}
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="text-xl font-headline">{t.member_list_title || "Members of the Vienna Dental Chamber"}</CardTitle>
                    <CardDescription>{t.member_list_description || "All currently registered members with access and training status."}</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col sm:flex-row gap-4 mb-6">
                        <div className="relative flex-grow">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input 
                                placeholder={t.member_list_search_placeholder || "Search by name or dentist ID"} 
                                className="pl-10" 
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className="flex flex-col sm:flex-row gap-2">
                            <Select value={statusFilter} onValueChange={setStatusFilter}>
                                <SelectTrigger className="w-full sm:w-[150px]">
                                    <SelectValue placeholder={t.member_list_filter_status || "Status: All"} />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">{t.member_list_filter_all || "All"}</SelectItem>
                                    <SelectItem value="active">{t.member_list_status_active || "Active"}</SelectItem>
                                    <SelectItem value="pending">{t.member_list_status_pending || "Pending"}</SelectItem>
                                    <SelectItem value="inactive">{t.member_list_status_inactive || "Inactive"}</SelectItem>
                                </SelectContent>
                            </Select>
                            <Select value={pointsFilter} onValueChange={setPointsFilter}>
                                <SelectTrigger className="w-full sm:w-[150px]">
                                    <SelectValue placeholder={t.member_list_filter_points || "Points: All"} />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">{t.member_list_filter_points_all || "Points: All"}</SelectItem>
                                    <SelectItem value="0-75">{t.member_list_filter_points_low || "Points: 0-75"}</SelectItem>
                                    <SelectItem value="76-150">{t.member_list_filter_points_medium || "Points: 76-150"}</SelectItem>
                                    <SelectItem value="150+">{t.member_list_filter_points_high || "Points: 150+"}</SelectItem>
                                </SelectContent>
                            </Select>
                             <Select value={repsFilter} onValueChange={setRepsFilter}>
                                <SelectTrigger className="w-full sm:w-[150px]">
                                    <SelectValue placeholder={t.member_list_filter_reps || "Representations: All"} />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">{t.member_list_filter_reps_all || "Reps: All"}</SelectItem>
                                    <SelectItem value="has_hours">{t.member_list_filter_reps_with || "With Hours"}</SelectItem>
                                    <SelectItem value="no_hours">{t.member_list_filter_reps_without || "Without Hours"}</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>{t.member_list_table_header_id || "Dentist-ID"}</TableHead>
                                <TableHead>{t.member_list_table_header_name || "Name"}</TableHead>
                                <TableHead>{t.member_list_table_header_status || "Status"}</TableHead>
                                <TableHead>{t.member_list_table_header_last_update || "Last Data Confirmation"}</TableHead>
                                <TableHead>{t.member_list_table_header_training_points || "Training Points"}</TableHead>
                                <TableHead>{t.member_list_table_header_rep_hours || "Rep. Hours"}</TableHead>
                                <TableHead>{t.member_list_table_header_action || "Action"}</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredMembers.length > 0 ? filteredMembers.map(member => (
                                <TableRow key={member.id}>
                                    <TableCell>{member.dentistId || '-'}</TableCell>
                                    <TableCell className="font-medium">{member.name}</TableCell>
                                    <TableCell>
                                        <StatusBadge status={member.status}>{t[statusKeyMap[member.status]] || member.status}</StatusBadge>
                                    </TableCell>
                                    <TableCell>{member.updatedAt ? format(new Date(member.updatedAt), 'dd.MM.yyyy') : '-'}</TableCell>
                                    <TableCell>{member.educationPoints || 0}</TableCell>
                                    <TableCell>{member.totalRepHours.toFixed(1)} h</TableCell>
                                    <TableCell>
                                        <Button variant="outline" size="sm" asChild>
                                            <Link href={`/${locale}/member-overview/${member.id}`}>{t.member_list_table_action_button || "VIEW"}</Link>
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            )) : (
                                <TableRow>
                                    <TableCell colSpan={7} className="text-center h-24">No members found.</TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

        </div>
    </AppLayout>
  )
}

