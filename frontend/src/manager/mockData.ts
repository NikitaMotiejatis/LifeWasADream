// src/manager/mockData.ts

export interface RefundRequest {
  id: string;
  orderId: string;
  customerName: string;
  amount: number;
  reason: string;
  requestedBy: string;
  date: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  orderItems: { name: string; quantity: number; price: number }[];
}

export const mockRefundRequests: RefundRequest[] = [
  {
    id: 'R001',
    orderId: 'O1001',
    customerName: 'Alice Johnson',
    amount: 15.50,
    reason: 'Incorrect item delivered (wrong size coffee).',
    requestedBy: 'Cashier 1',
    date: '2024-10-25 10:30',
    status: 'Pending',
    orderItems: [
      { name: 'Latte (Medium)', quantity: 1, price: 5.50 },
      { name: 'Croissant', quantity: 1, price: 3.50 },
      { name: 'Muffin', quantity: 1, price: 6.50 },
    ],
  },
  {
    id: 'R002',
    orderId: 'O1005',
    customerName: 'Bob Smith',
    amount: 45.00,
    reason: 'Reservation cancelled within 24 hours.',
    requestedBy: 'Receptionist 3',
    date: '2024-10-24 14:15',
    status: 'Pending',
    orderItems: [
      { name: 'Haircut & Style', quantity: 1, price: 45.00 },
    ],
  },
  {
    id: 'R003',
    orderId: 'O0998',
    customerName: 'Charlie Brown',
    amount: 8.99,
    reason: 'Product spoiled upon opening.',
    requestedBy: 'Cashier 2',
    date: '2024-10-23 18:00',
    status: 'Approved',
    orderItems: [
      { name: 'Orange Juice (1L)', quantity: 1, price: 8.99 },
    ],
  },
];

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
