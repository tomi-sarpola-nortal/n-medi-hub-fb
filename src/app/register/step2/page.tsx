
"use client"; // This is the content from the old step1-part2, now becoming step2

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2, XCircle, CheckCircle2 } from 'lucide-react';
import AuthLayout from '@/components/auth/AuthLayout';
import RegistrationStepper from '@/components/auth/RegistrationStepper';
import { getRegistrationData, updateRegistrationData } from '@/lib/registrationStore';

// Helper for client-side translations
const getClientTranslations = (locale: string) => {
  try {
    if (locale === 'de') {
      return require('../../../../locales/de.json');
    }
    return require('../../../../locales/en.json');
  } catch (e) {
    console.warn("Translation file not found for register/step2 (password), falling back to en");
    return require('../../../../locales/en.json'); // Fallback
  }
};

const passwordValidation = new RegExp(
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d\S]{8,}$/
);

const FormSchema = z.object({
  password: z.string().min(8, { message: "Password must be at least 8 characters." })
    .regex(passwordValidation, {
      message: "Password must include uppercase, lowercase, and a number.",
    }),
  confirmPassword: z.string().min(8, { message: "Please confirm your password." }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match.",
  path: ["confirmPassword"], 
});

type PasswordFormInputs = z.infer<typeof FormSchema>;

interface PasswordCriteria {
  minLength: boolean;
  uppercase: boolean;
  lowercase: boolean;
  number: boolean;
}

export default function RegisterStep2PasswordPage() { // Renamed component for clarity
  const router = useRouter();
  const pathname = usePathname();
  const potentialLocale = pathname.split('/')[1];
  const currentLocale = ['en', 'de'].includes(potentialLocale) ? potentialLocale : 'en';
  const t = getClientTranslations(currentLocale);

  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState<string | undefined>(undefined);
  const [passwordCriteria, setPasswordCriteria] = useState<PasswordCriteria>({
    minLength: false,
    uppercase: false,
    lowercase: false,
    number: false,
  });

  useEffect(() => {
    const storedData = getRegistrationData();
    if (!storedData.email) {
      toast({
        title: "Error",
        description: "Email not found. Please start registration from Step 1.",
        variant: "destructive",
      });
      router.replace('/register/step1'); 
    } else {
      setEmail(storedData.email);
    }
  }, [router, toast]);

  const form = useForm<PasswordFormInputs>({ // form initialization moved up
    resolver: zodResolver(FormSchema),
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
    mode: 'onTouched', 
  });

  const passwordValue = form.watch('password'); // Watch the password field

  const handlePasswordChange = (password: string) => {
    setPasswordCriteria({ // Updated setPasswordCriteria with corrected logic
      minLength: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /\d/.test(password),
    });
  };

  // Effect to update password criteria whenever the password value changes
  useEffect(() => {
 if (passwordValue !== undefined) { // Ensure passwordValue is not undefined initially
      handlePasswordChange(passwordValue);
    }
  }, [passwordValue]);

  const onSubmit: SubmitHandler<PasswordFormInputs> = async (data) => {
    setIsLoading(true);
    updateRegistrationData({ password: data.password });
    toast({
      title: t.register_step1_part2_password_saved_title || "Password Saved",
      description: t.register_step1_part2_password_saved_desc || "Password has been temporarily saved. Proceed to the next step.",
    });
    router.push('/register/step3'); // Navigate to the new Step 3 (Personal Data)
    setIsLoading(false);
  };

  if (!email && !isLoading) {
    return (
        <AuthLayout pageTitle="Loading..." pageSubtitle="Verifying registration step...">
            <div className="flex justify-center items-center h-32">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        </AuthLayout>
    );
  }

  const criteriaList = [
    { key: 'minLength', text: t.register_step1_part2_criteria_length || "At least 8 characters", met: passwordCriteria.minLength },
    { key: 'uppercase', text: t.register_step1_part2_criteria_uppercase || "At least one uppercase letter", met: passwordCriteria.uppercase },
    { key: 'lowercase', text: t.register_step1_part2_criteria_lowercase || "At least one lowercase letter", met: passwordCriteria.lowercase },
    { key: 'number', text: t.register_step1_part2_criteria_number || "At least one number", met: passwordCriteria.number },
  ];

  return (
    <AuthLayout
      pageTitle={t.register_page_main_title || "Registration with the Austrian Dental Chamber"}
      pageSubtitle={t.register_step1_subtitle || "Please create an account first to continue with the registration."} // Subtitle for account creation part 2
      showBackButton={true}
      backButtonHref="/register/step1" // Back to Step 1 (Email)
      backButtonTextKey="register_back_button"
    >
      <div className="w-full max-w-xl">
        <RegistrationStepper currentStep={2} totalSteps={6} /> {/* Now Step 2 */}
        <Card className="shadow-xl w-full">
          <CardHeader className="text-left">
            <CardTitle className="font-headline text-2xl">{t.register_step1_part2_card_title || "Set Password"}</CardTitle>
            <CardDescription>{t.register_step1_part2_card_description || "Please choose a secure password for your access to the member portal."}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div>
                <Label htmlFor="password">{t.register_step1_part2_label_password || "Password"}</Label>
                <Input
                  id="password"
                  type="password"
                  {...form.register('password')}
                  className={form.formState.errors.password ? "border-destructive" : ""}
                />
                {form.formState.errors.password && (
                  <p className="text-xs text-destructive mt-1">{form.formState.errors.password.message}</p>
                )}
              </div>
              <div>
                <Label htmlFor="confirmPassword">{t.register_step1_part2_label_confirm_password || "Repeat Password"}</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  {...form.register('confirmPassword')}
                  className={form.formState.errors.confirmPassword ? "border-destructive" : ""}
                />
                {form.formState.errors.confirmPassword && (
                  <p className="text-xs text-destructive mt-1">{form.formState.errors.confirmPassword.message}</p>
                )}
              </div>

              <div className="p-4 bg-muted/50 rounded-md space-y-2">
                {criteriaList.map(criterion => (
                  <div key={criterion.key} className="flex items-center text-sm">
                    {criterion.met ? (
                      <CheckCircle2 className="h-4 w-4 mr-2 text-green-500" />
                    ) : (
                      <XCircle className="h-4 w-4 mr-2 text-destructive" />
                    )}
                    <span>{criterion.text}</span>
                  </div>
                ))}
              </div>

              <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground h-11 text-base" disabled={isLoading}>
                {isLoading ? (
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                ) : (
                  t.register_button_continue || "CONTINUE" // Changed button text to generic "CONTINUE"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </AuthLayout>
  );
}
