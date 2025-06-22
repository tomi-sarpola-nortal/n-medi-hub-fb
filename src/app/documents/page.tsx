
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
import { useEffect, useState, useMemo } from 'react';
import { getDocumentTemplates, deleteDocumentTemplate } from '@/services/documentTemplateService';
import { useToast } from '@/hooks/use-toast';
import UploadDocumentDialog from '@/components/documents/UploadDocumentDialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import type { DocumentTemplate } from '@/lib/types';


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

const documentTypeMap = {
    'vorlage': 'documents_type_vorlage',
    'leitlinie': 'documents_type_leitlinie',
    'empfehlung': 'documents_type_empfehlung',
};

type FilterType = 'all' | 'vorlage' | 'leitlinie' | 'empfehlung';

interface DocumentsPageProps {
  params: { locale: string };
}

export default function DocumentsPage({ params }: DocumentsPageProps) {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [t, setT] = useState<Record<string, string>>({});
  const { toast } = useToast();

  const [documents, setDocuments] = useState<DocumentTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<FilterType>('all');
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
  const [documentToDelete, setDocumentToDelete] = useState<DocumentTemplate | null>(null);

  const fetchDocuments = async () => {
    setIsLoading(true);
    try {
      const docs = await getDocumentTemplates();
      setDocuments(docs);
    } catch (error) {
      console.error("Failed to fetch documents:", error);
      toast({ title: "Error", description: "Could not fetch document templates.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    setT(getClientTranslations(params.locale));
    fetchDocuments();
  }, [params.locale]);

  const filteredDocuments = useMemo(() => {
    if (filter === 'all') return documents;
    return documents.filter(doc => doc.type === filter);
  }, [documents, filter]);

  const handleDeleteClick = (doc: DocumentTemplate) => {
    setDocumentToDelete(doc);
    setIsDeleteAlertOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!documentToDelete) return;
    try {
      await deleteDocumentTemplate(documentToDelete.id, documentToDelete.fileUrl);
      toast({ title: "Success", description: "Document deleted successfully." });
      fetchDocuments(); // Refresh list
    } catch (error) {
      console.error("Failed to delete document:", error);
      toast({ title: "Error", description: "Could not delete document.", variant: "destructive" });
    } finally {
      setIsDeleteAlertOpen(false);
      setDocumentToDelete(null);
    }
  };

  const pageLoading = authLoading || Object.keys(t).length === 0;

  if (pageLoading || !user) {
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
              <h1 className="text-3xl font-bold tracking-tight font-headline">{pageTitle}</h1>
              <div className="text-sm text-muted-foreground mt-2">
                <Link href="/dashboard" className="hover:underline">{t.documents_breadcrumb_dashboard || "Dashboard"}</Link>
                <span className="mx-1">/</span>
                <span className="font-medium text-foreground">{t.documents_breadcrumb_current || "Document Templates"}</span>
              </div>
            </div>
          </div>
          {isLkMember && (
            <Button className="flex items-center gap-2" onClick={() => setIsUploadOpen(true)}>
              <FileUp className="h-5 w-5" />
              <span className="hidden sm:inline">{t.documents_upload_button || "UPLOAD NEW DOCUMENT"}</span>
            </Button>
          )}
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-xl font-headline">{t.documents_card_title || "Overview of all provided documents"}</CardTitle>
            <CardDescription>{t.documents_card_description || "Here you can find all templates, guidelines, and recommendations..."}</CardDescription>
            <div className="flex flex-wrap items-center gap-2 pt-4">
              <Button variant={filter === 'all' ? 'default' : 'outline'} onClick={() => setFilter('all')}>{t.documents_filter_all || "All"}</Button>
              <Button variant={filter === 'vorlage' ? 'default' : 'outline'} onClick={() => setFilter('vorlage')}>{t.documents_filter_templates || "Templates"}</Button>
              <Button variant={filter === 'empfehlung' ? 'default' : 'outline'} onClick={() => setFilter('empfehlung')}>{t.documents_filter_recommendations || "Recommendations"}</Button>
              <Button variant={filter === 'leitlinie' ? 'default' : 'outline'} onClick={() => setFilter('leitlinie')}>{t.documents_filter_guidelines || "Guidelines"}</Button>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center items-center py-10">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
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
                  {filteredDocuments.map((doc) => (
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
                          <Button asChild variant="ghost" size="icon" aria-label="Download document">
                              <a href={doc.fileUrl} target="_blank" rel="noopener noreferrer">
                                  <Download className="h-5 w-5 text-muted-foreground" />
                              </a>
                          </Button>
                          {isLkMember && (
                            <Button variant="ghost" size="icon" aria-label="Delete document" onClick={() => handleDeleteClick(doc)}>
                              <Trash2 className="h-5 w-5 text-muted-foreground" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <p className="text-xs text-muted-foreground">
          {t.documents_footer_note || "The documents shown are provided centrally..."}
        </p>
      </div>

      {isLkMember && (
        <UploadDocumentDialog
          isOpen={isUploadOpen}
          onOpenChange={setIsUploadOpen}
          onUploadSuccess={fetchDocuments}
          t={t}
        />
      )}

      <AlertDialog open={isDeleteAlertOpen} onOpenChange={setIsDeleteAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t.documents_delete_dialog_title || "Are you sure?"}</AlertDialogTitle>
            <AlertDialogDescription>
              {t.documents_delete_dialog_desc || "This action cannot be undone. This will permanently delete the document."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t.documents_delete_dialog_cancel || "Cancel"}</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete} className="bg-destructive hover:bg-destructive/90">
                {t.documents_delete_dialog_confirm || "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppLayout>
  )
}
