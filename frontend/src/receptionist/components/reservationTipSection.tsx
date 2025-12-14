import React, { useState } from 'react';
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
  const [showTipInput, setShowTipInput] = useState(false);
  const [tipInputValue, setTipInputValue] = useState('');
  const [tipAmount, setTipAmount] = useState(0);

  const handleAddTipClick = () => {
    setShowTipInput(true);
  };

  const handleTipInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;
    
    // Allow: empty string, numbers, and decimal point
    // Also allow starting with decimal point (like .50)
    if (value === '' || /^\.?\d*\.?\d{0,2}$/.test(value)) {
      // Don't allow multiple decimal points
      if ((value.match(/\./g) || []).length <= 1) {
        setTipInputValue(value);
      }
    }
  };

  const handleTipSubmit = () => {
    let amount = parseFloat(tipInputValue) || 0;
    
    // Handle input like ".50" (0.50)
    if (tipInputValue.startsWith('.') && tipInputValue.length > 1) {
      amount = parseFloat('0' + tipInputValue);
    }
    
    setTipAmount(amount);
    onTipAdded(amount);
    setShowTipInput(false);
  };

  const handleCancelTip = () => {
    setShowTipInput(false);
    setTipInputValue('');
  };

  const handleRemoveTip = () => {
    setTipAmount(0);
    setTipInputValue('');
    onTipAdded(0);
    setShowTipInput(false);
  };

  if (disabled) {
    return (
      <div className="rounded-lg border border-gray-300 bg-gray-100 p-3">
        <p className="text-sm font-medium text-gray-600 text-center">
          {t('reservation.tipDisabled')}
        </p>
      </div>
    );
  }

  if (!showTipInput && tipAmount === 0) {
    return (
      <button
        onClick={handleAddTipClick}
        className="w-full rounded-lg border border-gray-400 bg-white py-3 text-sm font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        disabled={disabled}
      >
        {t('reservation.addTip')}
      </button>
    );
  }

  if (showTipInput) {
    return (
      <div className="rounded-lg border border-gray-300 bg-gray-50 p-3">
        <div className="mb-2">
          <label className="mb-1 block text-sm font-medium text-gray-700">
            {t('reservation.enterTipAmount')}
          </label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              inputMode="decimal"
              value={tipInputValue}
              onChange={handleTipInputChange}
              placeholder="0.00"
              className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-right text-sm font-medium focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              autoFocus
              disabled={disabled}
            />
            <span className="text-sm font-medium text-gray-600">€</span>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleCancelTip}
            className="flex-1 rounded-lg border border-gray-400 py-2 text-xs font-medium hover:bg-gray-100"
            disabled={disabled}
          >
            {t('common.cancel')}
          </button>
          <button
            onClick={handleTipSubmit}
            className="flex-1 rounded-lg bg-blue-600 py-2 text-xs font-medium text-white hover:bg-blue-700"
            disabled={!tipInputValue || disabled}
          >
            {t('common.add')}
          </button>
        </div>
      </div>
    );
  }

  // Show tip amount with remove option
  return (
    <div className="flex items-center justify-between rounded-lg border border-gray-300 bg-gray-50 p-3">
      <div>
        <p className="text-sm font-medium text-gray-700">{t('reservation.tip')}</p>
        <p className="text-lg font-bold text-green-600">+{tipAmount.toFixed(2)}€</p>
      </div>
      <button
        onClick={handleRemoveTip}
        className="text-sm font-medium text-red-600 hover:text-red-800"
        disabled={disabled}
      >
        {t('common.remove')}
      </button>
    </div>
  );
};