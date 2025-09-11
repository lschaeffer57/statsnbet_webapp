import type { ReactNode } from 'react';
import { Navigate } from 'react-router';

interface ProtectedRouteProps {
  children: ReactNode;
  isAuthenticated: boolean;
}

export default function ProtectedRoute({ children, isAuthenticated }: ProtectedRouteProps) {
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
}