import React from 'react';
import { TipInput } from './tipInput';
import { useTranslation } from 'react-i18next';

interface ReservationTipSectionProps {
  onTipAdded: (amount: number) => void;
  disabled?: boolean;
}

export const ReservationTipSection: React.FC<ReservationTipSectionProps> = ({ 
  onTipAdded,
  disabled = false 
}) => {
  const { t } = useTranslation();
  const [tipAmount, setTipAmount] = React.useState(0);

  const handleTipChange = (amount: number) => {
    setTipAmount(amount);
    onTipAdded(amount);
  };

  return (
    <TipInput
      value={tipAmount}
      onChange={handleTipChange}
      disabled={disabled}
      disabledMessage={t('reservation.tipDisabled')}
      addTipText={t('reservation.addTip')}
      enterTipLabel={t('reservation.enterTipAmount')}
      showCurrency={true}
    />
  );
};