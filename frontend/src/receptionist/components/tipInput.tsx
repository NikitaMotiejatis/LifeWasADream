import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

interface TipInputProps {
  value: number;
  onChange: (amount: number) => void;
  disabled?: boolean;
  disabledMessage?: string;
  addTipText?: string;
  enterTipLabel?: string;
  showCurrency?: boolean;
  formatAmount?: (amount: number) => string;
  className?: string;
}

export const TipInput: React.FC<TipInputProps> = ({
  value,
  onChange,
  disabled = false,
  disabledMessage,
  addTipText,
  enterTipLabel,
  showCurrency = true,
  formatAmount = (amount) => amount.toFixed(2),
  className = '',
}) => {
  const { t } = useTranslation();
  const [showInput, setShowInput] = useState(false);
  const [inputValue, setInputValue] = useState('');

  const defaultMessages = {
    addTip: t('common.addTip'),
    enterTip: t('common.enterTipAmount'),
    tip: t('common.tip')
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value;

    const isValidDecimal = /^$|^\d*\.?\d{0,2}$/.test(val);
    
    if (isValidDecimal) {
      if ((val.match(/\./g) || []).length <= 1) {
        setInputValue(val);
      }
    }
  };

  const handleSubmit = () => {
    if (inputValue === '' || inputValue === '.') {
      onChange(0);
    } else {
      const amount = parseFloat(inputValue) || 0;
      
      if (inputValue.startsWith('.')) {
        const correctedValue = '0' + inputValue;
        onChange(parseFloat(correctedValue) || 0);
      } else {
        onChange(amount);
      }
    }
    
    setShowInput(false);
    setInputValue('');
  };

  const handleCancel = () => {
    setShowInput(false);
    setInputValue('');
  };

  const handleRemove = () => {
    onChange(0);
    setInputValue('');
    setShowInput(false);
  };

  if (showInput) {
    return (
      <div className={`rounded-lg border border-gray-300 bg-gray-50 p-3 ${className}`}>
        <div className="mb-2">
          <label className="mb-1 block text-sm font-medium text-gray-700">
            {enterTipLabel || defaultMessages.enterTip}
          </label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              inputMode="decimal"
              value={inputValue}
              onChange={handleInputChange}
              placeholder="0.00"
              className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-right text-sm font-medium focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              autoFocus
              disabled={disabled}
            />
            {showCurrency && <span className="text-sm font-medium text-gray-600">€</span>}
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleCancel}
            className="flex-1 rounded-lg border border-gray-400 py-2 text-xs font-medium hover:bg-gray-100"
            disabled={disabled}
          >
            {t('common.cancel')}
          </button>
          <button
            onClick={handleSubmit}
            className="flex-1 rounded-lg bg-blue-600 py-2 text-xs font-medium text-white hover:bg-blue-700"
            disabled={disabled}
          >
            {t('common.add')}
          </button>
        </div>
      </div>
    );
  }

  if (value > 0) {
    return (
      <div className={`flex items-center justify-between rounded-lg border border-gray-300 bg-gray-50 p-3 ${className}`}>
        <div>
          <p className="text-sm font-medium text-gray-700">{defaultMessages.tip}</p>
          <p className="text-lg font-bold text-green-600">
            +{formatAmount(value)}{showCurrency && '€'}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowInput(true)}
            className="text-sm font-medium text-blue-600 hover:text-blue-800"
            disabled={disabled}
          >
            {t('common.edit')}
          </button>
          <button
            onClick={handleRemove}
            className="text-sm font-medium text-red-600 hover:text-red-800"
            disabled={disabled}
          >
            {t('common.remove')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <button
      onClick={() => setShowInput(true)}
      className={`w-full rounded-lg border border-gray-400 bg-white py-3 text-sm font-medium hover:bg-gray-50 ${className}`}
      disabled={disabled}
    >
      {addTipText || defaultMessages.addTip}
    </button>
  );
};