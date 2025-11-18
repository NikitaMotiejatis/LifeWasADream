import Sidebar from '../components/sidebar';
import Topbar from '../components/topbar';
import ProductGrid from '../components/productGrid';
import OrderSummary from '../components/orderSummary';
import { CartProvider } from '../components/cartContext';

export default function NewOrderPage() {
  return (
    <div className="flex h-screen w-full">
      <Sidebar />

      <div className="flex flex-1 flex-col">
        <Topbar />

        <div className="flex flex-row gap-4 p-6">
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
        </div>
      </div>
    </div>
  );
}
