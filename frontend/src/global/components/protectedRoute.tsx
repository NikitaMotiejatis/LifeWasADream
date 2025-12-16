import { PropsWithChildren } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import useSWR from 'swr';
import { useAuth, UserDetails } from '@/global/hooks/auth';

type ProtectedRouteProps = PropsWithChildren<{
  requiredRoles?: string[];
}>;

export default function ProtectedRoute({
  requiredRoles,
  children,
}: ProtectedRouteProps) {
  const location = useLocation();
  const { userDetailsFetcher } = useAuth();

  const {
    data: user,
    error,
    isLoading,
  } = useSWR<UserDetails>('api/me', userDetailsFetcher, {
    revalidateOnMount: true,
    shouldRetryOnError: false,
  });

  if (isLoading) return null;

  if (error || !user?.username) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (
    requiredRoles?.length &&
    !requiredRoles.some(role => user.roles?.includes(role))
  ) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children ? children : <Outlet />;
}

