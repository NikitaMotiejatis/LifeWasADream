import { useState } from 'react';
import { useTranslation } from 'react-i18next';

interface SplitBillSectionProps {
  splitBill: boolean;
  setSplitBill: (value: boolean) => void;
  splitCount: number;
  setSplitCount: (count: number) => void;
  total: number; // Add total prop to calculate per person
}

export function SplitBillSection({
  splitBill,
  setSplitBill,
  splitCount,
  setSplitCount,
  total,
}: SplitBillSectionProps) {
  const { t } = useTranslation();
  const [tempSplitCount, setTempSplitCount] = useState(splitCount);
  const [isConfirmed, setIsConfirmed] = useState(false);

  const handleConfirmSplit = () => {
    setSplitCount(tempSplitCount);
    setIsConfirmed(true);
  };

  const handleEditSplit = () => {
    setIsConfirmed(false);
  };

  const handleCancelSplit = () => {
    setSplitBill(false);
    setIsConfirmed(false);
    setTempSplitCount(splitCount);
  };

  // Show split bill button when not active
  if (!splitBill) {
    return (
      <button
        onClick={() => setSplitBill(true)}
        className="mb-6 w-full rounded-lg border border-gray-400 py-2 text-xs font-medium hover:bg-gray-50"
      >
        {t('orderSummary.splitBill', 'Split Bill')}
      </button>
    );
  }

  // Show confirmed split info
  if (isConfirmed) {
    return (
      <div className="mb-6 rounded-lg border border-green-200 bg-green-50 p-4">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-green-700">
              {t('orderSummary.splitBill', 'Split Bill')}
            </span>
            <span className="rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-800">
              {t('orderPanel.confirmed', 'Confirmed')}
            </span>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleEditSplit}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              {t('orderPanel.edit', 'Edit')}
            </button>
            <button
              onClick={handleCancelSplit}
              className="text-sm text-gray-600 hover:text-gray-800"
            >
              {t('orderPanel.cancel', 'Cancel')}
            </button>
          </div>
        </div>

        <div className="mb-2">
          <p className="text-sm text-gray-700">
            {t('orderPanel.splitBetween', 'Split between')}{' '}
            <span className="font-bold">{splitCount}</span>{' '}
            {t('orderPanel.people', 'people')}
          </p>
          <p className="text-sm text-gray-700">
            {t('orderPanel.eachPays', 'Each person pays')}:{' '}
            <span className="font-bold text-green-700">
              ${(total / splitCount).toFixed(2)}
            </span>
          </p>
        </div>
      </div>
    );
  }

  // Show split configuration form
  return (
    <div className="mb-6 rounded-lg border border-gray-200 bg-gray-50 p-4">
      <div className="mb-3 flex items-center justify-between">
        <span className="text-sm font-medium text-gray-700">
          {t('orderSummary.splitBill', 'Split Bill')}
        </span>
        <button
          onClick={handleCancelSplit}
          className="text-sm text-gray-600 hover:text-gray-800"
        >
          {t('orderPanel.cancel', 'Cancel')}
        </button>
      </div>

      <div className="mb-4">
        <label className="mb-2 block text-sm text-gray-600">
          {t('orderPanel.splitCount', 'Split between')}:
        </label>
        <div className="mb-4 flex items-center gap-3">
          <button
            onClick={() => setTempSplitCount(Math.max(2, tempSplitCount - 1))}
            className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-300 hover:bg-gray-50"
          >
            −
          </button>
          <span className="w-12 text-center text-lg font-medium">
            {tempSplitCount}
          </span>
          <button
            onClick={() => setTempSplitCount(tempSplitCount + 1)}
            className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-300 hover:bg-gray-50"
          >
            +
          </button>
        </div>

        <p className="mb-4 text-xs text-gray-500">
          {t('orderPanel.splitPerPerson', 'Each person pays')}:{' '}
          <span className="font-bold">
            ${(total / tempSplitCount).toFixed(2)}
          </span>
        </p>
      </div>

      <div className="flex gap-2">
        <button
          onClick={handleCancelSplit}
          className="flex-1 rounded-lg border border-gray-300 py-2 text-xs font-medium hover:bg-gray-50"
        >
          {t('orderPanel.cancel', 'Cancel')}
        </button>
        <button
          onClick={handleConfirmSplit}
          className="flex-1 rounded-lg bg-blue-600 py-2 text-xs font-medium text-white hover:bg-blue-700"
        >
          {t('orderPanel.confirm', 'Confirm')}
        </button>
      </div>
    </div>
  );
}
