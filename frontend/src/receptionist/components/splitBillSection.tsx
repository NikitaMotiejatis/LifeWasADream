import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import DropdownSelector from '@/global/components/dropdownSelector';
import { useCart, type CartItem } from '@/receptionist/contexts/cartContext';
import { useNavigate } from 'react-router-dom';

type PaymentMethod = 'Cash' | 'Card' | 'Gift card';

const splitEvenly = (amount: number, parts: number): number[] => {
  if (parts <= 0) return [];
  const base = Math.floor(amount / parts);
  const remainder = amount % parts;

  return Array.from({ length: parts }, (_, i) =>
    i < remainder ? base + 1 : base,
  );
};

type SplitBillSectionProps = {
  total: number;
  items: CartItem[];
  formatPrice: (amount: number) => string;
  onSplitEnabledChange?: (enabled: boolean) => void;
  onCompletePayment?: (
    payments: { amount: number; method: PaymentMethod }[],
  ) => void;
  onStripePayment?: () => void;
};

export const SplitBillSection: React.FC<SplitBillSectionProps> = ({
  total,
  items,
  formatPrice,
  onSplitEnabledChange,
  onCompletePayment,
  onStripePayment,
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { 
    setIsPaymentStarted, 
    setIndividualTip, 
    individualTips,
    clearIndividualTips 
  } = useCart();

  const [isSplitEnabled, setIsSplitEnabled] = useState(false);
  const [numPeople, setNumPeople] = useState(2);
  const [splitMode, setSplitMode] = useState<'equal' | 'byItems'>('equal');

  const expandedItems = items.flatMap((item, itemIndex) =>
    Array.from({ length: item.quantity }, (_, i) => ({
      ...item,
      quantity: 1,
      instanceId: `${itemIndex}-${i}`,
    })),
  );

  const [assignments, setAssignments] = useState<number[]>(
    expandedItems.map(() => 1),
  );

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Cash');

  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>(
    Array(50).fill('Cash'),
  );
  const [paidStatus, setPaidStatus] = useState<boolean[]>(
    Array(50).fill(false),
  );

  // Individual tip input visibility
  const [showTipInputs, setShowTipInputs] = useState<boolean[]>(
    Array(50).fill(false)
  );
  
  // Store the string values for tip inputs separately
  const [tipInputValues, setTipInputValues] = useState<string[]>(
    Array(50).fill('')
  );

  const anyPaid = paidStatus.some(Boolean);

  useEffect(() => {
    setIsPaymentStarted(anyPaid);
  }, [anyPaid, setIsPaymentStarted]);

  useEffect(() => {
    if (onSplitEnabledChange) {
      onSplitEnabledChange(isSplitEnabled);
    }
  }, [isSplitEnabled, onSplitEnabledChange]);

  const getUnitPrice = (item: CartItem) => {
    const base = item.product.basePrice;
    const mod = item.selectedVariations.reduce(
      (s, v) => s + v.priceModifier,
      0,
    );
    return base + mod;
  };

  // Calculate base amounts WITHOUT tips
  const baseAmounts = Array.from({ length: numPeople }, () => 0);

  if (splitMode === 'byItems') {
    expandedItems.forEach((item, idx) => {
      const payer = assignments[idx] || 1;
      if (payer >= 1 && payer <= numPeople) {
        baseAmounts[payer - 1] += getUnitPrice(item);
      }
    });
  } else {
    const equal = total / numPeople;
    baseAmounts.fill(equal);
  }

  // Add individual tips to base amounts - SAFE ACCESS
  const payerTotals = baseAmounts.map((base, index) => {
    const tip = individualTips[index] || 0;
    return base + tip;
  });

  const activePayers = payerTotals
    .map((amount, i) => ({ index: i + 1, amount, baseAmount: baseAmounts[i] }))
    .filter(p => p.amount > 0);

  const allPaid = activePayers.every(p => paidStatus[p.index - 1]);

  const handleTipInputToggle = (index: number) => {
    // FIX: Only disable if THIS payer is paid
    if (paidStatus[index] || index < 0 || index >= 50) return;
    
    setShowTipInputs(prev => {
      const newShowInputs = [...prev];
      newShowInputs[index] = !newShowInputs[index];
      return newShowInputs;
    });
    
    // Reset input value when opening
    if (!showTipInputs[index]) {
      setTipInputValues(prev => {
        const newValues = [...prev];
        newValues[index] = '';
        return newValues;
      });
    }
  };

  const handleTipInputChange = (index: number, value: string) => {
    // FIX: Only disable if THIS payer is paid
    if (paidStatus[index] || index < 0 || index >= 50) return;
    
    // Allow: empty string, numbers, decimal point
    // Specifically allow "0." at the beginning and decimal numbers
    if (value === '' || /^(\d+)?(\.\d{0,2})?$/.test(value)) {
      // Don't allow multiple decimal points
      if ((value.match(/\./g) || []).length <= 1) {
        // Update the string value
        setTipInputValues(prev => {
          const newValues = [...prev];
          newValues[index] = value;
          return newValues;
        });
        
        // Convert to number if valid
        if (value === '' || value === '.' || value === '0.') {
          setIndividualTip(index, 0);
        } else {
          const amount = parseFloat(value);
          if (!isNaN(amount)) {
            setIndividualTip(index, amount);
          }
        }
      }
    }
  };

  const handleTipSubmit = (index: number) => {
    if (paidStatus[index] || index < 0 || index >= 50) return;
    
    const value = tipInputValues[index];
    let amount = 0;
    
    if (value && value !== '.' && value !== '0.') {
      amount = parseFloat(value) || 0;
    }
    
    setIndividualTip(index, amount);
    handleTipInputToggle(index);
  };

  const handleSplitEnable = () => {
    setIsSplitEnabled(true);
    // Clear any previous individual tips when enabling split
    clearIndividualTips();
    // Reset paid status
    setPaidStatus(Array(50).fill(false));
    // Reset show tip inputs
    setShowTipInputs(Array(50).fill(false));
    // Reset tip input values
    setTipInputValues(Array(50).fill(''));
  };

  const handleSplitDisable = () => {
    // FIX: Only allow disabling split if NO ONE has paid yet
    if (!anyPaid) {
      setIsSplitEnabled(false);
      // Clear individual tips when disabling split
      clearIndividualTips();
    }
  };

  // Handle payment method change for individual payers
  const handlePaymentMethodChange = (payerIndex: number, method: PaymentMethod) => {
    // FIX: Only disable if THIS payer is paid
    if (paidStatus[payerIndex] || payerIndex < 0 || payerIndex >= 50) return;
    
    const newMethods = [...paymentMethods];
    newMethods[payerIndex] = method;
    setPaymentMethods(newMethods);
  };

  // Handle payer payment
  const handlePayerPayment = (payerIndex: number) => {
    if (payerIndex < 0 || payerIndex >= 50) return;
    
    const newPaid = [...paidStatus];
    newPaid[payerIndex] = true;
    setPaidStatus(newPaid);

    // Check if all active payers have paid
    const allActivePaid = activePayers.every(p => newPaid[p.index - 1]);
    if (allActivePaid && onCompletePayment) {
      onCompletePayment(
        activePayers.map(p => ({
          amount: p.amount,
          method: paymentMethods[p.index - 1] || 'Cash',
          tip: individualTips[p.index - 1] || 0,
        })),
      );
    }
  };

  if (!isSplitEnabled) {
    return (
      <>
        <button
          onClick={handleSplitEnable}
          className="mt-4 w-full rounded-lg border border-gray-400 bg-white py-3 text-sm font-medium hover:bg-gray-50"
        >
          {t('orderSummary.splitBill')}
        </button>

        <div>
          <p className="mb-1.5 text-xs font-medium text-gray-700 xl:text-sm">
            {t('orderSummary.paymentMethod')}
          </p>
          <div className="grid grid-cols-3 gap-1.5">
            {(['Cash', 'Card', 'Gift card'] as const).map(method => (
              <button
                key={method}
                onClick={() => setPaymentMethod(method)}
                className={`rounded-lg py-2 text-xs font-medium transition ${
                  paymentMethod === method
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'border border-gray-400 hover:bg-gray-100'
                }`}
              >
                {t(`orderSummary.paymentMethods.${method}`)}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={() => {
            if (paymentMethod === 'Card' && onStripePayment) {
              onStripePayment();
            } else {
              navigate('/orders');
            }
          }}
          className="w-full rounded-xl bg-blue-600 py-4 text-lg font-bold text-white shadow-md transition hover:bg-blue-700"
        >
          {t('orderSummary.completePayment')}
        </button>
      </>
    );
  }

  return (
    <div className="mt-6">
      <div className="rounded-xl border border-gray-300 bg-gray-50 p-5">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-bold text-gray-800">
            {t('orderSummary.splitBill')} ({activePayers.length}{' '}
            {t('orderSummary.people')})
          </h3>
          <button
            onClick={handleSplitDisable}
            className={`text-sm font-medium transition-all ${
              anyPaid
                ? 'cursor-not-allowed text-red-400 opacity-60'
                : 'text-red-600 hover:text-red-800 active:text-red-900'
            } `}
            disabled={anyPaid}
          >
            {t('common.cancel')}
          </button>
        </div>

        {/* Info message */}
        <div className="mb-4 rounded-lg bg-blue-50 p-3 border border-blue-200">
          <p className="text-sm font-medium text-blue-800">
            {t('orderSummary.splitInfo')}
          </p>
          <p className="text-xs text-blue-600 mt-1">
            {t('orderSummary.individualTipsInfo')}
          </p>
        </div>

        <div className="mb-4 flex items-center gap-3">
          <span className="text-sm font-medium text-gray-700">
            {t('orderSummary.peopleCount')}:
          </span>
          <div
            className={`flex items-center gap-1 ${anyPaid ? 'opacity-50' : ''}`}
          >
            <button
              onClick={() => setNumPeople(Math.max(2, numPeople - 1))}
              disabled={anyPaid}
              className="h-8 w-8 rounded-full border border-gray-400 text-lg font-bold hover:bg-gray-100 disabled:cursor-not-allowed"
            >
              −
            </button>
            <span className="w-10 text-center text-lg font-bold">
              {numPeople}
            </span>
            <button
              onClick={() => setNumPeople(Math.min(50, numPeople + 1))}
              disabled={anyPaid}
              className="h-8 w-8 rounded-full bg-blue-600 text-lg font-bold text-white hover:bg-blue-700 disabled:opacity-70"
            >
              +
            </button>
          </div>
        </div>

        <div className="mb-5 flex gap-6">
          <label
            className={`flex items-center gap-2 text-sm font-medium ${anyPaid ? 'opacity-50' : 'cursor-pointer'}`}
          >
            <input
              type="radio"
              checked={splitMode === 'equal'}
              onChange={() => !anyPaid && setSplitMode('equal')}
              disabled={anyPaid}
              className="text-blue-600"
            />
            <span>{t('orderSummary.splitEqually')}</span>
          </label>
          <label
            className={`flex items-center gap-2 text-sm font-medium ${anyPaid ? 'opacity-50' : 'cursor-pointer'}`}
          >
            <input
              type="radio"
              checked={splitMode === 'byItems'}
              onChange={() => !anyPaid && setSplitMode('byItems')}
              disabled={anyPaid}
              className="text-blue-600"
            />
            <span>{t('orderSummary.splitByItems')}</span>
          </label>
        </div>

        {splitMode === 'byItems' && expandedItems.length > 0 && (
          <div className="relative z-50 mb-6 overflow-visible rounded-lg border border-gray-200 bg-white">
            {expandedItems.map((item, idx) => {
              const price = getUnitPrice(item);
              return (
                <div
                  key={item.instanceId}
                  className="border-b border-gray-200 px-4 py-3 last:border-0"
                >
                  <div className="mb-2">
                    <div className="font-medium text-gray-900">
                      {item.product.nameKey
                        ? t(item.product.nameKey)
                        : item.product.name}
                    </div>
                    {item.selectedVariations.length > 0 && (
                      <div className="mt-0.5 text-xs text-gray-500">
                        {item.selectedVariations
                          .map(v => (v.nameKey ? t(v.nameKey) : v.name))
                          .join(', ')}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">
                      {formatPrice(price)}
                    </span>

                    <DropdownSelector
                      options={Array.from({ length: numPeople }, (_, i) => ({
                        value: String(i + 1),
                        label: `${t('orderSummary.payer')} ${i + 1}`,
                      }))}
                      selected={String(assignments[idx] || 1)}
                      onChange={val => {
                        if (!anyPaid) {
                          const newAssign = [...assignments];
                          newAssign[idx] = Number(val);
                          setAssignments(newAssign);
                        }
                      }}
                      buttonClassName="w-36 px-3 py-2 text-sm"
                      menuClassName="w-36 right-0"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="space-y-4">
          {activePayers.map(({ index, amount, baseAmount }) => {
            const payerIndex = index - 1;
            const paid = paidStatus[payerIndex];
            const method = paymentMethods[payerIndex] || 'Cash';
            const showTipInput = showTipInputs[payerIndex];
            const individualTip = individualTips[payerIndex] || 0;
            const tipInputValue = tipInputValues[payerIndex] || '';

            // FIX: Each payer is only locked if THEY are paid
            const isPayerLocked = paid;

            return (
              <div
                key={index}
                className={`rounded-xl border-2 p-5 transition-all ${
                  paid
                    ? 'border-green-500 bg-green-50'
                    : 'border-gray-300 bg-white'
                }`}
              >
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-md font-bold">
                      {t('orderSummary.payer')} {index}{' '}
                      {paid && t('orderSummary.paid')}
                    </span>
                    <span className="text-xl font-bold text-blue-600">
                      {formatPrice(amount)}
                    </span>
                  </div>
                  
                  {/* Breakdown */}
                  <div className="text-sm text-gray-600 mb-3">
                    <div className="flex justify-between">
                      <span>{t('orderSummary.baseAmount')}:</span>
                      <span>{formatPrice(baseAmount)}</span>
                    </div>
                    {individualTip > 0 && (
                      <div className="flex justify-between text-green-600">
                        <span>{t('orderSummary.tip')}:</span>
                        <span>+{formatPrice(individualTip)}</span>
                      </div>
                    )}
                  </div>
                  
                  {/* Individual Tip Input - Only show if this payer is NOT paid */}
                  {!paid && !showTipInput && individualTip === 0 && (
                    <button
                      onClick={() => handleTipInputToggle(payerIndex)}
                      className="w-full rounded-lg border border-gray-300 py-2 text-sm font-medium hover:bg-gray-50"
                      disabled={isPayerLocked}
                    >
                      {t('orderSummary.addIndividualTip')}
                    </button>
                  )}
                  
                  {!paid && showTipInput && (
                    <div className="mb-3 rounded-lg border border-gray-300 bg-white p-3">
                      <label className="mb-2 block text-sm font-medium text-gray-700">
                        {t('orderSummary.individualTipForPayer', { payer: index })}
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          inputMode="decimal"
                          value={tipInputValue}
                          onChange={(e) => handleTipInputChange(payerIndex, e.target.value)}
                          placeholder="0.00"
                          className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-right focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                          disabled={isPayerLocked}
                          autoFocus
                        />
                        <span className="text-sm font-medium text-gray-600">€</span>
                      </div>
                      <div className="mt-2 flex gap-2">
                        <button
                          onClick={() => handleTipInputToggle(payerIndex)}
                          className="flex-1 rounded-lg border border-gray-400 py-1 text-xs font-medium hover:bg-gray-100"
                          disabled={isPayerLocked}
                        >
                          {t('common.cancel')}
                        </button>
                        <button
                          onClick={() => handleTipSubmit(payerIndex)}
                          className="flex-1 rounded-lg bg-blue-600 py-1 text-xs font-medium text-white hover:bg-blue-700"
                          disabled={isPayerLocked}
                        >
                          {t('common.add')}
                        </button>
                      </div>
                    </div>
                  )}
                  
                  {!paid && individualTip > 0 && !showTipInput && (
                    <div className="mb-3 flex items-center justify-between rounded-lg border border-green-200 bg-green-50 p-3">
                      <div>
                        <p className="text-sm font-medium text-green-800">{t('orderSummary.tipAdded')}</p>
                        <p className="text-lg font-bold text-green-600">+{formatPrice(individualTip)}</p>
                      </div>
                      <button
                        onClick={() => {
                          setIndividualTip(payerIndex, 0);
                          setTipInputValues(prev => {
                            const newValues = [...prev];
                            newValues[payerIndex] = '';
                            return newValues;
                          });
                        }}
                        className="text-sm font-medium text-red-600 hover:text-red-800"
                        disabled={isPayerLocked}
                      >
                        {t('common.remove')}
                      </button>
                    </div>
                  )}
                </div>

                {!paid && (
                  <>
                    <div className="mb-4 grid grid-cols-3 gap-2">
                      {(['Cash', 'Card', 'Gift card'] as const).map(m => (
                        <button
                          key={m}
                          onClick={() => handlePaymentMethodChange(payerIndex, m)}
                          className={`rounded-lg py-2.5 text-xs font-medium transition ${
                            method === m
                              ? 'bg-blue-600 text-white'
                              : 'border border-gray-300 hover:bg-gray-50'
                          }`}
                          disabled={isPayerLocked}
                        >
                          {t(`orderSummary.paymentMethods.${m}`)}
                        </button>
                      ))}
                    </div>

                    <button
                      onClick={() => handlePayerPayment(payerIndex)}
                      className="w-full rounded-xl bg-blue-600 py-5 text-xl font-bold text-white shadow-md transition hover:bg-blue-700"
                      disabled={isPayerLocked}
                    >
                      {t('orderSummary.payWith', {
                        method: t(`orderSummary.paymentMethods.${method}`),
                      })}
                    </button>
                  </>
                )}
              </div>
            );
          })}
        </div>

        {allPaid && (
          <div className="mt-8 text-center">
            <p className="text-3xl font-bold text-green-700">
              {t('orderSummary.allPaid')}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
