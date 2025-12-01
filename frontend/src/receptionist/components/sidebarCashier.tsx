import { useLocation } from 'react-router-dom';
import { useState } from 'react';
import OrdersGroupIcon from '@/icons/ordersGroupIcon';
import BigPlusIcon from '@/icons/bigPlusIcon';
import HamburgerIcon from '@/icons/hamburgerIcon';
import ReservationsGroupIcon from '@/icons/reservationsGroupIcon';
import { MenuGroup } from '@/global/components/menuGroup';
import { MenuGroupItem } from '@/global/components/menuGroupItem';

export default function SidebarCashier() {
  const location = useLocation();

  const [open, setOpen] = useState({
    orders: true,
    reservations: true,
  });

  const toggle = (key: 'orders' | 'reservations') => {
    setOpen(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="flex h-screen w-64 flex-col border-r border-gray-200 bg-white">
      <div className="border-b border-gray-200 p-6">
        <h1 className="text-2xl font-bold text-gray-900">Dream-PoS</h1>
        <p className="mt-1 text-sm text-gray-500">Unified system</p>
      </div>

      <nav className="flex-1 space-y-4 overflow-y-auto p-4">
        <div>
          <MenuGroup
            title="Orders"
            icon={OrdersGroupIcon}
            open={open.orders}
            onToggle={() => toggle('orders')}
          >
            <MenuGroupItem
              to="/newOrder"
              icon={BigPlusIcon}
              active={isActive('/newOrder')}
            >
              New order
            </MenuGroupItem>
            <MenuGroupItem
              to="/orders"
              icon={HamburgerIcon}
              active={isActive('/orders')}
            >
              Orders' list
            </MenuGroupItem>
          </MenuGroup>

          <MenuGroup
            title="Reservations"
            icon={ReservationsGroupIcon}
            open={open.reservations}
            onToggle={() => toggle('reservations')}
          >
            <MenuGroupItem
              to="/newReservation"
              icon={BigPlusIcon}
              active={isActive('/newReservation')}
            >
              New reservation
            </MenuGroupItem>
            <MenuGroupItem
              to="/reservations"
              icon={HamburgerIcon}
              active={isActive('/reservations')}
            >
              Reservations' list
            </MenuGroupItem>
          </MenuGroup>
        </div>
      </nav>
    </div>
  );
}
