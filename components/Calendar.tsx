import React, { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, CheckSquare, Square } from 'lucide-react';
import { getDaysInMonth, getFirstDayOfMonth, MONTH_NAMES, formatDate } from '../utils/dateUtils';

interface CalendarProps {
  mode: 'SINGLE' | 'MULTI';
  selectedDates: string[];
  onSelectDate: (date: string) => void;
  /**
   * Callback for bulk updates (Select/Deselect All)
   */
  onSelectedDatesChange?: (dates: string[]) => void;
  /**
   * Optional function to determine the color status of a date.
   * Used by Driver view to show their own availability history.
   */
  getDateStatus?: (date: string) => 'AVAILABLE' | 'UNAVAILABLE' | null;
}

export const Calendar: React.FC<CalendarProps> = ({ 
  mode, 
  selectedDates, 
  onSelectDate,
  onSelectedDatesChange,
  getDateStatus 
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const days = useMemo(() => getDaysInMonth(year, month), [year, month]);
  const firstDayIndex = getFirstDayOfMonth(year, month);
  
  // Compute all date strings for the current view to support "Select All"
  const currentMonthDates = useMemo(() => days.map(formatDate), [days]);
  
  // Check if all days in the current view are selected
  const isAllSelected = useMemo(() => {
    if (currentMonthDates.length === 0) return false;
    return currentMonthDates.every(d => selectedDates.includes(d));
  }, [currentMonthDates, selectedDates]);

  // Create empty placeholders for grid alignment
  const blanks = Array(firstDayIndex).fill(null);

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const handleDateClick = (date: Date) => {
    const dateStr = formatDate(date);
    onSelectDate(dateStr);
  };
  
  const toggleMonthSelection = () => {
    if (!onSelectedDatesChange) return;
    
    if (isAllSelected) {
      // Remove all current month dates from selection
      const newSelection = selectedDates.filter(d => !currentMonthDates.includes(d));
      onSelectedDatesChange(newSelection);
    } else {
      // Add all current month dates to selection (deduplicate using Set)
      const newSelection = Array.from(new Set([...selectedDates, ...currentMonthDates]));
      onSelectedDatesChange(newSelection);
    }
  };

  const isSelected = (date: Date) => {
    const dateStr = formatDate(date);
    return selectedDates.includes(dateStr);
  };

  return (
    <div className="w-full bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-4 bg-slate-50 border-b border-slate-200">
        <button 
          onClick={handlePrevMonth}
          className="p-2 hover:bg-white hover:shadow-sm rounded-full transition-all text-slate-600"
        >
          <ChevronLeft size={20} />
        </button>
        <h2 className="text-lg font-bold text-slate-800 tracking-tight">
          {MONTH_NAMES[month]} <span className="text-blue-600">{year}</span>
        </h2>
        <button 
          onClick={handleNextMonth}
          className="p-2 hover:bg-white hover:shadow-sm rounded-full transition-all text-slate-600"
        >
          <ChevronRight size={20} />
        </button>
      </div>

      {/* Bulk Action Bar (Only for Multi Mode) */}
      {mode === 'MULTI' && onSelectedDatesChange && (
        <div className="px-4 py-2 bg-slate-50 border-b border-slate-200 flex justify-end">
          <button
            onClick={toggleMonthSelection}
            className="flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-700 hover:bg-blue-50 px-3 py-1.5 rounded-lg transition-colors"
          >
            {isAllSelected ? (
              <>
                <CheckSquare size={16} />
                Deselect Month
              </>
            ) : (
              <>
                <Square size={16} />
                Select Month
              </>
            )}
          </button>
        </div>
      )}

      {/* Days Header */}
      <div className="grid grid-cols-7 text-center py-3 bg-slate-50/50 text-xs font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-100">
        <div>Sun</div>
        <div>Mon</div>
        <div>Tue</div>
        <div>Wed</div>
        <div>Thu</div>
        <div>Fri</div>
        <div>Sat</div>
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-px bg-slate-200 border-b border-slate-200">
        {blanks.map((_, idx) => (
          <div key={`blank-${idx}`} className="bg-slate-50/50 h-14 sm:h-20" />
        ))}
        
        {days.map((date) => {
          const dateStr = formatDate(date);
          const selected = isSelected(date);
          const status = getDateStatus ? getDateStatus(dateStr) : null;
          
          // Determine background color
          let bgClass = "bg-white hover:bg-slate-50";
          let textClass = "text-slate-700";
          let borderClass = "";
          
          if (selected) {
            bgClass = "bg-blue-600 shadow-inner";
            textClass = "text-white font-bold";
            borderClass = "z-10 relative";
          } else if (status === 'AVAILABLE') {
            bgClass = "bg-green-50 hover:bg-green-100";
            textClass = "text-green-700 font-medium";
          } else if (status === 'UNAVAILABLE') {
            bgClass = "bg-rose-50 hover:bg-rose-100";
            textClass = "text-rose-700 font-medium";
          }

          return (
            <button
              key={dateStr}
              onClick={() => handleDateClick(date)}
              className={`h-14 sm:h-20 flex flex-col items-center justify-center transition-all duration-200 outline-none focus:z-20 ${bgClass} ${borderClass}`}
            >
              <span className={`text-sm sm:text-lg ${textClass}`}>
                {date.getDate()}
              </span>
              
              {/* Status Indicator Dot for non-selected items */}
              {!selected && status === 'AVAILABLE' && (
                <div className="w-1.5 h-1.5 rounded-full bg-green-500 mt-1" />
              )}
              {!selected && status === 'UNAVAILABLE' && (
                <div className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-1" />
              )}
            </button>
          );
        })}
      </div>
      <div className="p-3 text-xs text-slate-400 text-center bg-slate-50">
        {mode === 'MULTI' ? 'Tap dates to select multiple' : 'Tap a date to view details'}
      </div>
    </div>
  );
};