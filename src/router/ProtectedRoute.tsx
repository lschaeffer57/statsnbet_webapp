import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router';

import { RoutesEnum } from '@/enums/router';

interface ProtectedRouteProps {
  children: ReactNode;
  isAuthenticated: boolean;
}

export default function ProtectedRoute({
  children,
  isAuthenticated,
}: ProtectedRouteProps) {
  const location = useLocation();

  const authPages = [RoutesEnum.LOGIN, RoutesEnum.SIGN_UP];
  const isAuthPage = authPages.includes(location.pathname as RoutesEnum);

  if (isAuthPage && isAuthenticated) {
    return <Navigate to={RoutesEnum.DASHBOARD} replace />;
  }

  if (!isAuthPage && !isAuthenticated) {
    return <Navigate to={RoutesEnum.LOGIN} replace />;
  }

  return <>{children}</>;
}
