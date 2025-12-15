import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import ManagerLayout from '../components/managerLayout';
import {
  Package,
  Percent,
  Search,
  Filter,
  Edit2,
  Save,
  X,
  AlertTriangle,
  Pencil,
  Tag,
} from 'lucide-react';

interface ItemVatRate {
  id: number;
  itemId: string;
  itemName: string;
  category: string;
  vatRate: number;
  customVatRate: number | null; // null = uses default, number = custom rate
  sku: string;
  price: number;
}

interface VatRate {
  id: number;
  name: string;
  rate: number;
  isDefault: boolean;
}

const VatSettingsPage: React.FC = () => {
  const { t } = useTranslation();

  // Default VAT rates (system-wide)
  const [vatRates, setVatRates] = useState<VatRate[]>([
    { id: 1, name: t('vat.rates.21percent'), rate: 21, isDefault: true },
    { id: 2, name: t('vat.rates.9percent'), rate: 9, isDefault: false },
    { id: 3, name: t('vat.rates.0percent'), rate: 0, isDefault: false },
  ]);

  // Items with their VAT rates
  const [items, setItems] = useState<ItemVatRate[]>([
    {
      id: 1,
      itemId: 'PROD-001',
      itemName: t('products.Espresso Shot'),
      category: t('menu.categories.hot drinks'),
      vatRate: 21,
      customVatRate: null, // Uses default
      sku: 'ESP001',
      price: 3.5,
    },
    {
      id: 2,
      itemId: 'PROD-002',
      itemName: t('products.croissant'),
      category: t('menu.categories.pastries'),
      vatRate: 9,
      customVatRate: null, // Uses default
      sku: 'CRS002',
      price: 2.5,
    },
    {
      id: 3,
      itemId: 'PROD-003',
      itemName: t('products.House Blend Coffee'),
      category: t('stockUpdates.categories.Raw Materials'),
      vatRate: 5,
      customVatRate: 5, // Custom rate (overrides default)
      sku: 'BEAN003',
      price: 15.99,
    },
    {
      id: 4,
      itemId: 'PROD-004',
      itemName: t('products.Iced Latte'),
      category: t('menu.categories.cold drinks'),
      vatRate: 15,
      customVatRate: 15, // Custom rate
      sku: 'ICED004',
      price: 4.5,
    },
    {
      id: 5,
      itemId: 'PROD-005',
      itemName: t('products.orangeJuice'),
      category: t('menu.categories.cold drinks'),
      vatRate: 9,
      customVatRate: null, // Uses default
      sku: 'WTR005',
      price: 1.5,
    },
    {
      id: 6,
      itemId: 'PROD-006',
      itemName: t('products.Blueberry Muffin'),
      category: t('menu.categories.pastries'),
      vatRate: 12,
      customVatRate: 12, // Custom rate
      sku: 'CAKE006',
      price: 6.99,
    },
  ]);

  // Get default VAT rate
  const defaultVatRate = vatRates.find(rate => rate.isDefault) || vatRates[0];
  const defaultVatValue = defaultVatRate?.rate || 21;

  // State for UI
  const [editingItemId, setEditingItemId] = useState<number | null>(null);
  const [vatRateInput, setVatRateInput] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [bulkSelection, setBulkSelection] = useState<number[]>([]);
  const [bulkVatRate, setBulkVatRate] = useState<string>('');
  const [validationError, setValidationError] = useState<string | null>(null);
  const [editingDefaultVat, setEditingDefaultVat] = useState(false);
  const [defaultVatInput, setDefaultVatInput] = useState<string>('');
  const [bulkValidationError, setBulkValidationError] = useState<string | null>(null);
  const [defaultVatValidationError, setDefaultVatValidationError] = useState<string | null>(null);

  // Get all unique categories
  const categories = [
    'all',
    ...Array.from(new Set(items.map(item => item.category))),
  ];

  // Filter items
  const filteredItems = items.filter(item => {
    const matchesSearch =
      searchTerm === '' ||
      item.itemName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.sku.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === 'all' || item.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  // Calculate stats
  const stats = {
    totalItems: items.length,
    itemsUsingDefault: items.filter(item => item.customVatRate === null).length,
    itemsWithCustomVat: items.filter(item => item.customVatRate !== null).length,
  };

  // Get effective VAT rate for item (custom or default)
  const getEffectiveVatRate = (item: ItemVatRate) => {
    return item.customVatRate !== null ? item.customVatRate : defaultVatValue;
  };

  // Start editing item
  const handleEditItem = (item: ItemVatRate) => {
    setEditingItemId(item.id);
    const currentRate = item.customVatRate !== null ? item.customVatRate : defaultVatValue;
    setVatRateInput(currentRate.toString());
    setValidationError(null);
  };

  // Start editing default VAT
  const handleEditDefaultVat = () => {
    setEditingDefaultVat(true);
    setDefaultVatInput(defaultVatValue.toString());
    setDefaultVatValidationError(null);
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

  // Save default VAT changes
  const handleSaveDefaultVat = () => {
    const validation = validateRate(defaultVatInput);
    if (!validation.valid && validation.error) {
      setDefaultVatValidationError(validation.error);
      return;
    }

    const newDefaultRate = parseFloat(defaultVatInput);

    // Update the default rate
    setVatRates(prev =>
      prev.map(rate => ({
        ...rate,
        isDefault: rate.rate === newDefaultRate,
      }))
    );

    // If the rate doesn't exist in the list, add it
    if (!vatRates.find(rate => rate.rate === newDefaultRate)) {
      const newVatRate: VatRate = {
        id: Math.max(...vatRates.map(r => r.id)) + 1,
        name: t('vat.rateName', { rate: newDefaultRate }),
        rate: newDefaultRate,
        isDefault: true,
      };
      setVatRates(prev => [
        ...prev.map(rate => ({ ...rate, isDefault: false })),
        newVatRate,
      ]);
    }

    // Update items that use the default (only those with customVatRate === null)
    setItems(prev =>
      prev.map(item => {
        if (item.customVatRate === null) {
          return {
            ...item,
            vatRate: newDefaultRate,
          };
        }
        return item;
      }),
    );

    setEditingDefaultVat(false);
    setDefaultVatInput('');
    setDefaultVatValidationError(null);
  };

  // Cancel editing
  const handleCancel = () => {
    setEditingItemId(null);
    setVatRateInput('');
    setValidationError(null);
    setEditingDefaultVat(false);
    setDefaultVatInput('');
    setDefaultVatValidationError(null);
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

    setBulkSelection([]);
    setBulkVatRate('');
    setBulkValidationError(null);
  };

  // Clear bulk validation error when user types
  const handleBulkVatRateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setBulkVatRate(e.target.value.replace(/[^0-9.]/g, ''));
    setBulkValidationError(null);
  };

  // Clear default VAT validation error when user types
  const handleDefaultVatInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDefaultVatInput(e.target.value.replace(/[^0-9.]/g, ''));
    setDefaultVatValidationError(null);
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
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Percent className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-blue-900">
                  {t('vat.currentDefault')}
                </p>
                {editingDefaultVat ? (
                  <div className="space-y-2 mt-1">
                    <div className="flex items-center gap-2">
                      <div className="relative">
                        <input
                          type="text"
                          inputMode="decimal"
                          value={defaultVatInput}
                          onChange={handleDefaultVatInputChange}
                          placeholder={t('itemVat.ratePlaceholder')}
                          className={`w-24 rounded-md border ${defaultVatValidationError ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'} px-3 py-2 pr-8 text-sm`}
                        />
                        <span className="absolute top-1/2 right-3 -translate-y-1/2 text-gray-500">
                          %
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={handleSaveDefaultVat}
                          className="rounded bg-green-600 px-3 py-2 text-sm font-medium text-white hover:bg-green-700"
                        >
                          {t('common.save')}
                        </button>
                        <button
                          onClick={handleCancel}
                          className="rounded border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                        >
                          {t('common.cancel')}
                        </button>
                      </div>
                    </div>
                    {defaultVatValidationError && (
                      <p className="text-sm text-red-600">
                        {defaultVatValidationError}
                      </p>
                    )}
                  </div>
                ) : (
                  <>
                    <p className="text-2xl font-bold text-blue-800">
                      {defaultVatValue}%
                    </p>
                    <p className="text-sm text-blue-700">
                      {t('vat.appliesToAll')}
                    </p>
                  </>
                )}
              </div>
            </div>
            {!editingDefaultVat && (
              <button
                onClick={handleEditDefaultVat}
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
              >
                <Pencil className="h-4 w-4 inline mr-2" />
                {t('common.edit')}
              </button>
            )}
          </div>
        </div>

        {/* Stats Overview */}
        <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
            <div className="flex items-center gap-3">
              <Package className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-blue-900">
                  {t('itemVat.stats.totalItems')}
                </p>
                <p className="text-2xl font-bold text-blue-800">
                  {stats.totalItems}
                </p>
              </div>
            </div>
          </div>
          <div className="rounded-lg border border-purple-200 bg-purple-50 p-4">
            <div className="flex items-center gap-3">
              <Tag className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-sm font-medium text-purple-900">
                  {t('itemVat.stats.customVat')}
                </p>
                <p className="text-2xl font-bold text-purple-800">
                  {stats.itemsWithCustomVat}
                </p>
              </div>
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

        {/* Search and Filters */}
        <div className="mb-6 rounded-lg border bg-white p-4">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-col gap-4 md:flex-row md:items-center">
              <div className="relative">
                <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  placeholder={t('itemVat.searchPlaceholder')}
                  className="w-full rounded-md border border-gray-300 py-2 pr-4 pl-10 focus:border-blue-500 focus:ring-blue-500 md:w-64"
                />
              </div>
              <div className="flex items-center gap-4">
                <Filter className="h-5 w-5 text-gray-400" />
                <select
                  value={selectedCategory}
                  onChange={e => setSelectedCategory(e.target.value)}
                  className="rounded-md border border-gray-300 px-3 py-2"
                >
                  {categories.map(category => (
                    <option key={category} value={category}>
                      {category === 'all'
                        ? t('itemVat.allCategories')
                        : category}
                    </option>
                  ))}
                </select>
              </div>
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
                            {item.sku} • ${item.price.toFixed(2)}
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
                              <span className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${
                                isUsingDefault
                                  ? 'bg-blue-100 text-blue-800'
                                  : 'bg-purple-100 text-purple-800'
                              }`}>
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
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="mt-2 text-sm text-blue-600 hover:text-blue-800"
                >
                  {t('itemVat.clearSearch')}
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </ManagerLayout>
  );
};

export default VatSettingsPage;