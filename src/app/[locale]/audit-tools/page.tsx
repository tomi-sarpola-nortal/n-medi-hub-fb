
"use client";

import { useEffect, useState } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Loader2 } from 'lucide-react';
import { useParams } from 'next/navigation';
import { getAuditLogs } from '@/services/auditLogService';
import type { AuditLog } from '@/lib/types';
import { format } from 'date-fns';

const getClientTranslations = (locale: string) => {
  try {
    const page = locale === 'de' ? require('../../../../locales/de/audit.json') : require('../../../../locales/en/audit.json');
    return page;
  } catch (e) {
    console.warn("Translation file not found, falling back to en");
    return require('../../../../locales/en/audit.json');
  }
};

export default function AuditToolsPage() {
  const params = useParams();
  const locale = typeof params.locale === 'string' ? params.locale : 'en';
  
  const [t, setT] = useState<Record<string, string>>({});
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setT(getClientTranslations(locale));
    
    async function fetchLogs() {
      setIsLoading(true);
      try {
        const auditLogs = await getAuditLogs();
        setLogs(auditLogs);
      } catch (error) {
        console.error("Failed to fetch audit logs:", error);
        // Handle toast notification here if needed
      } finally {
        setIsLoading(false);
      }
    }
    fetchLogs();
  }, [locale]);

  const pageTitle = t.audit_tools_page_title || "Audit Tools";

  return (
    <AppLayout pageTitle={pageTitle} locale={locale}>
      <div className="flex-1 space-y-6 p-4 md:p-8">
        <h1 className="text-3xl font-bold tracking-tight font-headline">{pageTitle}</h1>
        <p className="text-muted-foreground">{t.audit_tools_page_description || "Review the change history and audit logs for the system."}</p>

        <Card>
          <CardHeader>
            <CardTitle>{t.audit_log_table_title || "Audit Log"}</CardTitle>
            <CardDescription>{t.audit_log_table_description || "A record of all significant actions performed in the system."}</CardDescription>
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
                    <TableHead>{t.audit_log_header_timestamp || "Timestamp"}</TableHead>
                    <TableHead>{t.audit_log_header_user || "User"}</TableHead>
                    <TableHead>{t.audit_log_header_operation || "Operation"}</TableHead>
                    <TableHead>{t.audit_log_header_collection || "Collection"}</TableHead>
                    <TableHead>{t.audit_log_header_field || "Field(s)"}</TableHead>
                    <TableHead>{t.audit_log_header_impacted_person || "Impacted Person"}</TableHead>
                    <TableHead>{t.audit_log_header_details || "Details"}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {logs.length > 0 ? logs.map(log => (
                    <TableRow key={log.id}>
                      <TableCell>{format(new Date(log.timestamp), 'dd.MM.yyyy HH:mm:ss')}</TableCell>
                      <TableCell>{log.userName} ({log.userRole})</TableCell>
                      <TableCell className="capitalize">{log.operation}</TableCell>
                      <TableCell>{log.collectionName}</TableCell>
                      <TableCell>{Array.isArray(log.fieldName) ? log.fieldName.join(', ') : log.fieldName}</TableCell>
                      <TableCell>{log.impactedPersonName || '-'}</TableCell>
                      <TableCell>{log.details || '-'}</TableCell>
                    </TableRow>
                  )) : (
                     <TableRow>
                        <TableCell colSpan={7} className="h-24 text-center">{t.audit_log_no_results || "No audit logs found."}</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
