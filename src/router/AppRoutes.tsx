import { lazy, Suspense, useState } from 'react';
import { Route, Routes } from 'react-router';

import { RoutesEnum } from '@/enums/router';
import AuthLayout from '@/pages/auth/components/AuthLayout';
import DashboardLayout from '@/pages/dashboard/components/DashboardLayout';

import ProtectedRoute from './ProtectedRoute';

const LoginPage = lazy(() =>
  import('../pages/auth/Login').then(({ Login }) => ({ default: Login })),
);

const SignUpPage = lazy(() =>
  import('../pages/auth/SignUp').then(({ SignUp }) => ({ default: SignUp })),
);

const OnboardingPage = lazy(() =>
  import('../pages/auth/Onboarding').then(({ Onboarding }) => ({
    default: Onboarding,
  })),
);

const DashboardPage = lazy(() =>
  import('../pages/dashboard/Dashboard').then(({ Dashboard }) => ({
    default: Dashboard,
  })),
);

const TrainingPage = lazy(() =>
  import('../pages/dashboard/Training').then(({ Training }) => ({
    default: Training,
  })),
);

const NotFoundPage = lazy(() =>
  import('../pages/NotFound').then(({ NotFound }) => ({
    default: NotFound,
  })),
);

export default function AppRoutes() {
  const [isAuthenticated] = useState(true);

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Routes>
        <Route element={<AuthLayout />}>
          <Route
            path={RoutesEnum.LOGIN}
            element={
              <ProtectedRoute isAuthenticated={isAuthenticated}>
                <LoginPage />
              </ProtectedRoute>
            }
          />
          <Route
            path={RoutesEnum.SIGN_UP}
            element={
              <ProtectedRoute isAuthenticated={isAuthenticated}>
                <SignUpPage />
              </ProtectedRoute>
            }
          />
          <Route path={RoutesEnum.ONBOARDING} element={<OnboardingPage />} />
        </Route>

        <Route element={<DashboardLayout />}>
          <Route
            path={RoutesEnum.DASHBOARD}
            element={
              <ProtectedRoute isAuthenticated={isAuthenticated}>
                <DashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path={RoutesEnum.TRAINING}
            element={
              <ProtectedRoute isAuthenticated={isAuthenticated}>
                <TrainingPage />
              </ProtectedRoute>
            }
          />
        </Route>

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
