
"use client";

import AppLayout from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { FileUp, FileText, Download, Trash2, ArrowLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { TypeBadge } from '@/components/documents/TypeBadge';
import { useAuth } from '@/context/auth-context';
import { useEffect, useState } from 'react';

// Helper for client-side translations
const getClientTranslations = (locale: string) => {
  try {
    if (locale === 'de') {
      return require('../../../locales/de.json');
    }
    return require('../../../locales/en.json');
  } catch (e) {
    console.warn("Translation file not found for documents page, falling back to en");
    return require('../../../locales/en.json');
  }
};

interface DocumentTemplate {
    id: string;
    title: string;
    type: 'vorlage' | 'leitlinie' | 'empfehlung';
    publisher: string;
    lastChange: string;
}

const mockDocuments: DocumentTemplate[] = [
    { id: '1', title: 'Patientenaufklärung zur Wurzelkanalbehandlung', type: 'vorlage', publisher: 'ÖZÄK', lastChange: '15.05.2025' },
    { id: '2', title: 'Leitlinie zur Behandlung von Parodontitis', type: 'leitlinie', publisher: 'ÖZÄK', lastChange: '02.05.2025' },
    { id: '3', title: 'Empfehlung zur Antibiotikaprophylaxe', type: 'empfehlung', publisher: 'Landeskammer Wien', lastChange: '28.04.2025' },
    { id: '4', title: 'Vorlage für Behandlungsvertrag', type: 'vorlage', publisher: 'ÖZÄK', lastChange: '15.04.2025' },
    { id: '5', title: 'Leitlinie zur Behandlung von Kiefergelenkbeschwerden', type: 'leitlinie', publisher: 'ÖZÄK', lastChange: '05.04.2025' },
    { id: '6', title: 'Empfehlung zur Praxishygiene', type: 'empfehlung', publisher: 'Landeskammer Steiermark', lastChange: '20.03.2025' },
    { id: '7', title: 'Mustervorlage für Datenschutzerklärung', type: 'vorlage', publisher: 'ÖZÄK', lastChange: '10.03.2025' },
];

const documentTypeMap = {
    'vorlage': 'documents_type_vorlage',
    'leitlinie': 'documents_type_leitlinie',
    'empfehlung': 'documents_type_empfehlung',
};

interface DocumentsPageProps {
  params: { locale: string };
}

export default function DocumentsPage({ params }: DocumentsPageProps) {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [t, setT] = useState<Record<string, string> | null>(null);

  useEffect(() => {
    setT(getClientTranslations(params.locale));
  }, [params.locale]);

  if (loading || !user || !t) {
    return (
      <AppLayout pageTitle={t?.documents_page_title || "Document Templates"} locale={params.locale}>
        <div className="flex-1 space-y-8 p-4 md:p-8 flex justify-center items-center">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
        </div>
      </AppLayout>
    );
  }

  const pageTitle = t.documents_page_title || "Document Templates";
  const isLkMember = user.role === 'lk_member';

  return (
    <AppLayout pageTitle={pageTitle} locale={params.locale}>
        <div className="flex-1 space-y-6 p-4 md:p-8">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" className="h-8 w-8 hidden md:flex" onClick={() => router.back()}>
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight font-headline">
                            {pageTitle}
                        </h1>
                         <div className="text-sm text-muted-foreground mt-2">
                            <Link href="/dashboard" className="hover:underline">{t.documents_breadcrumb_dashboard || "Dashboard"}</Link>
                            <span className="mx-1">/</span>
                            <span className="font-medium text-foreground">{t.documents_breadcrumb_current || "Document Templates"}</span>
                        </div>
                    </div>
                </div>
                 {isLkMember && (
                    <Button className="flex items-center gap-2">
                        <FileUp className="h-5 w-5"/>
                        <span className="hidden sm:inline">{t.documents_upload_button || "UPLOAD NEW DOCUMENT"}</span>
                    </Button>
                 )}
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="text-xl font-headline">{t.documents_card_title || "Overview of all provided documents"}</CardTitle>
                    <CardDescription>{t.documents_card_description || "Here you can find all templates, guidelines, and recommendations..."}</CardDescription>
                    <div className="flex items-center gap-2 pt-4">
                        <Button variant="default">{t.documents_filter_all || "All"}</Button>
                        <Button variant="outline">{t.documents_filter_templates || "Templates"}</Button>
                        <Button variant="outline">{t.documents_filter_recommendations || "Recommendations"}</Button>
                        <Button variant="outline">{t.documents_filter_guidelines || "Guidelines"}</Button>
                    </div>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-2/5">{t.documents_table_header_title || "Title"}</TableHead>
                                <TableHead>{t.documents_table_header_type || "Type"}</TableHead>
                                <TableHead>{t.documents_table_header_publisher || "Publisher"}</TableHead>
                                <TableHead>{t.documents_table_header_last_change || "Last Change"}</TableHead>
                                <TableHead>{t.documents_table_header_format || "Format"}</TableHead>
                                <TableHead className="text-right">
                                    {isLkMember ? (t.documents_table_header_action || "Action") : (t.documents_table_header_download || "Download")}
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {mockDocuments.map((doc) => (
                                <TableRow key={doc.id}>
                                    <TableCell className="font-medium">{doc.title}</TableCell>
                                    <TableCell>
                                        <TypeBadge type={doc.type}>
                                            {t[documentTypeMap[doc.type]] || doc.type}
                                        </TypeBadge>
                                    </TableCell>
                                    <TableCell>{doc.publisher}</TableCell>
                                    <TableCell>{doc.lastChange}</TableCell>
                                    <TableCell>
                                        <FileText className="h-5 w-5 text-muted-foreground" />
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <Button variant="ghost" size="icon" aria-label="Download document">
                                                <Download className="h-5 w-5 text-muted-foreground" />
                                            </Button>
                                            {isLkMember && (
                                                <Button variant="ghost" size="icon" aria-label="Delete document">
                                                    <Trash2 className="h-5 w-5 text-muted-foreground" />
                                                </Button>
                                            )}
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <p className="text-xs text-muted-foreground">
                {t.documents_footer_note || "The documents shown are provided centrally..."}
            </p>
        </div>
    </AppLayout>
  )
}

    