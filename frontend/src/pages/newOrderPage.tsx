import SidebarCashier from '../components/sidebarCashier';
import Topbar from '../components/topbar';
import ProductGrid from '../components/productGrid';
import OrderSummary from '../components/orderSummary';
import { CartProvider } from '../contexts/cartContext';
import { CurrencyProvider } from '../contexts/currencyContext';

export default function NewOrderPage() {
  return (
    <div className="flex h-screen w-full">
      <SidebarCashier />

      <div className="flex flex-1 flex-col">
        <Topbar />

        <div className="flex flex-row gap-4 p-6">
          <CurrencyProvider>
            <CartProvider>
              {/* Left: Products */}
              <div className="flex-1">
                <ProductGrid />
              </div>

              {/* Right: Order summary */}
              <div className="w-1/3 max-w-md">
                <OrderSummary />
              </div>
            </CartProvider>
          </CurrencyProvider>
        </div>
      </div>
    </div>
  );
}
