import React from 'react';
import { useTranslation } from 'react-i18next';
import { useCart } from '@/receptionist/contexts/cartContext';
import { TipInput } from './tipInput';

interface TipSectionProps {
  disabled?: boolean;
  isSplitMode?: boolean;
}

export const TipSection: React.FC<TipSectionProps> = ({
  disabled = false,
  isSplitMode = false,
}) => {
  const { t } = useTranslation();
  const { tipAmount, setTipAmount, formatPrice } = useCart();

  if (disabled) {
    return (
      <div className="mt-4 rounded-lg border border-gray-300 bg-gray-100 p-4">
        <p className="text-center text-sm font-medium text-gray-600">
          {isSplitMode
            ? t('orderSummary.tipAfterSplit')
            : t('orderSummary.tipDisabled')}
        </p>
      </div>
    );
  }

  return (
    <TipInput
      value={tipAmount}
      onChange={setTipAmount}
      disabled={disabled}
      disabledMessage={t('orderSummary.tipDisabled')}
      addTipText={t('orderSummary.addTip')}
      enterTipLabel={t('orderSummary.enterTipAmount')}
      showCurrency={false}
      formatAmount={formatPrice}
      className="mt-4"
    />
  );
};
