
import AppLayout from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { getTranslations } from '@/lib/translations';
import { ArrowLeft, PlusCircle, Search } from 'lucide-react';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Separator } from '@/components/ui/separator';

interface MemberReview {
    id: string;
    name: string;
    date: string;
    changeType: string;
}

interface Member {
    id: string;
    dentistId: string;
    name: string;
    status: 'active' | 'in-review' | 'inactive';
    lastUpdate: string;
    trainingPoints: string;
    repHours: string;
}

const membersToReview: MemberReview[] = [
    { id: '1', name: 'Dr. Anna Huber', date: '21.05.2025', changeType: 'Datenänderung' },
    { id: '2', name: 'Dr. Mehmet Yilmaz', date: '21.05.2025', changeType: 'Datenänderung' },
];

const allMembers: Member[] = [
    { id: '1', dentistId: 'ZA-2023-0145', name: 'Dr. Thomas Müller', status: 'active', lastUpdate: '15.04.2025', trainingPoints: '125/150', repHours: '12 Stunden' },
    { id: '2', dentistId: 'ZA-2022-0892', name: 'Dr. Sabine Weber', status: 'active', lastUpdate: '22.03.2025', trainingPoints: '150/150', repHours: '5 Stunden' },
    { id: '3', dentistId: 'ZA-2024-0067', name: 'Dr. Mehmet Yilmaz', status: 'in-review', lastUpdate: '08.05.2023', trainingPoints: '85/150', repHours: '34 Stunden' },
    { id: '4', dentistId: 'ZA-2021-0456', name: 'Dr. Julia Hoffmann', status: 'active', lastUpdate: '12.02.2025', trainingPoints: '142/150', repHours: '81 Stunden' },
    { id: '5', dentistId: 'ZA-2020-1234', name: 'Dr. Markus Fischer', status: 'inactive', lastUpdate: '30.11.2024', trainingPoints: '120/150', repHours: '32 Stunden' },
    { id: '6', dentistId: 'ZA-2023-0578', name: 'Dr. Katharina Becker', status: 'active', lastUpdate: '05.04.2025', trainingPoints: '150/150', repHours: '15 Stunden' },
    { id: '7', dentistId: 'ZA-2022-0345', name: 'Dr. Stefan Wagner', status: 'active', lastUpdate: '18.03.2025', trainingPoints: '138/150', repHours: '7 Stunden' },
    { id: '8', dentistId: 'ZA-2024-0112', name: 'Dr. Laura Schmidt', status: 'in-review', lastUpdate: '22.04.2025', trainingPoints: '65/150', repHours: '0 Stunden' },
];

const ITEMS_PER_PAGE = 8;
const TOTAL_MOCK_ITEMS = 1873;

interface MemberOverviewPageProps {
  params: { locale: string };
}

export default async function MemberOverviewPage({ params }: MemberOverviewPageProps) {
  const t = getTranslations(params.locale);
  const pageTitle = t.member_overview_page_title || "Member Overview";
  const currentPage = 1; 
  const totalPages = Math.ceil(TOTAL_MOCK_ITEMS / ITEMS_PER_PAGE);

  const statusKeyMap = {
      'active': 'member_list_status_active',
      'in-review': 'member_list_status_in_review',
      'inactive': 'member_list_status_inactive',
  };

  return (
    <AppLayout pageTitle={pageTitle} locale={params.locale}>
        <div className="flex-1 space-y-6 p-4 md:p-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight font-headline flex items-center gap-2">
                        <ArrowLeft className="h-6 w-6 text-muted-foreground hidden lg:block"/>
                        {pageTitle}
                    </h1>
                    <div className="text-sm text-muted-foreground mt-2">
                        <span>{t.member_overview_breadcrumb_dashboard || "Dashboard"} / </span>
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
                    {membersToReview.map((member, index) => (
                        <div key={member.id}>
                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                                <div>
                                    <p className="font-semibold">{member.name}</p>
                                    <p className="text-sm text-muted-foreground">{member.date} | {t.data_change_label || "Data Change"}</p>
                                </div>
                                <Button variant="outline" className="w-full sm:w-auto">{t.member_review_action_button || "PERFORM REVIEW"}</Button>
                            </div>
                            {index < membersToReview.length - 1 && <Separator className="mt-4"/>}
                        </div>
                    ))}
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
                                    <SelectItem value="in-review">{t.member_list_status_in_review || "In Review"}</SelectItem>
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
                            {allMembers.map(member => (
                                <TableRow key={member.id}>
                                    <TableCell>{member.dentistId}</TableCell>
                                    <TableCell className="font-medium">{member.name}</TableCell>
                                    <TableCell>
                                        <StatusBadge status={member.status}>{t[statusKeyMap[member.status]] || member.status}</StatusBadge>
                                    </TableCell>
                                    <TableCell>{member.lastUpdate}</TableCell>
                                    <TableCell>{member.trainingPoints}</TableCell>
                                    <TableCell>{member.repHours}</TableCell>
                                    <TableCell>
                                        <Button variant="outline" size="sm">{t.member_list_table_action_button || "VIEW"}</Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>

                    <div className="mt-6 flex items-center justify-between">
                        <p className="text-sm text-muted-foreground">
                            {t.member_list_pagination_showing
                            .replace('{start}', (ITEMS_PER_PAGE * (currentPage -1) + 1).toString())
                            .replace('{end}', Math.min(ITEMS_PER_PAGE * currentPage, TOTAL_MOCK_ITEMS).toString())
                            .replace('{total}', TOTAL_MOCK_ITEMS.toString())
                            }
                        </p>
                        <div className="flex space-x-2">
                            <Button variant="outline" size="sm" disabled={currentPage === 1}>{t.member_list_pagination_back || "Back"}</Button>
                            {[1, 2, 3].map(page => (
                               <Button key={page} variant={currentPage === page ? "default" : "outline"} size="sm" className="w-9">{page}</Button>
                            ))}
                            <span>...</span>
                             <Button variant="outline" size="sm" className="w-9">{totalPages}</Button>
                            <Button variant="outline" size="sm" disabled={currentPage === totalPages}>{t.member_list_pagination_next || "Next"}</Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

        </div>
    </AppLayout>
  )
}
