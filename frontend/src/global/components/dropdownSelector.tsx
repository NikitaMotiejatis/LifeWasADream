import { ReactNode, useState } from 'react';
import ChevronDownIcon from '@/icons/chevronDownIcon';
import CheckMarkIcon from '@/icons/checkmarkIcon';

type Option<T extends string> = {
  value: T;
  label: ReactNode;
};

type Props<T extends string> = {
  options: readonly Option<T>[];
  selected: T;
  onChange: (value: T) => void;
  buttonClassName?: string;
  menuClassName?: string;
};

export default function DropdownSelector<T extends string>({
  options,
  selected,
  onChange,
  buttonClassName = 'w-48 px-3 py-2',
  menuClassName = 'w-48',
}: Props<T>) {
  const [isOpen, setIsOpen] = useState(false);

  const currentOption = options.find(o => o.value === selected) ?? options[0];

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center justify-between rounded-md border border-gray-300 bg-white text-sm font-medium text-gray-700 transition hover:border-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none ${buttonClassName}`}
      >
        <span className="truncate pr-2">{currentOption.label}</span>
        <ChevronDownIcon
          className={`h-4 w-4 shrink-0 text-gray-500 transition ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />

          <ul
            className={`absolute top-full right-0 left-0 z-50 mt-1 overflow-hidden rounded-md border border-gray-300 bg-white shadow-lg ${menuClassName}`}
          >
            {options.map(option => {
              const isActive = selected === option.value;

              return (
                <li key={option.value}>
                  <button
                    onClick={() => {
                      onChange(option.value);
                      setIsOpen(false);
                    }}
                    className={`flex w-full items-center justify-between px-3 py-2 text-left text-sm transition ${
                      isActive
                        ? 'bg-blue-50 font-medium text-blue-700'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <span className="truncate pr-2">{option.label}</span>
                    {isActive && (
                      <CheckMarkIcon className="h-4 w-4 shrink-0 text-blue-600" />
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        </>
      )}
    </div>
  );
}
