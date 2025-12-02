import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import { FlagIcon } from '@/icons/flagIcon';

export default function LanguageSwitcher() {
  const { i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);

  const current = i18n.language.startsWith('lt') ? 'lt' : 'en';

  const languages = [
    { code: 'lt', name: 'Lietuvių' },
    { code: 'en', name: 'English' },
  ] as const;

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex h-9 w-9 items-center justify-center rounded-full bg-white shadow-md ring-1 ring-gray-300 transition-all hover:scale-110 hover:ring-blue-400 focus:ring-4 focus:ring-blue-500/30 focus:outline-none"
        aria-label="Change language"
      >
        <FlagIcon code={current} className="rounded-full" />
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />

          <div className="absolute right-0 z-50 mt-2 w-48 origin-top-right overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xl">
            {languages.map(lang => {
              const isActive = current === lang.code;

              return (
                <button
                  key={lang.code}
                  onClick={() => {
                    i18n.changeLanguage(lang.code);
                    setIsOpen(false);
                  }}
                  className={`flex w-full items-center justify-between px-4 py-3.5 transition-all ${
                    isActive
                      ? 'bg-blue-50 font-medium text-blue-700'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <FlagIcon
                      code={lang.code}
                      className="rounded-full shadow-sm"
                    />
                    <span className="text-sm">{lang.name}</span>
                  </div>

                  {isActive && (
                    <svg
                      className="h-5 w-5 text-blue-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2.5}
                        d="M5 13l4 4L19 7"
                      />
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
