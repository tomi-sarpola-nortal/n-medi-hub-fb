
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/auth-context';
import { updatePerson } from '@/services/personService';
import type { Person } from '@/lib/types';
import { Loader2 } from 'lucide-react';
import { useState } from 'react';
import { Form, FormControl, FormField, FormItem, FormLabel, FormDescription } from '../ui/form';

const FormSchema = z.object({
  inApp: z.boolean().default(true),
  email: z.boolean().default(false),
});

type FormInputs = z.infer<typeof FormSchema>;

interface NotificationSettingsFormProps {
  user: Person;
  t: Record<string, string>;
  isDisabled?: boolean;
}

export default function NotificationSettingsForm({ user, t, isDisabled = false }: NotificationSettingsFormProps) {
  const { toast } = useToast();
  const { setUser } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<FormInputs>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      inApp: user.notificationSettings?.inApp ?? true,
      email: user.notificationSettings?.email ?? false,
    },
  });

  const onSubmit = async (data: FormInputs) => {
    setIsLoading(true);
    try {
      const updateData = { notificationSettings: data };
      await updatePerson(user.id, updateData);
      setUser(prev => prev ? ({ ...prev, ...updateData }) : null);

      toast({
        title: t.settings_save_success_title || "Success",
        description: t.settings_notification_success_desc || "Your notification settings have been saved.",
      });
    } catch (error) {
      console.error("Failed to update notification settings:", error);
      toast({
        title: t.settings_save_error_title || "Error",
        description: t.settings_save_error_desc || "Failed to update settings. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="inApp"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">{t.settings_notification_in_app_label || "In-App Notifications"}</FormLabel>
                <FormDescription>
                  {t.settings_notification_in_app_desc || "Receive notifications directly within the portal."}
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  disabled={isDisabled}
                />
              </FormControl>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">{t.settings_notification_email_label || "Email Notifications"}</FormLabel>
                <FormDescription>
                  {t.settings_notification_email_desc || "Receive notifications via email."}
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  disabled={isDisabled}
                />
              </FormControl>
            </FormItem>
          )}
        />
        {!isDisabled && (
          <div className="flex justify-end pt-4">
            <Button type="submit" className="bg-primary hover:bg-primary/90 text-primary-foreground" disabled={isLoading}>
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              {t.settings_button_save || "Save Changes"}
            </Button>
          </div>
        )}
      </form>
    </Form>
  );
}
