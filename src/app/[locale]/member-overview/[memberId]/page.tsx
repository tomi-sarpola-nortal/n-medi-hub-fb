import { notFound } from 'next/navigation';
import { getPersonById } from '@/services/personService';
import { getTranslations } from '@/lib/translations';
import { getTrainingHistoryForUser } from '@/services/trainingHistoryService';
import MemberProfileView from '@/components/member-overview/MemberProfileView';

interface MemberReviewPageProps {
  params: { memberId: string; locale: string };
  searchParams: { [key: string]: string | string[] | undefined };
}

export default async function MemberReviewPage({ params, searchParams }: MemberReviewPageProps) {
  const t = getTranslations(params.locale);
  const person = await getPersonById(params.memberId);

  if (!person) {
    notFound();
  }

  const trainingHistory = await getTrainingHistoryForUser(person.id);
  const defaultTab = typeof searchParams.tab === 'string' ? searchParams.tab : undefined;

  return (
    <MemberProfileView 
      person={person}
      trainingHistory={trainingHistory}
      t={t}
      locale={params.locale}
      defaultTab={defaultTab}
    />
  );
}