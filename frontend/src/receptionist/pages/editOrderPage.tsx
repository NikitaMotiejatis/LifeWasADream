import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import SidebarCashier from '@/receptionist/components/sidebarCashier';
import Topbar from '@/global/components/topbar';
import { CartProvider, useCart } from '@/receptionist/contexts/cartContext';
import { CurrencyProvider } from '@/global/contexts/currencyContext';
import { EditOrderPanel } from '@/receptionist/components/editOrder/editOrderPanel';
import { useTranslation } from 'react-i18next';

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
  const { t } = useTranslation();
  const [orderData, setOrderData] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const { clearCart } = useCart();

  useEffect(() => {
    const fetchOrder = async () => {
      setLoading(true);
      try {
        console.warn('API endpoint not implemented. Using empty state.');
        setOrderData({
          id: orderId || '',
          total: 0,
          createdAt: new Date(),
          status: 'active',
          items: [],
        });
      } catch (error) {
        console.error('Failed to fetch order:', error);
      } finally {
        setLoading(false);
      }
    };

    if (orderId) {
      fetchOrder();
    }
  }, [orderId]);

  const handleSave = async (items: OrderItem[]) => {
    try {
      console.log('Saving order items:', items);
      navigate('/orders');
    } catch (error) {
      console.error('Failed to save order:', error);
    }
  };

  const handleCancel = () => {
    navigate('/orders');
  };

  const handleAddMoreItems = (items: OrderItem[]) => {
    clearCart();

    items.forEach(item => {});

    navigate('/receptionist/new-order');
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
          <p className="mt-4 text-gray-500">
            {t('order.loading', 'loading')} #{orderId}...
          </p>
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
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <p className="mt-4 text-gray-500">
            {t('invoice.labels.order', 'order')} #{orderId} not found
          </p>
          <button
            onClick={() => navigate('/orders')}
            className="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
          >
            {t('editOrder.backToOrders', 'Back to Orders')}
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
            <svg
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {t('editOrder.title', 'Edit Order')} #{orderData.id}
            </h1>
            <p className="text-sm text-gray-600">
              {t('editOrder.created', 'Created')}:{' '}
              {orderData.createdAt.toLocaleDateString()}
              {' • '}
              {t(
                `editOrder.status.${orderData.status}`,
                orderData.status.charAt(0).toUpperCase() +
                  orderData.status.slice(1),
              )}
            </p>
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
        {/* */}
        <CurrencyProvider>
          <CartProvider>
            <EditOrderContent />
          </CartProvider>
        </CurrencyProvider>
      </div>
    </div>
  );
}
