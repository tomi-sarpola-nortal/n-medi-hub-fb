
"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/context/auth-context';
import { useToast } from '@/hooks/use-toast';
import { Loader2, PlusCircle } from 'lucide-react';
import AuthLayout from '@/components/auth/AuthLayout'; // Import AuthLayout

// Helper for client-side translations
const getClientTranslations = (locale: string) => {
  try {
    if (locale === 'de') {
      return require('../../../locales/de.json');
    }
    return require('../../../locales/en.json');
  } catch (e) {
    console.warn("Translation file not found for login page, falling back to en");
    return require('../../../locales/en.json'); // Fallback
  }
};

const FormSchema = z.object({
  email: z.string().email({ message: "Invalid email address." }),
  password: z.string().min(6, { message: "Password must be at least 6 characters." }),
});
type LoginFormInputs = z.infer<typeof FormSchema>;

export default function LoginPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentLocale = searchParams.get('locale') || router.locale || pathname.split('/')[1] || 'en';
  const t = getClientTranslations(currentLocale);

  const { login } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<LoginFormInputs>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit: SubmitHandler<LoginFormInputs> = async (data) => {
    setIsLoading(true);
    const result = await login(data.email, data.password);
    setIsLoading(false);
    if (result.success) {
      // AuthProvider will redirect to /dashboard
    } else {
      toast({
        title: t.login_error_title || "Login Failed",
        description: result.error || t.login_error_description || "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <AuthLayout
      pageTitle={t.login_page_main_title || "Portal Login"} // Assuming a general title for auth pages
      // pageSubtitle could be added if needed for login
    >
      <div className="w-full max-w-md space-y-8"> {/* This div ensures content is centered within AuthLayout's main area */}
        <Card className="shadow-xl">
          <CardHeader className="text-center">
            <CardTitle className="font-headline text-2xl">{t.login_form_title || "Anmeldung ins Portal"}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email" className="font-medium">{t.login_label_email || "E-Mail oder Zahnarzt-ID"}</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder={t.login_placeholder_email || "max.mustermann@example.com"}
                  {...form.register('email')}
                  className={form.formState.errors.email ? "border-destructive" : ""}
                />
                {form.formState.errors.email && (
                  <p className="text-xs text-destructive">{form.formState.errors.email.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">{t.login_label_password || "Passwort"}</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  {...form.register('password')}
                  className={form.formState.errors.password ? "border-destructive" : ""}
                />
                {form.formState.errors.password && (
                  <p className="text-xs text-destructive">{form.formState.errors.password.message}</p>
                )}
              </div>
              <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground h-11 text-base" disabled={isLoading}>
                {isLoading ? (
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                ) : (
                  t.login_button_text || "ANMELDEN"
                )}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex-col items-center space-y-2 pt-4 pb-6">
            <Link href="#" className="text-sm text-primary hover:underline">
              {t.login_forgot_password_link || "Passwort vergessen?"}
            </Link>
            <p className="text-xs text-muted-foreground">
              {t.login_support_text_prefix || "Probleme bei der Anmeldung?"}{" "}
              <Link href="#" className="text-primary hover:underline">
                {t.login_support_link || "Kontaktieren Sie unseren Support"}
              </Link>
            </p>
          </CardFooter>
        </Card>

        <Card className="shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-start space-x-4">
              <PlusCircle className="h-8 w-8 text-primary flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-headline text-lg font-semibold">
                  {t.login_register_title || "Noch nicht bei der Österreichischen Zahnärztekammer gemeldet?"}
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  {t.login_register_description || "Wenn Sie neu in Österreich tätig sind und noch keinen Eintrag bei der Österreichischen Zahnärztekammer haben, können Sie sich hier für einen Eintrag anmelden."}
                </p>
                <Button variant="outline" className="mt-4 w-full sm:w-auto border-primary text-primary hover:bg-primary/10" asChild>
                  {/* Updated Link to point to the new registration flow */}
                  <Link href="/register/step1"> 
                    {t.login_register_button_text || "EINTRAG IN DIE KAMMER BEANTRAGEN"}
                  </Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AuthLayout>
  );
}
