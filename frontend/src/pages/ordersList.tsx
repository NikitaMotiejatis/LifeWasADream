import SidebarCashier from '../components/sidebarCashier';
import Topbar from '../components/topbar';

export default function OrdersPage() {
  return (
    <div className="flex h-screen w-full">
      <SidebarCashier />

      <div className="flex flex-1 flex-col">
        <Topbar />

        <div className="flex flex-row gap-4 p-6"></div>
      </div>
    </div>
  );
}
