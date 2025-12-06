import { useLocation } from 'react-router-dom';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import HamburgerIcon from '@/icons/hamburgerIcon';
import { MenuGroup } from '@/global/components/menuGroup';
import { MenuGroupItem } from '@/global/components/menuGroupItem';

export default function SidebarStockClerk() {
  const { t } = useTranslation();
  const location = useLocation();

  const [open, setOpen] = useState({
    inventory: true,
  });

  const toggle = (key: 'inventory') => {
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
          title={t('sidebar.stock.group')}
          icon={HamburgerIcon}
          open={open.inventory}
          onToggle={() => toggle('inventory')}
        >
          <MenuGroupItem
            to="/stockUpdates"
            icon={HamburgerIcon}
            active={isActive('/stockUpdates')}
          >
            {t('sidebar.stock.updates')}
          </MenuGroupItem>
          <MenuGroupItem
            to="/transferRequests"
            icon={HamburgerIcon}
            active={isActive('/transferRequests')}
          >
            {t('sidebar.stock.transferRequests')}
          </MenuGroupItem>
          <MenuGroupItem
            to="/stockAlerts"
            icon={HamburgerIcon}
            active={isActive('/stockAlerts')}
          >
            {t('sidebar.stock.alerts')}
          </MenuGroupItem>
          <MenuGroupItem
            to="/auditHistory"
            icon={HamburgerIcon}
            active={isActive('/auditHistory')}
          >
            {t('sidebar.stock.auditHistory')}
          </MenuGroupItem>
        </MenuGroup>
      </nav>
    </div>
  );
}
