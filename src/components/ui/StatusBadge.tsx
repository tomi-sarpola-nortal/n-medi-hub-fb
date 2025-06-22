
"use client";

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface StatusBadgeProps {
  status: 'active' | 'in-review' | 'inactive';
  children: React.ReactNode;
  className?: string;
}

export const StatusBadge = ({ status, children, className }: StatusBadgeProps) => {
  const statusStyles = {
    'active': {
      backgroundColor: 'hsl(var(--status-success-background))',
      color: 'hsl(var(--status-success-foreground))',
    },
    'in-review': {
      backgroundColor: 'hsl(var(--status-warning-background))',
      color: 'hsl(var(--status-warning-foreground))',
    },
    'inactive': {
      backgroundColor: 'hsl(var(--status-destructive-background))',
      color: 'hsl(var(--status-destructive-foreground))',
    },
  };
  
  return (
    <Badge style={statusStyles[status]} className={cn("border-transparent font-medium", className)}>
      {children}
    </Badge>
  );
};
