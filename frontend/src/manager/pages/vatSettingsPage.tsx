import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import ManagerLayout from '../components/managerLayout';
import { Package, Percent, AlertTriangle, Tag } from 'lucide-react';
import { useCurrency } from '@/global/contexts/currencyContext';
import { useAuth } from '@/global/hooks/auth';
import useSWR from 'swr';

interface ItemVatRate {
  id: number;
  itemId: string;
  itemName: string;
  category: string;
  vatRate: number;
  customVatRate: number | null;
  sku: string;
  price: number;
}

const VatSettingsPage: React.FC = () => {
  const { t } = useTranslation();
  const { formatPrice } = useCurrency();

  // Items with their VAT rates (price in CENTS)
  const [items, setItems] = useState<ItemVatRate[]>([
    {
      id: 1,
      itemId: 'PROD-001',
      itemName: t('products.Espresso Shot'),
      category: t('menu.categories.hot drinks'),
      vatRate: 21,
      customVatRate: null,
      sku: 'ESP001',
      price: 350,
    },
    {
      id: 2,
      itemId: 'PROD-002',
      itemName: t('products.croissant'),
      category: t('menu.categories.pastries'),
      vatRate: 9,
      customVatRate: null,
      sku: 'CRS002',
      price: 250,
    },
    {
      id: 3,
      itemId: 'PROD-003',
      itemName: t('products.House Blend Coffee'),
      category: t('stockUpdates.categories.Raw Materials'),
      vatRate: 5,
      customVatRate: 5,
      sku: 'BEAN003',
      price: 1599,
    },
    {
      id: 4,
      itemId: 'PROD-004',
      itemName: t('products.Iced Latte'),
      category: t('menu.categories.cold drinks'),
      vatRate: 15,
      customVatRate: 15,
      sku: 'ICED004',
      price: 450,
    },
    {
      id: 5,
      itemId: 'PROD-005',
      itemName: t('products.orangeJuice'),
      category: t('menu.categories.cold drinks'),
      vatRate: 9,
      customVatRate: null,
      sku: 'WTR005',
      price: 150,
    },
    {
      id: 6,
      itemId: 'PROD-006',
      itemName: t('products.Blueberry Muffin'),
      category: t('menu.categories.pastries'),
      vatRate: 12,
      customVatRate: 12,
      sku: 'CAKE006',
      price: 699,
    },
  ]);

  // Get default VAT rate
  const { authFetchJson } = useAuth();
  const { data: defaultVatValue } = useSWR(
    `tax/default?locationId=${9}`,
    (url) => authFetchJson<number>(url, 'GET'),
  );

  const [editingItemId, setEditingItemId] = useState<number | null>(null);
  const [vatRateInput, setVatRateInput] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [bulkSelection, setBulkSelection] = useState<number[]>([]);
  const [bulkVatRate, setBulkVatRate] = useState<string>('');
  const [validationError, setValidationError] = useState<string | null>(null);
  const [bulkValidationError, setBulkValidationError] = useState<string | null>(
    null,
  );

  const categories = [
    'all',
    ...Array.from(new Set(items.map(item => item.category))),
  ];

  // Filter items
  const filteredItems = items.filter(item => {
    const matchesCategory =
      selectedCategory === 'all' || item.category === selectedCategory;
    return matchesCategory;
  });

  // Get effective VAT rate for item (custom or default)
  const getEffectiveVatRate = (item: ItemVatRate) => {
    return item.customVatRate !== null ? item.customVatRate : defaultVatValue;
  };

  // Start editing item
  const handleEditItem = (item: ItemVatRate) => {
    setEditingItemId(item.id);
    const currentRate =
      item.customVatRate !== null ? item.customVatRate : defaultVatValue;
    setVatRateInput(currentRate.toString());
    setValidationError(null);
  };

  // Helper function to convert cents to display format
  const centsToDisplay = (cents: number): string => {
    return formatPrice(cents / 100);
  };

  // Validate rate input
  const validateRate = (
    rateStr: string,
  ): { valid: boolean; error?: string } => {
    if (rateStr.trim() === '') {
      return {
        valid: false,
        error: t('vat.validation.required'),
      };
    }

    const rate = parseFloat(rateStr);
    if (isNaN(rate)) {
      return {
        valid: false,
        error: t('vat.validation.nan'),
      };
    }

    if (rate < 0) {
      return {
        valid: false,
        error: t('vat.validation.negative'),
      };
    }

    if (rate > 100) {
      return {
        valid: false,
        error: t('vat.validation.exceeds'),
      };
    }

    return { valid: true };
  };

  // Save item changes
  const handleSaveItem = () => {
    if (editingItemId === null) return;

    const validation = validateRate(vatRateInput);
    if (!validation.valid && validation.error) {
      setValidationError(validation.error);
      return;
    }

    const newRate = parseFloat(vatRateInput);
    const isUsingDefault = newRate === defaultVatValue;

    setItems(prev =>
      prev.map(item => {
        if (item.id === editingItemId) {
          return {
            ...item,
            vatRate: newRate,
            customVatRate: isUsingDefault ? null : newRate,
          };
        }
        return item;
      }),
    );

    handleCancel();
  };

  // Cancel editing
  const handleCancel = () => {
    setEditingItemId(null);
    setVatRateInput('');
    setValidationError(null);
  };

  // Reset item to default VAT
  const handleResetToDefault = (itemId: number) => {
    setItems(prev =>
      prev.map(item => {
        if (item.id === itemId) {
          return {
            ...item,
            vatRate: defaultVatValue,
            customVatRate: null,
          };
        }
        return item;
      }),
    );
  };

  // Bulk selection
  const handleBulkSelectAll = () => {
    if (bulkSelection.length === filteredItems.length) {
      setBulkSelection([]);
    } else {
      setBulkSelection(filteredItems.map(item => item.id));
    }
  };

  const handleBulkSelect = (itemId: number) => {
    setBulkSelection(prev =>
      prev.includes(itemId)
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId],
    );
  };

  // Apply bulk VAT rate
  const handleBulkApply = () => {
    if (bulkSelection.length === 0) return;

    const validation = validateRate(bulkVatRate);
    if (!validation.valid && validation.error) {
      setBulkValidationError(validation.error);
      return;
    }

    const newRate = parseFloat(bulkVatRate);
    const isUsingDefault = newRate === defaultVatValue;

    setItems(prev =>
      prev.map(item => {
        if (bulkSelection.includes(item.id)) {
          return {
            ...item,
            vatRate: newRate,
            customVatRate: isUsingDefault ? null : newRate,
          };
        }
        return item;
      }),
    );
    setSelectedCategory('all');
    setBulkSelection([]);
    setBulkVatRate('');
    setBulkValidationError(null);
  };

  // Clear bulk validation error when user types
  const handleBulkVatRateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setBulkVatRate(e.target.value.replace(/[^0-9.]/g, ''));
    setBulkValidationError(null);
  };

  // Clear item validation error when user types
  const handleVatRateInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setVatRateInput(e.target.value.replace(/[^0-9.]/g, ''));
    setValidationError(null);
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

        {/* Default VAT Section */}
        <div className="mb-6 rounded-lg border border-blue-200 bg-blue-50 p-4">
          <div className="flex items-center gap-3">
            <Percent className="h-5 w-5 text-blue-600" />
            <div>
              <p className="text-sm font-medium text-blue-900">
                {t('vat.currentDefault')}
              </p>
              <p className="text-2xl font-bold text-blue-800">
                {defaultVatValue}%
              </p>
              <p className="text-sm text-blue-700">{t('vat.appliesToAll')}</p>
            </div>
          </div>
        </div>

        {/* Bulk Actions */}
        {bulkSelection.length > 0 && (
          <div className="mb-4 rounded-lg border border-yellow-200 bg-yellow-50 p-4">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-3">
                <AlertTriangle className="h-5 w-5 text-yellow-600" />
                <div>
                  <p className="text-sm font-medium text-yellow-900">
                    {t('itemVat.bulkActions.selected', {
                      count: bulkSelection.length,
                    })}
                  </p>
                </div>
              </div>
              <div className="flex flex-col gap-3 md:flex-row md:items-center">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Percent className="h-4 w-4 text-gray-500" />
                    <input
                      type="text"
                      inputMode="decimal"
                      value={bulkVatRate}
                      onChange={handleBulkVatRateChange}
                      placeholder={t('itemVat.ratePlaceholder')}
                      className={`w-32 rounded-md border ${bulkValidationError ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-yellow-500 focus:ring-yellow-500'} px-3 py-2 text-sm`}
                    />
                    <span className="text-gray-600">%</span>
                  </div>
                  {bulkValidationError && (
                    <p className="text-sm text-red-600">
                      {bulkValidationError}
                    </p>
                  )}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleBulkApply}
                    className="rounded bg-yellow-600 px-4 py-2 text-sm font-medium text-white hover:bg-yellow-700"
                  >
                    {t('itemVat.bulkActions.apply')}
                  </button>
                  <button
                    onClick={() => {
                      setBulkSelection([]);
                      setBulkValidationError(null);
                    }}
                    className="rounded border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    {t('common.cancel')}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Category Filter */}
        <div className="mb-6">
          <label className="mb-2 block text-sm font-medium text-gray-700">
            {t('itemVat.filterByCategory')}
          </label>
          <div className="relative">
            <select
              value={selectedCategory}
              onChange={e => setSelectedCategory(e.target.value)}
              className="w-full appearance-none rounded-lg border-2 border-gray-300 bg-white px-4 py-3 pr-10 text-base transition-colors hover:border-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none"
            >
              {categories.map(category => (
                <option key={category} value={category}>
                  {category === 'all' ? t('itemVat.allCategories') : category}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
              <svg
                className="h-5 w-5 text-gray-400"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Items Table */}
        <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="w-12 px-4 py-3">
                    <input
                      type="checkbox"
                      checked={
                        bulkSelection.length === filteredItems.length &&
                        filteredItems.length > 0
                      }
                      onChange={handleBulkSelectAll}
                      className="rounded border-gray-300"
                    />
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                    {t('itemVat.table.item')}
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                    {t('itemVat.table.category')}
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                    {t('itemVat.table.vatRate')}
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                    {t('itemVat.table.actions')}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {filteredItems.map(item => {
                  const effectiveRate = getEffectiveVatRate(item);
                  const isUsingDefault = item.customVatRate === null;

                  return (
                    <tr key={item.id}>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <input
                          type="checkbox"
                          checked={bulkSelection.includes(item.id)}
                          onChange={() => handleBulkSelect(item.id)}
                          className="rounded border-gray-300"
                        />
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div>
                          <p className="font-medium text-gray-900">
                            {item.itemName}
                          </p>
                          <p className="text-sm text-gray-500">
                            {item.sku} • {centsToDisplay(item.price)}
                          </p>
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="text-sm text-gray-700">
                          {item.category}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        {editingItemId === item.id ? (
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <div className="relative">
                                <input
                                  type="text"
                                  inputMode="decimal"
                                  value={vatRateInput}
                                  onChange={handleVatRateInputChange}
                                  placeholder={t('itemVat.ratePlaceholder')}
                                  className={`w-24 rounded-md border ${validationError ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'} px-3 py-2 pr-8 text-sm`}
                                />
                                <span className="absolute top-1/2 right-3 -translate-y-1/2 text-gray-500">
                                  %
                                </span>
                              </div>
                            </div>
                            {validationError && (
                              <p className="text-sm text-red-600">
                                {validationError}
                              </p>
                            )}
                          </div>
                        ) : (
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span
                                className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${
                                  isUsingDefault
                                    ? 'bg-blue-100 text-blue-800'
                                    : 'bg-purple-100 text-purple-800'
                                }`}
                              >
                                {effectiveRate}%
                              </span>
                              {!isUsingDefault && (
                                <span className="text-xs text-gray-500">
                                  ({t('itemVat.custom')})
                                </span>
                              )}
                            </div>
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        {editingItemId === item.id ? (
                          <div className="flex gap-2">
                            <button
                              onClick={handleSaveItem}
                              className="rounded bg-green-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-green-700"
                            >
                              {t('common.save')}
                            </button>
                            <button
                              onClick={handleCancel}
                              className="rounded border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
                            >
                              {t('common.cancel')}
                            </button>
                          </div>
                        ) : (
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleEditItem(item)}
                              className="rounded bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700"
                            >
                              {t('common.edit')}
                            </button>
                            {!isUsingDefault && (
                              <button
                                onClick={() => handleResetToDefault(item.id)}
                                className="rounded border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
                              >
                                {t('itemVat.reset')}
                              </button>
                            )}
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {filteredItems.length === 0 && (
            <div className="py-12 text-center">
              <Package className="mx-auto mb-3 h-12 w-12 text-gray-300" />
              <p className="text-gray-500">{t('itemVat.noItemsFound')}</p>
            </div>
          )}
        </div>
      </div>
    </ManagerLayout>
  );
};

export default VatSettingsPage;
