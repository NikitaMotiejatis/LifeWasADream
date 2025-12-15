import { useLocation } from 'react-router-dom';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { MenuGroup } from '@/global/components/menuGroup';
import { MenuGroupItem } from '@/global/components/menuGroupItem';
import OrdersGroupIcon from '@/icons/ordersGroupIcon';
import HamburgerIcon from '@/icons/hamburgerIcon';
import SearchIcon from '@/icons/searchIcon';
import CheckmarkIcon from '@/icons/checkmarkIcon';
import TaxIcon from '@/icons/taxIcon';
import VatItemIcon from '@/icons/vatItemIcon';

export default function SidebarManager() {
  const { t } = useTranslation();
  const location = useLocation();

  const [open, setOpen] = useState({
    manager: true,
  });

  const toggle = (key: 'manager') => {
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
          title={t('sidebar.manager.group')}
          icon={OrdersGroupIcon}
          open={open.manager}
          onToggle={() => toggle('manager')}
        >
          <MenuGroupItem
            to="/dashboard"
            icon={HamburgerIcon}
            active={isActive('/dashboard')}
          >
            {t('sidebar.manager.dashboard')}
          </MenuGroupItem>
          <MenuGroupItem
            to="/refunds"
            icon={OrdersGroupIcon}
            active={isActive('/refunds')}
          >
            {t('sidebar.manager.refunds')}
          </MenuGroupItem>
          <MenuGroupItem
            to="/reports"
            icon={SearchIcon}
            active={isActive('/reports')}
          >
            {t('sidebar.manager.reports')}
          </MenuGroupItem>
          <MenuGroupItem
            to="/inventory"
            icon={CheckmarkIcon}
            active={isActive('/inventory')}
          >
            {t('sidebar.manager.inventory')}
          </MenuGroupItem>
          <MenuGroupItem
            to="/vat-settings"
            icon={TaxIcon}
            active={isActive('/vat-settings')}
          >
            {t('sidebar.manager.vatSettings')}
          </MenuGroupItem>
        </MenuGroup>
      </nav>
    </div>
  );
}
