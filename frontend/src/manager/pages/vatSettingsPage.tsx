import React, { useState } from 'react';
import ManagerLayout from '../components/managerLayout';
import { Plus, Edit2, Trash2, Save, X, Percent, Package, AlertTriangle } from 'lucide-react';

/**
 * Represents a VAT (Value Added Tax) rate in the system
 * @property id - Unique identifier for the VAT rate
 * @property name - Display name (e.g., "21% VAT")
 * @property rate - Percentage value (e.g., 21 for 21%)
 * @property isDefault - Whether this rate applies to all products
 */
interface VatRate {
  id: number;
  name: string;
  rate: number;
  isDefault: boolean;
}

const VatSettingsPage: React.FC = () => {
  // State for all VAT rates in the system
  const [vatRates, setVatRates] = useState<VatRate[]>([
    { id: 1, name: '21% VAT', rate: 21, isDefault: true },
    { id: 2, name: '9% VAT', rate: 9, isDefault: false },
    { id: 3, name: '0% VAT', rate: 0, isDefault: false },
  ]);
  
  // State for managing form interactions
  const [editingId, setEditingId] = useState<number | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [newRate, setNewRate] = useState<string>('');
  
  // State for confirmation dialog when changing default VAT
  const [confirmChange, setConfirmChange] = useState<number | null>(null);

  // Get the currently active default VAT rate
  const getDefaultVatRate = () => {
    if (vatRates.length === 0) {
      return { id: 0, name: '0% VAT', rate: 0, isDefault: true };
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
  };

  // Start editing an existing VAT rate
  const handleEdit = (rate: VatRate) => {
    setEditingId(rate.id);
    setNewRate(rate.rate.toString());
    setIsAdding(false);
  };

  /**
   * Save a new or edited VAT rate
   * Validates input and updates state accordingly
   */
  const handleSave = () => {
    if (!newRate.trim()) return;

    const rateValue = parseFloat(newRate);
    if (isNaN(rateValue) || rateValue < 0 || rateValue > 100) {
      alert('VAT rate must be a number between 0 and 100');
      return;
    }

    if (editingId) {
      // Update existing rate
      setVatRates(prev => prev.map(rate => 
        rate.id === editingId 
          ? { 
              ...rate, 
              name: `${rateValue}% VAT`,
              rate: rateValue
            }
          : rate
      ));
    } else {
      // Add new rate (new rates are never default by default)
      const newVatRate: VatRate = {
        id: vatRates.length > 0 ? Math.max(...vatRates.map(r => r.id)) + 1 : 1,
        name: `${rateValue}% VAT`,
        rate: rateValue,
        isDefault: vatRates.length === 0 // First rate becomes default
      };
      setVatRates(prev => [...prev, newVatRate]);
    }

    handleCancel();
  };

  // Delete a VAT rate with confirmation
  const handleDelete = (id: number) => {
    if (window.confirm('Delete this VAT rate?')) {
      const updatedRates = vatRates.filter(rate => rate.id !== id);
      
      // If we're deleting the default rate, make the first remaining rate the default
      const deletedRate = vatRates.find(rate => rate.id === id);
      if (deletedRate?.isDefault && updatedRates.length > 0) {
        updatedRates[0].isDefault = true;
      }
      
      setVatRates(updatedRates);
    }
  };

  // Cancel any form editing or adding
  const handleCancel = () => {
    setEditingId(null);
    setIsAdding(false);
    setNewRate('');
  };

  // Initiate process to set a VAT rate as default
  const setAsDefault = (id: number) => {
    const vatRate = vatRates.find(r => r.id === id);
    if (!vatRate) return;
    setConfirmChange(id);
  };

  // Confirm setting a new default VAT rate
  const confirmSetAsDefault = () => {
    if (!confirmChange) return;

    // Update all rates: only the selected one becomes default
    setVatRates(prev => prev.map(rate => ({
      ...rate,
      isDefault: rate.id === confirmChange
    })));

    alert(`VAT rate changed to ${vatRates.find(r => r.id === confirmChange)?.name}. This will apply to ALL products for new orders.`);
    
    setConfirmChange(null);
  };

  // Cancel the default VAT rate change
  const cancelSetAsDefault = () => {
    setConfirmChange(null);
  };

  return (
    <ManagerLayout>
      <div className="p-6">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-gray-900">VAT Rates</h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage VAT rates. Set one as default to apply to all products.
          </p>
        </div>

        {/* Current Default VAT Banner - Only show if we have rates */}
        {vatRates.length > 0 && (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Percent className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="text-sm font-medium text-blue-900">Current VAT for all products:</p>
                  <p className="text-2xl font-bold text-blue-800">{defaultVatRate.name}</p>
                </div>
              </div>
              <div className="text-sm text-blue-700">
                Applies to all products for new orders
              </div>
            </div>
          </div>
        )}

        {/* Add/Edit Form */}
        {(isAdding || editingId) && (
          <div className="bg-white rounded-lg border p-4 mb-6">
            <h3 className="text-md font-medium text-gray-900 mb-3">
              {editingId ? 'Edit VAT Rate' : 'Add New VAT Rate'}
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  VAT Percentage
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={newRate}
                    onChange={(e) => setNewRate(e.target.value)}
                    min="0"
                    max="100"
                    step="0.1"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., 21.00"
                    autoFocus
                  />
                  <span className="text-gray-600">%</span>
                </div>
              </div>
              
              <div className="flex gap-2">
                <button
                  onClick={handleCancel}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50 text-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="flex-1 px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
                >
                  {editingId ? 'Update' : 'Add'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Action Bar */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-medium text-gray-900">
            Available VAT Rates
          </h2>
          {!isAdding && !editingId && !confirmChange && (
            <button
              onClick={handleAddNew}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Plus className="w-4 h-4" />
              Add New Rate
            </button>
          )}
        </div>

        {/* Confirmation Dialog for Changing Default VAT */}
        {confirmChange && (
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="text-md font-medium text-yellow-800 mb-2">
                  Change Default VAT Rate
                </h3>
                <p className="text-sm text-yellow-700 mb-4">
                  This will change the VAT rate for <strong>ALL PRODUCTS</strong> to {
                    vatRates.find(r => r.id === confirmChange)?.name
                  }. 
                  Existing orders will keep their original VAT rates.
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={cancelSetAsDefault}
                    className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmSetAsDefault}
                    className="px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700"
                  >
                    Yes, Change All Products
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
                className={`bg-white border rounded-lg p-4 ${
                  rate.isDefault ? 'border-blue-300 bg-blue-50' : ''
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                      rate.isDefault ? 'bg-blue-100' : 'bg-gray-100'
                    }`}>
                      <Percent className={`w-6 h-6 ${
                        rate.isDefault ? 'text-blue-600' : 'text-gray-600'
                      }`} />
                    </div>
                    
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-medium text-gray-900">
                          {rate.name}
                        </h3>
                        {rate.isDefault && (
                          <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                            ACTIVE FOR ALL PRODUCTS
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-500">
                        {rate.isDefault 
                          ? 'Applied to all products' 
                          : 'Available for selection'
                        }
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {!rate.isDefault && !confirmChange && (
                      <button
                        onClick={() => setAsDefault(rate.id)}
                        className="px-3 py-1.5 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                      >
                        Set as Default
                      </button>
                    )}
                    
                    {!confirmChange && (
                      <>
                        <button
                          onClick={() => handleEdit(rate)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(rate.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
                
                {rate.isDefault && (
                  <div className="mt-3 pt-3 border-t border-blue-200">
                    <div className="flex items-center gap-2 text-sm text-blue-700">
                      <Package className="w-4 h-4" />
                      <span>This VAT rate applies to all products automatically</span>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          /* Empty State */
          <div className="text-center py-12">
            <Percent className="w-12 h-12 mx-auto text-gray-300 mb-3" />
            <p className="text-gray-500 mb-2">No VAT rates configured</p>
            <p className="text-sm text-gray-400 mb-4">
              All products will use 0% VAT until you add VAT rates
            </p>
            <button
              onClick={handleAddNew}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Add Your First VAT Rate
            </button>
          </div>
        )}
      </div>
    </ManagerLayout>
  );
};

export default VatSettingsPage;