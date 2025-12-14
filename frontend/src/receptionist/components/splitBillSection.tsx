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
  onCompletePayment?: (
    payments: { amount: number; method: PaymentMethod }[],
  ) => void;
  onStripePayment?: () => void;
};

export const SplitBillSection: React.FC<SplitBillSectionProps> = ({
  total,
  items,
  formatPrice,
  onCompletePayment,
  onStripePayment,
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { setIsPaymentStarted } = useCart();

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

  const anyPaid = paidStatus.some(Boolean);
  const isLocked = anyPaid;

  useEffect(() => {
    setIsPaymentStarted(anyPaid);
  }, [anyPaid, setIsPaymentStarted]);

  const getUnitPrice = (item: CartItem) => {
    const base = item.product.basePrice;
    const mod = item.selectedVariations.reduce(
      (s, v) => s + v.priceModifier,
      0,
    );
    return base + mod;
  };

  const payerTotals = Array.from({ length: numPeople }, () => 0);

  if (splitMode === 'byItems') {
    expandedItems.forEach((item, idx) => {
      const payer = assignments[idx] || 1;
      if (payer >= 1 && payer <= numPeople) {
        payerTotals[payer - 1] += getUnitPrice(item);
      }
    });
  } else {
    splitEvenly(total, numPeople).forEach((amount, index) => {
      payerTotals[index] = amount;
    });
  }

  const activePayers = payerTotals
    .map((amount, i) => ({ index: i + 1, amount }))
    .filter(p => p.amount > 0);

  const allPaid = activePayers.every(p => paidStatus[p.index - 1]);

  if (!isSplitEnabled) {
    return (
      <>
        <button
          onClick={() => setIsSplitEnabled(true)}
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
                onClick={() => setPaymentMethod && setPaymentMethod(method)}
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
            onClick={() => setIsSplitEnabled(false)}
            className={`text-sm font-medium transition-all ${
              isLocked
                ? 'cursor-not-allowed text-red-400 opacity-60'
                : 'text-red-600 hover:text-red-800 active:text-red-900'
            } `}
            disabled={isLocked}
          >
            {t('common.cancel')}
          </button>
        </div>

        <div className="mb-4 flex items-center gap-3">
          <span className="text-sm font-medium text-gray-700">
            {t('orderSummary.peopleCount')}:
          </span>
          <div
            className={`flex items-center gap-1 ${isLocked ? 'opacity-50' : ''}`}
          >
            <button
              onClick={() => setNumPeople(Math.max(2, numPeople - 1))}
              disabled={isLocked}
              className="h-8 w-8 rounded-full border border-gray-400 text-lg font-bold hover:bg-gray-100 disabled:cursor-not-allowed"
            >
              −
            </button>
            <span className="w-10 text-center text-lg font-bold">
              {numPeople}
            </span>
            <button
              onClick={() => setNumPeople(Math.min(50, numPeople + 1))}
              disabled={isLocked}
              className="h-8 w-8 rounded-full bg-blue-600 text-lg font-bold text-white hover:bg-blue-700 disabled:opacity-70"
            >
              +
            </button>
          </div>
        </div>

        <div className="mb-5 flex gap-6">
          <label
            className={`flex items-center gap-2 text-sm font-medium ${isLocked ? 'opacity-50' : 'cursor-pointer'}`}
          >
            <input
              type="radio"
              checked={splitMode === 'equal'}
              onChange={() => !isLocked && setSplitMode('equal')}
              disabled={isLocked}
              className="text-blue-600"
            />
            <span>{t('orderSummary.splitEqually')}</span>
          </label>
          <label
            className={`flex items-center gap-2 text-sm font-medium ${isLocked ? 'opacity-50' : 'cursor-pointer'}`}
          >
            <input
              type="radio"
              checked={splitMode === 'byItems'}
              onChange={() => !isLocked && setSplitMode('byItems')}
              disabled={isLocked}
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
                        if (!isLocked) {
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
          {activePayers.map(({ index, amount }) => {
            const paid = paidStatus[index - 1];
            const method = paymentMethods[index - 1];

            return (
              <div
                key={index}
                className={`rounded-xl border-2 p-5 transition-all ${
                  paid
                    ? 'border-green-500 bg-green-50'
                    : 'border-gray-300 bg-white'
                }`}
              >
                <div className="mb-4 flex items-center justify-between">
                  <span className="text-md font-bold">
                    {t('orderSummary.payer')} {index}{' '}
                    {paid && t('orderSummary.paid')}
                  </span>
                  <span className="text-xl font-bold text-blue-600">
                    {formatPrice(amount)}
                  </span>
                </div>

                {!paid && (
                  <>
                    <div className="mb-4 grid grid-cols-3 gap-2">
                      {(['Cash', 'Card', 'Gift card'] as const).map(m => (
                        <button
                          key={m}
                          onClick={() => {
                            const newMethods = [...paymentMethods];
                            newMethods[index - 1] = m;
                            setPaymentMethods(newMethods);
                          }}
                          className={`rounded-lg py-2.5 text-xs font-medium transition ${
                            method === m
                              ? 'bg-blue-600 text-white'
                              : 'border border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          {t(`orderSummary.paymentMethods.${m}`)}
                        </button>
                      ))}
                    </div>

                    <button
                      onClick={() => {
                        const newPaid = [...paidStatus];
                        newPaid[index - 1] = true;
                        setPaidStatus(newPaid);

                        if (activePayers.every(p => newPaid[p.index - 1])) {
                          onCompletePayment?.(
                            activePayers.map(p => ({
                              amount: p.amount,
                              method: paymentMethods[p.index - 1],
                            })),
                          );
                        }
                      }}
                      className="w-full rounded-xl bg-blue-600 py-5 text-xl font-bold text-white shadow-md transition hover:bg-blue-700"
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
