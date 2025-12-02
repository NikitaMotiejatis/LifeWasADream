import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import ChevronDownIcon from '@/icons/chevronDownIcon';

const branches = [
  { value: 'downtown' as const, labelKey: 'topbar.branchSelect' as const },
  { value: 'north' as const, labelKey: 'topbar.northBranch' as const },
  { value: 'west' as const, labelKey: 'topbar.westBranch' as const },
] as const;

type BranchValue = 'downtown' | 'north' | 'west';

export default function BranchSelector() {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState<BranchValue>('downtown');

  const currentLabel = t(
    branches.find(b => b.value === selected)?.labelKey || branches[0].labelKey,
  );

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-48 items-center justify-between rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 transition hover:border-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
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
            {branches.map(branch => {
              const isActive = selected === branch.value;
              const label = t(branch.labelKey);

              return (
                <li key={branch.value}>
                  <button
                    onClick={() => {
                      setSelected(branch.value);
                      setIsOpen(false);
                    }}
                    className={`flex w-full items-center justify-between px-3 py-2 text-left text-sm transition ${
                      isActive
                        ? 'bg-blue-50 font-medium text-blue-700'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <span className="truncate pr-2">{label}</span>
                    {isActive && (
                      <svg
                        className="h-4 w-4 shrink-0 text-blue-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={3}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
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
