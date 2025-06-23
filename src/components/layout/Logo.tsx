'use client';

import Image from 'next/image';
import { cn } from '@/lib/utils';

interface LogoProps {
  className?: string;
  iconSize?: number;
  portalText: string;
  hidePortalText?: boolean;
}

export default function Logo({ className, iconSize = 40, portalText, hidePortalText = false }: LogoProps) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Image
        src="https://firebasestorage.googleapis.com/v0/b/zahn-aerzte-kammer-v6.firebasestorage.app/o/logos%2Flogo-oezaek.svg?alt=media&token=09df57b3-78e7-41fd-bbfe-8ce54d339c88"
        alt="ÖZÄK Logo"
        width={iconSize}
        height={iconSize}
        className="h-auto"
        priority
      />
      {!hidePortalText && (
        <span className="font-headline text-lg font-medium text-primary" style={{ paddingLeft: '1px' }}>
            {portalText}
        </span>
      )}
    </div>
  );
}
