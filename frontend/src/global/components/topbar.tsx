import ChevronDownIcon from '@/icons/chevronDownIcon';
import LogoutIcon from '@/icons/logoutIcon';
import SearchIcon from '@/icons/searchIcon';

export default function Topbar() {
  const handleLogout = () => {
    window.location.href = '/login';
    console.log('Logging out...');
  };

  return (
    <div className="flex items-center justify-between gap-6 border-b border-gray-300 bg-white pt-3 pb-3 pl-3 lg:pl-6">
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <div className="relative">
          <select className="cursor-pointer appearance-none rounded-md border border-gray-300 bg-white px-3 py-1.5 pr-8 text-sm font-medium transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none">
            <option>Downtown Branch</option>
            <option>North Branch</option>
            <option>West Branch</option>
          </select>
          <ChevronDownIcon className="pointer-events-none absolute top-1/2 right-2 h-4 w-4 -translate-y-1/2 text-gray-500" />
        </div>

        <div className="relative max-w-xl flex-1">
          <input
            type="text"
            placeholder="Search products, orders..."
            className="w-full min-w-0 rounded-md border border-gray-300 px-3 py-1.5 pr-9 pl-3 text-sm placeholder-gray-500 transition placeholder:leading-tight focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
            title="Search products, orders..."
          />
          <SearchIcon className="pointer-events-none absolute top-1/2 right-2.5 h-5 w-5 -translate-y-1/2 text-gray-400" />
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-3 whitespace-nowrap">
        <div className="flex items-center gap-3">
          <span className="hidden text-sm font-medium text-gray-700 sm:block">
            John Doe
          </span>
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-linear-to-br from-blue-500 to-purple-600 text-sm font-semibold text-white shadow-md ring-2 ring-white">
            JD
          </div>
        </div>

        <div className="group relative">
          <button
            onClick={handleLogout}
            className="group flex h-9 w-9 items-center justify-center rounded-lg text-gray-500 transition hover:bg-gray-100 hover:text-red-600 active:scale-95"
            title="Logout"
          >
            <LogoutIcon className="h-7 w-7" />
          </button>
          <span className="pointer-events-none absolute -bottom-8 left-1/2 -translate-x-1/2 rounded bg-gray-900 px-2.5 py-1.5 text-xs font-medium whitespace-nowrap text-white opacity-0 transition-opacity group-hover:opacity-100">
            Logout
            <svg
              className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-full text-gray-900"
              width="16"
              height="8"
            >
              <path d="M0 8L8 0L16 8Z" fill="currentColor" />
            </svg>
          </span>
        </div>
      </div>
    </div>
  );
}
