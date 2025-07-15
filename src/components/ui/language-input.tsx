
"use client";

import * as React from "react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { X as XIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface LanguageInputProps {
  value?: string[];
  onChange: (languages: string[]) => void;
  placeholder?: string;
  className?: string;
}

export const LanguageInput = React.forwardRef<HTMLInputElement, LanguageInputProps>(
  ({ value = [], onChange, placeholder, className }, ref) => {
    const [inputValue, setInputValue] = React.useState("");

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter" && inputValue.trim()) {
        e.preventDefault();
        const newLanguage = inputValue.trim();
        if (newLanguage && !value.includes(newLanguage)) {
          onChange([...value, newLanguage]);
        }
        setInputValue("");
      }
    };

    const removeLanguage = (langToRemove: string) => {
      onChange(value.filter((lang) => lang !== langToRemove));
    };

    return (
      <div className={cn("space-y-2", className)}>
        <Input
          ref={ref}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
        />
        <div className="flex flex-wrap gap-2">
          {value.map((lang) => (
            <Badge key={lang} variant="secondary" className="text-sm font-medium py-1 px-3">
              {lang}
              <button
                type="button"
                className="ml-2 rounded-full outline-none ring-offset-background focus:ring-2 focus:ring-ring focus:ring-offset-2"
                onClick={() => removeLanguage(lang)}
                aria-label={`Remove ${lang}`}
              >
                <XIcon className="h-4 w-4 text-muted-foreground hover:text-foreground" />
              </button>
            </Badge>
          ))}
        </div>
      </div>
    );
  }
);

LanguageInput.displayName = "LanguageInput";
