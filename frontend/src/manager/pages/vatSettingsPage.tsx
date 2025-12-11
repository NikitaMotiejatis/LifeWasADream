import React, { useState } from 'react';
import ManagerLayout from '../components/managerLayout';
import { Plus, Edit2, Trash2, Save, X, Percent, Package, AlertTriangle } from 'lucide-react';

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
  const [validationError, setValidationError] = useState<string | null>(null);
  
  // State for confirmation dialog when changing default VAT
  const [confirmChange, setConfirmChange] = useState<number | null>(null);

  // Validate the rate input
  const validateRate = (value: string, isEditing: boolean = false): string | null => {
    if (!value.trim()) {
      return 'VAT percentage is required';
    }
    
    const rateValue = parseFloat(value);
    
    if (isNaN(rateValue)) {
      return 'Must be a valid number';
    }
    
    if (rateValue < 0) {
      return 'Cannot be negative';
    }
    
    if (rateValue > 100) {
      return 'Cannot exceed 100%';
    }
    
    // Check for duplicate rates (only when adding new, not when editing the same rate)
    if (!isEditing) {
      const existingRate = vatRates.find(rate => rate.rate === rateValue);
      if (existingRate) {
        return `A ${rateValue}% VAT rate already exists`;
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
      const duplicateRate = vatRates.find(rate => 
        rate.rate === rateValue && rate.id !== editingId
      );
      
      if (duplicateRate) {
        setValidationError(`A ${rateValue}% VAT rate already exists`);
        return;
      }
      
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
      // Add new rate 
      const newVatRate: VatRate = {
        id: vatRates.length > 0 ? Math.max(...vatRates.map(r => r.id)) + 1 : 1,
        name: `${rateValue}% VAT`,
        rate: rateValue,
        isDefault: vatRates.length === 0 
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

    setVatRates(prev => prev.map(rate => ({
      ...rate,
      isDefault: rate.id === confirmChange
    })));

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
                    onChange={(e) => handleRateChange(e.target.value)}
                    onBlur={() => {
                      // Validate on blur as well
                      const isEditing = editingId !== null;
                      const error = validateRate(newRate, isEditing);
                      setValidationError(error);
                    }}
                    min="0"
                    max="100"
                    step="0.1"
                    className={`flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                      validationError 
                        ? 'border-red-300 focus:ring-red-500' 
                        : 'border-gray-300 focus:ring-blue-500'
                    }`}
                    placeholder="e.g., 21.00"
                    autoFocus
                  />
                  <span className="text-gray-600">%</span>
                </div>
                
                {/* Validation Error Message */}
                {validationError && (
                  <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" />
                    {validationError}
                  </p>
                )}
                
                {/* Help text when no error */}
                {!validationError && (
                  <p className="mt-1 text-sm text-gray-500">
                    {editingId 
                      ? 'Update the VAT percentage value'
                      : 'Enter a value between 0 and 100 (no duplicates)'
                    }
                  </p>
                )}
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
                  disabled={!!validationError || !newRate.trim()}
                  className={`flex-1 px-3 py-2 rounded text-sm ${
                    validationError || !newRate.trim()
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
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