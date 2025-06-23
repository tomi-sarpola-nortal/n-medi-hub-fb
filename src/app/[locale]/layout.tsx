
import type { ReactNode } from 'react';

// The root layout at `src/app/layout.tsx` now handles the <html>, <body>, and Providers.
// This layout is now just a pass-through for its children.
export default function LocaleLayout({
  children,
}: {
  children: ReactNode;
}) {
  return <>{children}</>;
}
