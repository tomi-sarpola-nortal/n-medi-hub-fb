
"use client";

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useForm, type SubmitHandler, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import AuthLayout from '@/components/auth/AuthLayout';
import RegistrationStepper from '@/components/auth/RegistrationStepper';
import { 
  getRegistrationData, 
  updateRegistrationData,
  HEALTH_INSURANCE_CONTRACTS,
  type HealthInsuranceContractId
} from '@/lib/registrationStore';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

// Helper for client-side translations
const getClientTranslations = (locale: string) => {
  try {
    if (locale === 'de') {
      return require('../../../../locales/de.json');
    }
    return require('../../../../locales/en.json');
  } catch (e) {
    console.warn("Translation file not found for register/step5, falling back to en");
    return require('../../../../locales/en.json');
  }
};

const phoneRegex = new RegExp(
  /^(\+?\d{1,3}[-.\s]?)?(\(?\d{1,4}\)?[-.\s]?)?[\d\s-]{5,}$/
); // Basic phone number validation

const FormSchema = z.object({
  practiceName: z.string().min(1, { message: "Practice name is required." }),
  practiceStreetAddress: z.string().min(1, { message: "Street and house number are required." }),
  practicePostalCode: z.string().min(1, { message: "Postal code is required." }),
  practiceCity: z.string().min(1, { message: "City is required." }),
  practicePhoneNumber: z.string().regex(phoneRegex, { message: "Invalid phone number."}).min(1, {message: "Phone number is required."}),
  practiceFaxNumber: z.string().optional().refine(val => !val || phoneRegex.test(val), { message: "Invalid fax number." }),
  practiceEmail: z.string().email({ message: "Invalid email address." }).optional().or(z.literal('')),
  practiceWebsite: z.string().url({ message: "Invalid URL. Please include http(s)://" }).optional().or(z.literal('')),
  healthInsuranceContracts: z.array(z.string()).min(1, { message: "At least one health insurance contract must be selected." }),
});

type PracticeInfoFormInputs = z.infer<typeof FormSchema>;

export default function RegisterStep5Page() {
  const router = useRouter();
  const pathname = usePathname();
  const potentialLocale = pathname.split('/')[1];
  const currentLocale = ['en', 'de'].includes(potentialLocale) ? potentialLocale : 'en';
  const t = getClientTranslations(currentLocale);

  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<PracticeInfoFormInputs>({
    resolver: zodResolver(FormSchema),
    defaultValues: () => {
      const storedData = getRegistrationData();
      return {
        practiceName: storedData.practiceName || "",
        practiceStreetAddress: storedData.practiceStreetAddress || "",
        practicePostalCode: storedData.practicePostalCode || "",
        practiceCity: storedData.practiceCity || "",
        practicePhoneNumber: storedData.practicePhoneNumber || "",
        practiceFaxNumber: storedData.practiceFaxNumber || "",
        practiceEmail: storedData.practiceEmail || "",
        practiceWebsite: storedData.practiceWebsite || "",
        healthInsuranceContracts: storedData.healthInsuranceContracts || [],
      };
    },
  });

  useEffect(() => {
    const storedData = getRegistrationData();
    // Check for essential data from previous steps
    if (!storedData.email || !storedData.password || !storedData.firstName || !storedData.currentProfessionalTitle) { 
      toast({
        title: t.register_step2_missing_data_title || "Missing Information",
        description: t.register_step2_missing_data_desc || "Essential information from previous steps is missing. Please start over.",
        variant: "destructive",
      });
      router.replace('/register/step1');
    } else {
        form.reset({
            practiceName: storedData.practiceName || "",
            practiceStreetAddress: storedData.practiceStreetAddress || "",
            practicePostalCode: storedData.practicePostalCode || "",
            practiceCity: storedData.practiceCity || "",
            practicePhoneNumber: storedData.practicePhoneNumber || "",
            practiceFaxNumber: storedData.practiceFaxNumber || "",
            practiceEmail: storedData.practiceEmail || "",
            practiceWebsite: storedData.practiceWebsite || "",
            healthInsuranceContracts: storedData.healthInsuranceContracts || [],
        });
    }
  }, [router, toast, t, form]);

  const onSubmit: SubmitHandler<PracticeInfoFormInputs> = async (data) => {
    setIsLoading(true);
    updateRegistrationData(data);
    toast({
      title: t.register_step5_data_saved_title || "Practice Information Saved",
      description: t.register_step5_data_saved_desc || "Your practice information has been temporarily saved.",
    });
    router.push('/register/step6'); 
    setIsLoading(false);
  };

  return (
    <AuthLayout
      pageTitle={t.register_page_main_title || "Registration"}
      pageSubtitle={t.register_step5_subtitle || "Please provide your practice information."}
      showBackButton={true}
      backButtonHref="/register/step4"
      backButtonTextKey="register_back_button"
    >
      <div className="w-full max-w-2xl">
        <RegistrationStepper currentStep={5} totalSteps={6} />
        <Card className="shadow-xl w-full">
          <CardHeader className="text-left">
            <CardTitle className="font-headline text-2xl">{t.register_step5_card_title || "Practice Information"}</CardTitle>
            <CardDescription>{t.register_step4_card_description || "Please enter your practice details."}</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="practiceName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t.register_step5_label_practiceName || "Name of Practice/Clinic"}*</FormLabel>
                      <FormControl><Input {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="practiceStreetAddress"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t.register_step5_label_practiceStreetAddress || "Street and House Number"}*</FormLabel>
                      <FormControl><Input {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="practicePostalCode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t.register_step5_label_practicePostalCode || "Postal Code"}*</FormLabel>
                        <FormControl><Input {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="practiceCity"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t.register_step5_label_practiceCity || "City"}*</FormLabel>
                        <FormControl><Input {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="practicePhoneNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t.register_step5_label_practicePhoneNumber || "Practice Phone Number"}*</FormLabel>
                      <FormControl><Input placeholder="+43" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="practiceFaxNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t.register_step5_label_practiceFaxNumber || "Practice Fax Number"}</FormLabel>
                      <FormControl><Input placeholder="+43" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="practiceEmail"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t.register_step5_label_practiceEmail || "Practice Email"}</FormLabel>
                      <FormControl><Input type="email" placeholder={t.register_step5_placeholder_practiceEmail || "beispiel@mail.com"} {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="practiceWebsite"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t.register_step5_label_practiceWebsite || "Practice Website"}</FormLabel>
                      <FormControl><Input type="url" placeholder={t.register_step5_placeholder_practiceWebsite || "https://"} {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormItem>
                  <FormLabel>{t.register_step5_label_healthInsuranceContracts || "Health Insurance Contracts"}*</FormLabel>
                  <div className="space-y-2">
                    {HEALTH_INSURANCE_CONTRACTS.map((item) => (
                      <FormField
                        key={item.id}
                        control={form.control}
                        name="healthInsuranceContracts"
                        render={({ field }) => {
                          return (
                            <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                              <FormControl>
                                <Checkbox
                                  checked={field.value?.includes(item.id)}
                                  onCheckedChange={(checked) => {
                                    const currentValue = field.value || [];
                                    return checked
                                      ? field.onChange([...currentValue, item.id])
                                      : field.onChange(
                                          currentValue.filter(
                                            (value: HealthInsuranceContractId) => value !== item.id
                                          )
                                        );
                                  }}
                                />
                              </FormControl>
                              <FormLabel className="font-normal text-sm">
                                {t[item.labelKey] || item.id.toUpperCase()}
                              </FormLabel>
                            </FormItem>
                          );
                        }}
                      />
                    ))}
                  </div>
                  <FormMessage>{form.formState.errors.healthInsuranceContracts?.message}</FormMessage>
                </FormItem>
                
                <div className="flex justify-between pt-4">
                  <Button type="button" variant="outline" onClick={() => router.push('/register/step4')} disabled={isLoading}>
                    {t.register_back_button || "Back"}
                  </Button>
                  <Button type="submit" className="bg-primary hover:bg-primary/90 text-primary-foreground h-11 text-base" disabled={isLoading}>
                    {isLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : (t.register_step5_button_continue_to_review || "CONTINUE TO REVIEW")}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </AuthLayout>
  );
}
