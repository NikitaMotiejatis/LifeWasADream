import Sidebar from "../components/sidebar";
import Topbar from "../components/topbar";
import ProductGrid from "../components/productGrid";
import OrderSummary from "../components/orderSummary";

export default function NewOrderPage() {
  return (
    <div className="flex h-screen w-full">
      <Sidebar />

      <div className="flex flex-col flex-1">
        <Topbar />

        <div className="flex flex-row gap-4 p-6">
          {/* Left: Products */}
          <div className="flex-1">
            <ProductGrid />
          </div>

          {/* Right: Order summary */}
          <div className="w-80">
            <OrderSummary />
          </div>
        </div>
      </div>
    </div>
  );
}
