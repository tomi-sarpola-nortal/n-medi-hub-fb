'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { setPersonStatus, deletePersonByAdmin } from '@/app/actions/memberActions';
import type { Person } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Loader2 } from 'lucide-react';
import { auth } from '@/lib/firebaseConfig';

interface MemberDangerZoneActionsProps {
  member: Person;
  t: Record<string, string>;
}

export default function MemberDangerZoneActions({ member, t }: MemberDangerZoneActionsProps) {
  const router = useRouter();
  const { toast } = useToast();
  
  const [isDeactivating, setIsDeactivating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isInactiveAlertOpen, setIsInactiveAlertOpen] = useState(false);
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);

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
  
  const handleDeleteConfirm = async () => {
    if (!auth?.currentUser) {
        toast({ title: t.toast_error_title || "Error", description: "Authentication error. Please log in again.", variant: 'destructive' });
        return;
    }
    const token = await auth.currentUser.getIdToken();
    setIsDeleting(true);
    const result = await deletePersonByAdmin(member.id, token);
    if (result.success) {
      toast({ title: t.toast_success_title || "Success", description: result.message });
      router.push('/member-overview');
      router.refresh();
    } else {
      toast({ title: t.toast_error_title || "Error", description: result.message, variant: 'destructive' });
      setIsDeleteAlertOpen(false);
    }
    setIsDeleting(false);
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

       {/* Delete User Dialog */}
       <AlertDialog open={isDeleteAlertOpen} onOpenChange={setIsDeleteAlertOpen}>
        <Button variant="destructive" onClick={() => setIsDeleteAlertOpen(true)}>
          {t.member_list_delete_user_button || "Delete User"}
        </Button>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t.member_list_delete_dialog_title || "Are you absolutely sure?"}</AlertDialogTitle>
            <AlertDialogDescription>
              {(t.member_list_delete_dialog_desc || "This will permanently delete the user {memberName} and all associated data. This action cannot be undone.")
                .replace('{memberName}', member.name || 'this user')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>{t.member_list_deactivate_dialog_cancel || "Cancel"}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
              className="bg-destructive hover:bg-destructive/90"
            >
              {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {t.member_list_delete_dialog_confirm || "Delete User"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
