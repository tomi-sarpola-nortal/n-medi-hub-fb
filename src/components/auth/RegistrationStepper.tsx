
"use client";

import { cn } from "@/lib/utils";

interface RegistrationStepperProps {
  currentStep: number;
  totalSteps: number;
  className?: string;
}

export default function RegistrationStepper({
  currentStep,
  totalSteps = 6,
  className,
}: RegistrationStepperProps) {
  const steps = Array.from({ length: totalSteps }, (_, i) => i + 1);

  return (
    <div className={cn("flex items-center justify-center space-x-2 sm:space-x-4 mb-8", className)}>
      {steps.map((step, index) => (
        <div key={step} className="flex items-center">
          <div
            className={cn(
              "flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-full border-2 transition-all duration-300",
              step < currentStep ? "bg-primary border-primary text-primary-foreground" :
              step === currentStep
                ? "bg-primary border-primary text-primary-foreground scale-110 shadow-lg"
                : "bg-card border-border text-muted-foreground"
            )}
          >
            <span className="font-medium text-sm sm:text-base">{step}</span>
          </div>
          {index < steps.length - 1 && (
            <div className={cn(
              "w-8 h-1 sm:w-12 mx-1 sm:mx-2 transition-all duration-300",
              step < currentStep ? "bg-primary" : "bg-border"
            )} />
          )}
        </div>
      ))}
    </div>
  );
}
