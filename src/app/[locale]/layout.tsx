
import type {Metadata} from 'next';
import '../globals.css';
import { Providers } from '@/context/providers';

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
      <body className="font-body antialiased">
        <Providers>
          {children}
        </Providers>
      </body>
  );
}
