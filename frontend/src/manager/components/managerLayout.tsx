import type { ReactNode } from 'react';
import Topbar from '@/global/components/topbar';
import SidebarManager from './sidebarManager';

interface ManagerLayoutProps {
  children: ReactNode;
}

export default function ManagerLayout({ children }: ManagerLayoutProps) {
  return (
    <div className="flex h-screen bg-gray-50">
      <div className="fixed inset-y-0 left-0 z-40 w-64">
        <SidebarManager />
      </div>

      <div className="ml-64 flex flex-1 flex-col">
        <div className="flex flex-1 flex-col overflow-hidden">
          <Topbar />

          <main className="flex-1 overflow-y-auto bg-gray-50 p-8">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}

