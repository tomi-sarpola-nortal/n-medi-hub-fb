
"use client";

import { cn } from "@/lib/utils";
import { Badge, type BadgeProps } from "@/components/ui/badge";

interface TypeBadgeProps extends BadgeProps {
  type: 'vorlage' | 'leitlinie' | 'empfehlung';
}

export const TypeBadge = ({ type, children, className, ...props }: TypeBadgeProps) => {
  const typeClasses = {
    'vorlage': 'bg-badge-vorlage text-badge-vorlage-foreground hover:bg-badge-vorlage/90',
    'leitlinie': 'bg-badge-leitlinie text-badge-leitlinie-foreground hover:bg-badge-leitlinie/90',
    'empfehlung': 'bg-badge-empfehlung text-badge-empfehlung-foreground hover:bg-badge-empfehlung/90',
  };
  
  return (
    <Badge {...props} className={cn("border-transparent font-medium", typeClasses[type], className)}>
      {children}
    </Badge>
  );
};
