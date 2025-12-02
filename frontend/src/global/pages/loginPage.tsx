import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PersonIcon from '@/icons/personIcon';
import LockIcon from '@/icons/lockIcon';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const [touched, setTouched] = useState({ username: false, password: false });

  const demoAccounts = [
    { role: 'Cashier / Receptionist', login: 'cashier1', pass: 'demo123' },
    { role: 'Manager', login: 'manager1', pass: 'demo123' },
    { role: 'Stock Clerk', login: 'clerk1', pass: 'demo123' },
    { role: 'Supplier', login: 'supplier1', pass: 'demo123' },
  ];

  const loginAs = (login: string, pass: string) => {
    setUsername(login);
    setPassword(pass);
    setTouched({ username: true, password: true });
      // Determine the correct redirect path based on the demo account role
      let redirectPath = '/newOrder';
      if (login.includes('clerk')) {
          redirectPath = '/stockUpdates';
      } else if (login.includes('supplier')) {
          redirectPath = '/invoiceStatus';
      }
      setTimeout(() => navigate(redirectPath), 250);
  };

  const handleLogin = () => {
    setTouched({ username: true, password: true });
      if (username.trim() && password.trim()) {
          // Basic logic to determine redirect based on username for demo purposes
          let redirectPath = '/newOrder';
          if (username.includes('clerk')) {
              redirectPath = '/stockUpdates';
          } else if (username.includes('supplier')) {
              redirectPath = '/invoiceStatus';
          }
          navigate(redirectPath);
      }

  };

  const showUsernameError = touched.username && !username.trim();
  const showPasswordError = touched.password && !password.trim();

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <div className="mb-12 text-center">
        <h1 className="text-4xl font-bold text-gray-800">DreamPoS</h1>
        <p className="mt-2 text-gray-500">Unified Point-of-Sale System</p>
      </div>

      <div className="ml-10 w-full max-w-md rounded-xl bg-white p-10 shadow-lg">
        <h2 className="mb-6 text-xl font-semibold">LOGIN</h2>

        {/* USERNAME */}
        <div className="mb-2">
          <label className="mb-1 block text-sm font-medium text-gray-600">
            USERNAME
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-3 flex items-center text-gray-400">
              <PersonIcon className="h-5 w-5" />
            </span>
            <input
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value)}
              onBlur={() => setTouched(t => ({ ...t, username: true }))}
              placeholder="Enter username..."
              className={`w-full rounded-lg border bg-gray-50 py-3 pr-4 pl-10 transition focus:bg-white focus:ring-2 focus:ring-blue-400 focus:outline-none ${
                showUsernameError ? 'border-red-500' : 'border-gray-200'
              }`}
            />
          </div>
          <div className="mt-1 h-5">
            {showUsernameError && (
              <p className="text-xs text-red-500">Username is required</p>
            )}
          </div>
        </div>

        {/* PASSWORD */}
        <div className="mb-4">
          <label className="mb-1 block text-sm font-medium text-gray-600">
            PASSWORD
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-3 flex items-center text-gray-400">
              <LockIcon className="h-5 w-5" />
            </span>

            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              onBlur={() => setTouched(t => ({ ...t, password: true }))}
              placeholder="Enter password..."
              className={`w-full rounded-lg border bg-gray-50 py-3 pr-4 pl-10 transition focus:bg-white focus:ring-2 focus:ring-blue-400 focus:outline-none ${
                showPasswordError ? 'border-red-500' : 'border-gray-200'
              }`}
            />
          </div>

          <div className="mt-1 h-5">
            {showPasswordError && (
              <p className="text-xs text-red-500">Password is required</p>
            )}
          </div>
        </div>

        {/* LOGIN BUTTON */}
        <button
          onClick={handleLogin}
          className="w-full cursor-pointer rounded-lg bg-blue-600 py-3 font-medium text-white shadow-md transition-all duration-200 hover:scale-[1.02] hover:bg-blue-700 hover:shadow-lg active:scale-95 active:bg-blue-700"
        >
          Login
        </button>

        {/* DEMO BUTTONS */}
        <div className="mt-12 border-t border-gray-300 pt-8">
          <p className="mb-5 text-center text-sm font-medium text-gray-500">
            Demo accounts – click to log in instantly
          </p>
          <div className="grid grid-cols-2 gap-4">
            {demoAccounts.map(acc => (
              <button
                key={acc.login}
                type="button"
                onClick={() => loginAs(acc.login, acc.pass)}
                className="group relative cursor-pointer overflow-hidden rounded-xl border border-gray-300 bg-white px-5 py-4 text-left shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-gray-400 hover:bg-gray-200 hover:shadow-lg active:scale-95 active:bg-gray-300"
              >
                <div className="font-semibold text-gray-900">{acc.role}</div>
                <div className="mt-1 text-xs text-gray-600">
                  {acc.login} <span className="text-gray-600">/ demo123</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
