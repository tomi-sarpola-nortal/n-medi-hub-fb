
'use client';

import { useState } from 'react';
import { useAuth } from '@/context/auth-context';
import { useToast } from '@/hooks/use-toast';
import { logGeneralAudit } from '@/app/actions/auditActions';
import type { Person, UserRole } from '@/lib/types';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Loader2, KeyRound } from 'lucide-react';
import { Separator } from '../ui/separator';

interface ResetPasswordButtonProps {
  person: Person;
  t: Record<string, string>;
  locale: string;
}

export default function ResetPasswordButton({ person, t, locale }: ResetPasswordButtonProps) {
  const { user: auditor, sendPasswordReset } = useAuth();
  const { toast } = useToast();
  const [isSending, setIsSending] = useState(false);
  const [isAlertOpen, setIsAlertOpen] = useState(false);

  const handleResetPassword = async () => {
    if (!auditor) {
      toast({ title: t.toast_error_title || "Error", description: "Auditor not found.", variant: 'destructive' });
      return;
    }

    setIsSending(true);
    const result = await sendPasswordReset(person.email, locale);

    if (result.success) {
      await logGeneralAudit({
        auditor: { id: auditor.id, name: auditor.name, role: auditor.role as UserRole, chamber: auditor.stateChamberId || 'wien' },
        impacted: { id: person.id, name: person.name },
        operation: 'update',
        collectionName: 'auth',
        fieldName: 'password',
        details: `Password reset triggered for user ${person.email} by ${auditor.name}.`,
      });

      toast({
        title: t.member_profile_reset_password_success_title || "Success",
        description: (t.member_profile_reset_password_success_desc || `Password reset email sent to {email}.`).replace('{email}', person.email),
      });
      setIsAlertOpen(false);
    } else {
      toast({
        title: t.member_profile_reset_password_error_title || "Error",
        description: result.error || (t.member_profile_reset_password_error_desc || "Failed to send password reset email."),
        variant: 'destructive',
      });
    }
    setIsSending(false);
  };

  return (
    <>
      <Separator className="my-4" />
      <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogTrigger asChild>
          <Button variant="outline" className="w-full justify-start">
            <KeyRound className="mr-2 h-4 w-4" />
            {t.member_profile_reset_password_button || "Reset Password"}
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t.member_profile_reset_password_dialog_title || "Are you sure?"}</AlertDialogTitle>
            <AlertDialogDescription>
              {(t.member_profile_reset_password_dialog_desc || "This will send a password reset link to {email}. The user will be prompted to choose a new password upon clicking the link.")
                .replace('{email}', person.email)}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSending}>{t.member_list_deactivate_dialog_cancel || "Cancel"}</AlertDialogCancel>
            <AlertDialogAction onClick={handleResetPassword} disabled={isSending}>
              {isSending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {t.member_profile_reset_password_dialog_confirm || "Send Reset Link"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
