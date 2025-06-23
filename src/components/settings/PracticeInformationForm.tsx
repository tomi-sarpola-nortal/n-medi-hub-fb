
"use client";

import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/auth-context';
import { updatePerson } from '@/services/personService';
import type { Person, HealthInsuranceContractId } from '@/lib/types';
import { Loader2 } from 'lucide-react';
import { useState } from 'react';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../ui/form';
import { HEALTH_INSURANCE_CONTRACTS } from '@/lib/registrationStore';
import { cn } from '@/lib/utils';

const phoneRegex = new RegExp(
    /^(\+?\d{1,3}[-.\s]?)?(\(?\d{1,4}\)?[-.\s]?)?[\d\s-]{5,}$/
);

const FormSchema = z.object({
  practiceName: z.string().min(1, { message: "Practice name is required." }),
  practiceStreetAddress: z.string().min(1, { message: "Street and house number are required." }),
  practicePostalCode: z.string().min(1, { message: "Postal code is required." }),
  practiceCity: z.string().min(1, { message: "City is required." }),
  practicePhoneNumber: z.string().regex(phoneRegex, { message: "Invalid phone number."}).min(1, {message: "Phone number is required."}),
  practiceFaxNumber: z.string().optional().refine(val => !val || phoneRegex.test(val), { message: "Invalid fax number." }),
  practiceEmail: z.string().email({ message: "Invalid email address." }).optional().or(z.literal('')),
  practiceWebsite: z.string().url({ message: "Invalid URL. Please include http(s)://" }).optional().or(z.literal('')),
  healthInsuranceContracts: z.array(z.string()).min(1, { message: "At least one health insurance contract must be selected." }),
});

type FormInputs = z.infer<typeof FormSchema>;

interface PracticeInformationFormProps {
  user: Person;
  t: Record<string, string>;
  isDisabled?: boolean;
}

export default function PracticeInformationForm({ user, t, isDisabled = false }: PracticeInformationFormProps) {
  const { toast } = useToast();
  const { setUser } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<FormInputs>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      practiceName: user.practiceName || "",
      practiceStreetAddress: user.practiceStreetAddress || "",
      practicePostalCode: user.practicePostalCode || "",
      practiceCity: user.practiceCity || "",
      practicePhoneNumber: user.practicePhoneNumber || "",
      practiceFaxNumber: user.practiceFaxNumber || "",
      practiceEmail: user.practiceEmail || "",
      practiceWebsite: user.practiceWebsite || "",
      healthInsuranceContracts: user.healthInsuranceContracts || [],
    },
  });

  const onSubmit = async (data: FormInputs) => {
    setIsLoading(true);
    try {
      await updatePerson(user.id, data);
      setUser(prev => prev ? ({ ...prev, ...data }) : null);

      toast({
        title: t.settings_save_success_title || "Success",
        description: t.settings_practice_info_success_desc || "Your practice information has been updated.",
      });
    } catch (error) {
      console.error("Failed to update practice information:", error);
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
                name="practiceName"
                render={({ field }) => (
                <FormItem>
                    <FormLabel>{t.register_step5_label_practiceName || "Name of Practice/Clinic"}*</FormLabel>
                    <FormControl><Input {...field} disabled={isDisabled} /></FormControl>
                    <FormMessage />
                </FormItem>
                )}
            />
            <FormField
                control={form.control}
                name="practiceStreetAddress"
                render={({ field }) => (
                <FormItem>
                    <FormLabel>{t.register_step5_label_practiceStreetAddress || "Street and House Number"}*</FormLabel>
                    <FormControl><Input {...field} disabled={isDisabled} /></FormControl>
                    <FormMessage />
                </FormItem>
                )}
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                    control={form.control}
                    name="practicePostalCode"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>{t.register_step5_label_practicePostalCode || "Postal Code"}*</FormLabel>
                        <FormControl><Input {...field} disabled={isDisabled} /></FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="practiceCity"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>{t.register_step5_label_practiceCity || "City"}*</FormLabel>
                        <FormControl><Input {...field} disabled={isDisabled} /></FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                />
            </div>
             <FormField
                control={form.control}
                name="practicePhoneNumber"
                render={({ field }) => (
                <FormItem>
                    <FormLabel>{t.register_step5_label_practicePhoneNumber || "Practice Phone Number"}*</FormLabel>
                    <FormControl><Input placeholder="+43" {...field} disabled={isDisabled} /></FormControl>
                    <FormMessage />
                </FormItem>
                )}
            />
             <FormField
                control={form.control}
                name="practiceFaxNumber"
                render={({ field }) => (
                <FormItem>
                    <FormLabel>{t.register_step5_label_practiceFaxNumber || "Practice Fax Number"}</FormLabel>
                    <FormControl><Input placeholder="+43" {...field} disabled={isDisabled} /></FormControl>
                    <FormMessage />
                </FormItem>
                )}
            />
             <FormField
                control={form.control}
                name="practiceEmail"
                render={({ field }) => (
                <FormItem>
                    <FormLabel>{t.register_step5_label_practiceEmail || "Practice Email"}</FormLabel>
                    <FormControl><Input type="email" placeholder={t.register_step5_placeholder_practiceEmail || "practice@example.com"} {...field} disabled={isDisabled} /></FormControl>
                    <FormMessage />
                </FormItem>
                )}
            />
            <FormField
                control={form.control}
                name="practiceWebsite"
                render={({ field }) => (
                <FormItem>
                    <FormLabel>{t.register_step5_label_practiceWebsite || "Practice Website"}</FormLabel>
                    <FormControl><Input type="url" placeholder={t.register_step5_placeholder_practiceWebsite || "https://example.com"} {...field} disabled={isDisabled} /></FormControl>
                    <FormMessage />
                </FormItem>
                )}
            />
            <FormItem>
                <FormLabel>{t.register_step5_label_healthInsuranceContracts || "Health Insurance Contracts"}*</FormLabel>
                <div className="space-y-2">
                    {HEALTH_INSURANCE_CONTRACTS.map((item) => (
                    <FormField
                        key={item.id}
                        control={form.control}
                        name="healthInsuranceContracts"
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
                                disabled={isDisabled}
                            />
                            </FormControl>
                            <FormLabel className={cn("font-normal text-sm", isDisabled && "cursor-not-allowed opacity-70")}>
                                {t[item.labelKey] || item.id.toUpperCase()}
                            </FormLabel>
                        </FormItem>
                        )}
                    />
                    ))}
                </div>
                <FormMessage className="pt-2">{form.formState.errors.healthInsuranceContracts?.message}</FormMessage>
            </FormItem>

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
