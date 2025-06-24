
"use client";

import { useEffect, useState, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useAuth } from "@/context/auth-context";
import { useRouter, useParams } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { getAllPersons } from "@/services/personService";
import { createRepresentation } from "@/services/representationService";
import type { Person } from "@/lib/types";
import { set } from "date-fns";

import AppLayout from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DatePickerInput } from "@/components/ui/date-picker";
import { Loader2, ArrowLeft } from "lucide-react";
import Link from "next/link";

// Helper for client-side translations
const getClientTranslations = (locale: string) => {
    try {
        const page = locale === 'de' ? require('../../../../../locales/de/representations.json') : require('../../../../../locales/en/representations.json');
        return page;
    } catch (e) {
        console.warn("Translation file not found, falling back to en");
        return require('../../../../../locales/en/representations.json');
    }
};

const timeRegex = /^(0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/; // HH:MM format

const FormSchema = z.object({
    representedDentistId: z.string({ required_error: "Please select a dentist." }),
    date: z.date({ required_error: "Please select a date." }),
    startTime: z.string().regex(timeRegex, "Invalid time format. Use HH:MM."),
    endTime: z.string().regex(timeRegex, "Invalid time format. Use HH:MM."),
}).refine(data => {
    if (!timeRegex.test(data.startTime) || !timeRegex.test(data.endTime)) return false;
    const [startHour, startMinute] = data.startTime.split(':').map(Number);
    const [endHour, endMinute] = data.endTime.split(':').map(Number);
    return endHour > startHour || (endHour === startHour && endMinute > startMinute);
}, {
    message: "End time must be after start time.",
    path: ["endTime"],
});

type FormValues = z.infer<typeof FormSchema>;

export default function NewRepresentationPage() {
    const { user } = useAuth();
    const router = useRouter();
    const params = useParams();
    const locale = typeof params.locale === 'string' ? params.locale : 'en';

    const [t, setT] = useState<Record<string, string>>({});
    const [dentists, setDentists] = useState<Person[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { toast } = useToast();
    
    const hours = useMemo(() => Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0')), []);
    const minutes = useMemo(() => ['00', '15', '30', '45'], []);

    useEffect(() => {
        setT(getClientTranslations(locale));
        async function fetchDentists() {
            setIsLoading(true);
            try {
                const allPersons = await getAllPersons();
                const availableDentists = allPersons.filter(p => p.id !== user?.id && p.status === 'active' && p.role === 'dentist');
                setDentists(availableDentists);
            } catch (error) {
                toast({ title: "Error", description: "Could not fetch dentists.", variant: "destructive" });
            }
            setIsLoading(false);
        }
        if (user) {
            fetchDentists();
        }
    }, [user, locale, toast]);

    const form = useForm<FormValues>({
        resolver: zodResolver(FormSchema),
        defaultValues: {
            startTime: '11:00',
            endTime: '12:00'
        }
    });

    const onSubmit = async (data: FormValues) => {
        if (!user) return;

        const [startHour, startMinute] = data.startTime.split(':').map(Number);
        const [endHour, endMinute] = data.endTime.split(':').map(Number);

        const startDate = set(data.date, { hours: startHour, minutes: startMinute, seconds: 0, milliseconds: 0 });
        const endDate = set(data.date, { hours: endHour, minutes: endMinute, seconds: 0, milliseconds: 0 });
        
        const duration = (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60);
        const calculatedDuration = Math.round(duration * 100) / 100;

        setIsSubmitting(true);
        try {
            const representedDentist = dentists.find(d => d.id === data.representedDentistId);
            if (!representedDentist) {
                throw new Error("Selected dentist not found.");
            }

            await createRepresentation({
                representingPersonId: user.id,
                representingPersonName: user.name,
                representedPersonId: representedDentist.id,
                representedPersonName: representedDentist.name,
                startDate: startDate.toISOString(),
                endDate: endDate.toISOString(),
                durationHours: calculatedDuration,
                status: 'pending'
            });

            toast({
                title: t.new_representation_success_toast_title || "Representation Saved",
                description: t.new_representation_success_toast_desc || "The request has been sent for confirmation.",
            });
            router.push(`/${locale}/representations`);

        } catch (error) {
            console.error("Failed to save representation:", error);
            toast({
                title: t.new_representation_error_toast_title || "Error",
                description: t.new_representation_error_toast_desc || "Could not save representation. Please try again.",
                variant: "destructive",
            });
        } finally {
            setIsSubmitting(false);
        }
    };
    
    const pageTitle = t.new_representation_page_title || "New Representation";

    if (isLoading || !user) {
        return (
            <AppLayout pageTitle={pageTitle} locale={locale}>
                <div className="flex-1 space-y-8 p-4 md:p-8 flex justify-center items-center">
                    <Loader2 className="h-10 w-10 animate-spin text-primary" />
                </div>
            </AppLayout>
        );
    }
    
    return (
        <AppLayout pageTitle={pageTitle} locale={locale}>
            <div className="flex-1 space-y-6 p-4 md:p-8 max-w-2xl mx-auto">
                 <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                       <Link href={`/${locale}/representations`}>
                            <ArrowLeft className="h-5 w-5" />
                        </Link>
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight font-headline">{pageTitle}</h1>
                        <div className="text-sm text-muted-foreground mt-2">
                            <Link href={`/${locale}/dashboard`} className="hover:underline">{t.representations_breadcrumb_dashboard || "Dashboard"}</Link>
                            <span className="mx-1">/</span>
                            <Link href={`/${locale}/representations`} className="hover:underline">{t.representations_breadcrumb_current || "My Representations"}</Link>
                            <span className="mx-1">/</span>
                            <span className="font-medium text-foreground">{t.new_representation_breadcrumb_current || "New"}</span>
                        </div>
                    </div>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle className="font-headline text-xl">{t.new_representation_card_title || "Enter Representation Details"}</CardTitle>
                        <CardDescription>{t.new_representation_card_desc || "Select the dentist you represented and the time period."}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                                <FormField
                                    control={form.control}
                                    name="representedDentistId"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>{t.new_representation_form_dentist_label || "Represented Dentist"}</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder={t.new_representation_form_dentist_placeholder || "Select a dentist..."} />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {dentists.map((dentist) => (
                                                        <SelectItem key={dentist.id} value={dentist.id}>
                                                            {dentist.name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                
                                <FormField
                                    control={form.control}
                                    name="date"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-col">
                                            <FormLabel>{t.new_representation_form_date_label || "Date"}</FormLabel>
                                            <DatePickerInput
                                                value={field.value}
                                                onChange={field.onChange}
                                                disabled={(date) => date > new Date()}
                                            />
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <div className="grid grid-cols-2 gap-4">
                                     <FormField
                                        control={form.control}
                                        name="startTime"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>{t.new_representation_form_start_time_label || "Start Time"}</FormLabel>
                                                <div className="grid grid-cols-2 gap-2">
                                                    <Select
                                                        onValueChange={(h) => field.onChange(`${h}:${(field.value || '00:00').split(':')[1]}`)}
                                                        value={(field.value || '11:00').split(':')[0]}
                                                    >
                                                        <FormControl><SelectTrigger><SelectValue placeholder="Hour" /></SelectTrigger></FormControl>
                                                        <SelectContent>
                                                            {hours.map((hour) => (
                                                                <SelectItem key={`start-h-${hour}`} value={hour}>{hour}</SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                    <Select
                                                        onValueChange={(m) => field.onChange(`${(field.value || '00:00').split(':')[0]}:${m}`)}
                                                        value={(field.value || '11:00').split(':')[1]}
                                                    >
                                                        <FormControl><SelectTrigger><SelectValue placeholder="Minute" /></SelectTrigger></FormControl>
                                                        <SelectContent>
                                                            {minutes.map((minute) => (
                                                                <SelectItem key={`start-m-${minute}`} value={minute}>{minute}</SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                     <FormField
                                        control={form.control}
                                        name="endTime"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>{t.new_representation_form_end_time_label || "End Time"}</FormLabel>
                                                <div className="grid grid-cols-2 gap-2">
                                                     <Select
                                                        onValueChange={(h) => field.onChange(`${h}:${(field.value || '00:00').split(':')[1]}`)}
                                                        value={(field.value || '12:00').split(':')[0]}
                                                    >
                                                        <FormControl><SelectTrigger><SelectValue placeholder="Hour" /></SelectTrigger></FormControl>
                                                        <SelectContent>
                                                            {hours.map((hour) => (
                                                                <SelectItem key={`end-h-${hour}`} value={hour}>{hour}</SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                    <Select
                                                        onValueChange={(m) => field.onChange(`${(field.value || '00:00').split(':')[0]}:${m}`)}
                                                        value={(field.value || '12:00').split(':')[1]}
                                                    >
                                                        <FormControl><SelectTrigger><SelectValue placeholder="Minute" /></SelectTrigger></FormControl>
                                                        <SelectContent>
                                                            {minutes.map((minute) => (
                                                                <SelectItem key={`end-m-${minute}`} value={minute}>{minute}</SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <div className="flex justify-end gap-4 pt-4">
                                    <Button type="button" variant="outline" onClick={() => router.back()}>{t.new_representation_form_cancel_button || "Cancel"}</Button>
                                    <Button type="submit" disabled={isSubmitting}>
                                        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                        {t.new_representation_form_save_button || "Save Representation"}
                                    </Button>
                                </div>
                            </form>
                        </Form>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    )
}
