import { useState } from 'react';
import Topbar from '../components/topbar';
import SidebarStockClerk from '../components/sidebarStockClerk';

interface StockItem {
  id: string;
  name: string;
  sku: string;
  category: string;
  currentStock: number;
  minimumLevel: number;
  unit: string;
  lastUpdated: string;
}

export default function StockUpdatesPage() {
  const [stocks] = useState<StockItem[]>([
    {
      id: '1',
      name: 'Coffee Beans (Arabica)',
      sku: 'CB-001',
      category: 'Raw Materials',
      currentStock: 45,
      minimumLevel: 20,
      unit: 'kg',
      lastUpdated: '2 hours ago',
    },
    {
      id: '2',
      name: 'Milk (Whole)',
      sku: 'ML-002',
      category: 'Dairy',
      currentStock: 15,
      minimumLevel: 25,
      unit: 'liters',
      lastUpdated: '3 hours ago',
    },
    {
      id: '3',
      name: 'Sugar',
      sku: 'SG-003',
      category: 'Raw Materials',
      currentStock: 30,
      minimumLevel: 15,
      unit: 'kg',
      lastUpdated: '1 day ago',
    },
    {
      id: '4',
      name: 'Paper Cups (12oz)',
      sku: 'PC-004',
      category: 'Packaging',
      currentStock: 500,
      minimumLevel: 200,
      unit: 'pcs',
      lastUpdated: '5 hours ago',
    },
    {
      id: '5',
      name: 'Croissants',
      sku: 'CR-005',
      category: 'Bakery',
      currentStock: 25,
      minimumLevel: 10,
      unit: 'pcs',
      lastUpdated: '4 hours ago',
    },
    {
      id: '6',
      name: 'Syrup - Vanilla',
      sku: 'SY-006',
      category: 'Ingredients',
      currentStock: 8,
      minimumLevel: 5,
      unit: 'bottles',
      lastUpdated: '6 hours ago',
    },
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');

  const categories = [
    'All Categories',
    'Raw Materials',
    'Dairy',
    'Packaging',
    'Bakery',
    'Ingredients',
  ];

  const filteredStocks = stocks.filter(stock => {
    const matchesSearch =
      stock.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      stock.sku.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === 'All Categories' || stock.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const isLowStock = (current: number, minimum: number) => current < minimum;

  const handleUpdateStock = (id: string) => {
    console.log(`Update stock for item ${id}`);
    // TODO: Implement stock update modal/form
  };

  return (
    <div className="flex h-screen w-full">
      <SidebarStockClerk />

      <div className="flex flex-1 flex-col">
        <Topbar />

        <div className="flex-1 overflow-auto bg-gray-100 p-6">
          <div className="mb-6">
            <h1 className="mb-2 text-3xl font-bold text-gray-900">Stock Updates</h1>
            <p className="text-gray-600">Real-time inventory management</p>
          </div>

          {/* Search and Filter */}
          <div className="mb-6 flex flex-col gap-4 rounded-lg bg-white p-6 shadow-sm">
            <div className="flex gap-4">
              <input
                type="text"
                placeholder="Search by name or SKU..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="flex-1 rounded-lg border border-gray-300 px-4 py-2 transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
              />
              <select
                value={selectedCategory}
                onChange={e => setSelectedCategory(e.target.value)}
                className="rounded-lg border border-gray-300 bg-white px-4 py-2 transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Stock Grid */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredStocks.map(stock => (
              <div
                key={stock.id}
                className={`rounded-lg border p-6 shadow-sm transition-all ${
                  isLowStock(stock.currentStock, stock.minimumLevel)
                    ? 'border-red-200 bg-red-50'
                    : 'border-gray-200 bg-white'
                }`}
              >
                <div className="mb-4">
                  <h3 className="font-semibold text-gray-900">{stock.name}</h3>
                  <p className="text-sm text-gray-600">SKU: {stock.sku}</p>
                  <p className="text-xs text-gray-500">{stock.category}</p>
                </div>

                <div className="mb-4 space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Current Stock:</span>
                    <span
                      className={`font-semibold ${
                        isLowStock(stock.currentStock, stock.minimumLevel)
                          ? 'text-red-600'
                          : 'text-green-600'
                      }`}
                    >
                      {stock.currentStock} {stock.unit}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Minimum Level:</span>
                    <span className="font-semibold text-gray-900">
                      {stock.minimumLevel} {stock.unit}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Last updated:</span>
                    <span className="text-sm text-gray-500">{stock.lastUpdated}</span>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mb-4">
                  <div className="h-2 w-full rounded-full bg-gray-200">
                    <div
                      className={`h-full rounded-full transition-all ${
                        isLowStock(stock.currentStock, stock.minimumLevel)
                          ? 'bg-red-500'
                          : 'bg-green-500'
                      }`}
                      style={{
                        width: `${Math.min(
                          (stock.currentStock / (stock.minimumLevel * 2)) * 100,
                          100,
                        )}%`,
                      }}
                    />
                  </div>
                </div>

                <button
                  onClick={() => handleUpdateStock(stock.id)}
                  className="w-full rounded-lg bg-blue-600 py-2 font-medium text-white transition-all duration-200 hover:bg-blue-700 active:scale-95"
                >
                  Update Stock
                </button>
              </div>
            ))}
          </div>

          {filteredStocks.length === 0 && (
            <div className="rounded-lg border border-gray-200 bg-white p-12 text-center">
              <p className="text-gray-600">No stock items found matching your criteria.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
