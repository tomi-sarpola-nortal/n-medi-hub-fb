
"use client";

import { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import AuthLayout from '@/components/auth/AuthLayout';
import RegistrationStepper from '@/components/auth/RegistrationStepper';
import { findPersonByEmail } from '@/services/personService';
import { updateRegistrationData, getRegistrationData } from '@/lib/registrationStore'; 
import { v4 as uuidv4 } from 'uuid';

// Helper for client-side translations
const getClientTranslations = (locale: string) => {
  try {
    if (locale === 'de') {
      return require('../../../../../locales/de.json');
    }
    return require('../../../../../locales/en.json');
  } catch (e) {
    console.warn("Translation file not found for register/step1, falling back to en");
    return require('../../../../../locales/en.json'); // Fallback
  }
};

const FormSchema = z.object({
  email: z.string().email({ message: "Invalid email address." }),
});
type EmailFormInputs = z.infer<typeof FormSchema>;

export default function RegisterStep1Page() {
  const router = useRouter();
  const pathname = usePathname();
  const currentLocale = pathname.split('/')[1] || 'en';
  const t = getClientTranslations(currentLocale);

  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<EmailFormInputs>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      email: '',
    },
  });

  const onSubmit: SubmitHandler<EmailFormInputs> = async (data) => {
    setIsLoading(true);
    try {
      // New logic: Check against Firestore 'persons' collection
      const existingUser = await findPersonByEmail(data.email);
      if (existingUser) {
        toast({
          title: t.register_email_exists_title || "Email Already Registered",
          description: t.register_email_exists_description || "This email address is already in use. Please use a different email or try logging in.",
          variant: "destructive",
        });
        return; // Stop the process
      }
      
      const currentData = getRegistrationData();
      const sessionId = currentData.sessionId || uuidv4();

      // Email is available, proceed to the next step.
      updateRegistrationData({ 
        email: data.email,
        sessionId: sessionId,
      });
      router.push(`/register/step2`);

    } catch (error: any) {
      console.error("Email check error:", error);
      toast({
        title: t.register_email_check_error_title || "Verification Error",
        description: t.register_email_check_error_description || "Could not verify email address. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout
      pageTitle={t.register_page_main_title || "Registration with the Austrian Dental Chamber"}
      pageSubtitle={t.register_step1_subtitle || "Please create an account first to continue with the registration."}
      showBackButton={true}
      backButtonHref="/login"
      backButtonTextKey="register_back_to_login"
    >
      <div className="w-full max-w-xl">
        <RegistrationStepper currentStep={1} totalSteps={6} />
        <Card className="shadow-xl w-full">
          <CardHeader className="text-left">
            <CardTitle className="font-headline text-2xl">{t.register_step1_card_title || "Create Account"}</CardTitle>
            <CardDescription>{t.register_step1_card_description || "Please provide a valid email address to secure your account and receive important communications."}</CardDescription>
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
                  aria-invalid={form.formState.errors.email ? "true" : "false"}
                />
                {form.formState.errors.email && (
                  <p className="text-xs text-destructive" role="alert">{form.formState.errors.email.message}</p>
                )}
              </div>
              <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground h-11 text-base" disabled={isLoading}>
                {isLoading ? (
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                ) : (
                  t.register_step1_button_confirm_email || "CONFIRM EMAIL ADDRESS"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </AuthLayout>
  );
}
