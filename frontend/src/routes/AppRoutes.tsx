import { Navigate, Route, Routes } from 'react-router-dom';
import type { ReactElement } from 'react';
import MemberLayout from '../layouts/MemberLayout';
import AdminLayout from '../layouts/AdminLayout';
import CarSearchPage from '../pages/CarSearchPage';
import ReservationPage from '../pages/ReservationPage';
import ReservationSummaryPage from '../pages/ReservationSummaryPage';
import ReservationHistoryPage from '../pages/ReservationHistoryPage';
import AdditionalServicePage from '../pages/AdditionalServicePage';
import MemberDashboardPage from '../pages/MemberDashboardPage';
import AdminDashboardPage from '../pages/AdminDashboardPage';
import CarManagementPage from '../pages/CarManagementPage';
import ReservationManagementPage from '../pages/ReservationManagementPage';
import MemberManagementPage from '../pages/MemberManagementPage';
import ServiceManagementPage from '../pages/ServiceManagementPage';
import BranchManagementPage from '../pages/BranchManagementPage';
import ReportsPage from '../pages/ReportsPage';
import LoginPage from '../pages/LoginPage';
import RegisterPage from '../pages/RegisterPage';
import { useAuth } from '../hooks/useAuth';
import type { UserRole } from '../types/auth';

interface ProtectedRouteProps {
  children: ReactElement;
  requiredRole?: UserRole;
}

function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const { user, loading } = useAuth();

  if (loading) {
    return <p>Loading...</p>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to="/" replace />;
  }

  return children;
}

export default function AppRoutes() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Member routes */}
      <Route element={<MemberLayout />}>
        <Route path="/" element={<CarSearchPage />} />
        <Route path="/services" element={<AdditionalServicePage />} />
        <Route
          path="/reservations/new"
          element={
            <ProtectedRoute requiredRole="member">
              <ReservationPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/reservations/summary"
          element={
            <ProtectedRoute requiredRole="member">
              <ReservationSummaryPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/reservations/history"
          element={
            <ProtectedRoute requiredRole="member">
              <ReservationHistoryPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/member/dashboard"
          element={
            <ProtectedRoute requiredRole="member">
              <MemberDashboardPage />
            </ProtectedRoute>
          }
        />
      </Route>

      {/* Admin routes */}
      <Route
        element={
          <ProtectedRoute requiredRole="admin">
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/admin" element={<AdminDashboardPage />} />
        <Route path="/admin/cars" element={<CarManagementPage />} />
        <Route path="/admin/reservations" element={<ReservationManagementPage />} />
        <Route path="/admin/members" element={<MemberManagementPage />} />
        <Route path="/admin/services" element={<ServiceManagementPage />} />
        <Route path="/admin/branches" element={<BranchManagementPage />} />
        <Route path="/admin/reports" element={<ReportsPage />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
