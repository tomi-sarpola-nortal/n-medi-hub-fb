
"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/context/auth-context';
import { useToast } from '@/hooks/use-toast';
import { Landmark, Loader2, PlusCircle } from 'lucide-react';
import Image from 'next/image';

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
  const searchParams = useSearchParams();
  const currentLocale = searchParams.get('locale') || router.locale || 'en';
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
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4 font-body">
      <header className="mb-10 text-center">
        <Link href="/" className="inline-block">
          <div className="flex items-center justify-center space-x-2">
            {/* Placeholder for Z graphic, using Landmark icon */}
            <Landmark className="h-12 w-12 text-destructive" data-ai-hint="logo company" />
            <div>
              <h1 className="text-2xl font-bold font-headline text-charcoal">
                {t.login_logo_text_main || "ÖSTERREICHISCHE ZAHNÄRZTE KAMMER"}
              </h1>
              <p className="text-xl font-headline text-primary">
                {t.login_logo_text_portal || "Portal"}
              </p>
            </div>
          </div>
        </Link>
      </header>

      <main className="w-full max-w-md space-y-8">
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
                  <Link href="/register">
                    {t.login_register_button_text || "EINTRAG IN DIE KAMMER BEANTRAGEN"}
                  </Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>

      <footer className="mt-12 py-8 text-center text-xs text-muted-foreground w-full">
         <div className="inline-flex items-center justify-center space-x-1 mb-2">
            <Landmark className="h-5 w-5 text-destructive" />
            <span className="font-bold font-headline text-sm text-charcoal">
                {t.login_logo_text_main || "ÖSTERREICHISCHE ZAHNÄRZTE KAMMER"}
            </span>
        </div>
        <p className="mb-2">{t.login_footer_copyright || "© 2025 Österreichische Zahnärztekammer. Alle Rechte vorbehalten."}</p>
        <div className="space-x-4">
          <Link href="#" className="hover:text-primary hover:underline">{t.login_footer_privacy || "Datenschutz"}</Link>
          <Link href="#" className="hover:text-primary hover:underline">{t.login_footer_imprint || "Impressum"}</Link>
          <Link href="#" className="hover:text-primary hover:underline">{t.login_footer_contact || "Kontakt"}</Link>
        </div>
      </footer>
    </div>
  );
}
