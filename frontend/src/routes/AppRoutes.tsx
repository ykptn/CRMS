import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
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

// TODO: Implement route structure once all components are ready
export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<div>Home - Routes to be implemented</div>} />
    </Routes>
  );
}
