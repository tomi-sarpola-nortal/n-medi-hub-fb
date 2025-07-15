
"use client";

import { useEffect, useState, useMemo } from 'react';
import type { Representation, Person, UserRole } from '@/lib/types';
import { getAllRepresentationsForUser, updateRepresentationStatus } from '@/services/representationService';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Loader2, ShieldAlert } from 'lucide-react';
import { format } from 'date-fns';
import { RepresentationStatusBadge } from '@/components/representations/RepresentationStatusBadge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/context/auth-context';
import { logGeneralAudit } from '@/app/actions/auditActions';
import { Badge } from '@/components/ui/badge';

interface MemberRepresentationsTabProps {
  member: Person;
  t: Record<string, string>;
}

const formatPeriod = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const isSameDay = format(start, 'yyyy-MM-dd') === format(end, 'yyyy-MM-dd');
    if (isSameDay) {
        return `${format(start, 'dd.MM.yyyy, HH:mm')} - ${format(end, 'HH:mm')} Uhr`;
    }
    return `${format(start, 'dd.MM.yyyy, HH:mm')} - ${format(end, 'dd.MM.yyyy, HH:mm')}`;
};

export default function MemberRepresentationsTab({ member, t }: MemberRepresentationsTabProps) {
  const [representations, setRepresentations] = useState<Representation[]>([]);
  const [hasOldRequests, setHasOldRequests] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState<string | null>(null); // Store ID of rep being updated
  const { toast } = useToast();
  const { user: auditor } = useAuth();
  
  const fiveDaysAgo = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() - 5);
    return d;
  }, []);

  const fetchRepresentations = async () => {
    setIsLoading(true);
    try {
      const allReps = await getAllRepresentationsForUser(member.id);
      const sortedReps = allReps.sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());
      setRepresentations(sortedReps);

      // Check for old pending requests FOR THIS MEMBER based on start date
      const oldPending = sortedReps.filter(r => 
          r.status === 'pending' && 
          r.representedPersonId === member.id &&
          new Date(r.startDate) < fiveDaysAgo
      );
      setHasOldRequests(oldPending.length > 0);

    } catch (error) {
      console.error("Failed to fetch member representations:", error);
      toast({ title: t.toast_error_title || "Error", description: "Could not fetch representations.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRepresentations();
  }, [member.id]);

  const handleStatusChange = async (representationId: string, status: 'confirmed' | 'declined') => {
    const rep = representations.find(r => r.id === representationId);
    if (!auditor || !rep) {
      toast({ title: t.toast_error_title || "Error", description: "Auditor or representation not found.", variant: 'destructive' });
      return;
    }
    
    setIsSubmitting(representationId);
    try {
        await updateRepresentationStatus(representationId, status);

        const impactedPerson = { id: rep.representedPersonId, name: rep.representedPersonName };
        
        await logGeneralAudit({
            auditor: { id: auditor.id, name: auditor.name, role: auditor.role as UserRole, chamber: auditor.stateBureauId || 'wien' },
            impacted: impactedPerson,
            operation: 'update',
            collectionName: 'representations',
            fieldName: 'status',
            details: `Representation status for ${rep.representingPersonName} changed to '${status}' by ${auditor.name}.`,
        });

        toast({
            title: t.toast_success_title || "Success",
            description: `Representation has been ${status}.`,
        });
        fetchRepresentations(); // Refresh list
    } catch (error) {
        console.error(`Failed to ${status} representation:`, error);
        toast({
            title: t.toast_error_title || "Error",
            description: "Could not update representation status.",
            variant: "destructive"
        });
    } finally {
        setIsSubmitting(null);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t.member_review_vertretungen_tab || "Representations"}</CardTitle>
        {hasOldRequests && (
            <Alert variant="destructive" className="mt-4">
                <ShieldAlert className="h-4 w-4" />
                <AlertDescription>
                   {t.member_overview_rep_tab_overdue_alert || "This member has pending representation requests that are older than 5 days."}
                </AlertDescription>
            </Alert>
        )}
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center items-center h-48">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t.representations_table_header_period || "Period"}</TableHead>
                <TableHead>{t.member_overview_rep_table_header_type || "Type"}</TableHead>
                <TableHead>{t.member_overview_rep_table_header_other_person || "Other Person"}</TableHead>
                <TableHead className="text-right">{t.representations_table_header_duration || "Duration"}</TableHead>
                <TableHead>{t.representations_table_header_status || "Status"}</TableHead>
                <TableHead>{t.representations_table_header_created_date || "Created Date"}</TableHead>
                <TableHead className="text-right">{t.member_list_table_header_action || "Action"}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {representations.length > 0 ? representations.map((rep) => {
                const isStartDateOverdue = rep.status === 'pending' && new Date(rep.startDate) < fiveDaysAgo;
                const isCreateDateOverdue = rep.createdAt && rep.status === 'pending' && new Date(rep.createdAt) < fiveDaysAgo;
                const showActions = rep.status === 'pending' && (auditor?.id === rep.representedPersonId || auditor?.role === 'lk_member');

                return (
                <TableRow key={rep.id}>
                  <TableCell className="font-medium whitespace-pre-wrap">
                    <div className="flex items-center gap-2">
                      <span>{formatPeriod(rep.startDate, rep.endDate)}</span>
                      {isStartDateOverdue && (
                        <Badge variant="destructive" className="border border-destructive bg-destructive text-destructive-foreground">
                          {t.representations_label_overdue || "overdue"}
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {rep.representingPersonId === member.id 
                        ? (t.member_overview_rep_type_performed || 'Performed') 
                        : (t.member_overview_rep_type_received || 'Received')}
                  </TableCell>
                  <TableCell>
                    {rep.representingPersonId === member.id ? rep.representedPersonName : rep.representingPersonName}
                  </TableCell>
                  <TableCell className="text-right">{rep.durationHours} h</TableCell>
                  <TableCell>
                    <RepresentationStatusBadge status={rep.status}>
                        {t[`representations_status_${rep.status}`] || rep.status}
                    </RepresentationStatusBadge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span>{rep.createdAt ? format(new Date(rep.createdAt), 'dd.MM.yyyy') : '-'}</span>
                      {isCreateDateOverdue && (
                        <Badge variant="destructive" className="border border-destructive bg-destructive text-destructive-foreground">
                          {t.representations_label_overdue || "overdue"}
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    {showActions ? (
                      <div className="flex gap-2 justify-end">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleStatusChange(rep.id, 'confirmed')}
                          disabled={isSubmitting === rep.id}
                        >
                          {isSubmitting === rep.id && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                          {t.member_overview_rep_action_confirm || "Confirm"}
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleStatusChange(rep.id, 'declined')}
                          disabled={isSubmitting === rep.id}
                        >
                          {isSubmitting === rep.id && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                          {t.member_overview_rep_action_decline || "Decline"}
                        </Button>
                      </div>
                    ) : (
                        <span>-</span>
                    )}
                  </TableCell>
                </TableRow>
                );
              }) : (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center">
                    {t.member_overview_rep_no_reps_found || "No representations found for this member."}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
