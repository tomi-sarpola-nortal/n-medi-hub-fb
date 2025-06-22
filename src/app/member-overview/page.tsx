
import AppLayout from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { getTranslations } from '@/lib/translations';
import { PlusCircle, Search } from 'lucide-react';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Separator } from '@/components/ui/separator';
import Link from 'next/link';
import { getAllPersons } from '@/services/personService';
import type { Person } from '@/lib/types';
import { format } from 'date-fns';

interface MemberOverviewPageProps {
  params: { locale: string };
}

export default async function MemberOverviewPage({ params }: MemberOverviewPageProps) {
  const t = getTranslations(params.locale);
  const pageTitle = t.member_overview_page_title || "Member Overview";
  
  const allPersons = await getAllPersons();

  const membersToReview = allPersons.filter(p => p.status === 'pending');

  const statusKeyMap: Record<Person['status'], string> = {
      active: 'member_list_status_active',
      pending: 'member_list_status_pending',
      inactive: 'member_list_status_inactive',
      rejected: 'member_list_status_inactive',
  };

  return (
    <AppLayout pageTitle={pageTitle} locale={params.locale}>
        <div className="flex-1 space-y-6 p-4 md:p-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight font-headline flex items-center gap-2">
                        {pageTitle}
                    </h1>
                    <div className="text-sm text-muted-foreground mt-2">
                        <Link href="/dashboard" className="hover:underline">{t.member_overview_breadcrumb_dashboard || "Dashboard"}</Link>
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
                                   <Link href={`/member-overview/${member.id}/review`}>{t.member_review_action_button || "PERFORM REVIEW"}</Link>
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
                            <Input placeholder={t.member_list_search_placeholder || "Search by name or dentist ID"} className="pl-10" />
                        </div>
                        <div className="flex gap-4">
                            <Select>
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
                            <Select>
                                <SelectTrigger className="w-full sm:w-[150px]">
                                    <SelectValue placeholder={t.member_list_filter_points || "Points: All"} />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">{t.member_list_filter_all || "All"}</SelectItem>
                                </SelectContent>
                            </Select>
                             <Select>
                                <SelectTrigger className="w-full sm:w-[150px]">
                                    <SelectValue placeholder={t.member_list_filter_reps || "Representations: All"} />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">{t.member_list_filter_all || "All"}</SelectItem>
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
                            {allPersons.length > 0 ? allPersons.map(member => (
                                <TableRow key={member.id}>
                                    <TableCell>{member.dentistId || '-'}</TableCell>
                                    <TableCell className="font-medium">{member.name}</TableCell>
                                    <TableCell>
                                        <StatusBadge status={member.status}>{t[statusKeyMap[member.status]] || member.status}</StatusBadge>
                                    </TableCell>
                                    <TableCell>{member.updatedAt ? format(new Date(member.updatedAt), 'dd.MM.yyyy') : '-'}</TableCell>
                                    <TableCell>{member.educationPoints ? `${member.educationPoints} / 150` : 'N/A'}</TableCell>
                                    <TableCell>{"-"}</TableCell>
                                    <TableCell>
                                        <Button variant="outline" size="sm" asChild>
                                            <Link href={`/member-overview/${member.id}`}>{t.member_list_table_action_button || "VIEW"}</Link>
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
