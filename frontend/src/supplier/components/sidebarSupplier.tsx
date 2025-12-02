import { useLocation } from 'react-router-dom';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import HamburgerIcon from '@/icons/hamburgerIcon';
import { MenuGroup } from '@/global/components/menuGroup';
import { MenuGroupItem } from '@/global/components/menuGroupItem';

export default function SidebarSupplier() {
  const { t } = useTranslation();
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
        <p className="mt-1 text-sm text-gray-500">{t('sidebar.subtitle')}</p>
      </div>

      <nav className="flex-1 space-y-4 overflow-y-auto p-4">
        <MenuGroup
          title={t('sidebar.supplier.group')}
          icon={HamburgerIcon}
          open={open.business}
          onToggle={() => toggle('business')}
        >
          <MenuGroupItem
            to="/invoiceStatus"
            icon={HamburgerIcon}
            active={isActive('/invoiceStatus')}
          >
            {t('sidebar.supplier.invoiceStatus')}
          </MenuGroupItem>
          <MenuGroupItem
            to="/deliveries"
            icon={HamburgerIcon}
            active={isActive('/deliveries')}
          >
            {t('sidebar.supplier.deliveries')}
          </MenuGroupItem>
        </MenuGroup>
      </nav>
    </div>
  );
}
