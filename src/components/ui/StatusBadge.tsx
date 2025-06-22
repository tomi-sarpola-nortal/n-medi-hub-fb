
"use client";

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import type { Person } from "@/lib/types";

// Extends the status to include all possible values from the Person type and old mock data.
type BadgeStatus = Person['status'] | 'in-review';

interface StatusBadgeProps {
  status: BadgeStatus;
  children: React.ReactNode;
  className?: string;
}

export const StatusBadge = ({ status, children, className }: StatusBadgeProps) => {
  const statusStyles: Record<BadgeStatus, React.CSSProperties> = {
    'active': {
      backgroundColor: 'hsl(var(--status-success-background))',
      color: 'hsl(var(--status-success-foreground))',
    },
    'in-review': {
      backgroundColor: 'hsl(var(--status-warning-background))',
      color: 'hsl(var(--status-warning-foreground))',
    },
    'pending_approval': {
      backgroundColor: 'hsl(var(--status-warning-background))',
      color: 'hsl(var(--status-warning-foreground))',
    },
    'inactive': {
      backgroundColor: 'hsl(var(--status-destructive-background))',
      color: 'hsl(var(--status-destructive-foreground))',
    },
    'rejected': {
       backgroundColor: 'hsl(var(--status-destructive-background))',
       color: 'hsl(var(--status-destructive-foreground))',
    }
  };
  
  return (
    <Badge style={statusStyles[status]} className={cn("border-transparent font-medium", className)}>
      {children}
    </Badge>
  );
};
