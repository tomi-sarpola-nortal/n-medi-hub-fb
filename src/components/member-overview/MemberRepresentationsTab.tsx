
"use client";

import { useEffect, useState, useMemo } from 'react';
import type { Representation, Person } from '@/lib/types';
import { getRepresentationsForUser, updateRepresentationStatus } from '@/services/representationService';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Loader2, ShieldAlert } from 'lucide-react';
import { format } from 'date-fns';
import { RepresentationStatusBadge } from '@/components/representations/RepresentationStatusBadge';
import { Alert, AlertDescription } from '@/components/ui/alert';

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

  const fetchRepresentations = async () => {
    setIsLoading(true);
    try {
      const data = await getRepresentationsForUser(member.id);
      const allReps = [...data.performed, ...data.wasRepresented];
      // Remove duplicates if any (though logic should prevent this)
      const uniqueReps = Array.from(new Map(allReps.map(item => [item.id, item])).values());
      const sortedReps = uniqueReps.sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());
      setRepresentations(sortedReps);

      // Check for old pending requests FOR THIS MEMBER based on start date
      const fiveDaysAgo = new Date();
      fiveDaysAgo.setDate(fiveDaysAgo.getDate() - 5);

      const oldPending = data.wasRepresented.filter(r => 
          r.status === 'pending' && 
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
    setIsSubmitting(representationId);
    try {
        await updateRepresentationStatus(representationId, status);
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
                <TableHead className="text-right">{t.member_list_table_header_action || "Action"}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {representations.length > 0 ? representations.map((rep) => (
                <TableRow key={rep.id}>
                  <TableCell className="font-medium whitespace-pre-wrap">{formatPeriod(rep.startDate, rep.endDate)}</TableCell>
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
                  <TableCell className="text-right">
                    {rep.status === 'pending' ? (
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
              )) : (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
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
