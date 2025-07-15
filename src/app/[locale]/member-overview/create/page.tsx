
"use client";

import { useState, useEffect } from 'react';
import { useRouter, useParams, usePathname } from 'next/navigation';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import AppLayout from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2, ArrowLeft } from 'lucide-react';
import { findPersonByEmail } from '@/services/personService';
import { clearRegistrationData, updateRegistrationData } from '@/lib/registrationStore'; 
import { v4 as uuidv4 } from 'uuid';
import RegistrationStepper from '@/components/auth/RegistrationStepper';
import Link from 'next/link';

const getClientTranslations = (locale: string) => {
  try {
    const page = locale === 'de' ? require('../../../../../locales/de/member-overview.json') : require('../../../../../locales/en/member-overview.json');
    const register = locale === 'de' ? require('../../../../../locales/de/register.json') : require('../../../../../locales/en/register.json');
    return { ...page, ...register };
  } catch (e) {
    console.warn("Translation file not found, falling back to en");
    const page = require('../../../../../locales/en/member-overview.json');
    const register = require('../../../../../locales/en/register.json');
    return { ...page, ...register };
  }
};

const FormSchema = z.object({
  email: z.string().email({ message: "Invalid email address." }),
});
type EmailFormInputs = z.infer<typeof FormSchema>;

export default function CreateMemberStep1Page() {
  const router = useRouter();
  const params = useParams();
  const locale = typeof params.locale === 'string' ? params.locale : 'en';

  const [t, setT] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    setT(getClientTranslations(locale));
    // Clear any previous registration data when starting a new flow
    clearRegistrationData();
  }, [locale]);
  
  const form = useForm<EmailFormInputs>({
    resolver: zodResolver(FormSchema),
    defaultValues: { email: '' },
  });

  const onSubmit: SubmitHandler<EmailFormInputs> = async (data) => {
    setIsLoading(true);
    try {
      const existingUser = await findPersonByEmail(data.email);
      if (existingUser) {
        toast({
          title: t.register_email_exists_title || "Email Already Registered",
          description: t.register_email_exists_description || "This email address is already in use.",
          variant: "destructive",
        });
        return;
      }
      
      updateRegistrationData({ 
        email: data.email,
        sessionId: uuidv4(),
      });
      router.push(`/${locale}/member-overview/create/step2`);

    } catch (error: any) {
      console.error("Email check error:", error);
      toast({
        title: t.register_email_check_error_title || "Verification Error",
        description: t.register_email_check_error_description || "Could not verify email address.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
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

        <RegistrationStepper currentStep={1} totalSteps={5} />
        
        <Card>
          <CardHeader>
            <CardTitle>{t.create_member_step1_title || "New Member's Email"}</CardTitle>
            <CardDescription>{t.create_member_step1_desc || "Enter the email address for the new member. This must be unique."}</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="space-y-2">
                    <Label htmlFor="email" className="font-medium">{t.register_label_email || "Email Address"}</Label>
                    <Input
                        id="email"
                        type="email"
                        placeholder={t.register_placeholder_email || "example@email.com"}
                        {...form.register('email')}
                        className={form.formState.errors.email ? "border-destructive" : ""}
                    />
                    {form.formState.errors.email && (
                        <p className="text-xs text-destructive">{form.formState.errors.email.message}</p>
                    )}
                </div>
                <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground h-11 text-base" disabled={isLoading}>
                    {isLoading ? (
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    ) : (
                    t.register_button_continue || "Continue"
                    )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
