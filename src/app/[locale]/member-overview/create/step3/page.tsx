
"use client";

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import AppLayout from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { Loader2, UploadCloud } from 'lucide-react';
import RegistrationStepper from '@/components/auth/RegistrationStepper';
import { getRegistrationData, updateRegistrationData, DENTAL_SPECIALIZATIONS, PROFESSIONAL_TITLES, type SpecializationId, type RegistrationData } from '@/lib/registrationStore';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { DatePickerInput } from '@/components/ui/date-picker';
import { LanguageInput } from '@/components/ui/language-input';
import { uploadFile } from '@/services/storageService';

const getClientTranslations = (locale: string) => {
  try {
    const page = locale === 'de' ? require('../../../../../../locales/de/member-overview.json') : require('../../../../../../locales/en/member-overview.json');
    const register = locale === 'de' ? require('../../../../../../locales/de/register.json') : require('../../../../../../locales/en/register.json');
    return { ...page, ...register };
  } catch (e) {
    return { ...require('../../../../../../locales/en/member-overview.json'), ...require('../../../../../../locales/en/register.json')};
  }
};

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const ACCEPTED_FILE_TYPES = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
const optionalFileSchema = z.custom<FileList>().optional().nullable().refine((f) => !f || f.length === 0 || f?.[0]?.size <= MAX_FILE_SIZE, `Max 10MB`).refine((f) => !f || f.length === 0 || ACCEPTED_FILE_TYPES.includes(f?.[0]?.type), "Only .pdf, .jpg, .png");

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

export default function CreateMemberStep3Page() {
  const router = useRouter();
  const params = useParams();
  const locale = typeof params.locale === 'string' ? params.locale : 'en';

  const [t, setT] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const [selectedDiplomaFileName, setSelectedDiplomaFileName] = useState<string | null>(null);
  const [selectedApprobationCertificateFileName, setSelectedApprobationCertificateFileName] = useState<string | null>(null);
  const [selectedSpecialistRecognitionFileName, setSelectedSpecialistRecognitionFileName] = useState<string | null>(null);

  const form = useForm<ProfessionalQualificationsFormInputs>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      specializations: [], languages: [],
    },
  });

  useEffect(() => {
    setT(getClientTranslations(locale));
    const storedData = getRegistrationData();
    if (!storedData.email || !storedData.sessionId || !storedData.firstName) { 
      toast({ title: "Missing Information", description: "Data from previous steps is missing.", variant: "destructive" });
      router.replace(`/${locale}/member-overview/create`);
    } else {
      form.reset({
        ...storedData,
        graduationDate: storedData.graduationDate ? new Date(storedData.graduationDate) : undefined,
        approbationDate: storedData.approbationDate ? new Date(storedData.approbationDate) : undefined,
      });
      setSelectedDiplomaFileName(storedData.diplomaName || null);
      setSelectedApprobationCertificateFileName(storedData.approbationCertificateName || null);
      setSelectedSpecialistRecognitionFileName(storedData.specialistRecognitionName || null);
    }
  }, [locale, router, toast, form]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, fieldName: keyof ProfessionalQualificationsFormInputs, setFileName: React.Dispatch<React.SetStateAction<string | null>>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      form.setValue(fieldName, files as any, { shouldValidate: true });
      setFileName(files[0].name);
    }
  };

  const onSubmit: SubmitHandler<ProfessionalQualificationsFormInputs> = async (data) => {
    setIsLoading(true);
    const storedData = getRegistrationData();
    const uploadPath = `registrations/${storedData.sessionId}/qualifications`;
    try {
        let fileUpdates: Partial<RegistrationData> = {};
        if (data.diplomaFile?.[0]) { const f = data.diplomaFile[0]; fileUpdates.diplomaUrl = await uploadFile(f, uploadPath); fileUpdates.diplomaName = f.name; }
        if (data.approbationCertificateFile?.[0]) { const f = data.approbationCertificateFile[0]; fileUpdates.approbationCertificateUrl = await uploadFile(f, uploadPath); fileUpdates.approbationCertificateName = f.name; }
        if (data.specialistRecognitionFile?.[0]) { const f = data.specialistRecognitionFile[0]; fileUpdates.specialistRecognitionUrl = await uploadFile(f, uploadPath); fileUpdates.specialistRecognitionName = f.name; }
        if (!fileUpdates.diplomaUrl && !storedData.diplomaUrl) {
            toast({ title: t.register_step4_label_diploma || "Diploma Required", description: "Please upload diploma/certificate.", variant: "destructive" });
            setIsLoading(false); return;
        }
        updateRegistrationData({ ...data, ...fileUpdates });
        router.push(`/${locale}/member-overview/create/step4`);
    } catch (error) {
        toast({ title: "Upload Failed", description: "Could not upload documents. Please try again.", variant: "destructive" });
    } finally {
        setIsLoading(false);
    }
  };

  const pageTitle = t.create_member_page_title || "Create New Member";
  if (Object.keys(t).length === 0) return null;

  return (
    <AppLayout pageTitle={pageTitle} locale={locale}>
      <div className="flex-1 space-y-6 p-4 md:p-8 max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold tracking-tight font-headline">{t.register_step4_card_title}</h1>
        <RegistrationStepper currentStep={3} totalSteps={5} />
        <Card>
          <CardHeader><CardDescription>{t.register_step4_card_description}</CardDescription></CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField control={form.control} name="currentProfessionalTitle" render={({ field }) => (
                    <FormItem>
                        <FormLabel>{t.register_step4_label_prof_title}*</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl><SelectTrigger><SelectValue placeholder={t.register_select_placeholder} /></SelectTrigger></FormControl>
                            <SelectContent>{PROFESSIONAL_TITLES.map(title => <SelectItem key={title.id} value={title.id}>{t[title.labelKey]}</SelectItem>)}</SelectContent>
                        </Select>
                        <FormMessage />
                    </FormItem>
                )}/>
                <FormItem>
                  <FormLabel>{t.register_step4_label_specializations}*</FormLabel>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2">
                    {DENTAL_SPECIALIZATIONS.map((item) => (<FormField key={item.id} control={form.control} name="specializations" render={({ field }) => (
                      <FormItem className="flex items-row space-x-3 space-y-0"><FormControl><Checkbox checked={field.value?.includes(item.id)} onCheckedChange={(c) => c ? field.onChange([...field.value, item.id]) : field.onChange(field.value?.filter(v => v !== item.id))} /></FormControl><FormLabel className="font-normal text-sm">{t[item.labelKey]}</FormLabel></FormItem>
                    )} />))}
                  </div>
                  <FormMessage>{form.formState.errors.specializations?.message}</FormMessage>
                </FormItem>
                <FormField control={form.control} name="languages" render={({ field }) => (<FormItem><FormLabel>{t.register_step4_label_languages}*</FormLabel><FormControl><LanguageInput placeholder={t.register_step4_placeholder_languages} value={field.value} onChange={field.onChange} /></FormControl><FormMessage /></FormItem>)} />
                <FormField control={form.control} name="graduationDate" render={({ field }) => (<FormItem><FormLabel>{t.register_step4_label_graduation_date}*</FormLabel><FormControl><DatePickerInput value={field.value} onChange={field.onChange} /></FormControl><FormMessage /></FormItem>)} />
                <FormField control={form.control} name="university" render={({ field }) => (<FormItem><FormLabel>{t.register_step4_label_university}*</FormLabel><FormControl><Input placeholder={t.register_step4_placeholder_university} {...field} /></FormControl><FormMessage /></FormItem>)} />
                <FormField control={form.control} name="approbationNumber" render={({ field }) => (<FormItem><FormLabel>{t.register_step4_label_approbation_number}</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                <FormField control={form.control} name="approbationDate" render={({ field }) => (<FormItem><FormLabel>{t.register_step4_label_approbation_date}</FormLabel><FormControl><DatePickerInput value={field.value} onChange={field.onChange} /></FormControl><FormMessage /></FormItem>)} />
                
                <FormField control={form.control} name="diplomaFile" render={() => ( 
                    <FormItem>
                        <FormLabel>{t.register_step4_label_diploma}*</FormLabel>
                        <FormControl>
                            <div className="flex items-center space-x-2 mt-1">
                                <label htmlFor="diploma-file" className="flex items-center justify-center w-full px-4 py-2 border border-input rounded-md shadow-sm text-sm font-medium text-muted-foreground bg-background hover:bg-accent cursor-pointer">
                                    <UploadCloud className="mr-2 h-4 w-4" />
                                    <span>{selectedDiplomaFileName || t.register_step2_button_selectFile}</span>
                                </label>
                                <Input id="diploma-file" type="file" className="hidden" onChange={(e) => handleFileChange(e, 'diplomaFile', setSelectedDiplomaFileName)}/>
                            </div>
                        </FormControl>
                        <FormMessage/>
                    </FormItem>
                )} />

                <FormField control={form.control} name="approbationCertificateFile" render={() => ( 
                    <FormItem>
                        <FormLabel>{t.register_step4_label_approbation_cert}</FormLabel>
                        <FormControl>
                            <div className="flex items-center space-x-2 mt-1">
                                <label htmlFor="approbation-file" className="flex items-center justify-center w-full px-4 py-2 border border-input rounded-md shadow-sm text-sm font-medium text-muted-foreground bg-background hover:bg-accent cursor-pointer">
                                    <UploadCloud className="mr-2 h-4 w-4" />
                                    <span>{selectedApprobationCertificateFileName || t.register_step2_button_selectFile}</span>
                                </label>
                                <Input id="approbation-file" type="file" className="hidden" onChange={(e) => handleFileChange(e, 'approbationCertificateFile', setSelectedApprobationCertificateFileName)}/>
                            </div>
                        </FormControl>
                        <FormMessage/>
                    </FormItem>
                )} />

                <FormField control={form.control} name="specialistRecognitionFile" render={() => ( 
                    <FormItem>
                        <FormLabel>{t.register_step4_label_specialist_recognition}</FormLabel>
                        <FormControl>
                            <div className="flex items-center space-x-2 mt-1">
                                <label htmlFor="specialist-file" className="flex items-center justify-center w-full px-4 py-2 border border-input rounded-md shadow-sm text-sm font-medium text-muted-foreground bg-background hover:bg-accent cursor-pointer">
                                    <UploadCloud className="mr-2 h-4 w-4" />
                                    <span>{selectedSpecialistRecognitionFileName || t.register_step2_button_selectFile}</span>
                                </label>
                                <Input id="specialist-file" type="file" className="hidden" onChange={(e) => handleFileChange(e, 'specialistRecognitionFile', setSelectedSpecialistRecognitionFileName)}/>
                            </div>
                        </FormControl>
                        <FormMessage/>
                    </FormItem>
                )} />
                
                <div className="flex justify-between pt-4">
                  <Button type="button" variant="outline" onClick={() => router.push(`/${locale}/member-overview/create/step2`)} disabled={isLoading}>{t.register_back_button}</Button>
                  <Button type="submit" disabled={isLoading}>{isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : t.register_button_continue}</Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
