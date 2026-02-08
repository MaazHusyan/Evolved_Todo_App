"use client";

import * as React from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon, ChevronUp, ChevronDown, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";

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
    <>
      {/* Trigger Button */}
      <Button
        type="button"
        variant="outline"
        onClick={() => setIsOpen(true)}
        className={cn(
          "w-full justify-start text-left font-normal glass-input text-sm sm:text-base",
          !date && "text-muted-foreground"
        )}
      >
        <CalendarIcon className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
        {date ? (
          <span className="text-sm sm:text-base">{format(new Date(date), "PPP 'at' h:mm a")}</span>
        ) : (
          <span className="text-sm sm:text-base">{placeholder}</span>
        )}
      </Button>

      {/* Modal Dialog */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            />

            {/* Modal Content */}
            <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 pointer-events-none">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                transition={{ duration: 0.2 }}
                className="w-full max-w-sm pointer-events-auto"
              >
                <div className="glass dark:glass-dark rounded-xl sm:rounded-2xl shadow-2xl border-0">
                  {/* Header */}
                  <div className="flex items-center justify-between p-3 sm:p-4 border-b border-gray-200 dark:border-gray-700">
                    <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white">
                      Select Date & Time
                    </h3>
                    <Button
                      type="button"
                      onClick={() => setIsOpen(false)}
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 hover:bg-gray-200 dark:hover:bg-gray-700"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Calendar */}
                  <div className="p-2 sm:p-3">
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={handleDateSelect}
                      initialFocus
                      className="rounded-lg scale-90 sm:scale-100"
                    />
                  </div>

                  {/* Time Picker */}
                  <div className="p-3 sm:p-4 border-t border-gray-200 dark:border-gray-700 space-y-3">
                    <div className="flex items-center justify-center gap-2 sm:gap-3">
                      {/* Hours */}
                      <div className="flex flex-col items-center gap-1">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={incrementHours}
                          className="h-7 w-7 hover:bg-blue-500/10"
                        >
                          <ChevronUp className="h-4 w-4" />
                        </Button>
                        <div className="w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center text-xl sm:text-2xl font-bold bg-gray-100 dark:bg-gray-800 rounded-lg border-2 border-gray-300 dark:border-gray-600">
                          {hours.toString().padStart(2, "0")}
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={decrementHours}
                          className="h-7 w-7 hover:bg-blue-500/10"
                        >
                          <ChevronDown className="h-4 w-4" />
                        </Button>
                        <span className="text-[10px] sm:text-xs text-gray-600 dark:text-gray-400 font-semibold">Hours</span>
                      </div>

                      {/* Separator */}
                      <div className="text-2xl sm:text-3xl font-bold pb-6 text-gray-700 dark:text-gray-300">:</div>

                      {/* Minutes */}
                      <div className="flex flex-col items-center gap-1">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={incrementMinutes}
                          className="h-7 w-7 hover:bg-blue-500/10"
                        >
                          <ChevronUp className="h-4 w-4" />
                        </Button>
                        <div className="w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center text-xl sm:text-2xl font-bold bg-gray-100 dark:bg-gray-800 rounded-lg border-2 border-gray-300 dark:border-gray-600">
                          {minutes.toString().padStart(2, "0")}
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={decrementMinutes}
                          className="h-7 w-7 hover:bg-blue-500/10"
                        >
                          <ChevronDown className="h-4 w-4" />
                        </Button>
                        <span className="text-[10px] sm:text-xs text-gray-600 dark:text-gray-400 font-semibold">Minutes</span>
                      </div>

                      {/* AM/PM Toggle */}
                      <div className="flex flex-col items-center gap-1 pb-6">
                        <Button
                          type="button"
                          onClick={togglePeriod}
                          className={cn(
                            "w-12 h-12 sm:w-14 sm:h-14 text-base sm:text-lg font-bold transition-all rounded-lg",
                            period === "AM"
                              ? "bg-blue-600 hover:bg-blue-700 text-white ring-2 ring-blue-400"
                              : "bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300"
                          )}
                        >
                          AM
                        </Button>
                        <Button
                          type="button"
                          onClick={togglePeriod}
                          className={cn(
                            "w-12 h-12 sm:w-14 sm:h-14 text-base sm:text-lg font-bold transition-all rounded-lg",
                            period === "PM"
                              ? "bg-blue-600 hover:bg-blue-700 text-white ring-2 ring-blue-400"
                              : "bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300"
                          )}
                        >
                          PM
                        </Button>
                      </div>
                    </div>

                    {/* Preview */}
                    {selectedDate && (
                      <div className="text-center text-gray-700 dark:text-gray-300 bg-blue-50 dark:bg-blue-900/20 rounded-lg p-2 sm:p-2.5 border border-blue-200 dark:border-blue-800">
                        <p className="font-semibold text-xs sm:text-sm">
                          {format(selectedDate, "EEEE, MMMM d, yyyy")}
                        </p>
                        <p className="text-base sm:text-lg font-bold mt-0.5 text-blue-700 dark:text-blue-300">
                          {hours.toString().padStart(2, "0")}:{minutes.toString().padStart(2, "0")} {period}
                        </p>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex gap-2 pt-1">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleSetNow}
                        className="flex-1 text-xs sm:text-sm font-semibold h-9 sm:h-10"
                      >
                        Now
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleClear}
                        className="flex-1 text-xs sm:text-sm font-semibold h-9 sm:h-10"
                      >
                        Clear
                      </Button>
                      <Button
                        type="button"
                        onClick={handleApply}
                        disabled={!selectedDate}
                        className="flex-1 text-xs sm:text-sm font-semibold h-9 sm:h-10 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                      >
                        Apply
                      </Button>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
