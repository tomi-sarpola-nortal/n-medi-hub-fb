
"use client";

import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import AuthLayout from '@/components/auth/AuthLayout';
import { CheckCircle2 } from 'lucide-react';

// Helper for client-side translations
const getClientTranslations = (locale: string) => {
  try {
    if (locale === 'de') {
      return require('../../../../locales/de.json');
    }
    return require('../../../../locales/en.json');
  } catch (e) {
    console.warn("Translation file not found for register/success, falling back to en");
    return require('../../../../locales/en.json'); // Fallback
  }
};

export default function RegistrationSuccessPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentLocale = searchParams.get('locale') || router.locale || pathname.split('/')[1] || 'en';
  const t = getClientTranslations(currentLocale);

  return (
    <AuthLayout
      pageTitle={t.register_success_page_title || "Registration Submitted"}
      showBackButton={false} // No back button on success page
    >
      <div className="w-full max-w-md">
        <Card className="shadow-xl text-center">
          <CardContent className="p-8 space-y-6">
            <CheckCircle2 className="h-20 w-20 text-green-500 mx-auto" data-ai-hint="success checkmark" />
            <h2 className="text-3xl font-bold font-headline">
              {t.register_success_card_title || "Vielen Dank!"}
            </h2>
            <p className="text-muted-foreground">
              {t.register_success_card_message_line1 || "Ihr Antrag wurde erfolgreich an die Zahnärztekammer Salzburg übermittelt."}
            </p>
            <p className="text-muted-foreground">
              {t.register_success_card_message_line2 || "Nach der Prüfung erhalten Sie Ihre Zahnarzt-ID und weitere Informationen per E-Mail."}
            </p>
            <Button
              onClick={() => router.push('/login')}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground h-11 text-base mt-4"
            >
              {t.register_success_button_to_login || "ZUR ANMELDUNG"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </AuthLayout>
  );
}
