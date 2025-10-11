import type { UserResource } from '@clerk/types';
import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router';

import { RoutesEnum } from '@/enums/router';

interface ProtectedRouteProps {
  children: ReactNode;
  isAuthenticated: boolean;
  user: UserResource | null;
  requireAdmin?: boolean;
}

export default function ProtectedRoute({
  children,
  isAuthenticated,
  user,
  requireAdmin = false,
}: ProtectedRouteProps) {
  const location = useLocation();

  const authPages = [
    RoutesEnum.LOGIN,
    RoutesEnum.SIGN_UP,
    RoutesEnum.FORGOT_PASSWORD,
    RoutesEnum.ONBOARDING
  ];
  const isAuthPage = authPages.includes(location.pathname as RoutesEnum);

  if (isAuthPage && isAuthenticated) {
    return <Navigate to={RoutesEnum.DASHBOARD} replace />;
  }

  if (!isAuthPage && !isAuthenticated) {
    return <Navigate to={RoutesEnum.LOGIN} replace />;
  }

  if (requireAdmin && user) {
    if (user?.publicMetadata?.role !== 'admin') {
      return <Navigate to={RoutesEnum.ERROR} replace />;
    }
  }

  return <>{children}</>;
}
