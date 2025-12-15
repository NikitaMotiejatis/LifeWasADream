import SidebarCashier from '@/receptionist/components/sidebarCashier';
import Topbar from '@/global/components/topbar';
import ProductGrid from '@/receptionist/components/productGrid';
import OrderSummary from '@/receptionist/components/orderSummary';
import { CartProvider } from '@/receptionist/contexts/cartContext';

export default function NewOrderPage() {
  return (
    <div className="flex h-screen">
      <div className="fixed inset-y-0 left-0 z-50 w-64">
        <SidebarCashier />
      </div>

      <div className="ml-64 flex flex-1 flex-col">
        <div className="flex flex-1 flex-col overflow-hidden">
          <Topbar />

          <CartProvider>
            <main className="flex-1 overflow-y-auto">
              <div className="flex gap-6 p-6">
                {/* Left: Products */}
                <div className="flex-1">
                  <ProductGrid />
                </div>

                {/* Right: Order summary */}
                <div className="w-1/3 max-w-md">
                  <OrderSummary showPaymentSection={true} />
                </div>
              </div>
            </main>
          </CartProvider>
        </div>
      </div>
    </div>
  );
}
