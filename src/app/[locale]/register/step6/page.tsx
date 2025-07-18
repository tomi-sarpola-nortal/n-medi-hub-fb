
"use client";

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Info, FileText } from 'lucide-react';
import AuthLayout from '@/components/auth/AuthLayout';
import RegistrationStepper from '@/components/auth/RegistrationStepper';
import { 
  getRegistrationData, 
  clearRegistrationData,
  updateRegistrationData,
  TITLES_MAP,
  NATIONALITIES_MAP,
  STATES_MAP,
  PROFESSIONAL_TITLES,
  DENTAL_SPECIALIZATIONS,
  HEALTH_INSURANCE_CONTRACTS,
  getTranslationKey,
  getTranslationKeysForArray,
  type RegistrationData, // Import the type
} from '@/lib/registrationStore';
import { auth } from '@/lib/firebaseConfig';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { createPerson } from '@/services/personService';
import { copyFileToNewLocation, deleteFileByUrl } from '@/services/storageService';
import type { PersonCreationData } from '@/lib/types';
import { format } from 'date-fns';

// Helper for client-side translations
const getClientTranslations = (locale: string) => {
  try {
    const register = locale === 'de' ? require('../../../../../locales/de/register.json') : require('../../../../../locales/en/register.json');
    const common = locale === 'de' ? require('../../../../../locales/de/common.json') : require('../../../../../locales/en/common.json');
    return { ...register, ...common };
  } catch (e) {
    console.warn("Translation file not found for register/step6, falling back to en", e);
    const register = require('../../../../../locales/en/register.json');
    const common = require('../../../../../locales/en/common.json');
    return { ...register, ...common };
  }
};

interface ReviewSectionProps {
  title: string;
  data: { label: string; value?: string | string[] | null | Date }[];
  locale: string;
  t: Record<string, string>;
}

const ReviewSection: React.FC<ReviewSectionProps> = ({ title, data, locale, t }) => {
  const formatDate = (dateValue?: string | Date | null): string => {
    if (!dateValue) return t.register_review_not_provided || "Not provided";
    try {
      return format(new Date(dateValue), 'dd.MM.yyyy');
    } catch {
      return String(dateValue); // Fallback if not a valid date string for formatting
    }
  };

  const renderValue = (itemValue?: string | string[] | null | Date) => {
    if (itemValue === undefined || itemValue === null || (typeof itemValue === 'string' && itemValue.trim() === '') || (Array.isArray(itemValue) && itemValue.length === 0) ) {
      return <span className="text-muted-foreground italic">{t.register_review_not_provided || "Not provided"}</span>;
    }
    
    if (Array.isArray(itemValue)) {
      return itemValue.join(', ');
    }
    if (itemValue instanceof Date) {
        return formatDate(itemValue);
    }
    
    if (typeof itemValue === 'string' && (itemValue.endsWith('.pdf') || itemValue.endsWith('.jpg') || itemValue.endsWith('.jpeg') || itemValue.endsWith('.png'))) {
        return (
            <div className="flex items-center space-x-2 text-sm text-foreground">
                <FileText className="h-4 w-4 text-primary" />
                <span>{itemValue}</span>
            </div>
        );
    }
    return String(itemValue);
  };

  return (
    <div className="mb-6">
      <h3 className="text-lg font-semibold font-headline mb-3 text-primary">{title}</h3>
      <div className="space-y-2">
        {data.map((item, index) => (
          <div key={index} className="flex flex-col sm:flex-row sm:justify-between sm:items-center py-2 border-b border-border last:border-b-0">
            <p className="text-sm font-medium text-muted-foreground">{item.label}:</p>
            <div className="text-sm text-foreground text-left sm:text-right">{renderValue(item.value)}</div>
          </div>
        ))}
      </div>
    </div>
  );
};


export default function RegisterStep6Page() {
  const router = useRouter();
  const pathname = usePathname();
  const currentLocale = pathname.split('/')[1] || 'en';
  
  const [t, setT] = useState<Record<string, string> | null>(null);

  useEffect(() => {
    setT(getClientTranslations(currentLocale));
  }, [currentLocale]);


  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [registrationData, setRegistrationData] = useState<RegistrationData | null>(null);

  useEffect(() => {
    const storedData = getRegistrationData();
    if ((!storedData.email || !storedData.password || !storedData.firstName || !storedData.currentProfessionalTitle || !storedData.practiceName) && t) {
      toast({
        title: t.register_step2_missing_data_title || "Missing Information",
        description: t.register_step2_missing_data_desc || "Essential information from previous steps is missing. Please start over.",
        variant: "destructive",
      });
      router.replace('/register/step1');
    } else {
      setRegistrationData(storedData);
      setAgreedToTerms(storedData.agreedToTerms || false);
    }
  }, [router, toast, t]);

  const handleSubmit = async () => {
    if (!registrationData || !registrationData.email || !registrationData.password) {
      toast({ title: "Error", description: "Critical registration data is missing.", variant: "destructive" });
      return;
    }
    if (!agreedToTerms) {
        toast({ title: t!.register_step6_terms_error_title || "Terms not agreed", description: t!.register_step6_terms_error_desc || "Please agree to the terms and conditions.", variant: "destructive" });
        return;
    }

    setIsLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, registrationData.email, registrationData.password);
      const firebaseUser = userCredential.user;
      const newUserId = firebaseUser.uid;

      const personDataToCreate: PersonCreationData = {
        name: `${registrationData.title || ''} ${registrationData.firstName} ${registrationData.lastName}`.trim(),
        email: registrationData.email,
        role: registrationData.role || 'dentist', 
        region: registrationData.stateOrProvince || 'N/A', 
        dentistId: registrationData.dentistId || undefined, 
        avatarUrl: `https://avatar.vercel.sh/${registrationData.email}.png?size=100`, 
        status: 'pending',
        otpEnabled: false,
        notificationSettings: { inApp: true, email: false },
        stateChamberId: 'wien',
        title: registrationData.title,
        firstName: registrationData.firstName,
        lastName: registrationData.lastName,
        dateOfBirth: registrationData.dateOfBirth ? format(new Date(registrationData.dateOfBirth), 'yyyy-MM-dd') : undefined,
        placeOfBirth: registrationData.placeOfBirth,
        nationality: registrationData.nationality,
        streetAddress: registrationData.streetAddress,
        postalCode: registrationData.postalCode,
        city: registrationData.city,
        stateOrProvince: registrationData.stateOrProvince,
        phoneNumber: registrationData.phoneNumber,
        idDocumentUrl: registrationData.idDocumentUrl,
        idDocumentName: registrationData.idDocumentName,
        currentProfessionalTitle: registrationData.currentProfessionalTitle,
        specializations: registrationData.specializations,
        languages: registrationData.languages,
        graduationDate: registrationData.graduationDate ? format(new Date(registrationData.graduationDate), 'yyyy-MM-dd') : undefined,
        university: registrationData.university,
        approbationNumber: registrationData.approbationNumber,
        approbationDate: registrationData.approbationDate ? format(new Date(registrationData.approbationDate), 'yyyy-MM-dd') : undefined,
        diplomaUrl: registrationData.diplomaUrl,
        diplomaName: registrationData.diplomaName,
        approbationCertificateUrl: registrationData.approbationCertificateUrl,
        approbationCertificateName: registrationData.approbationCertificateName,
        specialistRecognitionUrl: registrationData.specialistRecognitionUrl,
        specialistRecognitionName: registrationData.specialistRecognitionName,
        practiceName: registrationData.practiceName,
        practiceStreetAddress: registrationData.practiceStreetAddress,
        practicePostalCode: registrationData.practicePostalCode,
        practiceCity: registrationData.practiceCity,
        practicePhoneNumber: registrationData.practicePhoneNumber,
        practiceFaxNumber: registrationData.practiceFaxNumber,
        practiceEmail: registrationData.practiceEmail,
        practiceWebsite: registrationData.practiceWebsite,
        healthInsuranceContracts: registrationData.healthInsuranceContracts,
      };

      const moveAndUpdateLink = async (
        urlKey: keyof RegistrationData,
        nameKey: keyof RegistrationData,
        targetFolder: 'id_documents' | 'qualifications'
      ) => {
        const sourceUrl = registrationData[urlKey] as string | undefined;
        const fileName = registrationData[nameKey] as string | undefined;
        
        if (sourceUrl && fileName) {
            const targetPath = `users/${newUserId}/${targetFolder}/${fileName}`;
            const newUrl = await copyFileToNewLocation(sourceUrl, targetPath);
            (personDataToCreate as any)[urlKey] = newUrl;
            await deleteFileByUrl(sourceUrl);
        }
      };
      
      const fileMovePromises = [
          moveAndUpdateLink('idDocumentUrl', 'idDocumentName', 'id_documents'),
          moveAndUpdateLink('diplomaUrl', 'diplomaName', 'qualifications'),
          moveAndUpdateLink('approbationCertificateUrl', 'approbationCertificateName', 'qualifications'),
          moveAndUpdateLink('specialistRecognitionUrl', 'specialistRecognitionName', 'qualifications'),
      ];

      await Promise.all(fileMovePromises);

      await createPerson(newUserId, personDataToCreate, currentLocale);

      clearRegistrationData();
      toast({
        title: t!.register_step6_success_title || "Registration Submitted",
        description: t!.register_step6_success_desc || "Your application has been successfully submitted for review.",
      });
      router.push('/register/success'); 

    } catch (error: any) {
      toast({
        title: t!.register_step6_submit_error_title || "Submission Failed",
        description: error.message || t!.register_step6_submit_error_desc || "An error occurred while submitting your application. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!registrationData || !t) {
    return (
      <AuthLayout pageTitle="Loading..." pageSubtitle="Loading review data...">
        <div className="flex justify-center items-center h-32">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AuthLayout>
    );
  }
  
  const personalDataItems = [
    { label: t.register_step2_label_title || "Title", value: t[getTranslationKey(registrationData.title, TITLES_MAP) || ''] || registrationData.title },
    { label: t.register_step2_label_firstName || "First Name", value: registrationData.firstName },
    { label: t.register_step2_label_lastName || "Last Name", value: registrationData.lastName },
    { label: t.register_step2_label_dateOfBirth || "Date of Birth", value: registrationData.dateOfBirth ? format(new Date(registrationData.dateOfBirth), 'dd.MM.yyyy') : null },
    { label: t.register_step2_label_placeOfBirth || "Place of Birth", value: registrationData.placeOfBirth },
    { label: t.register_step2_label_nationality || "Nationality", value: t[getTranslationKey(registrationData.nationality, NATIONALITIES_MAP) || ''] || registrationData.nationality },
    { label: t.register_step2_label_streetAddress || "Street Address", value: registrationData.streetAddress },
    { label: t.register_step2_label_postalCode || "Postal Code", value: registrationData.postalCode },
    { label: t.register_step2_label_city || "City", value: registrationData.city },
    { label: t.register_step2_label_stateOrProvince || "State/Province", value: t[getTranslationKey(registrationData.stateOrProvince, STATES_MAP) || ''] || registrationData.stateOrProvince },
    { label: t.register_step2_label_phoneNumber || "Phone Number", value: registrationData.phoneNumber },
    { label: t.register_label_email || "Email", value: registrationData.email },
    { label: t.register_step2_label_idDocument || "ID Document", value: registrationData.idDocumentName },
  ];

  const profQualDataItems = [
    { label: t.register_step4_label_prof_title || "Professional Title", value: t[getTranslationKeysForArray([registrationData.currentProfessionalTitle!], PROFESSIONAL_TITLES)[0]] || registrationData.currentProfessionalTitle },
    { label: t.register_step4_label_specializations || "Specializations", value: getTranslationKeysForArray(registrationData.specializations, DENTAL_SPECIALIZATIONS).map(key => t[key] || key).join(', ') },
    { label: t.register_step4_label_languages || "Languages", value: registrationData.languages?.join(', ') },
    { label: t.register_step4_label_graduation_date || "Graduation Date", value: registrationData.graduationDate ? format(new Date(registrationData.graduationDate), 'dd.MM.yyyy') : null },
    { label: t.register_step4_label_university || "University", value: registrationData.university },
    { label: t.register_step4_label_approbation_number || "Approbation Number", value: registrationData.approbationNumber },
    { label: t.register_step4_label_approbation_date || "Approbation Date", value: registrationData.approbationDate ? format(new Date(registrationData.approbationDate), 'dd.MM.yyyy') : null },
    { label: t.register_step4_label_diploma || "Diploma File", value: registrationData.diplomaName },
    { label: t.register_step4_label_approbation_cert || "Approbation Cert. File", value: registrationData.approbationCertificateName },
    { label: t.register_step4_label_specialist_recognition || "Specialist Recog. File", value: registrationData.specialistRecognitionName },
  ];

  const practiceInfoDataItems = [
    { label: t.register_step5_label_practiceName || "Practice Name", value: registrationData.practiceName },
    { label: t.register_step5_label_practiceStreetAddress || "Practice Street Address", value: registrationData.practiceStreetAddress },
    { label: t.register_step5_label_practicePostalCode || "Practice Postal Code", value: registrationData.practicePostalCode },
    { label: t.register_step5_label_practiceCity || "Practice City", value: registrationData.practiceCity },
    { label: t.register_step5_label_practicePhoneNumber || "Practice Phone", value: registrationData.practicePhoneNumber },
    { label: t.register_step5_label_practiceFaxNumber || "Practice Fax", value: registrationData.practiceFaxNumber },
    { label: t.register_step5_label_practiceEmail || "Practice Email", value: registrationData.practiceEmail },
    { label: t.register_step5_label_practiceWebsite || "Practice Website", value: registrationData.practiceWebsite },
    { label: t.register_step5_label_healthInsuranceContracts || "Health Insurance Contracts", value: getTranslationKeysForArray(registrationData.healthInsuranceContracts, HEALTH_INSURANCE_CONTRACTS).map(key => t[key] || key).join(', ') },
  ];


  return (
    <AuthLayout
      pageTitle={t.register_page_main_title || "Registration"}
      pageSubtitle={t.register_step6_subtitle || "Please review your data before submission."}
      showBackButton={true}
      backButtonHref="/login" // Or to a general "cancel registration" page
      backButtonTextKey="register_back_to_login"
    >
      <div className="w-full max-w-3xl">
        <RegistrationStepper currentStep={6} totalSteps={6} />
        <Card className="shadow-xl w-full">
          <CardHeader className="text-left">
            <CardTitle className="font-headline text-2xl">{t.register_step6_card_title || "Review Your Data"}</CardTitle>
            <CardDescription>{t.register_step6_card_description || "Please verify your information carefully before submitting your application."}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-8">
            <div className="p-4 bg-accent/20 border border-primary/50 rounded-md flex items-start space-x-3">
              <Info className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
              <p className="text-sm text-foreground">{t.register_step6_info_message || "Your application will be reviewed by the Dental Chamber. You will receive an email with your Dentist ID upon successful review."}</p>
            </div>

            <ReviewSection title={t.register_step2_card_title || "Personal Data"} data={personalDataItems} locale={currentLocale} t={t} />
            <ReviewSection title={t.register_step4_card_title || "Professional Qualifications"} data={profQualDataItems} locale={currentLocale} t={t}/>
            <ReviewSection title={t.register_step5_card_title || "Practice Information"} data={practiceInfoDataItems} locale={currentLocale} t={t}/>

            <div className="pt-4 space-y-4">
              <div className="flex items-start space-x-2">
                <Checkbox 
                    id="terms" 
                    checked={agreedToTerms}
                    onCheckedChange={(checked) => {
                        setAgreedToTerms(checked as boolean);
                        updateRegistrationData({ agreedToTerms: checked as boolean });
                    }}
                    aria-label={t.register_step6_terms_checkbox_label || "Agree to terms"}
                />
                <div className="grid gap-1.5 leading-none">
                    <Label htmlFor="terms" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                        {t.register_step6_terms_checkbox_text_part1 || "I confirm the accuracy of my details and agree to the processing of my data according to the " }
                        <a href="/privacy-policy" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                        {t.register_step6_terms_checkbox_text_part2_link || "privacy policy"}
                        </a>.
                        <span className="text-destructive">*</span>
                    </Label>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-between pt-6 space-y-2 sm:space-y-0 sm:space-x-2">
              <Button type="button" variant="outline" onClick={() => router.push('/register/step5')} disabled={isLoading}>
                {t.register_back_button || "Back"}
              </Button>
              <Button 
                type="button" 
                onClick={handleSubmit} 
                className="bg-primary hover:bg-primary/90 text-primary-foreground h-11 text-base" 
                disabled={isLoading || !agreedToTerms}
              >
                {isLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : (t.register_step6_button_submit || "SUBMIT APPLICATION")}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </AuthLayout>
  );
}
