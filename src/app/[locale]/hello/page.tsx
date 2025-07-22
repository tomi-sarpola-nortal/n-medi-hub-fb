
"use client";

import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useParams } from 'next/navigation';

export default function HelloPage() {
  const params = useParams();
  const locale = Array.isArray(params.locale) ? params.locale[0] : params.locale || 'en';

  return (
    <div className="flex flex-col items-center justify-center min-h-screen space-y-6 p-4 md:p-8">
      <h1 className="text-3xl font-bold tracking-tight font-headline">Hello World</h1>
      <p>This is a simple test page.</p>
      <p>
        Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
      </p>
      <Button asChild>
        <Link href={`/${locale}/login`}>Back to Login</Link>
      </Button>
    </div>
  );
}
