
"use client";

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useForm, type SubmitHandler, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
  type SpecializationId 
} from '@/lib/registrationStore';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";


// Helper for client-side translations
const getClientTranslations = (locale: string) => {
  try {
    if (locale === 'de') {
      return require('../../../../locales/de.json');
    }
    return require('../../../../locales/en.json');
  } catch (e) {
    console.warn("Translation file not found for register/step4, falling back to en");
    return require('../../../../locales/en.json');
  }
};

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ACCEPTED_FILE_TYPES = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];

const baseFileSchema = z
  .custom<FileList>()
  .refine((files) => files && files.length > 0, "File is required.")
  .refine((files) => files?.[0]?.size <= MAX_FILE_SIZE, `Max file size is 10MB.`)
  .refine(
    (files) => ACCEPTED_FILE_TYPES.includes(files?.[0]?.type),
    "Only .pdf, .jpg, .jpeg, .png formats are supported."
  )
  .transform(files => files?.[0] || null);

const optionalFileSchema = z
  .custom<FileList>()
  .optional()
  .nullable()
  .refine((files) => !files || files.length === 0 || files?.[0]?.size <= MAX_FILE_SIZE, `Max file size is 10MB.`)
  .refine(
    (files) => !files || files.length === 0 || ACCEPTED_FILE_TYPES.includes(files?.[0]?.type),
    "Only .pdf, .jpg, .jpeg, .png formats are supported."
  )
  .transform(files => (files && files.length > 0) ? files[0] : null);


const FormSchema = z.object({
  currentProfessionalTitle: z.string().min(1, { message: "Professional title is required." }),
  specializations: z.array(z.string()).min(1, { message: "At least one specialization must be selected." }),
  languages: z.string().min(1, { message: "Languages are required." }),
  graduationDate: z.string().min(1, { message: "Graduation date is required." }),
  university: z.string().min(1, { message: "University/College is required." }),
  approbationNumber: z.string().optional(),
  approbationDate: z.string().optional(),
  diplomaFile: baseFileSchema,
  approbationCertificateFile: optionalFileSchema,
  specialistRecognitionFile: optionalFileSchema,
});

type ProfessionalQualificationsFormInputs = z.infer<typeof FormSchema>;

export default function RegisterStep4Page() {
  const router = useRouter();
  const pathname = usePathname();
  const potentialLocale = pathname.split('/')[1];
  const currentLocale = ['en', 'de'].includes(potentialLocale) ? potentialLocale : 'en';
  const t = getClientTranslations(currentLocale);

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
      languages: "",
      graduationDate: "",
      university: "",
      approbationNumber: "",
      approbationDate: "",
      diplomaFile: null,
      approbationCertificateFile: null,
      specialistRecognitionFile: null,
    },
  });

  useEffect(() => {
    const storedData = getRegistrationData();
    // Check for essential data from previous steps
    if (!storedData.email || !storedData.password || !storedData.firstName ) { 
      toast({
        title: t.register_step2_missing_data_title || "Missing Information",
        description: t.register_step2_missing_data_desc || "Essential information from previous steps is missing. Please start over.",
        variant: "destructive",
      });
      router.replace('/register/step1');
    } else {
      if (storedData.diplomaFileName) setSelectedDiplomaFileName(storedData.diplomaFileName);
      if (storedData.approbationCertificateFileName) setSelectedApprobationCertificateFileName(storedData.approbationCertificateFileName);
      if (storedData.specialistRecognitionFileName) setSelectedSpecialistRecognitionFileName(storedData.specialistRecognitionFileName);
      
      form.reset({
        currentProfessionalTitle: storedData.currentProfessionalTitle || "",
        specializations: storedData.specializations || [],
        languages: storedData.languages || "",
        graduationDate: storedData.graduationDate || "",
        university: storedData.university || "",
        approbationNumber: storedData.approbationNumber || "",
        approbationDate: storedData.approbationDate || "",
        // Reset file inputs to their stored File object or null
        diplomaFile: storedData.diplomaFile || null,
        approbationCertificateFile: storedData.approbationCertificateFile || null,
        specialistRecognitionFile: storedData.specialistRecognitionFile || null,
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
    } else {
      form.setValue(fieldName, null as any, { shouldValidate: true }); 
      setFileNameState(null);
    }
  };

  const onSubmit: SubmitHandler<ProfessionalQualificationsFormInputs> = async (data) => {
    setIsLoading(true);
    
    const diplomaFileToStore = data.diplomaFile as File | null;
    const approbationCertificateFileToStore = data.approbationCertificateFile as File | null;
    const specialistRecognitionFileToStore = data.specialistRecognitionFile as File | null;

    updateRegistrationData({
      ...data,
      diplomaFile: diplomaFileToStore,
      diplomaFileName: diplomaFileToStore?.name,
      approbationCertificateFile: approbationCertificateFileToStore,
      approbationCertificateFileName: approbationCertificateFileToStore?.name,
      specialistRecognitionFile: specialistRecognitionFileToStore,
      specialistRecognitionFileName: specialistRecognitionFileToStore?.name,
    });

    router.push('/register/step5'); 
    setIsLoading(false);
  };

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
                        <Input placeholder={t.register_step4_placeholder_languages || "e.g., German, English"} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="graduationDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t.register_step4_label_graduation_date || "Date of Graduation"}*</FormLabel>
                      <FormControl>
                        <Input placeholder="DD/MM/YYYY" {...field} />
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
                    <FormItem>
                      <FormLabel>{t.register_step4_label_approbation_date || "Date of Approbation (if available)"}</FormLabel>
                      <FormControl>
                        <Input placeholder="DD/MM/YYYY" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="diplomaFile"
                  render={({ field }) => ( 
                    <FormItem>
                      <FormLabel>{t.register_step4_label_diploma || "Diploma/Certificate of Dental Studies"}*</FormLabel>
                       <FormControl>
                        <div className="flex items-center space-x-2 mt-1">
                            <label
                                htmlFor="diplomaFile-input"
                                className="flex items-center justify-center w-full px-4 py-2 border border-input rounded-md shadow-sm text-sm font-medium text-muted-foreground bg-background hover:bg-accent cursor-pointer"
                            >
                                <UploadCloud className="mr-2 h-4 w-4" />
                                {selectedDiplomaFileName || (t.register_step2_button_selectFile || "Select File")}
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
                        {selectedDiplomaFileName && (
                            <FormDescription className="flex items-center text-xs text-muted-foreground">
                                <FileIcon className="h-4 w-4 mr-1 text-primary" />
                                {t.register_step2_selected_file || "Selected:"} {selectedDiplomaFileName}
                            </FormDescription>
                        )}
                        <FormDescription>{t.register_step2_file_formats || "Accepted formats: PDF, JPG, PNG (max. 10MB)"}</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                 <FormField
                  control={form.control}
                  name="approbationCertificateFile"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t.register_step4_label_approbation_cert || "Approbation Certificate (if available)"}</FormLabel>
                       <FormControl>
                        <div className="flex items-center space-x-2 mt-1">
                            <label
                                htmlFor="approbationCertificateFile-input"
                                className="flex items-center justify-center w-full px-4 py-2 border border-input rounded-md shadow-sm text-sm font-medium text-muted-foreground bg-background hover:bg-accent cursor-pointer"
                            >
                                <UploadCloud className="mr-2 h-4 w-4" />
                                {selectedApprobationCertificateFileName || (t.register_step2_button_selectFile || "Select File")}
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
                        {selectedApprobationCertificateFileName && (
                             <FormDescription className="flex items-center text-xs text-muted-foreground">
                                <FileIcon className="h-4 w-4 mr-1 text-primary" />
                                {t.register_step2_selected_file || "Selected:"} {selectedApprobationCertificateFileName}
                            </FormDescription>
                        )}
                        <FormDescription>{t.register_step2_file_formats || "Accepted formats: PDF, JPG, PNG (max. 10MB)"}</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="specialistRecognitionFile"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t.register_step4_label_specialist_recognition || "Dental Specialist Recognition (if available)"}</FormLabel>
                       <FormControl>
                        <div className="flex items-center space-x-2 mt-1">
                            <label
                                htmlFor="specialistRecognitionFile-input"
                                className="flex items-center justify-center w-full px-4 py-2 border border-input rounded-md shadow-sm text-sm font-medium text-muted-foreground bg-background hover:bg-accent cursor-pointer"
                            >
                                <UploadCloud className="mr-2 h-4 w-4" />
                                {selectedSpecialistRecognitionFileName || (t.register_step2_button_selectFile || "Select File")}
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
                        {selectedSpecialistRecognitionFileName && (
                            <FormDescription className="flex items-center text-xs text-muted-foreground">
                                <FileIcon className="h-4 w-4 mr-1 text-primary" />
                               {t.register_step2_selected_file || "Selected:"} {selectedSpecialistRecognitionFileName}
                            </FormDescription>
                        )}
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
