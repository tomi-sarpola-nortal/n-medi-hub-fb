
"use client";

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
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
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';

// Helper for client-side translations
const getClientTranslations = (locale: string) => {
  try {
    const page = locale === 'de' ? require('../../../../locales/de/login.json') : require('../../../../locales/en/login.json');
    return page;
  } catch (e) {
    console.warn("Translation file not found for login page, falling back to en");
    return require('../../../../locales/en/login.json'); // Fallback
  }
};

const LoginFormSchema = z.object({
  email: z.string().email({ message: "Invalid email address." }),
  password: z.string().min(6, { message: "Password must be at least 6 characters." }),
});
type LoginFormInputs = z.infer<typeof LoginFormSchema>;

const ForgotPasswordSchema = z.object({
  email: z.string().email({ message: "Invalid email address." }),
});
type ForgotPasswordInputs = z.infer<typeof ForgotPasswordSchema>;


export default function LoginPage() {
  const router = useRouter();
  const params = useParams();
  const currentLocale = typeof params.locale === 'string' ? params.locale : 'en';
  
  const [t, setT] = useState<Record<string, string> | null>(null);

  useEffect(() => {
      setT(getClientTranslations(currentLocale));
  }, [currentLocale]);

  const { login, sendPasswordReset } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isForgotPassOpen, setIsForgotPassOpen] = useState(false);
  const [isSendingReset, setIsSendingReset] = useState(false);

  const loginForm = useForm<LoginFormInputs>({
    resolver: zodResolver(LoginFormSchema),
    defaultValues: { email: '', password: '' },
  });

  const forgotPasswordForm = useForm<ForgotPasswordInputs>({
    resolver: zodResolver(ForgotPasswordSchema),
    defaultValues: { email: '' },
  });

  const onLoginSubmit: SubmitHandler<LoginFormInputs> = async (data) => {
    setIsLoading(true);
    const result = await login(data.email, data.password);
    setIsLoading(false); 

    if (result.success) {
      router.push(`/${currentLocale}/dashboard`);
    } else {
      const errorMessage = t![result.error as string] || result.error || t!.login_error_description;
      toast({
        title: t!.login_error_title || "Login Failed",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const onForgotPasswordSubmit: SubmitHandler<ForgotPasswordInputs> = async (data) => {
    setIsSendingReset(true);
    await sendPasswordReset(data.email);
    setIsSendingReset(false);

    toast({
        title: t!.toast_success_title || "Success",
        description: t!.forgot_password_success_toast || "If an account with that email exists, a password reset link has been sent.",
    });

    setIsForgotPassOpen(false);
    forgotPasswordForm.reset();
  };
  
  if (!t) {
    return (
        <AuthLayout pageTitle="Loading..." locale={currentLocale}>
             <div className="flex-1 space-y-8 p-4 md:p-8 flex justify-center items-center">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
            </div>
        </AuthLayout>
    )
  }

  return (
    <AuthLayout
      pageTitle={t.login_page_main_title || "Portal Login"}
      locale={currentLocale}
    >
      <div className="w-full max-w-screen-xl mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12 items-start">
          
          <div className="hidden lg:block"></div>

          <div className="space-y-8">
            <Card className="shadow-xl w-full max-w-md mx-auto lg:mx-0">
              <CardHeader className="text-center">
                <CardTitle className="font-headline text-2xl">{t.login_form_title || "Anmeldung ins Portal"}</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="font-medium">{t.login_label_email || "E-Mail oder Zahnarzt-ID"}</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder={t.login_placeholder_email || "max.mustermann@example.com"}
                      {...loginForm.register('email')}
                      className={loginForm.formState.errors.email ? "border-destructive" : ""}
                    />
                    {loginForm.formState.errors.email && (
                      <p className="text-xs text-destructive">{loginForm.formState.errors.email.message}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">{t.login_label_password || "Passwort"}</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      {...loginForm.register('password')}
                      className={loginForm.formState.errors.password ? "border-destructive" : ""}
                    />
                    {loginForm.formState.errors.password && (
                      <p className="text-xs text-destructive">{loginForm.formState.errors.password.message}</p>
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
                <Button variant="link" type="button" onClick={() => setIsForgotPassOpen(true)} className="text-sm text-primary hover:underline p-0 h-auto">
                    {t.login_forgot_password_link || "Forgot password?"}
                </Button>
                <p className="text-xs text-muted-foreground">
                  {t.login_support_text_prefix || "Problems with login?"}{" "}
                  <a href="#" className="hover:underline">
                    {t.login_support_link || "Contact our support"}
                  </a>
                </p>
              </CardFooter>
            </Card>

            <Card className="shadow-lg w-full max-w-md mx-auto lg:mx-0">
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
                      <a href={`/${currentLocale}/register/step1`}> 
                        {t.login_register_button_text || "EINTRAG IN DIE KAMMER BEANTRAGEN"}
                      </a>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="w-full max-w-md mx-auto lg:mx-0">
            <Alert>
                <Info className="h-4 w-4" />
                <AlertTitle>Demo Mode</AlertTitle>
                <AlertDescription>
                    <p className="mb-2">You can use the following credentials to explore the application:</p>
                    <div className="space-y-2">
                        <div>
                            <p className="font-semibold">Dentist Role:</p>
                            <div className="pl-2 mt-1 space-y-1">
                                <div>
                                    <p className="text-xs">Email: <code className="font-mono bg-muted px-1 py-0.5 rounded">adasd@asdas.com</code></p>
                                    <p className="text-xs">Password: <code className="font-mono bg-muted px-1 py-0.5 rounded">-dkwfFv8WDGL=tR</code></p>
                                </div>
                                <div className="pt-1">
                                    <p className="text-xs">Email: <code className="font-mono bg-muted px-1 py-0.5 rounded">sabine.mueller@example.com</code></p>
                                    <p className="text-xs">Password: <code className="font-mono bg-muted px-1 py-0.5 rounded">TestTest24</code></p>
                                </div>
                            </div>
                        </div>
                        <div>
                            <p className="font-semibold">Chamber Member Role:</p>
                            <p className="text-xs ml-2">Email: <code className="font-mono bg-muted px-1 py-0.5 rounded">meme@gmail.com</code></p>
                            <p className="text-xs ml-2">Password: <code className="font-mono bg-muted px-1 py-0.5 rounded">-dkwfFv8WDGL=tR</code></p>
                        </div>
                    </div>
                </AlertDescription>
            </Alert>
          </div>
        </div>
      </div>
      
      <Dialog open={isForgotPassOpen} onOpenChange={setIsForgotPassOpen}>
        <DialogContent>
            <DialogHeader>
            <DialogTitle>{t.forgot_password_dialog_title || "Reset your password"}</DialogTitle>
            <DialogDescription>{t.forgot_password_dialog_desc || "Enter your email address and we will send you a link to reset your password."}</DialogDescription>
            </DialogHeader>
            <form onSubmit={forgotPasswordForm.handleSubmit(onForgotPasswordSubmit)} className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="reset-email">{t.login_label_email || "Email or Dentist ID"}</Label>
                    <Input
                        id="reset-email"
                        type="email"
                        placeholder={t.login_placeholder_email || "john.doe@example.com"}
                        {...forgotPasswordForm.register('email')}
                        className={forgotPasswordForm.formState.errors.email ? "border-destructive" : ""}
                    />
                    {forgotPasswordForm.formState.errors.email && (
                        <p className="text-xs text-destructive">{forgotPasswordForm.formState.errors.email.message}</p>
                    )}
                </div>
                <DialogFooter>
                    <Button type="submit" disabled={isSendingReset}>
                        {isSendingReset && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {t.forgot_password_button_send || "Send Reset Link"}
                    </Button>
                </DialogFooter>
            </form>
        </DialogContent>
      </Dialog>
    </AuthLayout>
  );
}
