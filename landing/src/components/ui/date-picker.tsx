import { isSameDay } from "date-fns";
import ReactDatePicker from "react-datepicker";
import { cn } from "@/lib/utils";

import "react-datepicker/dist/react-datepicker.css";

export type DatePickerProps = {
  selected?: Date | null;
  onSelect?: (date: Date | undefined) => void;
  minDate?: Date;
  maxDate?: Date;
  filterDate?: (date: Date) => boolean;
  /** Dates styled as locked (still selectable unless also filtered). */
  lockedDates?: Date[];
  openToDate?: Date;
  onMonthChange?: (date: Date) => void;
  inline?: boolean;
  className?: string;
  calendarClassName?: string;
  placeholderText?: string;
  dateFormat?: string;
  disabled?: boolean;
};

export function DatePicker({
  selected,
  onSelect,
  minDate,
  maxDate,
  filterDate,
  lockedDates,
  openToDate,
  onMonthChange,
  inline = true,
  className,
  calendarClassName,
  placeholderText,
  dateFormat = "MMM d, yyyy",
  disabled,
}: DatePickerProps) {
  return (
    <div className={cn("kwoka-datepicker", className)}>
      <ReactDatePicker
        selected={selected ?? null}
        onChange={(date) => onSelect?.(date ?? undefined)}
        onMonthChange={onMonthChange}
        openToDate={openToDate}
        minDate={minDate}
        maxDate={maxDate}
        filterDate={filterDate}
        inline={inline}
        disabled={disabled}
        placeholderText={placeholderText}
        dateFormat={dateFormat}
        calendarClassName={cn("kwoka-datepicker-calendar", calendarClassName)}
        dayClassName={(date) =>
          lockedDates?.some((locked) => isSameDay(locked, date)) ? "kwoka-day-locked" : undefined
        }
      />
    </div>
  );
}
