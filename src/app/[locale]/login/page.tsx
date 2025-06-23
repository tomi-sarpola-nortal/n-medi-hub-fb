
"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/context/auth-context';
import { useToast } from '@/hooks/use-toast';
import { Loader2, PlusCircle, Info } from 'lucide-react';
import AuthLayout from '@/components/auth/AuthLayout';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

// Helper for client-side translations
const getClientTranslations = (locale: string) => {
  try {
    if (locale === 'de') {
      return require('../../../../locales/de.json');
    }
    return require('../../../../locales/en.json');
  } catch (e) {
    console.warn("Translation file not found for login page, falling back to en");
    return require('../../../../locales/en.json'); // Fallback
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
  // With the [locale] structure, the locale is always the first segment
  const currentLocale = pathname.split('/')[1] || 'en';
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
    setIsLoading(false); // Set loading false after login attempt is complete

    if (result.success) {
      router.push('/dashboard'); // Explicit redirect on success
    } else {
      // Check if the error is a translation key or a raw message
      const errorMessage = t[result.error as string] || result.error || t.login_error_description;

      toast({
        title: t.login_error_title || "Login Failed",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  return (
    <AuthLayout
      pageTitle={t.login_page_main_title || "Portal Login"} // Assuming a general title for auth pages
      // pageSubtitle could be added if needed for login
    >
      <div className="w-full max-w-md space-y-8">
        <Alert>
            <Info className="h-4 w-4" />
            <AlertTitle>Demo Mode</AlertTitle>
            <AlertDescription>
                <p className="mb-2">You can use the following credentials to explore the application:</p>
                <div className="space-y-1">
                    <p className="font-semibold">Dentist Role:</p>
                    <p className="text-xs ml-2">Email: <code className="font-mono bg-muted px-1 py-0.5 rounded">adasd@asdas.com</code></p>
                    <p className="text-xs ml-2">Password: <code className="font-mono bg-muted px-1 py-0.5 rounded">-dkwfFv8WDGL=tR</code></p>
                </div>
                <div className="space-y-1 mt-2">
                    <p className="font-semibold">Chamber Member Role:</p>
                    <p className="text-xs ml-2">Email: <code className="font-mono bg-muted px-1 py-0.5 rounded">meme@gmail.com</code></p>
                    <p className="text-xs ml-2">Password: <code className="font-mono bg-muted px-1 py-0.5 rounded">-dkwfFv8WDGL=tR</code></p>
                </div>
            </AlertDescription>
        </Alert>
        
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
              <Link href="#" className="hover:underline">
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
