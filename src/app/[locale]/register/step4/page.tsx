
"use client";

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { Loader2, UploadCloud, FileText as FileIcon } from 'lucide-react';
import AuthLayout from '@/components/auth/AuthLayout';
import RegistrationStepper from '@/components/auth/RegistrationStepper';
import { 
  getRegistrationData, 
  updateRegistrationData, 
  DENTAL_SPECIALIZATIONS, 
  PROFESSIONAL_TITLES,
  type SpecializationId,
  type RegistrationData
} from '@/lib/registrationStore';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { DatePickerInput } from '@/components/ui/date-picker';
import { LanguageInput } from '@/components/ui/language-input';
import { uploadFile } from '@/services/storageService';

// Helper for client-side translations
const getClientTranslations = (locale: string) => {
  try {
    const register = locale === 'de' ? require('../../../../../locales/de/register.json') : require('../../../../../locales/en/register.json');
    const common = locale === 'de' ? require('../../../../../locales/de/common.json') : require('../../../../../locales/en/common.json');
    return { ...register, ...common };
  } catch (e) {
    console.warn("Translation file not found for register/step4, falling back to en", e);
    const register = require('../../../../../locales/en/register.json');
    const common = require('../../../../../locales/en/common.json');
    return { ...register, ...common };
  }
};

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ACCEPTED_FILE_TYPES = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];

const optionalFileSchema = z
  .custom<FileList>()
  .optional()
  .nullable()
  .refine((files) => !files || files.length === 0 || files?.[0]?.size <= MAX_FILE_SIZE, `Max file size is 10MB.`)
  .refine(
    (files) => !files || files.length === 0 || ACCEPTED_FILE_TYPES.includes(files?.[0]?.type),
    "Only .pdf, .jpg, .jpeg, .png formats are supported."
  );

const FormSchema = z.object({
  currentProfessionalTitle: z.string().min(1, { message: "Professional title is required." }),
  specializations: z.array(z.string()).min(1, { message: "At least one specialization must be selected." }),
  languages: z.array(z.string()).min(1, { message: "At least one language is required." }),
  graduationDate: z.date({ required_error: "Graduation date is required." }),
  university: z.string().min(1, { message: "University/College is required." }),
  approbationNumber: z.string().optional(),
  approbationDate: z.date().optional().nullable(),
  diplomaFile: optionalFileSchema,
  approbationCertificateFile: optionalFileSchema,
  specialistRecognitionFile: optionalFileSchema,
});

type ProfessionalQualificationsFormInputs = z.infer<typeof FormSchema>;

export default function RegisterStep4Page() {
  const router = useRouter();
  const pathname = usePathname();
  const currentLocale = pathname.split('/')[1] || 'en';
  
  const [t, setT] = useState<Record<string, string> | null>(null);

  useEffect(() => {
    setT(getClientTranslations(currentLocale));
  }, [currentLocale]);

  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const [selectedDiplomaFileName, setSelectedDiplomaFileName] = useState<string | null>(null);
  const [selectedApprobationCertificateFileName, setSelectedApprobationCertificateFileName] = useState<string | null>(null);
  const [selectedSpecialistRecognitionFileName, setSelectedSpecialistRecognitionFileName] = useState<string | null>(null);

  const form = useForm<ProfessionalQualificationsFormInputs>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      currentProfessionalTitle: "",
      specializations: [],
      languages: [],
      graduationDate: undefined,
      university: "",
      approbationNumber: "",
      approbationDate: undefined,
      diplomaFile: undefined,
      approbationCertificateFile: undefined,
      specialistRecognitionFile: undefined,
    },
  });

  useEffect(() => {
    const storedData = getRegistrationData();
    if ((!storedData.email || !storedData.password || !storedData.firstName) && t) { 
      toast({
        title: t.register_step2_missing_data_title || "Missing Information",
        description: t.register_step2_missing_data_desc || "Essential information from previous steps is missing. Please start over.",
        variant: "destructive",
      });
      router.replace('/register/step1');
    } else {
      setSelectedDiplomaFileName(storedData.diplomaName || null);
      setSelectedApprobationCertificateFileName(storedData.approbationCertificateName || null);
      setSelectedSpecialistRecognitionFileName(storedData.specialistRecognitionName || null);
      
      form.reset({
        currentProfessionalTitle: storedData.currentProfessionalTitle || "",
        specializations: storedData.specializations || [],
        languages: storedData.languages || [],
        graduationDate: storedData.graduationDate ? new Date(storedData.graduationDate) : undefined,
        university: storedData.university || "",
        approbationNumber: storedData.approbationNumber || "",
        approbationDate: storedData.approbationDate ? new Date(storedData.approbationDate) : undefined,
      });
    }
  }, [router, toast, t, form]);


  const handleFileChange = (
    event: React.ChangeEvent<HTMLInputElement>,
    fieldName: keyof ProfessionalQualificationsFormInputs,
    setFileNameState: React.Dispatch<React.SetStateAction<string | null>>
  ) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      form.setValue(fieldName, files as any, { shouldValidate: true });
      setFileNameState(files[0].name);
    }
  };

  const onSubmit: SubmitHandler<ProfessionalQualificationsFormInputs> = async (data) => {
    setIsLoading(true);
    const storedData = getRegistrationData();
    const uploadPath = `registrations/${storedData.sessionId}/qualifications`;

    try {
        let fileUpdates: Partial<RegistrationData> = {};

        if (data.diplomaFile?.[0]) {
            const file = data.diplomaFile[0];
            const url = await uploadFile(file, uploadPath);
            fileUpdates.diplomaUrl = url;
            fileUpdates.diplomaName = file.name;
        }

        if (data.approbationCertificateFile?.[0]) {
            const file = data.approbationCertificateFile[0];
            const url = await uploadFile(file, uploadPath);
            fileUpdates.approbationCertificateUrl = url;
            fileUpdates.approbationCertificateName = file.name;
        }
        
        if (data.specialistRecognitionFile?.[0]) {
            const file = data.specialistRecognitionFile[0];
            const url = await uploadFile(file, uploadPath);
            fileUpdates.specialistRecognitionUrl = url;
            fileUpdates.specialistRecognitionName = file.name;
        }

        if (!fileUpdates.diplomaUrl && !storedData.diplomaUrl) {
            toast({
                title: t!.register_step4_label_diploma || "Diploma Required",
                description: "Please upload your diploma/certificate to continue.",
                variant: "destructive",
            });
            setIsLoading(false);
            return;
        }

        updateRegistrationData({
            ...data,
            ...fileUpdates,
        });

        router.push('/register/step5');

    } catch (error) {
        console.error("File upload failed in step 4:", error);
        toast({
            title: "Upload Failed",
            description: "Could not upload one or more documents. Please try again.",
            variant: "destructive",
        });
    } finally {
        setIsLoading(false);
    }
  };

  if (isLoading || !t) {
    return (
        <AuthLayout pageTitle="Loading...">
             <div className="flex-1 space-y-8 p-4 md:p-8 flex justify-center items-center">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
            </div>
        </AuthLayout>
    )
  }

  return (
    <AuthLayout
      pageTitle={t.register_page_main_title || "Registration"}
      pageSubtitle={t.register_step4_subtitle || "Please provide your professional qualifications."}
      showBackButton={true}
      backButtonHref="/register/step3"
      backButtonTextKey="register_back_button"
    >
      <div className="w-full max-w-2xl">
        <RegistrationStepper currentStep={4} totalSteps={6} />
        <Card className="shadow-xl w-full">
          <CardHeader className="text-left">
            <CardTitle className="font-headline text-2xl">{t.register_step4_card_title || "Professional Qualifications"}</CardTitle>
            <CardDescription>{t.register_step4_card_description || "Please enter your professional qualifications details."}</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="currentProfessionalTitle"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t.register_step4_label_prof_title || "Current Professional Title"}*</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder={t.register_select_placeholder || "Please select"} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {PROFESSIONAL_TITLES.map(title => (
                            <SelectItem key={title.id} value={title.id}>
                              {t[title.labelKey] || title.id.replace(/_/g, ' ')}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormItem>
                  <FormLabel>{t.register_step4_label_specializations || "Specializations/Focus Areas"}*</FormLabel>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2">
                    {DENTAL_SPECIALIZATIONS.map((item) => (
                      <FormField
                        key={item.id}
                        control={form.control}
                        name="specializations"
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
                                            (value: SpecializationId) => value !== item.id
                                          )
                                        );
                                  }}
                                />
                              </FormControl>
                              <FormLabel className="font-normal text-sm">
                                {t[item.labelKey] || item.id.replace(/_/g, ' ')}
                              </FormLabel>
                            </FormItem>
                          );
                        }}
                      />
                    ))}
                  </div>
                  <FormMessage>{form.formState.errors.specializations?.message}</FormMessage>
                </FormItem>
                
                <FormField
                  control={form.control}
                  name="languages"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t.register_step4_label_languages || "Languages"}*</FormLabel>
                      <FormControl>
                        <LanguageInput
                          placeholder={t.register_step4_placeholder_languages || "Add a language..."}
                          value={field.value || []}
                          onChange={field.onChange}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="graduationDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>{t.register_step4_label_graduation_date || "Date of Graduation"}*</FormLabel>
                      <FormControl>
                        <DatePickerInput
                          value={field.value}
                          onChange={field.onChange}
                          disabled={(date) =>
                            date > new Date() || date < new Date("1950-01-01")
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="university"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t.register_step4_label_university || "University/College"}*</FormLabel>
                      <FormControl>
                        <Input placeholder={t.register_step4_placeholder_university || "Name of University/College"} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="approbationNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t.register_step4_label_approbation_number || "Approbation Number (if available)"}</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="approbationDate"
                  render={({ field }) => (
                     <FormItem className="flex flex-col">
                      <FormLabel>{t.register_step4_label_approbation_date || "Date of Approbation (if available)"}</FormLabel>
                       <FormControl>
                        <DatePickerInput
                          value={field.value}
                          onChange={field.onChange}
                          disabled={(date) =>
                            date > new Date() || date < new Date("1950-01-01")
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="diplomaFile"
                  render={() => ( 
                    <FormItem>
                      <FormLabel>{t.register_step4_label_diploma || "Diploma/Certificate of Dental Studies"}*</FormLabel>
                       <FormControl>
                        <div className="flex items-center space-x-2 mt-1">
                            <label
                                htmlFor="diplomaFile-input"
                                className="flex items-center justify-center w-full px-4 py-2 border border-input rounded-md shadow-sm text-sm font-medium text-muted-foreground bg-background hover:bg-accent cursor-pointer"
                            >
                                <UploadCloud className="mr-2 h-4 w-4" />
                                <span className="truncate">{selectedDiplomaFileName || (t.register_step2_button_selectFile || "Select File")}</span>
                            </label>
                            <Input
                                id="diplomaFile-input"
                                type="file"
                                className="hidden"
                                accept=".pdf,.jpg,.jpeg,.png"
                                onChange={(e) => handleFileChange(e, 'diplomaFile', setSelectedDiplomaFileName)}
                            />
                        </div>
                        </FormControl>
                        <FormDescription>{t.register_step2_file_formats || "Accepted formats: PDF, JPG, PNG (max. 10MB)"}</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                 <FormField
                  control={form.control}
                  name="approbationCertificateFile"
                  render={() => (
                    <FormItem>
                      <FormLabel>{t.register_step4_label_approbation_cert || "Approbation Certificate (if available)"}</FormLabel>
                       <FormControl>
                        <div className="flex items-center space-x-2 mt-1">
                            <label
                                htmlFor="approbationCertificateFile-input"
                                className="flex items-center justify-center w-full px-4 py-2 border border-input rounded-md shadow-sm text-sm font-medium text-muted-foreground bg-background hover:bg-accent cursor-pointer"
                            >
                                <UploadCloud className="mr-2 h-4 w-4" />
                                <span className="truncate">{selectedApprobationCertificateFileName || (t.register_step2_button_selectFile || "Select File")}</span>
                            </label>
                            <Input
                                id="approbationCertificateFile-input"
                                type="file"
                                className="hidden"
                                accept=".pdf,.jpg,.jpeg,.png"
                                onChange={(e) => handleFileChange(e, 'approbationCertificateFile', setSelectedApprobationCertificateFileName)}
                            />
                        </div>
                        </FormControl>
                        <FormDescription>{t.register_step2_file_formats || "Accepted formats: PDF, JPG, PNG (max. 10MB)"}</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="specialistRecognitionFile"
                  render={() => (
                    <FormItem>
                      <FormLabel>{t.register_step4_label_specialist_recognition || "Dental Specialist Recognition (if available)"}</FormLabel>
                       <FormControl>
                        <div className="flex items-center space-x-2 mt-1">
                            <label
                                htmlFor="specialistRecognitionFile-input"
                                className="flex items-center justify-center w-full px-4 py-2 border border-input rounded-md shadow-sm text-sm font-medium text-muted-foreground bg-background hover:bg-accent cursor-pointer"
                            >
                                <UploadCloud className="mr-2 h-4 w-4" />
                                <span className="truncate">{selectedSpecialistRecognitionFileName || (t.register_step2_button_selectFile || "Select File")}</span>
                            </label>
                            <Input
                                id="specialistRecognitionFile-input"
                                type="file"
                                className="hidden"
                                accept=".pdf,.jpg,.jpeg,.png"
                                onChange={(e) => handleFileChange(e, 'specialistRecognitionFile', setSelectedSpecialistRecognitionFileName)}
                            />
                        </div>
                        </FormControl>
                        <FormDescription>{t.register_step2_file_formats || "Accepted formats: PDF, JPG, PNG (max. 10MB)"}</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="flex justify-between pt-4">
                  <Button type="button" variant="outline" onClick={() => router.push('/register/step3')} disabled={isLoading}>
                    {t.register_back_button || "Back"}
                  </Button>
                  <Button type="submit" className="bg-primary hover:bg-primary/90 text-primary-foreground h-11 text-base" disabled={isLoading}>
                    {isLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : (t.register_button_continue || "CONTINUE")}
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
