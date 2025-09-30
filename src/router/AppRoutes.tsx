import { useUser } from '@clerk/clerk-react';
import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router';

import { Spinner } from '@/components/ui/Spinner';
import { RoutesEnum } from '@/enums/router';
import { AuthLayout } from '@/pages/Auth/components';
import DashboardLayout from '@/pages/Dashboard/components/DashboardLayout';

import ProtectedRoute from './ProtectedRoute';

const LoginPage = lazy(() =>
  import('../pages/Auth/Login').then(({ Login }) => ({ default: Login })),
);

const SignUpPage = lazy(() =>
  import('../pages/Auth/SignUp').then(({ SignUp }) => ({ default: SignUp })),
);

const ForgotPasswordPage = lazy(() =>
  import('../pages/Auth/ForgotPassword').then(({ ForgotPassword }) => ({
    default: ForgotPassword,
  })),
);

const OnboardingPage = lazy(() =>
  import('../pages/Auth/Onboarding').then(({ Onboarding }) => ({
    default: Onboarding,
  })),
);

const DashboardPage = lazy(() =>
  import('@/pages/Dashboard/Dashboard').then(({ Dashboard }) => ({
    default: Dashboard,
  })),
);

const TrainingPage = lazy(() =>
  import('@/pages/Dashboard/Training').then(({ Training }) => ({
    default: Training,
  })),
);

const TrainingVideoPage = lazy(() =>
  import('@/pages/Dashboard/Training/Video').then(({ TrainingVideo }) => ({
    default: TrainingVideo,
  })),
);

const SettingsPage = lazy(() =>
  import('@/pages/Dashboard/Settings').then(({ SettingsPage }) => ({
    default: SettingsPage,
  })),
);

const PublicDashboardPage = lazy(() =>
  import('@/pages/Dashboard/PublicDashboard').then(({ PublicDashboard }) => ({
    default: PublicDashboard,
  })),
);

const NotFoundPage = lazy(() =>
  import('../pages/NotFound').then(({ NotFound }) => ({
    default: NotFound,
  })),
);

const InviteUserPage = lazy(() =>
  import('../pages/InviteUser').then(({ InviteUser }) => ({
    default: InviteUser,
  })),
);

export default function AppRoutes() {
  const { isSignedIn, isLoaded, user } = useUser();

  if (!isLoaded || isSignedIn === undefined) {
    return (
      <div className="bg-background flex h-full items-center justify-center">
        <Spinner className="h-[50px] w-[50px]" />
      </div>
    );
  }

  return (
    <Suspense
      fallback={
        <div className="bg-background flex h-full items-center justify-center">
          <Spinner className="h-[50px] w-[50px]" />
        </div>
      }
    >
      <Routes>
        <Route
          element={
            <ProtectedRoute isAuthenticated={isSignedIn} user={user}>
              <AuthLayout />
            </ProtectedRoute>
          }
        >
          <Route path={RoutesEnum.LOGIN} element={<LoginPage />} />
          <Route path={RoutesEnum.SIGN_UP} element={<SignUpPage />} />
          <Route
            path={RoutesEnum.FORGOT_PASSWORD}
            element={<ForgotPasswordPage />}
          />
          <Route path={RoutesEnum.ONBOARDING} element={<OnboardingPage />} />
        </Route>

        <Route
          element={
            <ProtectedRoute isAuthenticated={isSignedIn} user={user}>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route path={RoutesEnum.DASHBOARD} element={<DashboardPage />} />
          <Route path={RoutesEnum.TRAINING} element={<TrainingPage />} />
          <Route
            path="/training/video/:videoId"
            element={<TrainingVideoPage />}
          />
          <Route path={RoutesEnum.SETTINGS} element={<SettingsPage />} />
        </Route>

        <Route
          path={RoutesEnum.PUBLIC_DASHBOARD}
          element={<PublicDashboardPage />}
        />
        <Route
          element={
            <ProtectedRoute
              isAuthenticated={isSignedIn}
              user={user}
              requireAdmin
            >
              <AuthLayout />
            </ProtectedRoute>
          }
        >
          <Route path={RoutesEnum.INVITE} element={<InviteUserPage />} />
        </Route>

        <Route
          path="/"
          element={<Navigate to={RoutesEnum.DASHBOARD} replace />}
        />

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  );
}
