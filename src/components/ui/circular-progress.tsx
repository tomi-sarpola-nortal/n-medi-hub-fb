
"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface CircularProgressProps extends React.SVGProps<SVGSVGElement> {
  value: number; // Percentage value (0-100)
  radius?: number;
  strokeWidth?: number;
  label?: React.ReactNode;
  showValue?: boolean;
  valueText?: string;
  className?: string;
  textClassName?: string;
  progressColor?: string; // e.g., "hsl(var(--primary))"
  backgroundColor?: string; // e.g., "hsl(var(--muted))"
}

const CircularProgress = React.forwardRef<
  SVGSVGElement,
  CircularProgressProps
>(
  (
    {
      value,
      radius = 60,
      strokeWidth = 10,
      label,
      showValue = true,
      valueText,
      className,
      textClassName,
      progressColor = "hsl(var(--primary))",
      backgroundColor = "hsl(var(--muted))",
      ...props
    },
    ref
  ) => {
    const normalizedRadius = radius - strokeWidth / 2;
    const circumference = normalizedRadius * 2 * Math.PI;
    const offset = circumference - (value / 100) * circumference;

    return (
      <div
        className={cn("relative flex flex-col items-center justify-center", className)}
        style={{ width: radius * 2, height: radius * 2 }}
      >
        <svg
          ref={ref}
          height={radius * 2}
          width={radius * 2}
          viewBox={`0 0 ${radius * 2} ${radius * 2}`}
          className="-rotate-90"
          {...props}
        >
          <circle
            stroke={backgroundColor}
            fill="transparent"
            strokeWidth={strokeWidth}
            r={normalizedRadius}
            cx={radius}
            cy={radius}
          />
          <circle
            stroke={progressColor}
            fill="transparent"
            strokeWidth={strokeWidth}
            strokeDasharray={circumference + " " + circumference}
            style={{ strokeDashoffset: offset }}
            strokeLinecap="round"
            r={normalizedRadius}
            cx={radius}
            cy={radius}
          />
        </svg>
        {(label || (showValue && valueText) || (showValue && value !== undefined)) && (
          <div
            className={cn(
              "absolute flex flex-col items-center justify-center text-center",
              textClassName
            )}
          >
            {label}
            {showValue && valueText && <span className="text-2xl font-bold">{valueText.split('/')[0]}</span>}
            {showValue && valueText && <span className="text-xs text-muted-foreground">/{valueText.split('/')[1]}</span>}
            {showValue && !valueText && value !== undefined && (
              <span className="text-xl font-bold">{`${Math.round(value)}%`}</span>
            )}
          </div>
        )}
      </div>
    );
  }
);
CircularProgress.displayName = "CircularProgress";

export { CircularProgress };
