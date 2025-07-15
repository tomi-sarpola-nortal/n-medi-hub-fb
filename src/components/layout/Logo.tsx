'use client';

import Image from 'next/image';
import { cn } from '@/lib/utils';

interface LogoProps {
  className?: string;
  iconSize?: number;
}

export default function Logo({ className, iconSize = 120 }: LogoProps) {
  const lightLogo = 'https://firebasestorage.googleapis.com/v0/b/n-medi-portal-dev-v7.firebasestorage.app/o/logos%2FNortal25logo_positive.png?alt=media&token=f5a6b6f9-aae4-496f-91d4-0494922d3ff8';
  const darkLogo = 'https://firebasestorage.googleapis.com/v0/b/n-medi-portal-dev-v7.firebasestorage.app/o/logos%2FNortal25logo_negative.png?alt=media&token=abd98059-b36e-47d5-beae-8ca6b2dbee40';
  
  return (
    <div className={cn("flex flex-col items-start", className)}>
      <div className="dark:hidden">
        <Image
          src={lightLogo}
          alt="Nortal Logo"
          width={iconSize}
          height={iconSize / 3}
          className="h-auto"
          priority
        />
      </div>
      <div className="hidden dark:block">
        <Image
          src={darkLogo}
          alt="Nortal Logo"
          width={iconSize}
          height={iconSize / 3}
          className="h-auto"
          priority
        />
      </div>
    </div>
  );
}
