
"use client";

import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { DatePickerInput } from '@/components/ui/date-picker';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/auth-context';
import { updatePerson } from '@/services/personService';
import type { Person, SpecializationId } from '@/lib/types';
import { Loader2 } from 'lucide-react';
import { useState } from 'react';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../ui/form';
import { DENTAL_SPECIALIZATIONS, PROFESSIONAL_TITLES } from '@/lib/registrationStore';


const FormSchema = z.object({
    currentProfessionalTitle: z.string().min(1, { message: "Professional title is required." }),
    specializations: z.array(z.string()).min(1, { message: "At least one specialization must be selected." }),
    languages: z.string().min(1, { message: "Languages are required." }),
    graduationDate: z.union([z.date(), z.string()]).refine(val => val, { message: "Graduation date is required."}),
    university: z.string().min(1, { message: "University/College is required." }),
    approbationNumber: z.string().optional(),
    approbationDate: z.union([z.date(), z.string()]).optional().nullable(),
});

type FormInputs = z.infer<typeof FormSchema>;

interface ProfessionalQualificationsFormProps {
  user: Person;
  t: Record<string, string>;
}

export default function ProfessionalQualificationsForm({ user, t }: ProfessionalQualificationsFormProps) {
  const { toast } = useToast();
  const { setUser } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<FormInputs>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      currentProfessionalTitle: user.currentProfessionalTitle || "",
      specializations: user.specializations || [],
      languages: user.languages || "",
      graduationDate: user.graduationDate ? new Date(user.graduationDate) : undefined,
      university: user.university || "",
      approbationNumber: user.approbationNumber || "",
      approbationDate: user.approbationDate ? new Date(user.approbationDate) : undefined,
    },
  });

  const onSubmit = async (data: FormInputs) => {
    setIsLoading(true);
    try {
      const updateData = {
        ...data,
        graduationDate: data.graduationDate instanceof Date ? data.graduationDate.toISOString().split('T')[0] : data.graduationDate,
        approbationDate: data.approbationDate instanceof Date ? data.approbationDate.toISOString().split('T')[0] : data.approbationDate,
      };

      await updatePerson(user.id, updateData);
      setUser(prev => prev ? ({ ...prev, ...updateData }) : null);

      toast({
        title: t.settings_save_success_title || "Success",
        description: t.settings_prof_qual_success_desc || "Your professional qualifications have been updated.",
      });
    } catch (error) {
      console.error("Failed to update professional qualifications:", error);
      toast({
        title: t.settings_save_error_title || "Error",
        description: t.settings_save_error_desc || "Failed to update information. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
     <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
                control={form.control}
                name="currentProfessionalTitle"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>{t.register_step4_label_prof_title || "Current Professional Title"}*</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                        <SelectTrigger>
                            <SelectValue placeholder={t.register_select_placeholder || "Please select"} />
                        </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                        {PROFESSIONAL_TITLES.map(title => (
                            <SelectItem key={title.id} value={title.id}>
                            {t[title.labelKey] || title.id.replace(/_/g, ' ')}
                            </SelectItem>
                        ))}
                        </SelectContent>
                    </Select>
                    <FormMessage />
                    </FormItem>
                )}
            />

            <FormItem>
                <FormLabel>{t.register_step4_label_specializations || "Specializations/Focus Areas"}*</FormLabel>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2">
                    {DENTAL_SPECIALIZATIONS.map((item) => (
                    <FormField
                        key={item.id}
                        control={form.control}
                        name="specializations"
                        render={({ field }) => (
                        <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                            <FormControl>
                            <Checkbox
                                checked={field.value?.includes(item.id)}
                                onCheckedChange={(checked) => {
                                const currentValue = field.value || [];
                                return checked
                                    ? field.onChange([...currentValue, item.id])
                                    : field.onChange(
                                        currentValue.filter(
                                        (value) => value !== item.id
                                        )
                                    );
                                }}
                            />
                            </FormControl>
                            <FormLabel className="font-normal text-sm">
                            {t[item.labelKey] || item.id.replace(/_/g, ' ')}
                            </FormLabel>
                        </FormItem>
                        )}
                    />
                    ))}
                </div>
                <FormMessage className="pt-2">{form.formState.errors.specializations?.message}</FormMessage>
            </FormItem>

            <FormField
                control={form.control}
                name="languages"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>{t.register_step4_label_languages || "Languages"}*</FormLabel>
                    <FormControl><Input placeholder={t.register_step4_placeholder_languages || "e.g., German, English"} {...field} /></FormControl>
                    <FormMessage />
                    </FormItem>
                )}
            />

            <FormField
                control={form.control}
                name="graduationDate"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>{t.register_step4_label_graduation_date || "Date of Graduation"}*</FormLabel>
                        <FormControl>
                        <DatePickerInput
                          value={field.value ? new Date(field.value) : undefined}
                          onChange={field.onChange}
                          disabled={(date) => date > new Date() || date < new Date("1950-01-01")}
                        />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />

             <FormField
                control={form.control}
                name="university"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>{t.register_step4_label_university || "University/College"}*</FormLabel>
                    <FormControl><Input placeholder={t.register_step4_placeholder_university || "Name of University/College"} {...field} /></FormControl>
                    <FormMessage />
                    </FormItem>
                )}
             />

            <FormField
                control={form.control}
                name="approbationNumber"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>{t.register_step4_label_approbation_number || "Approbation Number (if available)"}</FormLabel>
                    <FormControl><Input {...field} /></FormControl>
                    <FormMessage />
                    </FormItem>
                )}
            />

            <FormField
                control={form.control}
                name="approbationDate"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>{t.register_step4_label_approbation_date || "Date of Approbation (if available)"}</FormLabel>
                    <FormControl>
                        <DatePickerInput
                            value={field.value ? new Date(field.value) : undefined}
                            onChange={field.onChange}
                            disabled={(date) => date > new Date() || date < new Date("1950-01-01")}
                        />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
            />

            <div className="flex justify-end pt-4">
            <Button type="submit" className="bg-primary hover:bg-primary/90 text-primary-foreground" disabled={isLoading}>
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                {t.settings_button_save || "Save Changes"}
            </Button>
            </div>
        </form>
    </Form>
  );
}
