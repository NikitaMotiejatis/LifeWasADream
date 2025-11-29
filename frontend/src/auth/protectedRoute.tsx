import { PropsWithChildren } from 'react';
import { Role, useAuth } from './authContext';
import { useNavigate } from 'react-router-dom';

type ProtectedRouteProps = PropsWithChildren & {
  roleAuthPredicate: (roles: Role[]) => boolean;
};

export default function ProtectedRoute({
  roleAuthPredicate: roleAuthPredicate,
  children,
}: ProtectedRouteProps) {
  const { username, roles } = useAuth();
  const navigate = useNavigate();

  if (username === undefined || roles.length < 1) {
    navigate("/login");
  }

  if (!roleAuthPredicate(roles)) {
    return <div>404</div>; // TODO: add Page not found
  }

  return children;
}
