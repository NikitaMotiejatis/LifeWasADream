// src/manager/mockData.ts


export interface InventoryItem {
  sku: string;
  product: string;
  branch: string;
  inStock: number;
  unit: 'kg' | 'l' | 'pcs';
  status: 'ok' | 'low' | 'critical';
}

export const mockInventory: InventoryItem[] = [
  {
    sku: 'CB001',
    product: 'Coffee Beans (Arabica)',
    branch: 'Downtown Branch',
    inStock: 150,
    unit: 'kg',
    status: 'ok',
  },
  {
    sku: 'CB001',
    product: 'Coffee Beans (Arabica)',
    branch: 'Eastside Branch',
    inStock: 25,
    unit: 'kg',
    status: 'low',
  },
  {
    sku: 'ML002',
    product: 'Milk (Whole)',
    branch: 'Downtown Branch',
    inStock: 5,
    unit: 'l',
    status: 'critical',
  },
  {
    sku: 'PC003',
    product: 'Paper Cups (12oz)',
    branch: 'North Branch',
    inStock: 1200,
    unit: 'pcs',
    status: 'ok',
  },
  {
    sku: 'CR004',
    product: 'Croissants',
    branch: 'Downtown Branch',
    inStock: 15,
    unit: 'pcs',
    status: 'low',
  },
];

export interface ReportData {
  salesByCategory: { category: string; revenue: number }[];
  employeePerformance: { name: string; sales: number; orders: number }[];
}

export const mockReports: ReportData = {
  salesByCategory: [
    { category: 'Hot Drinks', revenue: 5500 },
    { category: 'Cold Drinks', revenue: 3500 },
    { category: 'Pastries', revenue: 2500 },
    { category: 'Merchandise', revenue: 1000 },
  ],
  employeePerformance: [
    { name: 'John Doe', sales: 3500, orders: 150 },
    { name: 'Jane Smith', sales: 4200, orders: 180 },
    { name: 'Peter Jones', sales: 2800, orders: 120 },
  ],
};
