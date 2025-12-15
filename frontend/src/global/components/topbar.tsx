import { useTranslation } from 'react-i18next';
import LogoutIcon from '@/icons/logoutIcon';
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
      </div>

      <div className="flex shrink-0 items-center gap-3 whitespace-nowrap">
        <div className="flex items-center gap-3">
          <span className="hidden text-sm font-medium text-gray-700 sm:block">
            {userData?.username}
          </span>
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
