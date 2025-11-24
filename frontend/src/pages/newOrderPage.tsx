import SidebarCashier from '../components/sidebarCashier';
import Topbar from '../components/topbar';
import ProductGrid from '../components/productGrid';
import OrderSummary from '../components/orderSummary';
import { CartProvider } from '../contexts/cartContext';
import { CurrencyProvider } from '../contexts/currencyContext';

export default function NewOrderPage() {
  return (
    <div className="flex h-screen">
      <div className="fixed inset-y-0 left-0 z-50 w-64">
        <SidebarCashier />
      </div>

      <div className="ml-64 flex flex-1 flex-col">
        <div className="flex flex-1 flex-col overflow-hidden">
          <Topbar />

          <CurrencyProvider>
            <CartProvider>
              <main className="flex-1 overflow-y-auto">
                <div className="flex gap-6 p-6">
                  {/* Left: Products */}
                  <div className="flex-1">
                    <ProductGrid />
                  </div>

                  {/* Right: Order summary */}
                  <div className="w-1/3 max-w-md">
                    <OrderSummary />
                  </div>
                </div>
              </main>
            </CartProvider>
          </CurrencyProvider>
        </div>
      </div>
    </div>
  );
}
