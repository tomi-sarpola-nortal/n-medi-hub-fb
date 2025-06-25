
"use client";

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useToast } from '@/hooks/use-toast';
import { createMemberByAdmin } from '@/app/actions/adminActions';
import type { PersonCreationData } from '@/lib/types';

import AppLayout from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Loader2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

const getClientTranslations = (locale: string) => {
  try {
    const page = locale === 'de' ? require('../../../../../locales/de/member-overview.json') : require('../../../../../locales/en/member-overview.json');
    const common = locale === 'de' ? require('../../../../../locales/de/common.json') : require('../../../../../locales/en/common.json');
    return { ...page, ...common };
  } catch (e) {
    console.warn("Translation file not found for create member page, falling back to en");
    return require('../../../../../locales/en/member-overview.json');
  }
};

const FormSchema = z.object({
  title: z.string().optional(),
  firstName: z.string().min(1, { message: "First name is required." }),
  lastName: z.string().min(1, { message: "Last name is required." }),
  email: z.string().email({ message: "A valid email is required." }),
});

type CreateMemberFormInputs = z.infer<typeof FormSchema>;

export default function CreateMemberPage() {
  const router = useRouter();
  const params = useParams();
  const locale = typeof params.locale === 'string' ? params.locale : 'en';

  const [t, setT] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    setT(getClientTranslations(locale));
  }, [locale]);
  
  const form = useForm<CreateMemberFormInputs>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      title: 'Dr.',
      firstName: '',
      lastName: '',
      email: '',
    },
  });

  const onSubmit = async (data: CreateMemberFormInputs) => {
    setIsLoading(true);
    
    const personData: PersonCreationData = {
      name: `${data.title} ${data.firstName} ${data.lastName}`.trim(),
      email: data.email,
      role: 'dentist', // All admin-created users are dentists
      region: 'Wien', // Default region
      status: 'active',
      ...data,
    };

    const result = await createMemberByAdmin({ ...personData, locale });

    if (result.success) {
      toast({
        title: t.toast_success_title || "Success",
        description: t.create_member_success_toast || "User created successfully. A password reset email has been sent.",
      });
      router.push(`/${locale}/member-overview`);
    } else {
      toast({
        title: t.toast_error_title || "Error",
        description: result.message || t.create_member_error_toast || "Failed to create user.",
        variant: 'destructive',
      });
    }

    setIsLoading(false);
  };

  const pageTitle = t.create_member_page_title || "Create New Member";

  if (Object.keys(t).length === 0) {
      return (
        <AppLayout pageTitle="Loading..." locale={locale}>
          <div className="flex-1 space-y-8 p-4 md:p-8 flex justify-center items-center">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
          </div>
        </AppLayout>
      );
  }

  return (
    <AppLayout pageTitle={pageTitle} locale={locale}>
      <div className="flex-1 space-y-6 p-4 md:p-8 max-w-2xl mx-auto">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
            <Link href={`/${locale}/member-overview`}>
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight font-headline">{pageTitle}</h1>
            <div className="text-sm text-muted-foreground mt-2">
                <Link href={`/${locale}/dashboard`} className="hover:underline">{t.member_overview_breadcrumb_dashboard || "Dashboard"}</Link>
                <span className="mx-1">/</span>
                <Link href={`/${locale}/member-overview`} className="hover:underline">{t.member_overview_breadcrumb_current || "Member Overview"}</Link>
                <span className="mx-1">/</span>
                <span className="font-medium text-foreground">{t.create_member_breadcrumb_create || "Create"}</span>
            </div>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{pageTitle}</CardTitle>
            <CardDescription>{t.create_member_page_desc || "Fill in the details for the new member. They will receive an email to set their password."}</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormField
                        control={form.control}
                        name="title"
                        render={({ field }) => (
                            <FormItem className="md:col-span-1">
                            <FormLabel>{t.register_step2_label_title || "Title"}</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger><SelectValue placeholder={t.register_select_placeholder || "Please select"} /></SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="Dr.">{t.title_dr || "Dr."}</SelectItem>
                                        <SelectItem value="Prof.">{t.title_prof || "Prof."}</SelectItem>
                                        <SelectItem value="Mag.">{t.title_mag || "Mag."}</SelectItem>
                                        <SelectItem value="none">{t.title_none || "None"}</SelectItem>
                                    </SelectContent>
                                </Select>
                            <FormMessage />
                            </FormItem>
                        )}
                        />
                     <FormField
                        control={form.control}
                        name="firstName"
                        render={({ field }) => (
                            <FormItem className="md:col-span-2">
                                <FormLabel>{t.register_step2_label_firstName || "First Name"}*</FormLabel>
                                <FormControl><Input {...field} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>
                <FormField
                    control={form.control}
                    name="lastName"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>{t.register_step2_label_lastName || "Last Name"}*</FormLabel>
                            <FormControl><Input {...field} /></FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                 <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>{t.register_label_email || "Email Address"}*</FormLabel>
                            <FormControl><Input type="email" {...field} /></FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <div className="flex justify-end pt-4">
                  <Button type="submit" disabled={isLoading}>
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {t.create_member_submit_button || "Create Member and Send Invite"}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
