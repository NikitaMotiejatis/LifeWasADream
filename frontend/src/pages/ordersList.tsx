import OrderList from '../components/orderList';
import SidebarCashier from '../components/sidebarCashier';
import Topbar from '../components/topbar';

export default function OrdersPage() {
  return (
    <div className="flex h-screen">
      <div className="fixed inset-y-0 left-0 z-50 w-64">
        <SidebarCashier />
      </div>

      <div className="ml-64 flex flex-1 flex-col">
        <div className="flex flex-1 flex-col overflow-hidden">
          <Topbar />

          <main className="flex-1 overflow-y-auto p-6">
            <OrderList />
          </main>
        </div>
      </div>
    </div>
  );
}
