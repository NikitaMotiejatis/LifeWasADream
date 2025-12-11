import { useTranslation } from 'react-i18next';
import LogoutIcon from '@/icons/logoutIcon';
import SearchIcon from '@/icons/searchIcon';
import BranchSelector from './branchSelector';
import LanguageSwitcher from './languageSwitcher';
import { useAuth } from '@/global/hooks/auth';
import { useNavigate } from 'react-router-dom';
import useSWR from 'swr';

export default function Topbar() {
  const { t } = useTranslation();
  const { userDetailsFetcher, logout } = useAuth();
  const navigate = useNavigate();

  const { data: userData } = useSWR(`api/me`, userDetailsFetcher, { revalidateOnMount: true });

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <div className="flex items-center justify-between gap-6 border-b border-gray-300 bg-white pt-3 pb-3 pl-3 lg:pl-6">
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <BranchSelector />

        <div className="relative max-w-xl flex-1">
          <input
            type="text"
            placeholder={t('topbar.searchPlaceholder')}
            className="w-full min-w-0 rounded-md border border-gray-300 px-3 py-1.5 pr-9 pl-3 text-sm placeholder-gray-500 transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
          />
          <SearchIcon className="pointer-events-none absolute top-1/2 right-2.5 h-5 w-5 -translate-y-1/2 text-gray-400" />
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-3 whitespace-nowrap">
        <div className="flex items-center gap-3">
          <span className="hidden text-sm font-medium text-gray-700 sm:block">
            {userData?.username}
          </span>
          {/* TODO: remove
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-linear-to-br from-blue-500 to-purple-600 text-sm font-semibold text-white shadow-md ring-2 ring-white">
            {t('topbar.userName')
              ?.trim()
              .split(/\s+/)
              .slice(0, 2)
              .map(w => w[0]?.toUpperCase())
              .join('') || '?'}
          </div>
          */}
        </div>

        <LanguageSwitcher />

        <div className="group relative">
          <button
            onClick={handleLogout}
            className="group flex h-9 w-9 items-center justify-center rounded-lg text-gray-500 transition hover:bg-gray-100 hover:text-red-600 active:scale-95"
            title={t('topbar.logout')}
          >
            <LogoutIcon className="h-7 w-7" />
          </button>
          <span className="pointer-events-none absolute -bottom-8 left-1/2 -translate-x-1/2 rounded bg-gray-900 px-2.5 py-1.5 text-xs font-medium whitespace-nowrap text-white opacity-0 transition-opacity group-hover:opacity-100">
            {t('topbar.logout')}
          </span>
        </div>
      </div>
    </div>
  );
}
