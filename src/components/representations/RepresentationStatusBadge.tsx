
"use client";

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Clock } from "lucide-react";

interface RepresentationStatusBadgeProps {
  status: 'confirmed' | 'pending';
  children: React.ReactNode;
  className?: string;
}

export const RepresentationStatusBadge = ({ status, children, className }: RepresentationStatusBadgeProps) => {
  const statusStyles = {
    'confirmed': 'bg-status-success-background text-status-success-foreground hover:bg-status-success-background/90',
    'pending': 'bg-status-warning-background text-status-warning-foreground hover:bg-status-warning-background/90',
  };
  
  const Icon = status === 'confirmed' ? CheckCircle2 : Clock;

  return (
    <Badge className={cn("border-transparent font-medium flex items-center gap-1.5", statusStyles[status], className)}>
      <Icon className="h-4 w-4" />
      <span>{children}</span>
    </Badge>
  );
};
