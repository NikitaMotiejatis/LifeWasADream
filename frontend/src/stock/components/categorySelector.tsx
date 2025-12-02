import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import ChevronDownIcon from '@/icons/chevronDownIcon';
import CheckMarkIcon from '@/icons/checkmarkIcon';

const categories = [
  {
    value: 'All Categories',
    labelKey: 'stockUpdates.categories.All Categories',
  },
  { value: 'Raw Materials', labelKey: 'stockUpdates.categories.Raw Materials' },
  { value: 'Dairy', labelKey: 'stockUpdates.categories.Dairy' },
  { value: 'Packaging', labelKey: 'stockUpdates.categories.Packaging' },
  { value: 'Bakery', labelKey: 'stockUpdates.categories.Bakery' },
  { value: 'Ingredients', labelKey: 'stockUpdates.categories.Ingredients' },
] as const;

type Props = {
  selected: string;
  onChange: (value: string) => void;
};

export default function CategorySelector({ selected, onChange }: Props) {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);

  const currentLabel = t(
    categories.find(c => c.value === selected)?.labelKey ??
      categories[0].labelKey,
  );

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-48 items-center justify-between rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition hover:border-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
      >
        <span className="truncate pr-2">{currentLabel}</span>
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

          <ul className="absolute top-full right-0 left-0 z-50 mt-1 w-48 overflow-hidden rounded-md border border-gray-300 bg-white shadow-lg">
            {categories.map(cat => {
              const isActive = selected === cat.value;
              const label = t(cat.labelKey);

              return (
                <li key={cat.value}>
                  <button
                    onClick={() => {
                      onChange(cat.value);
                      setIsOpen(false);
                    }}
                    className={`flex w-full items-center justify-between px-3 py-2 text-left text-sm transition ${isActive ? 'bg-blue-50 font-medium text-blue-700' : 'text-gray-700 hover:bg-gray-50'}`}
                  >
                    <span className="truncate pr-2">{label}</span>

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
