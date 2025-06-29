
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
import { useToast } from '@/hooks/use-toast';
import { Loader2, UploadCloud, FileText as FileIcon } from 'lucide-react'; 
import AuthLayout from '@/components/auth/AuthLayout';
import RegistrationStepper from '@/components/auth/RegistrationStepper';
import { getRegistrationData, updateRegistrationData, type RegistrationData, STATES_MAP } from '@/lib/registrationStore';
import { DatePickerInput } from '@/components/ui/date-picker';
import { uploadFile } from '@/services/storageService';

// Helper for client-side translations
const getClientTranslations = (locale: string) => {
  try {
    const register = locale === 'de' ? require('../../../../../locales/de/register.json') : require('../../../../../locales/en/register.json');
    const common = locale === 'de' ? require('../../../../../locales/de/common.json') : require('../../../../../locales/en/common.json');
    return { ...register, ...common };
  } catch (e) {
    console.warn("Translation file not found for register/step3 (personal data), falling back to en", e);
    const register = require('../../../../../locales/en/register.json');
    const common = require('../../../../../locales/en/common.json');
    return { ...register, ...common };
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
  email: z.string().email(), 
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

export default function RegisterStep3PersonalDataPage() {
  const router = useRouter();
  const pathname = usePathname();
  const currentLocale = pathname.split('/')[1] || 'en';
  
  const [t, setT] = useState<Record<string, string> | null>(null);

  useEffect(() => {
    setT(getClientTranslations(currentLocale));
  }, [currentLocale]);

  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [storedEmail, setStoredEmail] = useState<string>('');
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);

  const form = useForm<PersonalDataFormInputs>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      email: '', 
      title: '',
      firstName: '',
      lastName: '',
      dateOfBirth: undefined,
      placeOfBirth: '',
      nationality: '',
      streetAddress: '',
      postalCode: '',
      city: '',
      stateOrProvince: '',
      phoneNumber: '',
      idDocument: undefined,
    },
  });


  useEffect(() => {
    const storedData = getRegistrationData();
    if ((!storedData.email || !storedData.password || !storedData.sessionId) && t) { 
      toast({
        title: t.register_step2_missing_data_title || "Missing Information",
        description: t.register_step2_missing_data_desc || "Essential information from previous steps is missing. Please start over.",
        variant: "destructive",
      });
      router.replace('/register/step1');
    } else {
      setStoredEmail(storedData.email || '');
      const dataToReset = {
        email: storedData.email,
        title: storedData.title || '',
        firstName: storedData.firstName || '',
        lastName: storedData.lastName || '',
        dateOfBirth: storedData.dateOfBirth ? new Date(storedData.dateOfBirth) : undefined,
        placeOfBirth: storedData.placeOfBirth || '',
        nationality: storedData.nationality || '',
        streetAddress: storedData.streetAddress || '',
        postalCode: storedData.postalCode || '',
        city: storedData.city || '',
        stateOrProvince: storedData.stateOrProvince || '',
        phoneNumber: storedData.phoneNumber || '',
      };
      form.reset(dataToReset as any);
      if (storedData.idDocumentName) {
        setSelectedFileName(storedData.idDocumentName);
      }
    }
  }, [router, toast, t, form]);


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
            toast({
                title: t!.register_step2_label_idDocument || "ID Document Required",
                description: "Please select your ID card or passport to continue.",
                variant: "destructive",
            });
            setIsLoading(false);
            return;
        }

        updateRegistrationData({
            ...data,
            ...fileUpdate,
        });

        router.push('/register/step4');

    } catch (error) {
        console.error("File upload failed:", error);
        toast({
            title: "Upload Failed",
            description: "Could not upload your ID document. Please try again.",
            variant: "destructive",
        });
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


  if (!storedEmail || isLoading || !t) { 
    return (
        <AuthLayout pageTitle="Loading..." pageSubtitle="Verifying registration step...">
            <div className="flex justify-center items-center h-32">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        </AuthLayout>
    );
  }

  return (
    <AuthLayout
      pageTitle={t.register_page_main_title || "Registration"}
      pageSubtitle={t.register_step2_subtitle || "Please fill in your personal details."}
      showBackButton={true}
      backButtonHref="/register/step2"
      backButtonTextKey="register_back_button"
    >
      <div className="w-full max-w-2xl">
        <RegistrationStepper currentStep={3} totalSteps={6} />
        <Card className="shadow-xl w-full">
          <CardHeader className="text-left">
            <CardTitle className="font-headline text-2xl">{t.register_step2_card_title || "Personal Data"}</CardTitle>
            <CardDescription>{t.register_step2_card_description || "Please provide your personal information."}</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                <div className="md:col-span-1">
                    <Label htmlFor="title">{t.register_step2_label_title || "Title"}</Label>
                    <Controller
                        name="title"
                        control={form.control}
                        render={({ field }) => (
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <SelectTrigger id="title">
                                    <SelectValue placeholder={t.register_select_placeholder || "Please select"} />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Dr.">{t.title_dr || "Dr."}</SelectItem>
                                    <SelectItem value="Prof.">{t.title_prof || "Prof."}</SelectItem>
                                    <SelectItem value="Mag.">{t.title_mag || "Mag."}</SelectItem>
                                    <SelectItem value="none">{t.title_none || "None"}</SelectItem>
                                </SelectContent>
                            </Select>
                        )}
                    />
                </div>
                <div className="md:col-span-2">
                    <Label htmlFor="firstName">{t.register_step2_label_firstName || "First Name"}*</Label>
                    <Input id="firstName" {...form.register('firstName')} />
                    {form.formState.errors.firstName && <p className="text-xs text-destructive mt-1">{form.formState.errors.firstName.message}</p>}
                </div>
              </div>

              <div>
                <Label htmlFor="lastName">{t.register_step2_label_lastName || "Last Name"}*</Label>
                <Input id="lastName" {...form.register('lastName')} />
                {form.formState.errors.lastName && <p className="text-xs text-destructive mt-1">{form.formState.errors.lastName.message}</p>}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="dateOfBirth">{t.register_step2_label_dateOfBirth || "Date of Birth"}*</Label>
                  <Controller
                    name="dateOfBirth"
                    control={form.control}
                    render={({ field }) => (
                      <DatePickerInput
                        value={field.value}
                        onChange={field.onChange}
                        placeholder={t.register_step2_placeholder_dateOfBirth || "YYYY-MM-DD"}
                        disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
                      />
                    )}
                  />
                  {form.formState.errors.dateOfBirth && <p className="text-xs text-destructive mt-1">{form.formState.errors.dateOfBirth.message}</p>}
                </div>
                <div>
                  <Label htmlFor="placeOfBirth">{t.register_step2_label_placeOfBirth || "Place of Birth"}*</Label>
                  <Input id="placeOfBirth" {...form.register('placeOfBirth')} />
                  {form.formState.errors.placeOfBirth && <p className="text-xs text-destructive mt-1">{form.formState.errors.placeOfBirth.message}</p>}
                </div>
              </div>

              <div>
                <Label htmlFor="nationality">{t.register_step2_label_nationality || "Nationality"}*</Label>
                 <Controller
                    name="nationality"
                    control={form.control}
                    render={({ field }) => (
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <SelectTrigger id="nationality">
                                <SelectValue placeholder={t.register_select_placeholder || "Please select"} />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="AT">{t.nationality_at || "Austria"}</SelectItem>
                                <SelectItem value="DE">{t.nationality_de || "Germany"}</SelectItem>
                                <SelectItem value="CH">{t.nationality_ch || "Switzerland"}</SelectItem>
                                <SelectItem value="other">{t.nationality_other || "Other"}</SelectItem>
                            </SelectContent>
                        </Select>
                    )}
                />
                {form.formState.errors.nationality && <p className="text-xs text-destructive mt-1">{form.formState.errors.nationality.message}</p>}
              </div>

              <div>
                <Label htmlFor="streetAddress">{t.register_step2_label_streetAddress || "Street and House Number"}*</Label>
                <Input id="streetAddress" {...form.register('streetAddress')} />
                {form.formState.errors.streetAddress && <p className="text-xs text-destructive mt-1">{form.formState.errors.streetAddress.message}</p>}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="postalCode">{t.register_step2_label_postalCode || "Postal Code"}*</Label>
                  <Input id="postalCode" {...form.register('postalCode')} />
                  {form.formState.errors.postalCode && <p className="text-xs text-destructive mt-1">{form.formState.errors.postalCode.message}</p>}
                </div>
                <div>
                  <Label htmlFor="city">{t.register_step2_label_city || "City"}*</Label>
                  <Input id="city" {...form.register('city')} />
                  {form.formState.errors.city && <p className="text-xs text-destructive mt-1">{form.formState.errors.city.message}</p>}
                </div>
              </div>

              <div>
                <Label htmlFor="stateOrProvince">{t.register_step2_label_stateOrProvince || "State/Province"}*</Label>
                 <Controller
                    name="stateOrProvince"
                    control={form.control}
                    render={({ field }) => (
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <SelectTrigger id="stateOrProvince">
                                <SelectValue placeholder={t.register_select_placeholder || "Please select"} />
                            </SelectTrigger>
                            <SelectContent>
                                {Object.entries(STATES_MAP).map(([name, key]) => (
                                    <SelectItem key={key} value={name}>{t[key] || name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    )}
                />
                {form.formState.errors.stateOrProvince && <p className="text-xs text-destructive mt-1">{form.formState.errors.stateOrProvince.message}</p>}
              </div>

              <div>
                <Label htmlFor="phoneNumber">{t.register_step2_label_phoneNumber || "Phone Number"}</Label>
                <Input id="phoneNumber" type="tel" {...form.register('phoneNumber')} />
                {form.formState.errors.phoneNumber && <p className="text-xs text-destructive mt-1">{form.formState.errors.phoneNumber.message}</p>}
              </div>

              <div>
                <Label htmlFor="email">{t.register_label_email || "Email Address"}*</Label>
                <Input id="email" type="email" value={storedEmail} readOnly disabled className="bg-muted/50" />
              </div>
              
              <div>
                <Label htmlFor="idDocument">{t.register_step2_label_idDocument || "ID Card or Passport"}*</Label>
                <div className="flex items-center space-x-2 mt-1">
                    <label
                        htmlFor="idDocument-file"
                        className="flex items-center justify-center w-full px-4 py-2 border border-input rounded-md shadow-sm text-sm font-medium text-muted-foreground bg-background hover:bg-accent cursor-pointer"
                    >
                        <UploadCloud className="mr-2 h-4 w-4" />
                        <span className="truncate max-w-[200px] sm:max-w-xs md:max-w-sm lg:max-w-md">
                           {selectedFileName || (t.register_step2_button_selectFile || "Select File")}
                        </span>
                    </label>
                    <Input
                        id="idDocument-file"
                        type="file"
                        className="hidden"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={handleFileChange}
                    />
                </div>
                {selectedFileName && !form.formState.errors.idDocument && (
                     <div className="mt-2 flex items-center text-xs text-muted-foreground">
                        <FileIcon className="h-4 w-4 mr-1 text-primary" />
                        <span>{t.register_step2_selected_file || "Selected:"} {selectedFileName}</span>
                    </div>
                )}
                <p className="text-xs text-muted-foreground mt-1">{t.register_step2_file_formats || "Accepted formats: PDF, JPG, PNG (max. 10MB)"}</p>
                {form.formState.errors.idDocument && <p className="text-xs text-destructive mt-1">{form.formState.errors.idDocument.message}</p>}
              </div>


              <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground h-11 text-base" disabled={isLoading}>
                {isLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : (t.register_button_continue || "CONTINUE")}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </AuthLayout>
  );
}
