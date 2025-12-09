import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import PersonIcon from '@/icons/personIcon';
import LockIcon from '@/icons/lockIcon';
import { useNavigate, useNavigation } from 'react-router-dom';

export default function LoginPage() {
  const { t } = useTranslation();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [touched, setTouched] = useState({ username: false, password: false });

  const navigate = useNavigate();

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

    setTimeout(() => {
      if (login === 'cashier1') window.location.href = '/newOrder';
      else if (login === 'manager1') window.location.href = '/dashboard';
      else if (login === 'clerk1') window.location.href = '/stockUpdates';
      else if (login === 'supplier1') window.location.href = '/invoiceStatus';
    }, 250);
  };

  const handleLogin = async () => {
    setTouched({ username: true, password: true });

    try {
      const response = await fetch("http://localhost:8081/auth/login", {
        method: "POST",
        body: JSON.stringify({username, password}),
        credentials: 'include',
      });

      const redirectPath = await response.text();
      console.log(redirectPath);

      function getCookie(name: string) {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop()?.split(';').shift();
      }

      const _ = await fetch("http://localhost:8081/auth/validate", {
        method: "PUT",
        headers: {
          "X-XSRF-TOKEN": getCookie("X-XSRF-TOKEN") ?? "",
        },
        credentials: 'include',
      });
      response.redirected
      //navigate(redirectPath);
    } catch (e) {
      console.error(e);
    }
  };

  const showUsernameError = touched.username && !username.trim();
  const showPasswordError = touched.password && !password.trim();

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <div className="mb-12 text-center">
        <h1 className="text-4xl font-bold text-gray-800">{t('login.title')}</h1>
        <p className="mt-2 text-gray-500">{t('login.subtitle')}</p>
      </div>

      <div className="ml-10 w-full max-w-md rounded-xl bg-white p-10 shadow-lg">
        <h2 className="mb-6 text-xl font-semibold">{t('login.formTitle')}</h2>

        {/* USERNAME */}
        <div className="mb-2">
          <label className="mb-1 block text-sm font-medium text-gray-600">
            {t('login.usernameLabel')}
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
              placeholder={t('login.usernamePlaceholder')}
              className={`w-full rounded-lg border bg-gray-50 py-3 pr-4 pl-10 transition focus:bg-white focus:ring-2 focus:ring-blue-400 focus:outline-none ${
                showUsernameError ? 'border-red-500' : 'border-gray-200'
              }`}
            />
          </div>
          <div className="mt-1 h-5">
            {showUsernameError && (
              <p className="text-xs text-red-500">
                {t('login.usernameRequired')}
              </p>
            )}
          </div>
        </div>

        {/* PASSWORD */}
        <div className="mb-4">
          <label className="mb-1 block text-sm font-medium text-gray-700">
            {t('login.passwordLabel')}
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
              placeholder={t('login.passwordPlaceholder')}
              className={`w-full rounded-lg border bg-gray-50 py-3 pr-4 pl-10 transition focus:bg-white focus:ring-2 focus:ring-blue-400 focus:outline-none ${
                showPasswordError ? 'border-red-500' : 'border-gray-200'
              }`}
            />
          </div>

          <div className="mt-1 h-5">
            {showPasswordError && (
              <p className="text-xs text-red-500">
                {t('login.passwordRequired')}
              </p>
            )}
          </div>
        </div>

        {/* LOGIN BUTTON */}
        <button
          onClick={handleLogin}
          className="w-full cursor-pointer rounded-lg bg-blue-600 py-3 font-medium text-white shadow-md transition-all duration-200 hover:scale-[1.02] hover:bg-blue-700 hover:shadow-lg active:scale-95 active:bg-blue-700"
        >
          {t('login.loginButton')}
        </button>

        {/* DEMO BUTTONS */}
        <div className="mt-12 border-t border-gray-300 pt-8">
          <p className="mb-5 text-center text-sm font-medium text-gray-500">
            {t('login.demoTitle')}
          </p>
          <div className="grid grid-cols-2 gap-4">
            {demoAccounts.map(acc => (
              <button
                key={acc.login}
                type="button"
                onClick={() => loginAs(acc.login, acc.pass)}
                className="group relative cursor-pointer overflow-hidden rounded-xl border border-gray-300 bg-white px-5 py-4 text-left shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-gray-400 hover:bg-gray-200 hover:shadow-lg active:scale-95 active:bg-gray-300"
              >
                <div className="font-semibold text-gray-900">
                  {t(`login.demoRoles.${acc.role}`)}
                </div>
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
