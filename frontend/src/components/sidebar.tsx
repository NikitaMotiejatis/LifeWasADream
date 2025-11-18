import { useNavigate, useLocation } from 'react-router-dom';
import { useState } from 'react';

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  const [open, setOpen] = useState({
    orders: true,
    reservations: true,
  });

  const toggle = (key: 'orders' | 'reservations') => {
    setOpen(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const isActive = (path: string) => location.pathname === path;

  const btn =
    'w-full text-left px-4 py-3 rounded-lg font-medium flex items-center gap-3 border transition-all duration-200';
  const inactive =
    'border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300';
  const active = 'bg-blue-600 text-white border-blue-600 shadow-sm';

  const groupHeader =
    'flex items-center justify-between px-4 py-3 text-sm font-semibold text-gray-900 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors';

  return (
    <div className="flex h-screen w-64 flex-col border-r border-gray-200 bg-white">
      <div className="border-b border-gray-200 p-6">
        <h1 className="text-2xl font-bold text-gray-900">Dream-PoS</h1>
        <p className="mt-1 text-sm text-gray-500">Unified system</p>
      </div>

      <nav className="flex-1 space-y-4 overflow-y-auto p-4">
        <div>
          <div className={groupHeader} onClick={() => toggle('orders')}>
            <div className="flex items-center gap-3 text-base">
              <svg
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 17h6m-6-4h6m-6-4h6M5 3h14v18H5z"
                />
              </svg>
              <span>Orders</span>
            </div>
            <svg
              className={`h-4 w-4 transition-transform ${open.orders ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={3}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </div>

          {open.orders && (
            <div className="mt-2 ml-8 space-y-2 text-sm">
              <button
                onClick={() => navigate('/newOrder')}
                className={`${btn} ${isActive('/newOrder') ? active : inactive}`}
              >
                <svg
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                New order
              </button>

              <button
                onClick={() => navigate('/orders')}
                className={`${btn} ${isActive('/orders') ? active : inactive}`}
              >
                <svg
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
                Orders' list
              </button>
            </div>
          )}
        </div>

        <div>
          <div className={groupHeader} onClick={() => toggle('reservations')}>
            <div className="flex items-center gap-3 text-base">
              <svg
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <span>Reservations</span>
            </div>
            <svg
              className={`h-4 w-4 transition-transform ${open.reservations ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={3}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </div>

          {open.reservations && (
            <div className="mt-2 ml-8 space-y-2 text-sm">
              <button
                onClick={() => navigate('/newReservation')}
                className={`${btn} ${isActive('/newReservation') ? active : inactive}`}
              >
                <svg
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                New reservation
              </button>

              <button
                onClick={() => navigate('/reservations')}
                className={`${btn} ${isActive('/reservations') ? active : inactive}`}
              >
                <svg
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
                Reservations' list
              </button>
            </div>
          )}
        </div>
      </nav>
    </div>
  );
}
