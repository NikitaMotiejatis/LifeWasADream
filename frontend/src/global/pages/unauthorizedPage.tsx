import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import useSWR from 'swr';
import { useAuth, UserDetails } from '@/global/hooks/auth';

function defaultPathForRoles(roles: string[] | undefined): string {
  if (!roles?.length) return '/login';
  if (roles.includes('OWNER') || roles.includes('MANAGER')) return '/dashboard';
  if (roles.includes('CASHIER')) return '/newOrder';
  if (roles.includes('RECEPTIONIST')) return '/newReservation';
  if (roles.includes('CLERK')) return '/stockUpdates';
  if (roles.includes('SUPPLIER')) return '/invoiceStatus';
  return '/login';
}

export default function UnauthorizedPage() {
  const { userDetailsFetcher } = useAuth();
  const { data: user } = useSWR<UserDetails>('api/me', userDetailsFetcher, {
    revalidateOnMount: true,
    shouldRetryOnError: false,
  });

  const homePath = useMemo(() => defaultPathForRoles(user?.roles), [user?.roles]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 px-6">
      <div className="w-full max-w-lg rounded-xl bg-white p-10 shadow-lg">
        <h1 className="text-2xl font-semibold text-gray-900">Not authorized</h1>
        <p className="mt-2 text-sm text-gray-600">
          Your account doesn&apos;t have access to this page.
        </p>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            to={homePath}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700"
          >
            Go to home
          </Link>
          <Link
            to="/login"
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Go to login
          </Link>
        </div>
      </div>
    </div>
  );
}

