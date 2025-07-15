
"use client";

import { useState, useEffect } from 'react';
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
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/context/auth-context';
import { useToast } from '@/hooks/use-toast';
import { Loader2, AlertTriangle } from 'lucide-react';
import type { Person } from '@/lib/types';

interface DeleteAccountSectionProps {
  user: Person;
  t: Record<string, string>;
  isDisabled?: boolean;
}

export default function DeleteAccountSection({ t, isDisabled }: DeleteAccountSectionProps) {
  const { deleteUserAccount } = useAuth();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [confirmationCode, setConfirmationCode] = useState('');
  const [userInput, setUserInput] = useState('');

  // Generate a new confirmation code whenever the dialog opens
  useEffect(() => {
    if (isOpen) {
      const part1 = Math.floor(100 + Math.random() * 900);
      const part2 = Math.floor(100 + Math.random() * 900);
      setConfirmationCode(`${part1}${part2}`);
      setUserInput(''); // Reset input
    }
  }, [isOpen]);
  
  const formattedConfirmationCode = `${confirmationCode.slice(0, 3)} ${confirmationCode.slice(3, 6)}`;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value;
    // Remove all non-digit characters except for a single space if it's in the middle
    const digits = rawValue.replace(/\s/g, ''); 
    
    if (/^\d*$/.test(digits) && digits.length <= 6) {
        let formattedValue = digits;
        if (digits.length > 3) {
            formattedValue = `${digits.slice(0, 3)} ${digits.slice(3)}`;
        }
        setUserInput(formattedValue);
    }
  };

  const handleDelete = async () => {
    if (userInput.replace(/\s/g, '') !== confirmationCode) {
        toast({
            title: t.settings_delete_error_code_mismatch_title || "Incorrect Code",
            description: t.settings_delete_error_code_mismatch_desc || "The confirmation code does not match.",
            variant: "destructive",
        });
        return;
    }

    setIsDeleting(true);
    const result = await deleteUserAccount();
    setIsDeleting(false);

    if (result.success) {
        toast({
            title: t.settings_delete_success_title || "Account Deleted",
            description: t.settings_delete_success_desc || "Your account has been permanently deleted.",
        });
        // The auth context handles the redirect
    } else {
        toast({
            title: t.settings_delete_error_title || "Deletion Failed",
            description: result.error,
            variant: "destructive",
        });
        setIsOpen(false); // Close dialog on failure
    }
  };
  
  return (
    <Card className="border-destructive mt-8">
      <CardHeader>
        <div className="flex items-center gap-3">
            <AlertTriangle className="h-6 w-6 text-destructive" />
            <CardTitle className="text-destructive">{t.settings_danger_zone_title || "Danger Zone"}</CardTitle>
        </div>
        <CardDescription>
          {t.settings_danger_zone_desc || "This action is permanent and cannot be undone."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" disabled={isDisabled}>{t.settings_delete_account_button || "Delete My Account"}</Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{t.settings_delete_dialog_title || "Are you absolutely sure?"}</AlertDialogTitle>
              <AlertDialogDescription>
                {t.settings_delete_dialog_desc_part1 || "This action cannot be undone. This will permanently delete your account and remove all your data from our servers, including all uploaded documents."}
                <br /><br />
                {t.settings_delete_dialog_desc_part2 || "Please type"} <strong className="text-foreground">{formattedConfirmationCode}</strong> {t.settings_delete_dialog_desc_part3 || "to confirm."}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="py-2">
                <Label htmlFor="confirmation-code" className="sr-only">Confirmation Code</Label>
                <Input
                    id="confirmation-code"
                    value={userInput}
                    onChange={handleInputChange}
                    placeholder="123 456"
                    autoFocus
                    className="text-center tracking-widest font-mono text-lg"
                />
            </div>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isDeleting}>{t.settings_delete_dialog_cancel || "Cancel"}</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                disabled={userInput.replace(/\s/g, '') !== confirmationCode || isDeleting}
                className="bg-destructive hover:bg-destructive/90"
              >
                {isDeleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                {t.settings_delete_dialog_confirm || "Delete Account"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardContent>
    </Card>
  );
}
