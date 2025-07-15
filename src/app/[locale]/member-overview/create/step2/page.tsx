
"use client";

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import AppLayout from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Loader2, UploadCloud, FileText as FileIcon } from 'lucide-react'; 
import RegistrationStepper from '@/components/auth/RegistrationStepper';
import { getRegistrationData, updateRegistrationData, type RegistrationData, STATES_MAP } from '@/lib/registrationStore';
import { DatePickerInput } from '@/components/ui/date-picker';
import { uploadFile } from '@/services/storageService';
import Link from 'next/link';

// Helper for client-side translations
const getClientTranslations = (locale: string) => {
  try {
    const page = locale === 'de' ? require('../../../../../../locales/de/member-overview.json') : require('../../../../../../locales/en/member-overview.json');
    const register = locale === 'de' ? require('../../../../../../locales/de/register.json') : require('../../../../../../locales/en/register.json');
    const common = locale === 'de' ? require('../../../../../../locales/de/common.json') : require('../../../../../../locales/en/common.json');
    return { ...page, ...register, ...common };
  } catch (e) {
    console.warn("Translation file not found, falling back to en");
    return { ...require('../../../../../../locales/en/member-overview.json'), ...require('../../../../../../locales/en/register.json'), ...require('../../../../../../locales/en/common.json')};
  }
};

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ACCEPTED_FILE_TYPES = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];

const FormSchema = z.object({
  title: z.string().optional(),
  firstName: z.string().min(1, { message: "First name is required." }),
  lastName: z.string().min(1, { message: "Last name is required." }),
  dateOfBirth: z.date({ required_error: "Date of birth is required." }),
  placeOfBirth: z.string().min(1, { message: "Place of birth is required." }),
  nationality: z.string().min(1, { message: "Nationality is required." }),
  streetAddress: z.string().min(1, { message: "Street and house number are required." }),
  postalCode: z.string().min(1, { message: "Postal code is required." }),
  city: z.string().min(1, { message: "City is required." }),
  stateOrProvince: z.string().min(1, { message: "State/Province is required." }),
  phoneNumber: z.string().optional(),
  idDocument: z
    .custom<FileList>()
    .optional()
    .nullable()
    .refine((files) => !files || files.length === 0 || files?.[0]?.size <= MAX_FILE_SIZE, `File size should be less than 10MB.`)
    .refine(
      (files) => !files || files.length === 0 || ACCEPTED_FILE_TYPES.includes(files?.[0]?.type),
      "Only .pdf, .jpg, .jpeg, .png formats are supported."
    ),
});

type PersonalDataFormInputs = z.infer<typeof FormSchema>;

export default function CreateMemberStep2Page() {
  const router = useRouter();
  const params = useParams();
  const locale = typeof params.locale === 'string' ? params.locale : 'en';

  const [t, setT] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);
  const { toast } = useToast();
  
  const form = useForm<PersonalDataFormInputs>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      title: '', firstName: '', lastName: '', dateOfBirth: undefined, placeOfBirth: '',
      nationality: '', streetAddress: '', postalCode: '', city: '', stateOrProvince: '',
      phoneNumber: '', idDocument: undefined,
    },
  });

  useEffect(() => {
    setT(getClientTranslations(locale));
    const storedData = getRegistrationData();
    if (!storedData.email || !storedData.sessionId) {
      toast({
        title: "Missing Information",
        description: "Email from previous step is missing. Please start over.",
        variant: "destructive",
      });
      router.replace(`/${locale}/member-overview/create`);
    } else {
      form.reset({
        ...storedData,
        dateOfBirth: storedData.dateOfBirth ? new Date(storedData.dateOfBirth) : undefined,
      });
      setSelectedFileName(storedData.idDocumentName || null);
    }
  }, [locale, router, toast, form]);

  const onSubmit: SubmitHandler<PersonalDataFormInputs> = async (data) => {
    setIsLoading(true);
    const storedData = getRegistrationData();
    try {
        let fileUpdate: Partial<RegistrationData> = {};
        const fileToUpload = data.idDocument?.[0];

        if (fileToUpload) {
            const uploadPath = `registrations/${storedData.sessionId}/id_documents`;
            const downloadURL = await uploadFile(fileToUpload, uploadPath);
            fileUpdate.idDocumentUrl = downloadURL;
            fileUpdate.idDocumentName = fileToUpload.name;
        } else if (!storedData.idDocumentUrl) {
            toast({ title: t.register_step2_label_idDocument || "ID Document Required", description: "Please select an ID card or passport.", variant: "destructive" });
            setIsLoading(false);
            return;
        }

        updateRegistrationData({ ...data, ...fileUpdate });
        router.push(`/${locale}/member-overview/create/step3`);

    } catch (error) {
        console.error("File upload failed:", error);
        toast({ title: "Upload Failed", description: "Could not upload ID document.", variant: "destructive" });
    } finally {
        setIsLoading(false);
    }
  };
  
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      form.setValue('idDocument', files, { shouldValidate: true });
      setSelectedFileName(files[0].name);
    }
  };

  const pageTitle = t.create_member_page_title || "Create New Member";

  if (Object.keys(t).length === 0) { return null; }

  return (
    <AppLayout pageTitle={pageTitle} locale={locale}>
      <div className="flex-1 space-y-6 p-4 md:p-8 max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold tracking-tight font-headline">{t.register_step2_card_title || "Personal Data"}</h1>
        <RegistrationStepper currentStep={2} totalSteps={5} />
        <Card>
          <CardHeader><CardDescription>{t.register_step2_card_description}</CardDescription></CardHeader>
          <CardContent>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
               <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                <div className="md:col-span-1">
                    <Label htmlFor="title">{t.register_step2_label_title || "Title"}</Label>
                    <Controller name="title" control={form.control} render={({ field }) => (
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <SelectTrigger id="title"><SelectValue placeholder={t.register_select_placeholder} /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Dr.">{t.title_dr}</SelectItem>
                                <SelectItem value="Prof.">{t.title_prof}</SelectItem>
                                <SelectItem value="Mag.">{t.title_mag}</SelectItem>
                                <SelectItem value="none">{t.title_none}</SelectItem>
                            </SelectContent>
                        </Select>
                    )} />
                </div>
                <div className="md:col-span-2">
                    <Label htmlFor="firstName">{t.register_step2_label_firstName}*</Label>
                    <Input id="firstName" {...form.register('firstName')} />
                    {form.formState.errors.firstName && <p className="text-xs text-destructive mt-1">{form.formState.errors.firstName.message}</p>}
                </div>
              </div>
              <LabelledInput id="lastName" label={`${t.register_step2_label_lastName}*`} error={form.formState.errors.lastName}>
                <Input id="lastName" {...form.register('lastName')} />
              </LabelledInput>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="dateOfBirth">{t.register_step2_label_dateOfBirth}*</Label>
                  <Controller name="dateOfBirth" control={form.control} render={({ field }) => (
                      <DatePickerInput value={field.value} onChange={field.onChange} placeholder={t.register_step2_placeholder_dateOfBirth} disabled={(date) => date > new Date() || date < new Date("1900-01-01")}/>
                  )} />
                  {form.formState.errors.dateOfBirth && <p className="text-xs text-destructive mt-1">{form.formState.errors.dateOfBirth.message}</p>}
                </div>
                <LabelledInput id="placeOfBirth" label={`${t.register_step2_label_placeOfBirth}*`} error={form.formState.errors.placeOfBirth}>
                    <Input id="placeOfBirth" {...form.register('placeOfBirth')} />
                </LabelledInput>
              </div>
              <LabelledInput id="nationality" label={`${t.register_step2_label_nationality}*`} error={form.formState.errors.nationality}>
                 <Controller name="nationality" control={form.control} render={({ field }) => (
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <SelectTrigger id="nationality"><SelectValue placeholder={t.register_select_placeholder} /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="AT">{t.nationality_at}</SelectItem>
                            <SelectItem value="DE">{t.nationality_de}</SelectItem>
                            <SelectItem value="CH">{t.nationality_ch}</SelectItem>
                            <SelectItem value="other">{t.nationality_other}</SelectItem>
                        </SelectContent>
                    </Select>
                 )} />
              </LabelledInput>
              <LabelledInput id="streetAddress" label={`${t.register_step2_label_streetAddress}*`} error={form.formState.errors.streetAddress}>
                <Input id="streetAddress" {...form.register('streetAddress')} />
              </LabelledInput>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <LabelledInput id="postalCode" label={`${t.register_step2_label_postalCode}*`} error={form.formState.errors.postalCode}><Input id="postalCode" {...form.register('postalCode')} /></LabelledInput>
                <LabelledInput id="city" label={`${t.register_step2_label_city}*`} error={form.formState.errors.city}><Input id="city" {...form.register('city')} /></LabelledInput>
              </div>
              <LabelledInput id="stateOrProvince" label={`${t.register_step2_label_stateOrProvince}*`} error={form.formState.errors.stateOrProvince}>
                 <Controller name="stateOrProvince" control={form.control} render={({ field }) => (
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <SelectTrigger id="stateOrProvince"><SelectValue placeholder={t.register_select_placeholder} /></SelectTrigger>
                        <SelectContent>
                            {Object.entries(STATES_MAP).map(([name, key]) => (
                                <SelectItem key={key} value={name}>{t[key] || name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                 )} />
              </LabelledInput>
              <LabelledInput id="phoneNumber" label={t.register_step2_label_phoneNumber} error={form.formState.errors.phoneNumber}><Input id="phoneNumber" type="tel" {...form.register('phoneNumber')} /></LabelledInput>
              <div>
                <Label htmlFor="idDocument">{t.register_step2_label_idDocument}*</Label>
                <div className="flex items-center space-x-2 mt-1">
                    <label htmlFor="idDocument-file" className="flex items-center justify-center w-full px-4 py-2 border border-input rounded-md shadow-sm text-sm font-medium text-muted-foreground bg-background hover:bg-accent cursor-pointer">
                        <UploadCloud className="mr-2 h-4 w-4" />
                        <span className="truncate">{selectedFileName || t.register_step2_button_selectFile}</span>
                    </label>
                    <Input id="idDocument-file" type="file" className="hidden" accept=".pdf,.jpg,.jpeg,.png" onChange={handleFileChange} />
                </div>
                {form.formState.errors.idDocument && <p className="text-xs text-destructive mt-1">{form.formState.errors.idDocument.message}</p>}
              </div>

              <div className="flex justify-between pt-4">
                  <Button type="button" variant="outline" onClick={() => router.push(`/${locale}/member-overview/create`)} disabled={isLoading}>{t.register_back_button}</Button>
                  <Button type="submit" className="bg-primary hover:bg-primary/90" disabled={isLoading}>
                    {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : t.register_button_continue}
                  </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}

const LabelledInput = ({ id, label, error, children }: { id: string; label: string; error?: { message?: string }; children: React.ReactNode }) => (
  <div>
    <Label htmlFor={id}>{label}</Label>
    {children}
    {error && <p className="text-xs text-destructive mt-1">{error.message}</p>}
  </div>
);
