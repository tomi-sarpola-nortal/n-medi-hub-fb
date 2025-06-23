
"use client";

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { DatePickerInput } from '@/components/ui/date-picker';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/auth-context';
import { updatePerson } from '@/services/personService';
import type { Person } from '@/lib/types';
import { Loader2, UploadCloud } from 'lucide-react';
import { useState } from 'react';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../ui/form';
import { DENTAL_SPECIALIZATIONS, PROFESSIONAL_TITLES } from '@/lib/registrationStore';
import { LanguageInput } from '../ui/language-input';
import { uploadFile, deleteFileByUrl } from '@/services/storageService';
import { cn } from '@/lib/utils';

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
    graduationDate: z.union([z.date(), z.string()]).refine(val => val, { message: "Graduation date is required."}),
    university: z.string().min(1, { message: "University/College is required." }),
    approbationNumber: z.string().optional(),
    approbationDate: z.union([z.date(), z.string()]).optional().nullable(),
    diplomaFile: optionalFileSchema,
    approbationCertificateFile: optionalFileSchema,
    specialistRecognitionFile: optionalFileSchema,
});

type FormInputs = z.infer<typeof FormSchema>;

interface ProfessionalQualificationsFormProps {
  user: Person;
  t: Record<string, string>;
  isDisabled?: boolean;
}

export default function ProfessionalQualificationsForm({ user, t, isDisabled = false }: ProfessionalQualificationsFormProps) {
  const { toast } = useToast();
  const { setUser } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  
  const [selectedDiplomaName, setSelectedDiplomaName] = useState<string | null>(user.diplomaName || null);
  const [selectedApprobationCertificateName, setSelectedApprobationCertificateName] = useState<string | null>(user.approbationCertificateName || null);
  const [selectedSpecialistRecognitionName, setSelectedSpecialistRecognitionName] = useState<string | null>(user.specialistRecognitionName || null);


  const form = useForm<FormInputs>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      currentProfessionalTitle: user.currentProfessionalTitle || "",
      specializations: user.specializations || [],
      languages: user.languages || [],
      graduationDate: user.graduationDate ? new Date(user.graduationDate) : undefined,
      university: user.university || "",
      approbationNumber: user.approbationNumber || "",
      approbationDate: user.approbationDate ? new Date(user.approbationDate) : undefined,
    },
  });
  
  const handleFileChange = (
    event: React.ChangeEvent<HTMLInputElement>,
    fieldName: keyof FormInputs,
    setFileNameState: React.Dispatch<React.SetStateAction<string | null>>
  ) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      form.setValue(fieldName, files as any, { shouldValidate: true });
      setFileNameState(files[0].name);
    }
  };

  const onSubmit = async (data: FormInputs) => {
    setIsLoading(true);
    try {
      const uploadPath = `users/${user.id}/qualifications`;
      
      const { 
        diplomaFile, 
        approbationCertificateFile, 
        specialistRecognitionFile, 
        ...restOfData 
      } = data;

      const updateData: Partial<Person> = {
        ...restOfData,
        graduationDate: data.graduationDate instanceof Date ? data.graduationDate.toISOString().split('T')[0] : data.graduationDate,
        approbationDate: data.approbationDate instanceof Date ? data.approbationDate.toISOString().split('T')[0] : data.approbationDate,
      };

      if (diplomaFile?.[0]) {
        if (user.diplomaUrl) {
            await deleteFileByUrl(user.diplomaUrl);
        }
        const file = diplomaFile[0];
        const url = await uploadFile(file, uploadPath);
        updateData.diplomaUrl = url;
        updateData.diplomaName = file.name;
        setSelectedDiplomaName(file.name);
      }
      if (approbationCertificateFile?.[0]) {
        if (user.approbationCertificateUrl) {
            await deleteFileByUrl(user.approbationCertificateUrl);
        }
        const file = approbationCertificateFile[0];
        const url = await uploadFile(file, uploadPath);
        updateData.approbationCertificateUrl = url;
        updateData.approbationCertificateName = file.name;
        setSelectedApprobationCertificateName(file.name);
      }
      if (specialistRecognitionFile?.[0]) {
        if (user.specialistRecognitionUrl) {
            await deleteFileByUrl(user.specialistRecognitionUrl);
        }
        const file = specialistRecognitionFile[0];
        const url = await uploadFile(file, uploadPath);
        updateData.specialistRecognitionUrl = url;
        updateData.specialistRecognitionName = file.name;
        setSelectedSpecialistRecognitionName(file.name);
      }

      await updatePerson(user.id, updateData);
      setUser(prev => prev ? ({ ...prev, ...updateData }) : null);

      toast({
        title: t.settings_save_success_title || "Success",
        description: t.settings_prof_qual_success_desc || "Your professional qualifications have been updated.",
      });
    } catch (error) {
      console.error("Failed to update professional qualifications:", error);
      toast({
        title: t.settings_save_error_title || "Error",
        description: t.settings_save_error_desc || "Failed to update information. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
     <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
                control={form.control}
                name="currentProfessionalTitle"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>{t.register_step4_label_prof_title || "Current Professional Title"}*</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isDisabled}>
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
                        render={({ field }) => (
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
                                        (value) => value !== item.id
                                        )
                                    );
                                }}
                                disabled={isDisabled}
                            />
                            </FormControl>
                            <FormLabel className={cn("font-normal text-sm", isDisabled && "cursor-not-allowed opacity-70")}>
                            {t[item.labelKey] || item.id.replace(/_/g, ' ')}
                            </FormLabel>
                        </FormItem>
                        )}
                    />
                    ))}
                </div>
                <FormMessage className="pt-2">{form.formState.errors.specializations?.message}</FormMessage>
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
                      disabled={isDisabled}
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
                    <FormItem>
                        <FormLabel>{t.register_step4_label_graduation_date || "Date of Graduation"}*</FormLabel>
                        <FormControl>
                        <DatePickerInput
                          value={field.value ? new Date(field.value) : undefined}
                          onChange={field.onChange}
                          disabled={(date) => date > new Date() || date < new Date("1950-01-01") || isDisabled}
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
                    <FormControl><Input placeholder={t.register_step4_placeholder_university || "Name of University/College"} {...field} disabled={isDisabled} /></FormControl>
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
                    <FormControl><Input {...field} disabled={isDisabled} /></FormControl>
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
                        <DatePickerInput
                            value={field.value ? new Date(field.value) : undefined}
                            onChange={field.onChange}
                            disabled={(date) => date > new Date() || date < new Date("1950-01-01") || isDisabled}
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
                  <FormLabel>{t.register_step4_label_diploma || "Diploma/Certificate of Dental Studies"}</FormLabel>
                   <FormControl>
                    <div className="flex items-center space-x-2 mt-1">
                        <label
                            htmlFor="diplomaFile-input"
                            className={cn(
                                "flex items-center justify-center w-full px-4 py-2 border border-input rounded-md shadow-sm text-sm font-medium text-muted-foreground bg-background",
                                !isDisabled && "hover:bg-accent cursor-pointer"
                            )}
                        >
                            <UploadCloud className="mr-2 h-4 w-4" />
                            {selectedDiplomaName || (t.register_step2_button_selectFile || "Select File")}
                        </label>
                        <Input
                            id="diplomaFile-input"
                            type="file"
                            className="hidden"
                            accept=".pdf,.jpg,.jpeg,.png"
                            onChange={(e) => handleFileChange(e, 'diplomaFile', setSelectedDiplomaName)}
                            disabled={isDisabled}
                        />
                    </div>
                    </FormControl>
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
                            className={cn(
                                "flex items-center justify-center w-full px-4 py-2 border border-input rounded-md shadow-sm text-sm font-medium text-muted-foreground bg-background",
                                !isDisabled && "hover:bg-accent cursor-pointer"
                            )}
                        >
                            <UploadCloud className="mr-2 h-4 w-4" />
                            {selectedApprobationCertificateName || (t.register_step2_button_selectFile || "Select File")}
                        </label>
                        <Input
                            id="approbationCertificateFile-input"
                            type="file"
                            className="hidden"
                            accept=".pdf,.jpg,.jpeg,.png"
                            onChange={(e) => handleFileChange(e, 'approbationCertificateFile', setSelectedApprobationCertificateName)}
                            disabled={isDisabled}
                        />
                    </div>
                    </FormControl>
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
                            className={cn(
                                "flex items-center justify-center w-full px-4 py-2 border border-input rounded-md shadow-sm text-sm font-medium text-muted-foreground bg-background",
                                !isDisabled && "hover:bg-accent cursor-pointer"
                            )}
                        >
                            <UploadCloud className="mr-2 h-4 w-4" />
                            {selectedSpecialistRecognitionName || (t.register_step2_button_selectFile || "Select File")}
                        </label>
                        <Input
                            id="specialistRecognitionFile-input"
                            type="file"
                            className="hidden"
                            accept=".pdf,.jpg,.jpeg,.png"
                            onChange={(e) => handleFileChange(e, 'specialistRecognitionFile', setSelectedSpecialistRecognitionName)}
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
