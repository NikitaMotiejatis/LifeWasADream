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
    amount: 15.5,
    reason: 'refundReasons.wrongItem',
    requestedBy: 'Hannah Smith',
    date: '2024-10-25 10:30',
    status: 'Pending',
    orderItems: [
      { name: 'products.latteMedium', quantity: 1, price: 5.5 },
      { name: 'products.croissant', quantity: 1, price: 3.5 },
      { name: 'products.muffin', quantity: 1, price: 6.5 },
    ],
  },
  {
    id: 'R002',
    orderId: 'O1005',
    customerName: 'Bob Smith',
    amount: 45.0,
    reason: 'refundReasons.reservationCancelled',
    requestedBy: 'Tom Ford',
    date: '2024-10-24 14:15',
    status: 'Pending',
    orderItems: [{ name: 'products.haircutStyle', quantity: 1, price: 45.0 }],
  },
  {
    id: 'R003',
    orderId: 'O0998',
    customerName: 'Charlie Brown',
    amount: 8.99,
    reason: 'refundReasons.spoiledProduct',
    requestedBy: 'David Jones',
    date: '2024-10-23 18:00',
    status: 'Approved',
    orderItems: [{ name: 'products.orangeJuice1L', quantity: 1, price: 8.99 }],
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
    product: 'products.coffeeBeans',
    branch: 'branches.downtown',
    inStock: 150,
    unit: 'kg',
    status: 'ok',
  },
  {
    sku: 'CB001',
    product: 'products.coffeeBeans',
    branch: 'branches.eastside',
    inStock: 25,
    unit: 'kg',
    status: 'low',
  },
  {
    sku: 'ML002',
    product: 'products.milkWhole',
    branch: 'branches.downtown',
    inStock: 5,
    unit: 'l',
    status: 'critical',
  },
  {
    sku: 'PC003',
    product: 'products.paperCups12oz',
    branch: 'branches.north',
    inStock: 1200,
    unit: 'pcs',
    status: 'ok',
  },
  {
    sku: 'CR004',
    product: 'products.croissants',
    branch: 'branches.downtown',
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
    { category: 'categories.hotDrinks', revenue: 5500 },
    { category: 'categories.coldDrinks', revenue: 3500 },
    { category: 'categories.pastries', revenue: 2500 },
    { category: 'categories.merchandise', revenue: 1000 },
  ],
  employeePerformance: [
    { name: 'John Doe', sales: 3500, orders: 150 },
    { name: 'Jane Smith', sales: 4200, orders: 180 },
    { name: 'Peter Jones', sales: 2800, orders: 120 },
  ],
};
