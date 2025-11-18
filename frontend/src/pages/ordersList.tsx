import Sidebar from '../components/sidebar';
import Topbar from '../components/topbar';

export default function OrdersPage() {
  return (
    <div className="flex h-screen w-full">
      <Sidebar />

      <div className="flex flex-1 flex-col">
        <Topbar />

        <div className="flex flex-row gap-4 p-6"></div>
      </div>
    </div>
  );
}
