import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import SidebarCashier from '@/receptionist/components/sidebarCashier';
import Topbar from '@/global/components/topbar';
import { CartProvider, useCart } from '@/receptionist/contexts/cartContext';
import { CurrencyProvider } from '@/global/contexts/currencyContext';
import editOrderPanel, { EditOrderPanel } from '@/receptionist/components/editOrderPanel';

type Order = {
  id: string;
  total: number;
  createdAt: Date;
  status: 'active' | 'closed' | 'refund_pending';
  items?: any[];
};

type OrderItem = {
  id: string;
  product: any;
  quantity: number;
  selectedVariations: any[];
  finalPrice: number;
  note?: string;
};

function EditOrderContent() {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const [orderData, setOrderData] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [initialItems, setInitialItems] = useState<OrderItem[]>([]);
  const { addToCart, clearCart } = useCart();

  useEffect(() => {
    const fetchOrder = async () => {
      setLoading(true);
      try {
        await new Promise(resolve => setTimeout(resolve, 300));
        
        // Mock data - replace with your actual API call
        const mockOrder: Order = {
          id: orderId || '',
          total: 87.4,
          createdAt: new Date('2025-11-25T16:45:00'),
          status: 'active',
          items: []
        };
        
        // Mock initial items for the order
        const mockItems: OrderItem[] = [
          {
            id: 'item1',
            product: { 
              id: 'iced-coffee', 
              name: 'Iced Coffee', 
              nameKey: 'products.icedCoffee',
              basePrice: 4.5 
            },
            quantity: 2,
            selectedVariations: [
              { name: 'Large', nameKey: 'variations.large', priceModifier: 0.8 },
              { name: 'Oat Milk', nameKey: 'variations.oatMilk', priceModifier: 0.6 },
            ],
            finalPrice: 4.5 + 0.8 + 0.6,
            note: 'Extra ice please'
          },
          {
            id: 'item2',
            product: { 
              id: 'croissant', 
              name: 'Croissant', 
              nameKey: 'products.croissant',
              basePrice: 3.0 
            },
            quantity: 1,
            selectedVariations: [],
            finalPrice: 3.0,
          }
        ];
        
        setOrderData(mockOrder);
        setInitialItems(mockItems);
      } catch (error) {
        console.error('Failed to fetch order:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId]);

  const handleSave = (items: OrderItem[]) => {
    console.log('Saving order changes...', items);
    
    // Here you would typically send the updated items to your backend
    // Example API call:
    // await updateOrderAPI(orderId, { items });
    
    // Show success message
    alert('Order updated successfully!');
    
    navigate('/orders');
  };

  const handleCancel = () => {
    // Confirm before canceling
    if (window.confirm('Are you sure you want to cancel? Changes will be lost.')) {
      navigate('/orders');
    }
  };

  const handleAddMoreItems = (items: OrderItem[]) => {
    // Clear current cart and add items from edit order
    clearCart();
    
    // Add each item to cart
    items.forEach(item => {
      // Convert OrderItem format to cart format
      addToCart(item.product, item.selectedVariations );
    });
    
    // Navigate to new order page
    navigate('/receptionist/new-order');
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
          <p className="mt-4 text-gray-500">Loading order #{orderId}...</p>
        </div>
      </div>
    );
  }

  if (!orderData) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 text-gray-400">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="mt-4 text-gray-500">Order #{orderId} not found</p>
          <button
            onClick={() => navigate('/orders')}
            className="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
          >
            Back to Orders
          </button>
        </div>
      </div>
    );
  }

  return (
    <main className="flex-1 overflow-y-auto p-4 md:p-6">
      <div className="mb-6">
        <div className="flex items-center gap-4">
          <button
            onClick={handleCancel}
            className="rounded-lg border border-gray-300 p-2 hover:bg-gray-50"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Edit Order #{orderData.id}</h1>
            <p className="text-sm text-gray-600">
              Created {orderData.createdAt.toLocaleDateString()} • {orderData.status.charAt(0).toUpperCase() + orderData.status.slice(1)}
            </p>
          </div>
          <div className="ml-auto rounded-lg bg-gray-100 px-3 py-1">
            <span className="text-sm font-medium text-gray-700">
              Total: ${orderData.total.toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      <div className="flex justify-center">
        <div className="w-full max-w-5xl">
          <EditOrderPanel
            mode="edit"
            orderId={orderData.id}
            onSave={handleSave}
            onCancel={handleCancel}
            onAddMoreItems={handleAddMoreItems}
          />
        </div>
      </div>
    </main>
  );
}

export default function EditOrderPage() {
  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="fixed inset-y-0 left-0 z-50 hidden w-64 md:block">
        <SidebarCashier />
      </div>

      {/* Main Content */}
      <div className="flex flex-1 flex-col md:ml-64">
        {/* Topbar */}
        <Topbar />
        
        {/* Content Area with Context Providers */}
        <CurrencyProvider>
          <CartProvider>
            <EditOrderContent />
          </CartProvider>
        </CurrencyProvider>
      </div>

      {/* Mobile Sidebar Toggle (optional) */}
      <button className="fixed bottom-4 right-4 z-50 rounded-full bg-blue-600 p-4 shadow-lg md:hidden">
        <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>
    </div>
  );
}