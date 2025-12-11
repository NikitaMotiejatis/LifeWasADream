import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import ManagerLayout from '../components/managerLayout';
import {
  Plus,
  Edit2,
  Trash2,
  Save,
  X,
  Percent,
  Package,
  AlertTriangle,
} from 'lucide-react';

interface VatRate {
  id: number;
  name: string;
  rate: number;
  isDefault: boolean;
}

const VatSettingsPage: React.FC = () => {
  const { t } = useTranslation();

  // State for all VAT rates in the system
  const [vatRates, setVatRates] = useState<VatRate[]>([
    { id: 1, name: t('vat.rates.21percent'), rate: 21, isDefault: true },
    { id: 2, name: t('vat.rates.9percent'), rate: 9, isDefault: false },
    { id: 3, name: t('vat.rates.0percent'), rate: 0, isDefault: false },
  ]);

  // State for managing form interactions
  const [editingId, setEditingId] = useState<number | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [newRate, setNewRate] = useState<string>('');
  const [validationError, setValidationError] = useState<string | null>(null);

  // State for confirmation dialog when changing default VAT
  const [confirmChange, setConfirmChange] = useState<number | null>(null);

  // Validate the rate input
  const validateRate = (
    value: string,
    isEditing: boolean = false,
  ): string | null => {
    if (!value.trim()) {
      return t('vat.validation.required');
    }

    const rateValue = parseFloat(value);

    if (isNaN(rateValue)) {
      return t('vat.validation.nan');
    }

    if (rateValue < 0) {
      return t('vat.validation.negative');
    }

    if (rateValue > 100) {
      return t('vat.validation.exceeds');
    }

    // Check for duplicate rates (only when adding new, not when editing the same rate)
    if (!isEditing) {
      const existingRate = vatRates.find(rate => rate.rate === rateValue);
      if (existingRate) {
        return t('vat.validation.duplicate', { rate: rateValue });
      }
    }

    return null; // No error
  };

  // Handle input change with validation
  const handleRateChange = (value: string) => {
    setNewRate(value);

    // Clear error if input is being corrected
    if (validationError) {
      const isEditing = editingId !== null;
      const error = validateRate(value, isEditing);
      setValidationError(error);
    }
  };

  // Get the currently active default VAT rate
  const getDefaultVatRate = () => {
    if (vatRates.length === 0) {
      return { id: 0, name: t('vat.rates.0percent'), rate: 0, isDefault: true };
    }
    return vatRates.find(rate => rate.isDefault) || vatRates[0];
  };

  // Get default VAT rate safely for display
  const defaultVatRate = getDefaultVatRate();

  // Start the process of adding a new VAT rate
  const handleAddNew = () => {
    setIsAdding(true);
    setEditingId(null);
    setNewRate('');
    setValidationError(null);
  };

  // Start editing an existing VAT rate
  const handleEdit = (rate: VatRate) => {
    setEditingId(rate.id);
    setNewRate(rate.rate.toString());
    setIsAdding(false);
    setValidationError(null);
  };

  const handleSave = () => {
    const isEditing = editingId !== null;
    const error = validateRate(newRate, isEditing);
    if (error) {
      setValidationError(error);
      return;
    }

    const rateValue = parseFloat(newRate);

    if (editingId) {
      // Check if editing would create a duplicate with another rate
      const duplicateRate = vatRates.find(
        rate => rate.rate === rateValue && rate.id !== editingId,
      );

      if (duplicateRate) {
        setValidationError(t('vat.validation.duplicate', { rate: rateValue }));
        return;
      }

      setVatRates(prev =>
        prev.map(rate =>
          rate.id === editingId
            ? {
                ...rate,
                name: t('vat.rateName', { rate: rateValue }),
                rate: rateValue,
              }
            : rate,
        ),
      );
    } else {
      // Add new rate
      const newVatRate: VatRate = {
        id: vatRates.length > 0 ? Math.max(...vatRates.map(r => r.id)) + 1 : 1,
        name: t('vat.rateName', { rate: rateValue }),
        rate: rateValue,
        isDefault: vatRates.length === 0,
      };
      setVatRates(prev => [...prev, newVatRate]);
    }

    handleCancel();
  };

  // Delete a VAT rate with confirmation
  const handleDelete = (id: number) => {
    const updatedRates = vatRates.filter(rate => rate.id !== id);
    const deletedRate = vatRates.find(rate => rate.id === id);
    if (deletedRate?.isDefault && updatedRates.length > 0) {
      updatedRates[0].isDefault = true;
    }

    setVatRates(updatedRates);
  };

  const handleCancel = () => {
    setEditingId(null);
    setIsAdding(false);
    setNewRate('');
    setValidationError(null);
  };

  const setAsDefault = (id: number) => {
    const vatRate = vatRates.find(r => r.id === id);
    if (!vatRate) return;
    setConfirmChange(id);
  };

  const confirmSetAsDefault = () => {
    if (!confirmChange) return;

    setVatRates(prev =>
      prev.map(rate => ({
        ...rate,
        isDefault: rate.id === confirmChange,
      })),
    );

    setConfirmChange(null);
  };

  const cancelSetAsDefault = () => {
    setConfirmChange(null);
  };

  return (
    <ManagerLayout>
      <div className="p-6">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-gray-900">
            {t('vat.title')}
          </h1>
          <p className="mt-1 text-sm text-gray-500">{t('vat.subtitle')}</p>
        </div>

        {/* Current Default VAT Banner */}
        {vatRates.length > 0 && (
          <div className="mb-6 rounded-lg border border-blue-200 bg-blue-50 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Percent className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="text-sm font-medium text-blue-900">
                    {t('vat.currentDefault')}
                  </p>
                  <p className="text-2xl font-bold text-blue-800">
                    {defaultVatRate.name}
                  </p>
                </div>
              </div>
              <div className="text-sm text-blue-700">
                {t('vat.appliesToAll')}
              </div>
            </div>
          </div>
        )}

        {/* Add/Edit Form */}
        {(isAdding || editingId) && (
          <div className="mb-6 rounded-lg border bg-white p-4">
            <h3 className="text-md mb-3 font-medium text-gray-900">
              {editingId ? t('vat.editRate') : t('vat.addRate')}
            </h3>

            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  {t('vat.percentageLabel')}
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={newRate}
                    onChange={e => handleRateChange(e.target.value)}
                    onBlur={() => {
                      const isEditing = editingId !== null;
                      const error = validateRate(newRate, isEditing);
                      setValidationError(error);
                    }}
                    min="0"
                    max="100"
                    step="0.1"
                    className={`flex-1 rounded-md border px-3 py-2 focus:ring-2 focus:outline-none ${
                      validationError
                        ? 'border-red-300 focus:ring-red-500'
                        : 'border-gray-300 focus:ring-blue-500'
                    }`}
                    placeholder={t('vat.percentagePlaceholder')}
                    autoFocus
                  />
                  <span className="text-gray-600">%</span>
                </div>

                {/* Validation Error Message */}
                {validationError && (
                  <p className="mt-1 flex items-center gap-1 text-sm text-red-600">
                    <AlertTriangle className="h-3 w-3" />
                    {validationError}
                  </p>
                )}

                {/* Help text when no error */}
                {!validationError && (
                  <p className="mt-1 text-sm text-gray-500">
                    {editingId ? t('vat.editHelp') : t('vat.addHelp')}
                  </p>
                )}
              </div>

              <div className="flex gap-2">
                <button
                  onClick={handleCancel}
                  className="flex-1 rounded border border-gray-300 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                >
                  {t('common.cancel')}
                </button>
                <button
                  onClick={handleSave}
                  disabled={!!validationError || !newRate.trim()}
                  className={`flex-1 rounded px-3 py-2 text-sm ${
                    validationError || !newRate.trim()
                      ? 'cursor-not-allowed bg-gray-300 text-gray-500'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  {editingId ? t('common.update') : t('common.add')}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Action Bar */}
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-medium text-gray-900">
            {t('vat.availableRates')}
          </h2>
          {!isAdding && !editingId && !confirmChange && (
            <button
              onClick={handleAddNew}
              className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
            >
              <Plus className="h-4 w-4" />
              {t('vat.addNewRate')}
            </button>
          )}
        </div>

        {/* Confirmation Dialog for Changing Default VAT */}
        {confirmChange && (
          <div className="mb-6 rounded-lg border border-yellow-200 bg-yellow-50 p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="mt-0.5 h-5 w-5 flex-shrink-0 text-yellow-600" />
              <div className="flex-1">
                <h3 className="text-md mb-2 font-medium text-yellow-800">
                  {t('vat.confirmChange.title')}
                </h3>
                <p className="mb-4 text-sm text-yellow-700">
                  {t('vat.confirmChange.message', {
                    rate: vatRates.find(r => r.id === confirmChange)?.name,
                  })}
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={cancelSetAsDefault}
                    className="rounded border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50"
                  >
                    {t('common.cancel')}
                  </button>
                  <button
                    onClick={confirmSetAsDefault}
                    className="rounded bg-yellow-600 px-4 py-2 text-white hover:bg-yellow-700"
                  >
                    {t('vat.confirmChange.confirm')}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* VAT Rates List */}
        {vatRates.length > 0 ? (
          <div className="space-y-3">
            {vatRates.map(rate => (
              <div
                key={rate.id}
                className={`rounded-lg border bg-white p-4 ${
                  rate.isDefault ? 'border-blue-300 bg-blue-50' : ''
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div
                      className={`flex h-12 w-12 items-center justify-center rounded-lg ${
                        rate.isDefault ? 'bg-blue-100' : 'bg-gray-100'
                      }`}
                    >
                      <Percent
                        className={`h-6 w-6 ${
                          rate.isDefault ? 'text-blue-600' : 'text-gray-600'
                        }`}
                      />
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-medium text-gray-900">
                          {rate.name}
                        </h3>
                        {rate.isDefault && (
                          <span className="rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800">
                            {t('vat.activeLabel')}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-500">
                        {rate.isDefault
                          ? t('vat.appliedToAll')
                          : t('vat.availableForSelection')}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {!rate.isDefault && !confirmChange && (
                      <button
                        onClick={() => setAsDefault(rate.id)}
                        className="rounded bg-gray-100 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-200"
                      >
                        {t('vat.setAsDefault')}
                      </button>
                    )}

                    {!confirmChange && (
                      <>
                        <button
                          onClick={() => handleEdit(rate)}
                          className="rounded-lg p-2 text-blue-600 hover:bg-blue-50"
                          title={t('common.edit')}
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(rate.id)}
                          className="rounded-lg p-2 text-red-600 hover:bg-red-50"
                          title={t('common.delete')}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {rate.isDefault && (
                  <div className="mt-3 border-t border-blue-200 pt-3">
                    <div className="flex items-center gap-2 text-sm text-blue-700">
                      <Package className="h-4 w-4" />
                      <span>{t('vat.defaultExplanation')}</span>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          /* Empty State */
          <div className="py-12 text-center">
            <Percent className="mx-auto mb-3 h-12 w-12 text-gray-300" />
            <p className="mb-2 text-gray-500">{t('vat.noRates')}</p>
            <p className="mb-4 text-sm text-gray-400">
              {t('vat.defaultToZero')}
            </p>
            <button
              onClick={handleAddNew}
              className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
            >
              {t('vat.addFirstRate')}
            </button>
          </div>
        )}
      </div>
    </ManagerLayout>
  );
};

export default VatSettingsPage;
