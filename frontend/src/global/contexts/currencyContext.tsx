import { createContext, useContext, useState, ReactNode } from 'react';

export type Currency = 'USD' | 'EUR' | 'GBP';

type CurrencyContextType = {
  currency: Currency;
  setCurrency: (currency: Currency) => void;
  formatPrice: (price: number) => string;
};

const currencySymbols: Record<Currency, string> = {
  USD: '$',
  EUR: '€',
  GBP: '£',
};

const CurrencyContext = createContext<CurrencyContextType | undefined>(
  undefined,
);

export const CurrencyProvider = ({ children }: { children: ReactNode }) => {
  const [currency, setCurrency] = useState<Currency>('USD');

  const formatPrice = (price: number): string => {
    const symbol = currencySymbols[currency];
    const amount = price.toFixed(2);

    return currency === 'EUR' ? `${amount} ${symbol}` : `${symbol}${amount}`;
  };

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, formatPrice }}>
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = (): CurrencyContextType => {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
};
