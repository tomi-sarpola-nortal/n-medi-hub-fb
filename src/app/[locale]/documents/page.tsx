
"use client";

import AppLayout from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { FileUp, Download, Trash2, ArrowLeft, ArrowUp, ArrowDown, Loader2, File, Search } from 'lucide-react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { TypeBadge } from '@/components/documents/TypeBadge';
import { useAuth } from '@/context/auth-context';
import { useEffect, useState, useMemo } from 'react';
import { getDocumentTemplates, deleteDocumentTemplate } from '@/services/documentTemplateService';
import { useToast } from '@/hooks/use-toast';
import UploadDocumentDialog from '@/components/documents/UploadDocumentDialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import type { DocumentTemplate } from '@/lib/types';
import { format } from 'date-fns';


// Helper for client-side translations
const getClientTranslations = (locale: string) => {
  try {
    const page = locale === 'de' ? require('../../../../locales/de/documents.json') : require('../../../../locales/en/documents.json');
    return page;
  } catch (e) {
    console.warn("Translation file not found for documents page, falling back to en");
    return require('../../../../locales/en/documents.json');
  }
};

const documentTypeMap = {
    'vorlage': 'documents_type_vorlage',
    'leitlinie': 'documents_type_leitlinie',
    'empfehlung': 'documents_type_empfehlung',
};

type FilterType = 'all' | 'vorlage' | 'leitlinie' | 'empfehlung';
type SortDescriptor = {
    id: keyof DocumentTemplate;
    desc: boolean;
};

// Icon Components for File Types
const PdfFileIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" className="h-6 w-6">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z" fill="#E53E3E" />
    <path d="M14 2v6h6L14 2z" fill="#FED7D7" />
    <text x="8.5" y="17" fontFamily="Arial, sans-serif" fontWeight="bold" fontSize="4.5" fill="#FFF">PDF</text>
  </svg>
);

const WordFileIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" className="h-6 w-6">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z" fill="#4299E1" />
    <path d="M14 2v6h6L14 2z" fill="#BEE3F8" />
    <text x="8.5" y="17.5" fontFamily="Arial, sans-serif" fontWeight="bold" fontSize="5.5" fill="#FFF">W</text>
  </svg>
);


export default function DocumentsPage() {
  const router = useRouter();
  const params = useParams();
  const locale = typeof params.locale === 'string' ? params.locale : 'en';
  const { user, loading: authLoading } = useAuth();
  const [t, setT] = useState<Record<string, string>>({});
  const { toast } = useToast();

  const [documents, setDocuments] = useState<DocumentTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<FilterType>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
  const [documentToDelete, setDocumentToDelete] = useState<DocumentTemplate | null>(null);

  const [sorting, setSorting] = useState<SortDescriptor>({ id: 'lastChange', desc: true });
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });

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
    setT(getClientTranslations(locale));
    fetchDocuments();
  }, [locale]);

  const handleSort = (columnId: keyof DocumentTemplate) => {
    setSorting(current => ({
      id: columnId,
      desc: current.id === columnId ? !current.desc : false,
    }));
  };

  const filteredDocuments = useMemo(() => {
    return documents
      .filter((doc) => filter === 'all' || doc.type === filter)
      .filter((doc) => {
        if (!searchTerm) return true;
        const term = searchTerm.toLowerCase();
        return (
          doc.title.toLowerCase().includes(term) ||
          doc.publisher.toLowerCase().includes(term)
        );
      });
  }, [documents, filter, searchTerm]);

  const displayedDocuments = useMemo(() => {
    const sorted = [...filteredDocuments].sort((a, b) => {
      const valA = a[sorting.id];
      const valB = b[sorting.id];
      if (valA === null || valA === undefined) return 1;
      if (valB === null || valB === undefined) return -1;
      if (valA < valB) return sorting.desc ? 1 : -1;
      if (valA > valB) return sorting.desc ? -1 : 1;
      return 0;
    });

    const start = pagination.pageIndex * pagination.pageSize;
    const end = start + pagination.pageSize;
    return sorted.slice(start, end);
  }, [filteredDocuments, sorting, pagination]);


  const totalPages = Math.ceil(filteredDocuments.length / pagination.pageSize);

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
  
  const SortableHeader = ({ columnId, label }: { columnId: keyof DocumentTemplate, label: string }) => (
    <TableHead>
        <Button variant="ghost" onClick={() => handleSort(columnId)} className="px-0 hover:bg-transparent">
            {label}
            {sorting.id === columnId && (
                sorting.desc ? <ArrowDown className="ml-2 h-4 w-4" /> : <ArrowUp className="ml-2 h-4 w-4" />
            )}
        </Button>
    </TableHead>
  );

  const pageLoading = authLoading || Object.keys(t).length === 0;

  if (pageLoading || !user) {
    return (
      <AppLayout pageTitle={t?.documents_page_title || "Document Templates"} locale={locale}>
        <div className="flex-1 space-y-8 p-4 md:p-8 flex justify-center items-center">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
        </div>
      </AppLayout>
    );
  }

  const pageTitle = t.documents_page_title || "Document Templates";
  const isLkMember = user.role === 'lk_member';

  return (
    <AppLayout pageTitle={pageTitle} locale={locale}>
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
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4">
                <div className="flex flex-wrap items-center gap-2">
                    <Button variant={filter === 'all' ? 'default' : 'outline'} onClick={() => setFilter('all')}>{t.documents_filter_all || "All"}</Button>
                    <Button variant={filter === 'vorlage' ? 'default' : 'outline'} onClick={() => setFilter('vorlage')}>{t.documents_filter_templates || "Templates"}</Button>
                    <Button variant={filter === 'empfehlung' ? 'default' : 'outline'} onClick={() => setFilter('empfehlung')}>{t.documents_filter_recommendations || "Recommendations"}</Button>
                    <Button variant={filter === 'leitlinie' ? 'default' : 'outline'} onClick={() => setFilter('leitlinie')}>{t.documents_filter_guidelines || "Guidelines"}</Button>
                </div>
                <div className="relative w-full sm:w-auto sm:max-w-xs">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder={t.documents_search_placeholder || "Search by title or publisher..."}
                        className="pl-10"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center items-center py-10">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <SortableHeader columnId="title" label={t.documents_table_header_title || "Title"} />
                    <SortableHeader columnId="type" label={t.documents_table_header_type || "Type"} />
                    <SortableHeader columnId="publisher" label={t.documents_table_header_publisher || "Publisher"} />
                    <SortableHeader columnId="lastChange" label={t.documents_table_header_last_change || "Last Change"} />
                    <SortableHeader columnId="fileFormat" label={t.documents_table_header_format || "Format"} />
                    <TableHead className="text-right">
                      {isLkMember ? (t.documents_table_header_action || "Action") : (t.documents_table_header_download || "Download")}
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {displayedDocuments.length > 0 ? displayedDocuments.map((doc) => (
                    <TableRow key={doc.id}>
                      <TableCell className="font-medium">{doc.title}</TableCell>
                      <TableCell>
                        <TypeBadge type={doc.type}>
                          {t[documentTypeMap[doc.type]] || doc.type}
                        </TypeBadge>
                      </TableCell>
                      <TableCell>{doc.publisher}</TableCell>
                      <TableCell>{format(new Date(doc.lastChange), 'dd.MM.yyyy')}</TableCell>
                      <TableCell>
                        {doc.fileFormat === 'PDF' ? (
                          <PdfFileIcon />
                        ) : doc.fileFormat === 'Word' ? (
                          <WordFileIcon />
                        ) : (
                          <File className="h-5 w-5 text-muted-foreground" />
                        )}
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
                  )) : (
                    <TableRow>
                        <TableCell colSpan={6} className="h-24 text-center">
                            {t.documents_table_no_results || "No results found."}
                        </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
              <div className="flex items-center justify-between space-x-2 p-4 border-t">
                    <div className="flex items-center space-x-2">
                        <p className="text-sm font-medium">{t.documents_pagination_rows_per_page || "Rows per page"}</p>
                        <Select
                            value={`${pagination.pageSize}`}
                            onValueChange={(value) => {
                                setPagination(p => ({ ...p, pageSize: Number(value), pageIndex: 0 }));
                            }}
                        >
                            <SelectTrigger className="h-8 w-[70px]">
                                <SelectValue placeholder={pagination.pageSize} />
                            </SelectTrigger>
                            <SelectContent side="top">
                                {[10, 20, 50].map((pageSize) => (
                                    <SelectItem key={pageSize} value={`${pageSize}`}>
                                        {pageSize}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="flex items-center space-x-2 text-sm font-medium">
                       <span>
                         {(t.documents_pagination_page_info || "Page {currentPage} of {totalPages}")
                            .replace('{currentPage}', (pagination.pageIndex + 1).toString())
                            .replace('{totalPages}', totalPages.toString())
                         }
                       </span>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setPagination(p => ({...p, pageIndex: p.pageIndex - 1}))}
                            disabled={pagination.pageIndex === 0}
                        >
                            {t.documents_pagination_previous || "Previous"}
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setPagination(p => ({...p, pageIndex: p.pageIndex + 1}))}
                            disabled={pagination.pageIndex >= totalPages - 1}
                        >
                            {t.documents_pagination_next || "Next"}
                        </Button>
                    </div>
                </div>
              </>
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
