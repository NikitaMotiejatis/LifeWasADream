import { useLocation } from 'react-router-dom';
import { useState } from 'react';
import HamburgerIcon from '@/icons/hamburgerIcon';
import { MenuGroup } from '@/global/components/menuGroup';
import { MenuGroupItem } from '@/global/components/menuGroupItem';

export default function SidebarSupplier() {
  const location = useLocation();

  const [open, setOpen] = useState({
    business: true,
  });

  const toggle = (key: 'business') => {
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
            title="Business"
            icon={HamburgerIcon}
            open={open.business}
            onToggle={() => toggle('business')}
          >
            <MenuGroupItem
              to="/invoiceStatus"
              icon={HamburgerIcon}
              active={isActive('/invoiceStatus')}
            >
              Invoice Status
            </MenuGroupItem>
            <MenuGroupItem
              to="/deliveries"
              icon={HamburgerIcon}
              active={isActive('/deliveries')}
            >
              Deliveries
            </MenuGroupItem>
          </MenuGroup>
        </div>
      </nav>
    </div>
  );
}
