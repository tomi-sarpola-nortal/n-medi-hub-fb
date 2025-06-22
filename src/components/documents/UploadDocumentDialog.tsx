
"use client";

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, UploadCloud } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { addDocumentTemplate } from '@/services/documentTemplateService';

interface UploadDocumentDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onUploadSuccess: () => void;
  t: Record<string, string>;
}

const MAX_FILE_SIZE = 15 * 1024 * 1024; // 15MB
const ACCEPTED_FILE_TYPES = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];

const FormSchema = z.object({
  title: z.string().min(1, { message: "Title is required." }),
  type: z.enum(['vorlage', 'leitlinie', 'empfehlung'], {
    required_error: "You need to select a document type.",
  }),
  publisher: z.string().min(1, { message: "Publisher is required." }),
  file: z
    .custom<FileList>()
    .refine((files) => files && files.length > 0, 'File is required.')
    .refine((files) => files?.[0]?.size <= MAX_FILE_SIZE, `Max file size is 15MB.`)
    .refine(
      (files) => ACCEPTED_FILE_TYPES.includes(files?.[0]?.type),
      "Only .pdf, .doc, and .docx formats are supported."
    ),
});

type FormValues = z.infer<typeof FormSchema>;

export default function UploadDocumentDialog({ isOpen, onOpenChange, onUploadSuccess, t }: UploadDocumentDialogProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      title: '',
      publisher: 'ÖZÄK',
    },
  });

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      form.setValue('file', files, { shouldValidate: true });
      setSelectedFileName(files[0].name);
    } else {
        form.setValue('file', new DataTransfer().files, { shouldValidate: true });
        setSelectedFileName(null);
    }
  };

  const onSubmit = async (data: FormValues) => {
    setIsLoading(true);
    try {
      const { file, ...metadata } = data;
      await addDocumentTemplate(metadata, file[0]);
      toast({
        title: t.documents_upload_success_title || 'Upload Successful',
        description: t.documents_upload_success_desc || `Document "${data.title}" has been uploaded.`,
      });
      onUploadSuccess();
      form.reset();
      setSelectedFileName(null);
      onOpenChange(false);
    } catch (error) {
      console.error("Upload failed:", error);
      toast({
        title: t.documents_upload_error_title || 'Upload Failed',
        description: t.documents_upload_error_desc || 'Could not upload the document. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Reset form when dialog is closed
  const handleOpenChange = (open: boolean) => {
      if (!open) {
          form.reset();
          setSelectedFileName(null);
      }
      onOpenChange(open);
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{t.documents_upload_dialog_title || 'Upload New Document'}</DialogTitle>
          <DialogDescription>{t.documents_upload_dialog_desc || "Add a new document to the templates library. Click save when you're done."}</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 py-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t.documents_upload_form_title || 'Document Title'}</FormLabel>
                  <FormControl><Input {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t.documents_upload_form_type || 'Document Type'}</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl><SelectTrigger><SelectValue placeholder={t.register_select_placeholder || 'Please select'} /></SelectTrigger></FormControl>
                    <SelectContent>
                      <SelectItem value="vorlage">{t.documents_type_vorlage || 'Template'}</SelectItem>
                      <SelectItem value="leitlinie">{t.documents_type_leitlinie || 'Guideline'}</SelectItem>
                      <SelectItem value="empfehlung">{t.documents_type_empfehlung || 'Recommendation'}</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="publisher"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t.documents_upload_form_publisher || 'Publisher'}</FormLabel>
                  <FormControl><Input {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="file"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t.documents_upload_form_file || 'File'}</FormLabel>
                   <FormControl>
                        <div className="flex items-center space-x-2 mt-1">
                            <label
                                htmlFor="file-upload-input"
                                className="flex items-center justify-center w-full px-4 py-2 border border-input rounded-md shadow-sm text-sm font-medium text-muted-foreground bg-background hover:bg-accent cursor-pointer"
                            >
                                <UploadCloud className="mr-2 h-4 w-4" />
                                <span className="truncate max-w-[200px]">
                                   {selectedFileName || (t.register_step2_button_selectFile || "Select File")}
                                </span>
                            </label>
                            <Input
                                id="file-upload-input"
                                type="file"
                                className="hidden"
                                accept=".pdf,.doc,.docx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                                onChange={handleFileChange}
                            />
                        </div>
                    </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-end pt-2">
                <Button type="submit" disabled={isLoading}>
                    {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    {t.documents_upload_form_submit || 'Save and Upload'}
                </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
