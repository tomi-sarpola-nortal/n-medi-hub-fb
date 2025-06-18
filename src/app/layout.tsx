import type {Metadata} from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";

import { AuthProvider } from "@/context/auth-context";
export const metadata: Metadata = {
  title: 'Zahn Aerzte Kammer V6',
  description: 'Dental Chamber Management Portal',
};

export default function RootLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: { locale: string };
}>) {
  return (
    <html lang={params.locale || 'en'}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>

      <body className="font-body antialiased">
 <AuthProvider>
 {children}
 </AuthProvider>
        <Toaster />
      </body>
    </html>
  );
}
