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
import { Loader2, PlusCircle, Info, Code } from 'lucide-react';
import AuthLayout from '@/components/auth/AuthLayout';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useClientTranslations } from '@/hooks/use-client-translations';

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
  
  const { t, isLoading: translationsLoading } = useClientTranslations(['login']);

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

  const fillLoginForm = (email: string, password: string) => {
    loginForm.setValue('email', email);
    loginForm.setValue('password', password);
  };

  const onLoginSubmit: SubmitHandler<LoginFormInputs> = async (data) => {
    setIsLoading(true);
    const result = await login(data.email, data.password);
    setIsLoading(false); 

    if (result.success) {
      router.push(`/${currentLocale}/dashboard`);
    } else {
      const errorMessage = t(result.error as string) || result.error || t('login_error_description');
      toast({
        title: t('login_error_title'),
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const onForgotPasswordSubmit: SubmitHandler<ForgotPasswordInputs> = async (data) => {
    setIsSendingReset(true);
    await sendPasswordReset(data.email, currentLocale);
    setIsSendingReset(false);

    toast({
        title: t('toast_success_title'),
        description: t('forgot_password_success_toast'),
    });

    setIsForgotPassOpen(false);
    forgotPasswordForm.reset();
  };
  
  if (translationsLoading) {
    return (
      <AuthLayout
        pageTitle="Loading..."
        locale={currentLocale}
      >
        <div className="flex-1 space-y-8 p-4 md:p-8 flex justify-center items-center">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
        </div>
      </AuthLayout>
    );
  }
  
  return (
    <AuthLayout
      pageTitle={t('login_page_main_title')}
      locale={currentLocale}
    >
      <div className="w-full max-w-screen-xl mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12 items-start">
          
          <div className="hidden lg:block"></div>

          <div className="space-y-8">
            <Card className="shadow-xl w-full max-w-md mx-auto lg:mx-0">
              <CardHeader className="text-center">
                <CardTitle className="font-headline text-2xl">{t('login_form_title')}</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="font-medium">{t('login_label_email')}</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder={t('login_placeholder_email')}
                      {...loginForm.register('email')}
                      className={loginForm.formState.errors.email ? "border-destructive" : ""}
                    />
                    {loginForm.formState.errors.email && (
                      <p className="text-xs text-destructive">{loginForm.formState.errors.email.message}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">{t('login_label_password')}</Label>
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
                      t('login_button_text')
                    )}
                  </Button>
                </form>
              </CardContent>
              <CardFooter className="flex-col items-center space-y-2 pt-4 pb-6">
                <Button variant="link" type="button" onClick={() => setIsForgotPassOpen(true)} className="text-sm text-primary hover:underline p-0 h-auto">
                    {t('login_forgot_password_link')}
                </Button>
                <p className="text-xs text-muted-foreground">
                  {t('login_support_text_prefix')}{" "}
                  <a href="#" className="hover:underline">
                    {t('login_support_link')}
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
                      {t('login_register_title')}
                    </h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {t('login_register_description')}
                    </p>
                    <Button variant="outline" className="mt-4 w-full sm:w-auto border-primary text-primary hover:bg-primary/10" asChild>
                      <a href={`/${currentLocale}/register/step1`}> 
                        {t('login_register_button_text')}
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
                            <p className="font-semibold">Doctor Role:</p>
                            <div className="pl-2 mt-1 space-y-1">
                                <div>
                                    <p className="text-xs">Email: <code className="font-mono bg-muted px-1 py-0.5 rounded">adasd@asdas.com</code></p>
                                    <p className="text-xs">Password: <code className="font-mono bg-muted px-1 py-0.5 rounded">-dkwfFv8WDGL=tR</code></p>
                                    <Button 
                                        variant="outline" 
                                        size="sm" 
                                        className="mt-1 text-xs h-7 bg-gray-100 hover:bg-gray-200 border-gray-200 text-gray-800 font-medium" 
                                        onClick={() => fillLoginForm('adasd@asdas.com', '-dkwfFv8WDGL=tR')}
                                    >
                                        Use these credentials
                                    </Button>
                                </div>
                                <div className="pt-1">
                                    <p className="text-xs">Email: <code className="font-mono bg-muted px-1 py-0.5 rounded">sarah.miller@example.com</code></p>
                                    <p className="text-xs">Password: <code className="font-mono bg-muted px-1 py-0.5 rounded">TestTest24</code></p>
                                    <Button 
                                        variant="outline" 
                                        size="sm" 
                                        className="mt-1 text-xs h-7 bg-gray-100 hover:bg-gray-200 border-gray-200 text-gray-800 font-medium" 
                                        onClick={() => fillLoginForm('sarah.miller@example.com', 'TestTest24')}
                                    >
                                        Use these credentials
                                    </Button>
                                </div>
                            </div>
                        </div>
                        <div>
                            <p className="font-semibold">Bureau Member Role:</p>
                            <p className="text-xs ml-2">Email: <code className="font-mono bg-muted px-1 py-0.5 rounded">max.sample@example.com</code></p>
                            <p className="text-xs ml-2">Password: <code className="font-mono bg-muted px-1 py-0.5 rounded">-dkwfFv8WDGL=tR</code></p>
                            <Button 
                                variant="outline" 
                                size="sm" 
                                className="mt-1 ml-2 text-xs h-7 bg-gray-100 hover:bg-gray-200 border-gray-200 text-gray-800 font-medium" 
                                onClick={() => fillLoginForm('max.sample@example.com', '-dkwfFv8WDGL=tR')}
                            >
                                Use these credentials
                            </Button>
                        </div>
                    </div>
                    <div className="mt-4 pt-2 border-t border-gray-200">
                        <Button 
                            variant="outline" 
                            size="sm" 
                            className="w-full text-xs h-7 bg-gray-100 hover:bg-gray-200 border-gray-200 text-gray-800 font-medium flex items-center justify-center"
                            onClick={() => router.push(`/${currentLocale}/developer`)}
                        >
                            <Code className="mr-2 h-4 w-4" />
                            Open Developer Module
                        </Button>
                    </div>
                </AlertDescription>
            </Alert>
          </div>
        </div>
      </div>
      
      <Dialog open={isForgotPassOpen} onOpenChange={setIsForgotPassOpen}>
        <DialogContent>
            <DialogHeader>
            <DialogTitle>{t('forgot_password_dialog_title')}</DialogTitle>
            <DialogDescription>{t('forgot_password_dialog_desc')}</DialogDescription>
            </DialogHeader>
            <form onSubmit={forgotPasswordForm.handleSubmit(onForgotPasswordSubmit)} className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="reset-email">{t('login_label_email')}</Label>
                    <Input
                        id="reset-email"
                        type="email"
                        placeholder={t('login_placeholder_email')}
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
                        {t('forgot_password_button_send')}
                    </Button>
                </DialogFooter>
            </form>
        </DialogContent>
      </Dialog>
    </AuthLayout>
  );
}