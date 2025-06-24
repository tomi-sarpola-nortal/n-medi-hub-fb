
"use client";

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth } from '@/context/auth-context';
import { useRouter, useParams, usePathname } from 'next/navigation';
import { getAllPersons } from '@/services/personService';
import { createRepresentation } from '@/services/representationService';
import { useToast } from '@/hooks/use-toast';
import type { Person } from '@/lib/types';
import AppLayout from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { DatePickerInput } from '@/components/ui/date-picker';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { ArrowLeft, Check, ChevronsUpDown, Loader2 } from 'lucide-react';
import { differenceInMinutes } from 'date-fns';

const getClientTranslations = (locale: string) => {
  try {
    const page = locale === 'de' ? require('../../../../../locales/de/representations.json') : require('../../../../../locales/en/representations.json');
    return page;
  } catch (e) {
    console.warn("Translation file not found for new representation page, falling back to en");
    return require('../../../../../locales/en/representations.json');
  }
};

const timeRegex = /^(0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/;

const formSchema = z.object({
  representedPersonId: z.string().min(1, 'You must select a dentist.'),
  startDate: z.date({ required_error: 'Start date is required.' }),
  startTime: z.string().regex(timeRegex, 'Invalid time format. Use HH:MM.'),
  endDate: z.date({ required_error: 'End date is required.' }),
  endTime: z.string().regex(timeRegex, 'Invalid time format. Use HH:MM.'),
}).refine(data => {
    const startDateTime = new Date(data.startDate);
    const [startHour, startMinute] = data.startTime.split(':').map(Number);
    startDateTime.setHours(startHour, startMinute);

    const endDateTime = new Date(data.endDate);
    const [endHour, endMinute] = data.endTime.split(':').map(Number);
    endDateTime.setHours(endHour, endMinute);

    return endDateTime > startDateTime;
}, {
    message: "End date and time must be after the start date and time.",
    path: ["endDate"],
});


type NewRepresentationFormValues = z.infer<typeof formSchema>;


export default function NewRepresentationPage() {
    const { user } = useAuth();
    const router = useRouter();
    const params = useParams();
    const locale = typeof params.locale === 'string' ? params.locale : 'en';
    const { toast } = useToast();
    const t = getClientTranslations(locale);

    const [persons, setPersons] = useState<Person[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const form = useForm<NewRepresentationFormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            representedPersonId: '',
            startTime: '08:00',
            endTime: '17:00'
        },
    });
    
    const formValues = form.watch();

    const calculatedDuration = (): number => {
        const { startDate, startTime, endDate, endTime } = formValues;
        if (startDate && startTime && endDate && endTime && timeRegex.test(startTime) && timeRegex.test(endTime)) {
            const startDateTime = new Date(startDate);
            const [startHour, startMinute] = startTime.split(':').map(Number);
            startDateTime.setHours(startHour, startMinute);

            const endDateTime = new Date(endDate);
            const [endHour, endMinute] = endTime.split(':').map(Number);
            endDateTime.setHours(endHour, endMinute);

            if (endDateTime > startDateTime) {
                const diffMinutes = differenceInMinutes(endDateTime, startDateTime);
                return parseFloat((diffMinutes / 60).toFixed(2));
            }
        }
        return 0;
    };


    useEffect(() => {
        const fetchPersons = async () => {
            if (user) {
                const allPersons = await getAllPersons();
                // Filter out the current user from the list of people they can represent for
                setPersons(allPersons.filter(p => p.id !== user.id));
            }
        };
        fetchPersons();
    }, [user]);

    const onSubmit = async (data: NewRepresentationFormValues) => {
        if (!user) return;
        setIsLoading(true);

        const representedPerson = persons.find(p => p.id === data.representedPersonId);
        if (!representedPerson) {
            toast({ title: t.new_representation_error_toast_title, description: "Selected dentist not found.", variant: 'destructive' });
            setIsLoading(false);
            return;
        }

        const startDateTime = new Date(data.startDate);
        const [startHour, startMinute] = data.startTime.split(':').map(Number);
        startDateTime.setHours(startHour, startMinute);

        const endDateTime = new Date(data.endDate);
        const [endHour, endMinute] = data.endTime.split(':').map(Number);
        endDateTime.setHours(endHour, endMinute);
        
        try {
            await createRepresentation({
                representingPersonId: user.id,
                representedPersonId: representedPerson.id,
                representingPersonName: user.name,
                representedPersonName: representedPerson.name,
                startDate: startDateTime.toISOString(),
                endDate: endDateTime.toISOString(),
                durationHours: calculatedDuration(),
                status: 'pending',
            });

            toast({
                title: t.new_representation_success_toast_title,
                description: t.new_representation_success_toast_desc,
            });
            router.push(`/${locale}/representations`);

        } catch (error) {
            console.error("Failed to create representation:", error);
            toast({
                title: t.new_representation_error_toast_title,
                description: t.new_representation_error_toast_desc,
                variant: 'destructive',
            });
        } finally {
            setIsLoading(false);
        }
    };

    const pageTitle = t.new_representation_page_title || "New Representation";
    
    return (
        <AppLayout pageTitle={pageTitle} locale={locale}>
            <div className="flex-1 space-y-6 p-4 md:p-8">
                 <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight font-headline flex items-center gap-2">
                            <Link href={`/${locale}/representations`} className="hidden lg:block">
                                <ArrowLeft className="h-6 w-6 text-muted-foreground"/>
                            </Link>
                           {pageTitle}
                        </h1>
                         <div className="text-sm text-muted-foreground mt-2">
                            <Link href={`/${locale}/dashboard`} className="hover:underline">{t.representations_breadcrumb_dashboard || "Dashboard"}</Link>
                            <span className="mx-1">/</span>
                             <Link href={`/${locale}/representations`} className="hover:underline">{t.representations_breadcrumb_current || "My Representations"}</Link>
                            <span className="mx-1">/</span>
                            <span className="font-medium text-foreground">{t.new_representation_breadcrumb_current || "New"}</span>
                        </div>
                    </div>
                </div>

                <Card className="max-w-2xl mx-auto">
                    <CardHeader>
                        <CardTitle>{t.new_representation_card_title || "Enter Representation Details"}</CardTitle>
                        <CardDescription>{t.new_representation_card_desc || "Select the dentist you represented and the time period."}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                                <FormField
                                    control={form.control}
                                    name="representedPersonId"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-col">
                                            <FormLabel>{t.new_representation_form_dentist_label || "Represented Dentist"}</FormLabel>
                                            <Popover>
                                                <PopoverTrigger asChild>
                                                    <FormControl>
                                                        <Button
                                                            variant="outline"
                                                            role="combobox"
                                                            className={cn(
                                                                "w-full justify-between",
                                                                !field.value && "text-muted-foreground"
                                                            )}
                                                        >
                                                            {field.value
                                                                ? persons.find((p) => p.id === field.value)?.name
                                                                : (t.new_representation_form_dentist_placeholder || "Select a dentist...")}
                                                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                                        </Button>
                                                    </FormControl>
                                                </PopoverTrigger>
                                                <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                                                    <Command>
                                                        <CommandInput placeholder={t.new_representation_form_search_dentist || "Search dentist..."} />
                                                        <CommandList>
                                                            <CommandEmpty>{t.new_representation_form_dentist_not_found || "No dentist found."}</CommandEmpty>
                                                            <CommandGroup>
                                                                {persons.map((p) => (
                                                                    <CommandItem
                                                                        value={p.name}
                                                                        key={p.id}
                                                                        onSelect={() => {
                                                                            form.setValue("representedPersonId", p.id);
                                                                        }}
                                                                    >
                                                                        <Check
                                                                            className={cn(
                                                                                "mr-2 h-4 w-4",
                                                                                p.id === field.value ? "opacity-100" : "opacity-0"
                                                                            )}
                                                                        />
                                                                        {p.name} (ID: {p.dentistId || 'N/A'})
                                                                    </CommandItem>
                                                                ))}
                                                            </CommandGroup>
                                                        </CommandList>
                                                    </Command>
                                                </PopoverContent>
                                            </Popover>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                     <FormField
                                        control={form.control}
                                        name="startDate"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>{t.new_representation_form_start_date_label || "Start Date & Time"}</FormLabel>
                                                <div className="flex gap-2">
                                                    <DatePickerInput
                                                        value={field.value}
                                                        onChange={field.onChange}
                                                        disabled={(date) => date > new Date()}
                                                    />
                                                    <FormField control={form.control} name="startTime" render={({ field: timeField }) => (
                                                        <Input {...timeField} placeholder={t.new_representation_form_time_placeholder || "HH:MM"} className="w-24" />
                                                    )}/>
                                                </div>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="endDate"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>{t.new_representation_form_end_date_label || "End Date & Time"}</FormLabel>
                                                <div className="flex gap-2">
                                                     <DatePickerInput
                                                        value={field.value}
                                                        onChange={field.onChange}
                                                        disabled={(date) => date > new Date() || (formValues.startDate && date < formValues.startDate)}
                                                    />
                                                     <FormField control={form.control} name="endTime" render={({ field: timeField }) => (
                                                        <Input {...timeField} placeholder={t.new_representation_form_time_placeholder || "HH:MM"} className="w-24" />
                                                    )}/>
                                                </div>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                                
                                <div>
                                    <FormLabel>{t.new_representation_form_duration_label || "Calculated Duration (hours)"}</FormLabel>
                                    <Input value={calculatedDuration()} readOnly disabled className="bg-muted mt-2" />
                                </div>


                                <div className="flex justify-end gap-4 pt-4">
                                    <Button type="button" variant="outline" onClick={() => router.back()} disabled={isLoading}>
                                        {t.new_representation_form_cancel_button || "Cancel"}
                                    </Button>
                                    <Button type="submit" disabled={isLoading}>
                                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                        {t.new_representation_form_save_button || "Save Representation"}
                                    </Button>
                                </div>
                            </form>
                        </Form>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}

