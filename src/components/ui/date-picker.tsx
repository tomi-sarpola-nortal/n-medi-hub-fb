"use client";

import * as React from "react";
import { format, parse, isValid } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

interface DatePickerInputProps {
  value?: Date;
  onChange: (date?: Date) => void;
  placeholder?: string;
  disabled?: ((date: Date) => boolean) | boolean;
}

export function DatePickerInput({
  value,
  onChange,
  placeholder = "YYYY-MM-DD",
  disabled,
}: DatePickerInputProps) {
  const { toast } = useToast();
  const [inputValue, setInputValue] = React.useState<string>(
    value ? format(value, "yyyy-MM-dd") : ""
  );
  const [isPopoverOpen, setIsPopoverOpen] = React.useState(false);

  React.useEffect(() => {
    if (value) {
      if (isValid(value)) {
        setInputValue(format(value, "yyyy-MM-dd"));
      }
    } else {
      setInputValue("");
    }
  }, [value]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const handleInputBlur = () => {
    if (inputValue) {
      const parsedDate = parse(inputValue, "yyyy-MM-dd", new Date());
      if (isValid(parsedDate)) {
        if (typeof disabled === 'function' && disabled(parsedDate)) {
          toast({
            title: "Invalid Date",
            description: "This date is not allowed.",
            variant: "destructive",
          });
          return;
        }
        onChange(parsedDate);
      } else {
        toast({
          title: "Invalid Date Format",
          description: "Please use YYYY-MM-DD format.",
          variant: "destructive",
        });
        onChange(undefined);
      }
    } else {
      onChange(undefined);
    }
  };

  const handleDateSelect = (selectedDate?: Date) => {
    if (selectedDate) {
      onChange(selectedDate);
      setInputValue(format(selectedDate, "yyyy-MM-dd"));
    }
    setIsPopoverOpen(false);
  };

  const isDateDisabled = typeof disabled === 'function' ? disabled : undefined;

  return (
    <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
      <div className="relative">
        <Input
          value={inputValue}
          onChange={handleInputChange}
          onBlur={handleInputBlur}
          placeholder={placeholder}
          className="pr-10"
        />
        <PopoverTrigger asChild>
            <Button
                type="button"
                variant="ghost"
                className="absolute right-0 top-0 h-full px-3"
            >
                <CalendarIcon className="h-4 w-4 text-muted-foreground" />
            </Button>
        </PopoverTrigger>
      </div>
      <PopoverContent className="w-auto p-0">
        <Calendar
          mode="single"
          selected={value}
          onSelect={handleDateSelect}
          initialFocus
          disabled={isDateDisabled}
        />
      </PopoverContent>
    </Popover>
  );
}
