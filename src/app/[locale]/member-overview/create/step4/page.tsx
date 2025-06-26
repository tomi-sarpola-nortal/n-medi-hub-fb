
"use client";

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import AppLayout from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import RegistrationStepper from '@/components/auth/RegistrationStepper';
import { getRegistrationData, updateRegistrationData, HEALTH_INSURANCE_CONTRACTS } from '@/lib/registrationStore';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

const getClientTranslations = (locale: string) => {
  try {
    const page = locale === 'de' ? require('../../../../../../locales/de/member-overview.json') : require('../../../../../../locales/en/member-overview.json');
    const register = locale === 'de' ? require('../../../../../../locales/de/register.json') : require('../../../../../../locales/en/register.json');
    return { ...page, ...register };
  } catch (e) {
    return { ...require('../../../../../../locales/en/member-overview.json'), ...require('../../../../../../locales/en/register.json')};
  }
};

const phoneRegex = /^(\+?\d{1,3}[-.\s]?)?(\(?\d{1,4}\)?[-.\s]?)?[\d\s-]{5,}$/;

const FormSchema = z.object({
  practiceName: z.string().min(1, "Required"),
  practiceStreetAddress: z.string().min(1, "Required"),
  practicePostalCode: z.string().min(1, "Required"),
  practiceCity: z.string().min(1, "Required"),
  practicePhoneNumber: z.string().regex(phoneRegex, "Invalid phone").min(1, "Required"),
  practiceFaxNumber: z.string().optional().refine(v => !v || phoneRegex.test(v), "Invalid fax"),
  practiceEmail: z.string().email().optional().or(z.literal('')),
  practiceWebsite: z.string().url().optional().or(z.literal('')),
  healthInsuranceContracts: z.array(z.string()).min(1, "Select at least one"),
});

type PracticeInfoFormInputs = z.infer<typeof FormSchema>;

export default function CreateMemberStep4Page() {
  const router = useRouter();
  const params = useParams();
  const locale = typeof params.locale === 'string' ? params.locale : 'en';

  const [t, setT] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<PracticeInfoFormInputs>({
    resolver: zodResolver(FormSchema),
    defaultValues: { healthInsuranceContracts: [] },
  });

  useEffect(() => {
    setT(getClientTranslations(locale));
    const storedData = getRegistrationData();
    if (!storedData.email || !storedData.sessionId || !storedData.currentProfessionalTitle) {
      toast({ title: "Missing Information", variant: "destructive" });
      router.replace(`/${locale}/member-overview/create`);
    } else {
        form.reset(storedData);
    }
  }, [locale, router, toast, form]);

  const onSubmit: SubmitHandler<PracticeInfoFormInputs> = async (data) => {
    setIsLoading(true);
    updateRegistrationData(data);
    router.push(`/${locale}/member-overview/create/step5`);
    setIsLoading(false);
  };

  const pageTitle = t.create_member_page_title || "Create New Member";
  if (Object.keys(t).length === 0) return null;

  return (
    <AppLayout pageTitle={pageTitle} locale={locale}>
      <div className="flex-1 space-y-6 p-4 md:p-8 max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold tracking-tight font-headline">{t.register_step5_card_title}</h1>
        <RegistrationStepper currentStep={4} totalSteps={5} />
        <Card>
          <CardHeader><CardDescription>{t.register_step5_card_description || "Provide practice details."}</CardDescription></CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField control={form.control} name="practiceName" render={({ field }) => (<FormItem><FormLabel>{t.register_step5_label_practiceName}*</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                <FormField control={form.control} name="practiceStreetAddress" render={({ field }) => (<FormItem><FormLabel>{t.register_step5_label_practiceStreetAddress}*</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField control={form.control} name="practicePostalCode" render={({ field }) => (<FormItem><FormLabel>{t.register_step5_label_practicePostalCode}*</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                  <FormField control={form.control} name="practiceCity" render={({ field }) => (<FormItem><FormLabel>{t.register_step5_label_practiceCity}*</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                </div>
                <FormField control={form.control} name="practicePhoneNumber" render={({ field }) => (<FormItem><FormLabel>{t.register_step5_label_practicePhoneNumber}*</FormLabel><FormControl><Input placeholder="+43" {...field} /></FormControl><FormMessage /></FormItem>)} />
                <FormField control={form.control} name="practiceFaxNumber" render={({ field }) => (<FormItem><FormLabel>{t.register_step5_label_practiceFaxNumber}</FormLabel><FormControl><Input placeholder="+43" {...field} /></FormControl><FormMessage /></FormItem>)} />
                <FormField control={form.control} name="practiceEmail" render={({ field }) => (<FormItem><FormLabel>{t.register_step5_label_practiceEmail}</FormLabel><FormControl><Input type="email" placeholder={t.register_step5_placeholder_practiceEmail} {...field} /></FormControl><FormMessage /></FormItem>)} />
                <FormField control={form.control} name="practiceWebsite" render={({ field }) => (<FormItem><FormLabel>{t.register_step5_label_practiceWebsite}</FormLabel><FormControl><Input type="url" placeholder={t.register_step5_placeholder_practiceWebsite} {...field} /></FormControl><FormMessage /></FormItem>)} />
                <FormItem>
                  <FormLabel>{t.register_step5_label_healthInsuranceContracts}*</FormLabel>
                  <div className="space-y-2">{HEALTH_INSURANCE_CONTRACTS.map((item) => (<FormField key={item.id} control={form.control} name="healthInsuranceContracts" render={({ field }) => (<FormItem className="flex items-row space-x-3 space-y-0"><FormControl><Checkbox checked={field.value?.includes(item.id)} onCheckedChange={(c) => c ? field.onChange([...field.value, item.id]) : field.onChange(field.value?.filter(v => v !== item.id))} /></FormControl><FormLabel className="font-normal text-sm">{t[item.labelKey]}</FormLabel></FormItem>)} />))}</div>
                  <FormMessage>{form.formState.errors.healthInsuranceContracts?.message}</FormMessage>
                </FormItem>
                <div className="flex justify-between pt-4">
                  <Button type="button" variant="outline" onClick={() => router.push(`/${locale}/member-overview/create/step3`)} disabled={isLoading}>{t.register_back_button}</Button>
                  <Button type="submit" disabled={isLoading}>{isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : t.register_button_continue}</Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
