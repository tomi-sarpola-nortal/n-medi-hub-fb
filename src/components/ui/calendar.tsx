
"use client"

import * as React from "react"
import { DayPicker, useNavigation } from "react-day-picker"
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react"
import { format, subYears, addYears } from 'date-fns';

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

export type CalendarProps = React.ComponentProps<typeof DayPicker>

function CalendarCaption() {
  const { goToMonth, nextMonth, previousMonth, displayMonth } = useNavigation();

  // Guard against displayMonth being undefined during initial render
  if (!displayMonth) {
    return null;
  }

  return (
    <div className="flex items-center justify-between px-1 pt-1 mb-2">
      <div className="flex items-center space-x-1">
        <Button
          onClick={() => goToMonth(subYears(displayMonth, 1))}
          variant="outline"
          className="h-7 w-7 bg-transparent p-0"
        >
          <span className="sr-only">Go to previous year</span>
          <ChevronsLeft className="h-4 w-4" />
        </Button>
        <Button
          disabled={!previousMonth}
          onClick={() => previousMonth && goToMonth(previousMonth)}
          variant="outline"
          className="h-7 w-7 bg-transparent p-0"
        >
          <span className="sr-only">Go to previous month</span>
          <ChevronLeft className="h-4 w-4" />
        </Button>
      </div>
      <span className="text-sm font-medium">
        {format(displayMonth, 'MMMM yyyy')}
      </span>
      <div className="flex items-center space-x-1">
        <Button
          disabled={!nextMonth}
          onClick={() => nextMonth && goToMonth(nextMonth)}
          variant="outline"
          className="h-7 w-7 bg-transparent p-0"
        >
          <span className="sr-only">Go to next month</span>
          <ChevronRight className="h-4 w-4" />
        </Button>
        <Button
          onClick={() => goToMonth(addYears(displayMonth, 1))}
          variant="outline"
          className="h-7 w-7 bg-transparent p-0"
        >
          <span className="sr-only">Go to next year</span>
          <ChevronsRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-3", className)}
      classNames={{
        months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
        month: "space-y-4",
        caption: "hidden", // Hide the default caption, we're replacing it
        table: "w-full border-collapse space-y-1",
        head_row: "flex",
        head_cell:
          "text-muted-foreground rounded-md w-9 font-normal text-[0.8rem]",
        row: "flex w-full mt-2",
        cell: "h-9 w-9 text-center text-sm p-0 relative [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-outside)]:bg-accent/50 [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
        day: cn(
          "h-9 w-9 p-0 font-normal aria-selected:opacity-100",
          "hover:bg-accent focus-visible:bg-accent focus-visible:outline-none" // Using custom hover/focus from buttonVariants ghost
        ),
        day_range_end: "day-range-end",
        day_selected:
          "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
        day_today: "bg-accent text-accent-foreground",
        day_outside:
          "day-outside text-muted-foreground opacity-50 aria-selected:bg-accent/50 aria-selected:text-muted-foreground",
        day_disabled: "text-muted-foreground opacity-50",
        day_range_middle:
          "aria-selected:bg-accent aria-selected:text-accent-foreground",
        day_hidden: "invisible",
        ...classNames,
      }}
      components={{
        Caption: CalendarCaption,
      }}
      {...props}
    />
  )
}
Calendar.displayName = "Calendar"

export { Calendar }
