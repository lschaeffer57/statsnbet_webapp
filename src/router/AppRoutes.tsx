import { lazy, Suspense, useState } from 'react';
import { Route, Routes } from 'react-router';

import { RoutesEnum } from '@/enums/router';
import AuthLayout from '@/pages/Auth/components/AuthLayout';

import ProtectedRoute from './ProtectedRoute';

const LoginPage = lazy(() =>
  import('../pages/Auth/Login').then(({ Login }) => ({ default: Login })),
);

const SignUpPage = lazy(() =>
  import('../pages/Auth/SignUp').then(({ SignUp }) => ({ default: SignUp })),
);

const OnboardingPage = lazy(() =>
  import('../pages/Auth/Onboarding').then(({ Onboarding }) => ({
    default: Onboarding,
  })),
);

const DashboardPage = lazy(() =>
  import('../pages/Dashboard').then(({ Dashboard }) => ({
    default: Dashboard,
  })),
);

const NotFoundPage = lazy(() =>
  import('../pages/NotFound').then(({ NotFound }) => ({
    default: NotFound,
  })),
);

export default function AppRoutes() {
  const [isAuthenticated] = useState(false);

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Routes>
        <Route element={<AuthLayout />}>
          <Route path={RoutesEnum.LOGIN} element={<LoginPage />} />
          <Route path={RoutesEnum.SIGN_UP} element={<SignUpPage />} />
          <Route path={RoutesEnum.ONBOARDING} element={<OnboardingPage />} />
        </Route>

        <Route
          path={RoutesEnum.DASHBOARD}
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/"
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <DashboardPage />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  );
}
