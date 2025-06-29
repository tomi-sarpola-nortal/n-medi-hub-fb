'use client';

import Image from 'next/image';
import { cn } from '@/lib/utils';

interface LogoProps {
  className?: string;
  iconSize?: number;
}

export default function Logo({ className, iconSize = 80 }: LogoProps) {
  return (
    <div className={cn("flex flex-col items-start", className)}>
      <Image
        src="/nortal-logo.webp"
        alt="Nortal Logo"
        width={iconSize}
        height={iconSize / 3}
        className="h-auto"
        priority
      />
    </div>
  );
}