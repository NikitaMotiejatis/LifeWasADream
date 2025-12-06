import { useState } from 'react';
import { useTranslation } from 'react-i18next';

interface TimePickerDropdownProps {
  value: string; // Format: "HH:MM"
  onChange: (time: string) => void;
  availableHours?: string[]; // Array of available times like ["09:00", "10:00", "14:30"]
}

export function TimePickerDropdown({ 
  value, 
  onChange, 
  availableHours 
}: TimePickerDropdownProps) {
  const { t, i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  
const defaultHours = Array.from({ length: 11 }, (_, i) => {
  const hour = i + 9; // 9 AM to 7 PM
  return `${hour.toString().padStart(2, '0')}:00`;
});
  
  const hours = availableHours || defaultHours;
  
  const formatTimeForDisplay = (time: string) => {
    const [hourStr, minuteStr] = time.split(':');
    const hour = parseInt(hourStr);
    const minute = parseInt(minuteStr);
    
    if (i18n.language === 'en') {
      const period = hour >= 12 ? 'PM' : 'AM';
      const displayHour = hour % 12 || 12;
      return `${displayHour}:${minute.toString().padStart(2, '0')} ${period}`;
    } else {
      return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
    }
  };
  
  const displayValue = value ? formatTimeForDisplay(value) : t('reservation.selectTime', 'Pasirinkite laiką');
  
  return (
    <div className="relative">
      {/* Time input trigger */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-left hover:border-blue-500"
      >
        <span className={value ? 'text-gray-900' : 'text-gray-500'}>
          {displayValue}
        </span>
        <svg
          className={`h-5 w-5 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      
      {/* Dropdown */}
      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute top-full z-50 mt-1 max-h-60 w-full overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-lg">
            {hours.map((time) => {
              const isSelected = value === time;
              const displayTime = formatTimeForDisplay(time);
              
              return (
                <button
                  key={time}
                  type="button"
                  onClick={() => {
                    onChange(time);
                    setIsOpen(false);
                  }}
                  className={`flex w-full items-center justify-between px-4 py-3 text-left hover:bg-blue-50 ${
                    isSelected 
                      ? 'bg-blue-50 text-blue-600' 
                      : 'text-gray-900'
                  }`}
                >
                  <span className="font-medium">{displayTime}</span>
                  {isSelected && (
                    <svg className="h-5 w-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}