import ReservationList from '../components/reservationList';
import SidebarCashier from '../components/sidebarCashier';
import Topbar from '../components/topbar';

export default function ReservationsPage() {
  return (
    <div className="flex h-screen">
      <SidebarCashier />

      <div className="flex flex-1 flex-col overflow-hidden">
        <Topbar />

        <main className="flex-1 overflow-y-auto bg-gray-50 p-4 md:p-6">
          <div className="mx-auto max-w-7xl">
            <ReservationList />
          </div>
        </main>
      </div>
    </div>
  );
}
