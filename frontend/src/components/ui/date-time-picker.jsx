"use client";

import * as React from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon, ChevronUp, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export function DateTimePicker({ date, setDate, placeholder = "Pick a date and time" }) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [selectedDate, setSelectedDate] = React.useState(date ? new Date(date) : undefined);

  // Convert to 12-hour format
  const [hours, setHours] = React.useState(() => {
    if (date) {
      const h = new Date(date).getHours();
      return h === 0 ? 12 : h > 12 ? h - 12 : h;
    }
    return 12;
  });

  const [minutes, setMinutes] = React.useState(
    date ? new Date(date).getMinutes() : 0
  );

  const [period, setPeriod] = React.useState(() => {
    if (date) {
      return new Date(date).getHours() >= 12 ? "PM" : "AM";
    }
    return "AM";
  });

  const incrementHours = () => {
    setHours((prev) => (prev === 12 ? 1 : prev + 1));
  };

  const decrementHours = () => {
    setHours((prev) => (prev === 1 ? 12 : prev - 1));
  };

  const incrementMinutes = () => {
    setMinutes((prev) => (prev === 59 ? 0 : prev + 1));
  };

  const decrementMinutes = () => {
    setMinutes((prev) => (prev === 0 ? 59 : prev - 1));
  };

  const togglePeriod = () => {
    setPeriod((prev) => (prev === "AM" ? "PM" : "AM"));
  };

  const handleDateSelect = (newDate) => {
    if (newDate) {
      setSelectedDate(newDate);
    }
  };

  const handleSetNow = () => {
    const now = new Date();
    setSelectedDate(now);
    const h = now.getHours();
    setHours(h === 0 ? 12 : h > 12 ? h - 12 : h);
    setMinutes(now.getMinutes());
    setPeriod(h >= 12 ? "PM" : "AM");
  };

  const handleApply = () => {
    if (selectedDate) {
      const finalDate = new Date(selectedDate);
      // Convert 12-hour to 24-hour format
      let hour24 = hours;
      if (period === "PM" && hours !== 12) {
        hour24 = hours + 12;
      } else if (period === "AM" && hours === 12) {
        hour24 = 0;
      }
      finalDate.setHours(hour24);
      finalDate.setMinutes(minutes);
      finalDate.setSeconds(0);
      finalDate.setMilliseconds(0);

      // Return full ISO string for proper backend handling
      setDate(finalDate.toISOString());
      setIsOpen(false);
    }
  };

  const handleClear = () => {
    setSelectedDate(undefined);
    setHours(12);
    setMinutes(0);
    setPeriod("AM");
    setDate("");
    setIsOpen(false);
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-full justify-start text-left font-normal glass-input text-base",
            !date && "text-muted-foreground"
          )}
        >
          <CalendarIcon className="mr-2 h-5 w-5" />
          {date ? (
            <span className="text-base">{format(new Date(date), "PPP 'at' h:mm a")}</span>
          ) : (
            <span className="text-base">{placeholder}</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-auto p-0 glass dark:glass-dark border-0 shadow-2xl"
        align="center"
        side="top"
        sideOffset={10}
      >
        <div className="flex flex-col">
          {/* Calendar */}
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={handleDateSelect}
            initialFocus
            className="rounded-t-lg text-base"
          />

          {/* Time Picker with +/- buttons */}
          <div className="p-5 border-t border-gray-200 dark:border-gray-700 space-y-4">
            <div className="flex items-center justify-center gap-4">
              {/* Hours */}
              <div className="flex flex-col items-center gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={incrementHours}
                  className="h-8 w-8 hover:bg-blue-500/10"
                >
                  <ChevronUp className="h-5 w-5" />
                </Button>
                <div className="w-16 h-16 flex items-center justify-center text-3xl font-bold bg-gray-100 dark:bg-gray-800 rounded-lg border-2 border-gray-300 dark:border-gray-600 shadow-sm">
                  {hours.toString().padStart(2, "0")}
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={decrementHours}
                  className="h-8 w-8 hover:bg-blue-500/10"
                >
                  <ChevronDown className="h-5 w-5" />
                </Button>
                <span className="text-xs text-gray-600 dark:text-gray-400 font-semibold">Hours</span>
              </div>

              {/* Separator */}
              <div className="text-3xl font-bold pb-10 text-gray-700 dark:text-gray-300">:</div>

              {/* Minutes */}
              <div className="flex flex-col items-center gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={incrementMinutes}
                  className="h-8 w-8 hover:bg-blue-500/10"
                >
                  <ChevronUp className="h-5 w-5" />
                </Button>
                <div className="w-16 h-16 flex items-center justify-center text-3xl font-bold bg-gray-100 dark:bg-gray-800 rounded-lg border-2 border-gray-300 dark:border-gray-600 shadow-sm">
                  {minutes.toString().padStart(2, "0")}
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={decrementMinutes}
                  className="h-8 w-8 hover:bg-blue-500/10"
                >
                  <ChevronDown className="h-5 w-5" />
                </Button>
                <span className="text-xs text-gray-600 dark:text-gray-400 font-semibold">Minutes</span>
              </div>

              {/* AM/PM Toggle */}
              <div className="flex flex-col items-center gap-2 pb-10">
                <Button
                  type="button"
                  onClick={togglePeriod}
                  className={cn(
                    "w-16 h-16 text-xl font-bold transition-all rounded-lg shadow-md",
                    period === "AM"
                      ? "bg-blue-600 hover:bg-blue-700 text-white shadow-lg ring-2 ring-blue-400"
                      : "bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300"
                  )}
                >
                  AM
                </Button>
                <Button
                  type="button"
                  onClick={togglePeriod}
                  className={cn(
                    "w-16 h-16 text-xl font-bold transition-all rounded-lg shadow-md",
                    period === "PM"
                      ? "bg-blue-600 hover:bg-blue-700 text-white shadow-lg ring-2 ring-blue-400"
                      : "bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300"
                  )}
                >
                  PM
                </Button>
              </div>
            </div>

            {/* Preview */}
            {selectedDate && (
              <div className="text-center text-gray-700 dark:text-gray-300 bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 border border-blue-200 dark:border-blue-800 shadow-sm">
                <p className="font-semibold text-sm">
                  {format(selectedDate, "EEEE, MMMM d, yyyy")}
                </p>
                <p className="text-xl font-bold mt-1 text-blue-700 dark:text-blue-300">
                  {hours.toString().padStart(2, "0")}:{minutes.toString().padStart(2, "0")} {period}
                </p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleSetNow}
                className="flex-1 text-base font-semibold h-11"
              >
                Now
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={handleClear}
                className="flex-1 text-base font-semibold h-11"
              >
                Clear
              </Button>
              <Button
                type="button"
                onClick={handleApply}
                disabled={!selectedDate}
                className="flex-1 text-base font-semibold h-11 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg"
              >
                Apply
              </Button>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
