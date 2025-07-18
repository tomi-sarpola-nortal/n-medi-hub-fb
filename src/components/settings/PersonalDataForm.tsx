
"use client";

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DatePickerInput } from '@/components/ui/date-picker';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/auth-context';
import { requestDataChange } from '@/app/actions/memberActions';
import type { Person } from '@/lib/types';
import { Loader2, UploadCloud } from 'lucide-react';
import { useState } from 'react';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../ui/form';
import { uploadFile, deleteFileByUrl } from '@/services/storageService';
import { cn } from '@/lib/utils';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ExclamationTriangleIcon } from '@radix-ui/react-icons';
import { STATES_MAP } from '@/lib/registrationStore';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ACCEPTED_FILE_TYPES = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];

const FormSchema = z.object({
  title: z.string().optional(),
  firstName: z.string().min(1, { message: "First name is required." }),
  lastName: z.string().min(1, { message: "Last name is required." }),
  dateOfBirth: z.union([z.date(), z.string()]).refine(val => val, { message: "Date of birth is required."}),
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

interface PersonalDataFormProps {
  user: Person;
  t: Record<string, string>;
  isDisabled?: boolean;
  locale: string;
}

export default function PersonalDataForm({ user, t, isDisabled = false, locale }: PersonalDataFormProps) {
  const { toast } = useToast();
  const { user: authUser, setUser } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFileName, setSelectedFileName] = useState<string | null>(user.idDocumentName || null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const form = useForm<PersonalDataFormInputs>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      title: user.title || "",
      firstName: user.firstName || "",
      lastName: user.lastName || "",
      dateOfBirth: user.dateOfBirth ? new Date(user.dateOfBirth) : undefined,
      placeOfBirth: user.placeOfBirth || "",
      nationality: user.nationality || "",
      streetAddress: user.streetAddress || "",
      postalCode: user.postalCode || "",
      city: user.city || "",
      stateOrProvince: user.stateOrProvince || "",
      phoneNumber: user.phoneNumber || "",
    },
  });

  const onSubmit = async (data: PersonalDataFormInputs) => {
    if (!authUser) return;
    setIsLoading(true);
    setErrorMessage(null);
    
    try {
      const { idDocument, ...restOfData } = data;

      const updateData: Partial<Person> = {
        ...restOfData,
        dateOfBirth: data.dateOfBirth instanceof Date ? data.dateOfBirth.toISOString().split('T')[0] : data.dateOfBirth,
        name: `${data.title || ''} ${data.firstName} ${data.lastName}`.trim(),
      };
      
      const fileToUpload = idDocument?.[0];
      if (fileToUpload) {
        const uploadPath = `users/${user.id}/id_documents_pending`;
        const downloadURL = await uploadFile(fileToUpload, uploadPath);
        updateData.idDocumentUrl = downloadURL;
        updateData.idDocumentName = fileToUpload.name;
      } else {
        // Preserve existing file if no new one is uploaded
        updateData.idDocumentUrl = user.idDocumentUrl;
        updateData.idDocumentName = user.idDocumentName;
      }

      const result = await requestDataChange(user.id, updateData, authUser, locale);

      if (result.success) {
        // Optimistically update the user context to reflect the pending state
        setUser(prev => prev ? ({ ...prev, pendingData: { ...prev.pendingData, ...updateData }, hasPendingChanges: true }) : null);
        toast({
          title: t.settings_save_success_title || "Success",
          description: t.settings_personal_data_success_desc || "Your changes have been submitted for review.",
        });
      } else {
        throw new Error(result.message);
      }

    } catch (error) {
      console.error("Failed to request data change:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to submit changes. Please try again.";
      setErrorMessage(errorMessage);
      toast({
        title: t.settings_save_error_title || "Error",
        description: errorMessage,
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

  const isFormDisabled = isDisabled || !!user.pendingData;

  return (
    <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {errorMessage && (
              <Alert variant="destructive">
                <ExclamationTriangleIcon className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{errorMessage}</AlertDescription>
              </Alert>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                 <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem className="md:col-span-1">
                      <FormLabel>{t.register_step2_label_title || "Title"}</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isFormDisabled}>
                            <FormControl>
                                <SelectTrigger><SelectValue placeholder={t.register_select_placeholder || "Please select"} /></SelectTrigger>
                            </FormControl>
                            <SelectContent>
                                <SelectItem value="Dr.">{t.title_dr || "Dr."}</SelectItem>
                                <SelectItem value="Prof.">{t.title_prof || "Prof."}</SelectItem>
                                <SelectItem value="Mag.">{t.title_mag || "Mag."}</SelectItem>
                                <SelectItem value="none">{t.title_none || "None"}</SelectItem>
                            </SelectContent>
                        </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>{t.register_step2_label_firstName || "First Name"}*</FormLabel>
                      <FormControl><Input {...field} disabled={isFormDisabled} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
            </div>
            
            <FormField
                control={form.control}
                name="lastName"
                render={({ field }) => (
                <FormItem>
                    <FormLabel>{t.register_step2_label_lastName || "Last Name"}*</FormLabel>
                    <FormControl><Input {...field} disabled={isFormDisabled} /></FormControl>
                    <FormMessage />
                </FormItem>
                )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <FormField
                    control={form.control}
                    name="dateOfBirth"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>{t.register_step2_label_dateOfBirth || "Date of Birth"}*</FormLabel>
                            <FormControl>
                                <DatePickerInput
                                    value={field.value ? new Date(field.value) : undefined}
                                    onChange={field.onChange}
                                    disabled={(date) => date > new Date() || date < new Date("1900-01-01") || isFormDisabled}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                    />
                <FormField
                    control={form.control}
                    name="placeOfBirth"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>{t.register_step2_label_placeOfBirth || "Place of Birth"}*</FormLabel>
                        <FormControl><Input {...field} disabled={isFormDisabled} /></FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />
            </div>
            
             <FormField
                control={form.control}
                name="nationality"
                render={({ field }) => (
                <FormItem>
                    <FormLabel>{t.register_step2_label_nationality || "Nationality"}*</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isFormDisabled}>
                        <FormControl>
                        <SelectTrigger><SelectValue placeholder={t.register_select_placeholder || "Please select"} /></SelectTrigger>
                        </FormControl>
                        <SelectContent>
                            <SelectItem value="AT">{t.nationality_at || "Austria"}</SelectItem>
                            <SelectItem value="DE">{t.nationality_de || "Germany"}</SelectItem>
                            <SelectItem value="CH">{t.nationality_ch || "Switzerland"}</SelectItem>
                            <SelectItem value="other">{t.nationality_other || "Other"}</SelectItem>
                        </SelectContent>
                    </Select>
                    <FormMessage />
                </FormItem>
                )}
            />

            <FormField
                control={form.control}
                name="streetAddress"
                render={({ field }) => (
                <FormItem>
                    <FormLabel>{t.register_step2_label_streetAddress || "Street and House Number"}*</FormLabel>
                    <FormControl><Input {...field} disabled={isFormDisabled} /></FormControl>
                    <FormMessage />
                </FormItem>
                )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <FormField
                    control={form.control}
                    name="postalCode"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>{t.register_step2_label_postalCode || "Postal Code"}*</FormLabel>
                        <FormControl><Input {...field} disabled={isFormDisabled} /></FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />
                 <FormField
                    control={form.control}
                    name="city"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>{t.register_step2_label_city || "City"}*</FormLabel>
                        <FormControl><Input {...field} disabled={isFormDisabled} /></FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />
            </div>

            <FormField
                control={form.control}
                name="stateOrProvince"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>{t.register_step2_label_stateOrProvince || "State/Province"}*</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isFormDisabled}>
                        <FormControl>
                        <SelectTrigger><SelectValue placeholder={t.register_select_placeholder || "Please select"} /></SelectTrigger>
                        </FormControl>
                        <SelectContent>
                            {Object.entries(STATES_MAP).map(([name, key]) => (
                                <SelectItem key={key} value={name}>{t[key] || name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <FormMessage />
                    </FormItem>
                )}
            />
            
             <FormField
                control={form.control}
                name="phoneNumber"
                render={({ field }) => (
                <FormItem>
                    <FormLabel>{t.register_step2_label_phoneNumber || "Phone Number"}</FormLabel>
                    <FormControl><Input type="tel" {...field} disabled={isFormDisabled} /></FormControl>
                    <FormMessage />
                </FormItem>
                )}
            />
            
            <FormField
                control={form.control}
                name="idDocument"
                render={() => (
                <FormItem>
                    <FormLabel>{t.register_step2_label_idDocument || "ID Card or Passport"}</FormLabel>
                    <FormControl>
                        <div className="flex items-center space-x-2 mt-1">
                            <label
                                htmlFor="idDocument-file"
                                className={cn(
                                    "flex items-center justify-center w-full px-4 py-2 border border-input rounded-md shadow-sm text-sm font-medium text-muted-foreground bg-background",
                                    !isFormDisabled && "hover:bg-accent cursor-pointer"
                                )}
                            >
                                <UploadCloud className="mr-2 h-4 w-4" />
                                {selectedFileName || (t.register_step2_button_selectFile || "Select File")}
                            </label>
                            <Input
                                id="idDocument-file"
                                type="file"
                                className="hidden"
                                accept=".pdf,.jpg,.jpeg,.png"
                                onChange={handleFileChange}
                                disabled={isFormDisabled}
                            />
                        </div>
                    </FormControl>
                    <FormMessage />
                </FormItem>
                )}
            />

            {!isFormDisabled && (
                <div className="flex justify-end pt-4">
                    <Button type="submit" className="bg-primary hover:bg-primary/90 text-primary-foreground" disabled={isLoading}>
                        {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                        {t.settings_button_save || "Save Changes"}
                    </Button>
                </div>
            )}
        </form>
    </Form>
  );
}
