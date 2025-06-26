
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { setPersonStatus } from '@/app/actions/memberActions';
import type { Person } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Loader2 } from 'lucide-react';

interface MemberDangerZoneActionsProps {
  member: Person;
  t: Record<string, string>;
}

export default function MemberDangerZoneActions({ member, t }: MemberDangerZoneActionsProps) {
  const router = useRouter();
  const { toast } = useToast();
  
  const [isDeactivating, setIsDeactivating] = useState(false);
  const [isInactiveAlertOpen, setIsInactiveAlertOpen] = useState(false);

  const handleDeactivateConfirm = async () => {
    setIsDeactivating(true);
    const result = await setPersonStatus(member.id, 'inactive');
    if (result.success) {
      toast({ title: t.toast_success_title || "Success", description: result.message });
      router.refresh();
      setIsInactiveAlertOpen(false);
    } else {
      toast({ title: t.toast_error_title || "Error", description: result.message, variant: 'destructive' });
    }
    setIsDeactivating(false);
  };

  return (
    <div className="flex flex-wrap gap-4">
      {/* Set Inactive Dialog */}
      <AlertDialog open={isInactiveAlertOpen} onOpenChange={setIsInactiveAlertOpen}>
        <Button variant="outline" className="border-destructive text-destructive hover:bg-destructive/10 hover:text-destructive" onClick={() => setIsInactiveAlertOpen(true)}>
          {t.member_list_table_action_set_inactive || "Set Inactive"}
        </Button>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t.member_list_deactivate_dialog_title || "Are you sure?"}</AlertDialogTitle>
            <AlertDialogDescription>
              {(t.member_list_deactivate_dialog_desc || "This will set user {memberName} to 'inactive'...")
                .replace('{memberName}', member.name || 'this user')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeactivating}>{t.member_list_deactivate_dialog_cancel || "Cancel"}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeactivateConfirm}
              disabled={isDeactivating}
            >
              {isDeactivating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {t.member_list_deactivate_dialog_confirm || "Set Inactive"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
