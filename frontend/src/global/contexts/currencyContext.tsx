import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
} from 'react';
import { useTranslation } from 'react-i18next';

export type Currency = 'USD' | 'EUR' | 'GBP';

type CurrencyContextType = {
  currency: Currency;
  setCurrency: (currency: Currency) => void;
  formatPrice: (price: number) => string;
  syncWithLanguage: boolean;
  setSyncWithLanguage: (enabled: boolean) => void;
  overrideFromBackend: (currency: Currency, sync?: boolean) => void;
};

const currencySymbols: Record<Currency, string> = {
  USD: '$',
  EUR: '€',
  GBP: '£',
};

const CurrencyContext = createContext<CurrencyContextType | undefined>(
  undefined,
);

const getDefaultCurrency = (lang: string): Currency => {
  const map: Partial<Record<string, Currency>> = {
    lt: 'EUR',
    'en-GB': 'GBP',
    gb: 'GBP',
    en: 'GBP',
    us: 'USD',
  };
  const code = lang.toLowerCase();
  const base = code.split('-')[0];
  return map[code] ?? map[base] ?? 'USD';
};

export const CurrencyProvider = ({ children }: { children: ReactNode }) => {
  const { i18n } = useTranslation();

  const [currency, setCurrencyState] = useState<Currency>('USD');
  const [syncWithLanguage, setSyncWithLanguageState] = useState<boolean>(true);
  const [manuallyOverridden, setManuallyOverridden] = useState<boolean>(false);

  useEffect(() => {
    const savedCurrency = localStorage.getItem('currency') as Currency | null;
    const savedSync = localStorage.getItem('syncCurrencyWithLanguage');

    if (savedSync !== null) setSyncWithLanguageState(savedSync === 'true');
    if (savedCurrency) {
      setCurrencyState(savedCurrency);
      setManuallyOverridden(true);
    } else {
      setCurrencyState(getDefaultCurrency(i18n.language));
    }
  }, []);

  useEffect(() => {
    if (!syncWithLanguage || manuallyOverridden) return;
    const next = getDefaultCurrency(i18n.language);
    if (next !== currency) setCurrencyState(next);
  }, [i18n.language, syncWithLanguage, manuallyOverridden, currency]);

  const setCurrency = useCallback((c: Currency) => {
    setCurrencyState(c);
    localStorage.setItem('currency', c);
    setManuallyOverridden(true);
  }, []);

  const setSyncWithLanguage = useCallback((enabled: boolean) => {
    setSyncWithLanguageState(enabled);
    localStorage.setItem('syncCurrencyWithLanguage', String(enabled));
  }, []);

  const overrideFromBackend = useCallback((c: Currency, sync?: boolean) => {
    setCurrencyState(c);
    localStorage.setItem('currency', c);
    setManuallyOverridden(true);

    if (sync !== undefined) {
      setSyncWithLanguageState(sync);
      localStorage.setItem('syncCurrencyWithLanguage', String(sync));
    }
  }, []);

  const formatPrice = (price: number): string => {
    const symbol = currencySymbols[currency];
    const amount = price.toFixed(2);

    if (currency === 'EUR' && i18n.language.startsWith('lt')) {
      return `${amount.replace('.', ',')} ${symbol}`;
    }
    return `${symbol}${amount}`;
  };

  return (
    <CurrencyContext.Provider
      value={{
        currency,
        setCurrency,
        formatPrice,
        syncWithLanguage,
        setSyncWithLanguage,
        overrideFromBackend,
      }}
    >
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = (): CurrencyContextType => {
  const context = useContext(CurrencyContext);
  if (!context)
    throw new Error('useCurrency must be used within CurrencyProvider');
  return context;
};
