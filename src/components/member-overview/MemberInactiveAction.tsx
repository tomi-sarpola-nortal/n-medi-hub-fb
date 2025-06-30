
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

interface MemberAdminActionsProps {
  member: Person;
  t: Record<string, string>;
}

export default function MemberAdminActions({ member, t }: MemberAdminActionsProps) {
  const router = useRouter();
  const { toast } = useToast();
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isInactiveAlertOpen, setIsInactiveAlertOpen] = useState(false);
  const [isActivateAlertOpen, setIsActivateAlertOpen] = useState(false);
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);

  const handleDeactivateConfirm = async () => {
    setIsSubmitting(true);
    const result = await setPersonStatus(member.id, 'inactive');
    if (result.success) {
      toast({ title: t.toast_success_title || "Success", description: result.message });
      router.refresh();
      setIsInactiveAlertOpen(false);
    } else {
      toast({ title: t.toast_error_title || "Error", description: result.message, variant: 'destructive' });
    }
    setIsSubmitting(false);
  };
  
  const handleActivateConfirm = async () => {
    setIsSubmitting(true);
    const result = await setPersonStatus(member.id, 'active');
    if (result.success) {
      toast({ title: t.toast_success_title || "Success", description: result.message });
      router.refresh();
      setIsActivateAlertOpen(false);
    } else {
      toast({ title: t.toast_error_title || "Error", description: result.message, variant: 'destructive' });
    }
    setIsSubmitting(false);
  };

  const handleDeleteConfirm = async () => {
    if (!auth?.currentUser) {
        toast({ title: t.toast_error_title || "Error", description: "Authentication error. Please log in again.", variant: 'destructive' });
        return;
    }
    const token = await auth.currentUser.getIdToken();
    setIsSubmitting(true);
    const result = await deletePersonByAdmin(member.id, token);
    if (result.success) {
      toast({ title: t.toast_success_title || "Success", description: result.message });
      router.push('/member-overview');
      router.refresh();
    } else {
      toast({ title: t.toast_error_title || "Error", description: result.message, variant: 'destructive' });
      setIsDeleteAlertOpen(false);
    }
    setIsSubmitting(false);
  };


  return (
    <div className="flex flex-wrap gap-4">
      {/* Set Inactive Button and Dialog */}
      {member.status === 'active' && (
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
              <AlertDialogCancel disabled={isSubmitting}>{t.member_list_deactivate_dialog_cancel || "Cancel"}</AlertDialogCancel>
              <AlertDialogAction onClick={handleDeactivateConfirm} disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {t.member_list_deactivate_dialog_confirm || "Set Inactive"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}

      {/* Set Active Button and Dialog */}
      {member.status === 'inactive' && (
        <AlertDialog open={isActivateAlertOpen} onOpenChange={setIsActivateAlertOpen}>
          <Button className="bg-green-600 text-primary-foreground hover:bg-green-700" onClick={() => setIsActivateAlertOpen(true)}>
            {t.member_list_table_action_set_active || "Set Active"}
          </Button>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{t.member_list_activate_dialog_title || "Are you sure?"}</AlertDialogTitle>
              <AlertDialogDescription>
                {(t.member_list_activate_dialog_desc || "This will set user {memberName} to 'active'...")
                  .replace('{memberName}', member.name || 'this user')}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isSubmitting}>{t.member_list_deactivate_dialog_cancel || "Cancel"}</AlertDialogCancel>
              <AlertDialogAction onClick={handleActivateConfirm} disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {t.member_list_activate_dialog_confirm || "Set Active"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}

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
            <AlertDialogCancel disabled={isSubmitting}>{t.member_list_deactivate_dialog_cancel || "Cancel"}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={isSubmitting}
              className="bg-destructive hover:bg-destructive/90"
            >
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {t.member_list_delete_dialog_confirm || "Delete User"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
