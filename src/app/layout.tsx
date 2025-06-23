
// This is the new root layout, required by the App Router.
// It is intentionally minimal. The main layout styling is in /[locale]/layout.tsx.
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // The lang attribute will be set by the layout inside the [locale] folder.
    <html lang="en" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
