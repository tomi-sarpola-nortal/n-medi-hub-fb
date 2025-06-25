
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { setPersonStatus } from '@/app/actions/memberActions';
import type { Person } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Loader2 } from 'lucide-react';

interface MemberInactiveActionProps {
  member: Person;
  t: Record<string, string>;
}

export default function MemberInactiveAction({ member, t }: MemberInactiveActionProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isDeactivating, setIsDeactivating] = useState(false);
  const [isAlertOpen, setIsAlertOpen] = useState(false);

  const handleDeactivateConfirm = async () => {
    setIsDeactivating(true);
    const result = await setPersonStatus(member.id, 'inactive');
    if (result.success) {
      toast({ title: t.toast_success_title || "Success", description: result.message });
      router.refresh(); // Refresh server component data
      setIsAlertOpen(false);
    } else {
      toast({ title: t.toast_error_title || "Error", description: result.message, variant: 'destructive' });
    }
    setIsDeactivating(false);
  };

  return (
    <>
      <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <Button variant="destructive" onClick={() => setIsAlertOpen(true)}>
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
              className="bg-destructive hover:bg-destructive/90"
            >
              {isDeactivating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {t.member_list_deactivate_dialog_confirm || "Set Inactive"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
