
import AppLayout from '@/components/layout/AppLayout';
import { getTranslations } from '@/lib/translations';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { RepresentationStatusBadge } from '@/components/representations/RepresentationStatusBadge';
import Link from 'next/link';
import { PlusCircle } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

// Mock Data
const performedRepresentations = [
    { id: '1', period: '15.05.2025, 08:00 - 15:00 Uhr', person: 'Dr. Markus Weber (ID: 78954)', duration: '7 Stunden', status: 'confirmed', confirmationDate: '22.05.2025' },
    { id: '2', period: '01.05.2025, 08:00 - 15:00 Uhr\n02.05.2025, 13:00 - 19:00 Uhr', person: 'Dr. Julia Schmidt (ID: 65412)', duration: '13 Stunden', status: 'pending', confirmationDate: '-' },
    { id: '3', period: '15.04.2025, 08:00 - 18:00 Uhr', person: 'Dr. Thomas Müller (ID: 34567)', duration: '8 Stunden', status: 'confirmed', confirmationDate: '21.04.2025' },
    { id: '4', period: '01.04.2025, 07:00 - 13:00 Uhr', person: 'Dr. Sabine Becker (ID: 23456)', duration: '6 Stunden', status: 'confirmed', confirmationDate: '12.04.2025' },
];

const pendingConfirmations = [
    { id: '1', person: 'Dr. Lukas Hoffmann', details: ['10.05.2025, 08:30 Uhr - 17:00 Uhr (8,5 Stunden)', '11.05.2025, 15:00 Uhr - 18:00 Uhr (3 Stunden)'] },
    { id: '2', person: 'Dr. Anna Schneider', details: ['02.05.2025, 10:00 Uhr - 17:00 Uhr (7 Stunden)'] },
];

const myRepresentations = [
    { id: '1', period: '10.05.2025, 08:30 Uhr - 17:00 Uhr\n11.05.2025, 15:00 Uhr - 18:00 Uhr', person: 'Dr. Lukas Hoffmann (ID: 78954)', duration: '8,5 Stunden', status: 'pending', confirmationDate: '-' },
    { id: '2', period: '02.05.2025, 10:00 Uhr - 17:00 Uhr', person: 'Dr. Anna Schneider (ID: 65412)', duration: '3 Stunden', status: 'pending', confirmationDate: '-' },
    { id: '3', period: '15.12.2024, 15:00 Uhr - 18:00 Uhr', person: 'Dr. Thomas Müller (ID: 34567)', duration: '3 Stunden', status: 'confirmed', confirmationDate: '21.12.2024' },
];


interface RepresentationsPageProps {
  params: { locale: string };
}

export default async function RepresentationsPage({ params }: RepresentationsPageProps) {
    const t = getTranslations(params.locale);
    const pageTitle = t.representations_page_title || "My Representations";

    return (
        <AppLayout pageTitle={pageTitle} locale={params.locale}>
            <div className="flex-1 space-y-6 p-4 md:p-8">
                <div className="flex items-start justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight font-headline">
                            {pageTitle}
                        </h1>
                         <div className="text-sm text-muted-foreground mt-2">
                            <Link href="/dashboard" className="hover:underline">{t.representations_breadcrumb_dashboard || "Dashboard"}</Link>
                            <span className="mx-1">/</span>
                            <span className="font-medium text-foreground">{t.representations_breadcrumb_current || "My Representations"}</span>
                        </div>
                    </div>
                    <Button className="flex items-center gap-2">
                        <PlusCircle className="h-5 w-5"/>
                        <span className="hidden sm:inline">{t.representations_new_button || "ENTER NEW REPRESENTATION"}</span>
                    </Button>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-xl font-headline">{t.representations_performed_title || "Overview of my performed representations"}</CardTitle>
                        <CardDescription>{t.representations_performed_desc || "Here you can see representations where you have covered for others."}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-1/4">{t.representations_table_header_period || "Period"}</TableHead>
                                    <TableHead>{t.representations_table_header_person || "Represented Person"}</TableHead>
                                    <TableHead>{t.representations_table_header_duration || "Duration"}</TableHead>
                                    <TableHead>{t.representations_table_header_status || "Status"}</TableHead>
                                    <TableHead>{t.representations_table_header_confirmation_date || "Confirmation Date"}</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {performedRepresentations.map((rep) => (
                                    <TableRow key={rep.id}>
                                        <TableCell className="font-medium whitespace-pre-line">{rep.period}</TableCell>
                                        <TableCell>{rep.person}</TableCell>
                                        <TableCell>{rep.duration}</TableCell>
                                        <TableCell>
                                            <RepresentationStatusBadge status={rep.status as 'confirmed' | 'pending'}>
                                                {rep.status === 'confirmed' ? (t.representations_status_confirmed || 'Confirmed') : (t.representations_status_pending || 'Pending')}
                                            </RepresentationStatusBadge>
                                        </TableCell>
                                        <TableCell>{rep.confirmationDate}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-xl font-headline">{t.representations_confirm_title || "Confirm representations"}</CardTitle>
                        <CardDescription>{t.representations_confirm_desc || "Here you can confirm representations where you were represented."}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {pendingConfirmations.map((req, index) => (
                             <div key={req.id}>
                                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                                    <div>
                                        <p className="font-semibold">{req.person}</p>
                                        <div className="text-sm text-muted-foreground">
                                            {req.details.map((line, idx) => <p key={idx}>{line}</p>)}
                                        </div>
                                    </div>
                                    <div className="flex gap-2 flex-shrink-0 w-full sm:w-auto">
                                        <Button className="flex-1 sm:flex-none">{t.representations_confirm_button || "CONFIRM"}</Button>
                                        <Button variant="outline" className="flex-1 sm:flex-none">{t.representations_decline_button || "DECLINE"}</Button>
                                    </div>
                                </div>
                                {index < pendingConfirmations.length - 1 && <Separator className="my-4"/>}
                            </div>
                        ))}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-xl font-headline">{t.representations_my_title || "Overview of my representations"}</CardTitle>
                        <CardDescription>{t.representations_my_desc || "Here you can view representations where you were represented by others."}</CardDescription>
                    </CardHeader>
                    <CardContent>
                       <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-1/4">{t.representations_table_header_period || "Period"}</TableHead>
                                    <TableHead>{t.representations_table_header_representing_person || "Representing Person"}</TableHead>
                                    <TableHead>{t.representations_table_header_duration || "Duration"}</TableHead>
                                    <TableHead>{t.representations_table_header_status || "Status"}</TableHead>
                                    <TableHead>{t.representations_table_header_confirmation_date || "Confirmation Date"}</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {myRepresentations.map((rep) => (
                                    <TableRow key={rep.id}>
                                        <TableCell className="font-medium whitespace-pre-line">{rep.period}</TableCell>
                                        <TableCell>{rep.person}</TableCell>
                                        <TableCell>{rep.duration}</TableCell>
                                        <TableCell>
                                            <RepresentationStatusBadge status={rep.status as 'confirmed' | 'pending'}>
                                                {rep.status === 'confirmed' ? (t.representations_status_confirmed || 'Confirmed') : (t.representations_status_pending || 'Pending')}
                                            </RepresentationStatusBadge>
                                        </TableCell>
                                        <TableCell>{rep.confirmationDate}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

                 <p className="text-xs text-muted-foreground text-center pt-4">
                    {t.representations_footer_note || "Representations can only be confirmed by the represented person. Your state chamber also has access to this data."}
                </p>

            </div>
        </AppLayout>
    );
}
