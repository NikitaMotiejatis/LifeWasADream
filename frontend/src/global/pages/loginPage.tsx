import { useTranslation } from 'react-i18next';
import PersonIcon from '@/icons/personIcon';
import LockIcon from '@/icons/lockIcon';
import { useLocation, useNavigate } from 'react-router-dom';
import { useForm, useFormState } from 'react-hook-form';
import { LoginInfo, useAuth } from '@/global/hooks/auth';
import { Currency, useCurrency } from '../contexts/currencyContext';

const demoAccounts = [
  { role: 'Cashier / Receptionist', login: 'cashier1', pass: 'demo123' },
  { role: 'Manager', login: 'manager1', pass: 'demo123' },
  { role: 'Stock Clerk', login: 'clerk1', pass: 'demo123' },
  { role: 'Supplier', login: 'supplier1', pass: 'demo123' },
];

export default function LoginPage() {
  const { t } = useTranslation();

  const { login } = useAuth();
  const { overrideFromBackend } = useCurrency();

  const { register, handleSubmit, control, setValue } = useForm({
    defaultValues: {
      username: '',
      password: '',
    },
  });
  const { errors, isSubmitting } = useFormState({
    control,
    name: ['username', 'password'],
  });

  const navigate = useNavigate();
  const location = useLocation();

  const tryToLogin = async (data: any) => {
    const userData = await login(data as LoginInfo);

    if (!userData) return;

    const from = (location.state as any)?.from;
    const fromPath =
      typeof from?.pathname === 'string'
        ? `${from.pathname}${from.search ?? ''}${from.hash ?? ''}`
        : null;

    if (fromPath && fromPath !== '/login') {
      navigate(fromPath, { replace: true });
    } else if (userData.redirectPath) {
      navigate(userData.redirectPath);
    }
    if (userData.currency) {
      overrideFromBackend(userData.currency as Currency, false);
    }
    if (userData.businessInfo) {
      localStorage.setItem('businessInfo', JSON.stringify(userData.businessInfo));
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <div className="mb-12 text-center">
        <h1 className="text-4xl font-bold text-gray-800">{t('login.title')}</h1>
        <p className="mt-2 text-gray-500">{t('login.subtitle')}</p>
      </div>

      {/* TODO: failed login message is needed */}
      <form
        onSubmit={handleSubmit(tryToLogin)}
        className="ml-10 w-full max-w-md rounded-xl bg-white p-10 shadow-lg"
      >
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
              {...register('username', {
                required: t('login.usernameRequired'),
                // TODO: maybe some pattern matching
              })}
              placeholder={t('login.usernamePlaceholder')}
              className={`w-full rounded-lg border bg-gray-50 py-3 pr-4 pl-10 transition focus:bg-white focus:ring-2 focus:ring-blue-400 focus:outline-none ${
                errors.username ? 'border-red-500' : 'border-gray-500'
              }`}
            />
          </div>
          <div className="mt-1 h-5">
            {errors.username && (
              <p className="text-xs text-red-500">{errors.username.message}</p>
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
              {...register('password', {
                required: t('login.passwordRequired'),
                // TODO: maybe some pattern matching
              })}
              placeholder={t('login.passwordPlaceholder')}
              className={`w-full rounded-lg border bg-gray-50 py-3 pr-4 pl-10 transition focus:bg-white focus:ring-2 focus:ring-blue-400 focus:outline-none ${
                errors.password ? 'border-red-500' : 'border-gray-500'
              }`}
            />
          </div>
          <div className="mt-1 h-5">
            {errors.password && (
              <p className="text-xs text-red-500">{errors.password.message}</p>
            )}
          </div>
        </div>

        {/* LOGIN BUTTON */}
        <button
          type="submit"
          disabled={isSubmitting}
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
                onClick={() => {
                  setValue('username', acc.login);
                  setValue('password', acc.pass);
                }}
                className="group relative cursor-pointer overflow-hidden rounded-xl border border-gray-300 bg-white px-5 py-4 text-left shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-gray-400 hover:bg-gray-200 hover:shadow-lg active:scale-95 active:bg-gray-300"
              >
                <div className="font-semibold text-gray-900">
                  {t(`login.demoRoles.${acc.role}`)}
                </div>
                <div className="mt-1 text-xs text-gray-600">
                  {acc.login} / {acc.pass}
                </div>
              </button>
            ))}
          </div>
        </div>
      </form>
    </div>
  );
}
