import { useParams } from 'react-router-dom';
import { Suspense } from 'react';
import SidebarCashier from '@/receptionist/components/sidebarCashier';
import Topbar from '@/global/components/topbar';
import { CartItem, CartProvider } from '@/receptionist/contexts/cartContext';
import { CurrencyProvider } from '@/global/contexts/currencyContext';
import ProductGrid from '../components/productGrid';
import OrderSummary from '../components/orderSummary';
import useSWR from 'swr';
import { useAuth } from '@/global/hooks/auth';

export default function EditOrderPage() {
  return (
    <div className="flex h-screen bg-gray-50">
      <div className="fixed inset-y-0 left-0 z-50 hidden w-64 md:block">
        <SidebarCashier />
      </div>

      <div className="flex flex-1 flex-col md:ml-64">
        <Topbar />
        <Suspense fallback={<div>Loading...</div>}>
          <OrderPanel />
        </Suspense>
      </div>
    </div>
  );
}

function OrderPanel() {
  const params = useParams();
  const { authFetchJson } = useAuth();
  const { data: items } = useSWR(
    `order/${params.orderId}`,
    (url) => authFetchJson<CartItem[]>(url, "GET"),
    {
      suspense: true,
      revalidateOnMount: true,
    }
  );

  return (
    <CurrencyProvider>
      <CartProvider initItems={items}>
        <main className="flex-1 overflow-y-auto">
          <div className="flex gap-6 p-6">

            {/* Left: Products */}
            <div className="flex-1">
              <ProductGrid />
            </div>

            {/* Right: Order summary */}
            <div className="w-1/3 max-w-md">
              <OrderSummary showPaymentSection={true}/>
            </div>

          </div>
        </main>
      </CartProvider>
    </CurrencyProvider>
  );
}
