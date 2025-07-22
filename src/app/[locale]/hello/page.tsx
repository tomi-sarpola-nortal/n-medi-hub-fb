
"use client";

import AppLayout from '@/components/layout/AppLayout';
import { useParams } from 'next/navigation';

export default function HelloPage() {
  const params = useParams();
  const locale = typeof params.locale === 'string' ? params.locale : 'en';

  return (
    <AppLayout pageTitle="Hello World" locale={locale}>
      <div className="flex-1 space-y-6 p-4 md:p-8">
        <h1 className="text-3xl font-bold tracking-tight font-headline">Hello World</h1>
        <p>This is a simple test page.</p>
      </div>
    </AppLayout>
  );
}

    