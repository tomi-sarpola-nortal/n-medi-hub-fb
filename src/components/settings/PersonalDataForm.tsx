
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
import { updatePerson } from '@/services/personService';
import type { Person } from '@/lib/types';
import { Loader2, UploadCloud } from 'lucide-react';
import { useState } from 'react';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../ui/form';
import { uploadFile, deleteFileByUrl } from '@/services/storageService';

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
}

export default function PersonalDataForm({ user, t, isDisabled = false }: PersonalDataFormProps) {
  const { toast } = useToast();
  const { setUser } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFileName, setSelectedFileName] = useState<string | null>(user.idDocumentName || null);


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
    setIsLoading(true);
    try {
      const { idDocument, ...restOfData } = data;

      const updateData: Partial<Person> = {
        ...restOfData,
        dateOfBirth: data.dateOfBirth instanceof Date ? data.dateOfBirth.toISOString().split('T')[0] : data.dateOfBirth,
        name: `${data.title || ''} ${data.firstName} ${data.lastName}`.trim(),
      };
      
      const fileToUpload = idDocument?.[0];
      if (fileToUpload) {
        // If there's an old file URL, try to delete it first.
        if (user.idDocumentUrl) {
          await deleteFileByUrl(user.idDocumentUrl);
        }

        const uploadPath = `users/${user.id}/id_documents`;
        const downloadURL = await uploadFile(fileToUpload, uploadPath);
        updateData.idDocumentUrl = downloadURL;
        updateData.idDocumentName = fileToUpload.name;
        setSelectedFileName(fileToUpload.name);
      }

      await updatePerson(user.id, updateData);
      
      setUser(prev => prev ? ({ ...prev, ...updateData }) : null);

      toast({
        title: t.settings_save_success_title || "Success",
        description: t.settings_personal_data_success_desc || "Your personal data has been updated.",
      });
    } catch (error) {
      console.error("Failed to update personal data:", error);
      toast({
        title: t.settings_save_error_title || "Error",
        description: t.settings_save_error_desc || "Failed to update information. Please try again.",
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

  return (
    <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                 <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem className="md:col-span-1">
                      <FormLabel>{t.register_step2_label_title || "Title"}</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isDisabled}>
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
                      <FormControl><Input {...field} disabled={isDisabled} /></FormControl>
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
                    <FormControl><Input {...field} disabled={isDisabled} /></FormControl>
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
                                    disabled={(date) => date > new Date() || date < new Date("1900-01-01") || isDisabled}
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
                        <FormControl><Input {...field} disabled={isDisabled} /></FormControl>
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
                    <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isDisabled}>
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
                    <FormControl><Input {...field} disabled={isDisabled} /></FormControl>
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
                        <FormControl><Input {...field} disabled={isDisabled} /></FormControl>
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
                        <FormControl><Input {...field} disabled={isDisabled} /></FormControl>
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
                    <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isDisabled}>
                        <FormControl>
                        <SelectTrigger><SelectValue placeholder={t.register_select_placeholder || "Please select"} /></SelectTrigger>
                        </FormControl>
                        <SelectContent>
                            <SelectItem value="Wien">{t.state_wien || "Vienna"}</SelectItem>
                            <SelectItem value="NÖ">{t.state_noe || "Lower Austria"}</SelectItem>
                            <SelectItem value="OÖ">{t.state_ooe || "Upper Austria"}</SelectItem>
                            <SelectItem value="Bayern">{t.state_bayern || "Bavaria"}</SelectItem>
                            <SelectItem value="Baden-Württemberg">{t.state_bw || "Baden-Württemberg"}</SelectItem>
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
                    <FormControl><Input type="tel" {...field} disabled={isDisabled} /></FormControl>
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
                                    !isDisabled && "hover:bg-accent cursor-pointer"
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
                                disabled={isDisabled}
                            />
                        </div>
                    </FormControl>
                    <FormMessage />
                </FormItem>
                )}
            />

            {!isDisabled && (
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
