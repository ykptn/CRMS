import { useCallback, useEffect, useState } from 'react';
import { adminService, DashboardOverview } from '../services/adminService';
import { reportingService, ReportingSummary } from '../services/reportingService';
import { CarModel } from '../types/car';
import { ReservationModel } from '../types/reservation';
import { AdditionalService } from '../types/service';
import { AuthUser } from '../types/auth';

interface AdminDashboardState {
  overview: DashboardOverview | null;
  cars: CarModel[];
  reservations: ReservationModel[];
  services: AdditionalService[];
  members: AuthUser[];
  report: ReportingSummary | null;
  loading: boolean;
  error: string | null;
}

export function useAdminDashboard() {
  const [state, setState] = useState<AdminDashboardState>({
    overview: null,
    cars: [],
    reservations: [],
    services: [],
    members: [],
    report: null,
    loading: true,
    error: null,
  });

  const refresh = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true }));
    try {
      const [overview, cars, reservations, services, members, report] = await Promise.all([
        adminService.getDashboardOverview(),
        adminService.listCars(),
        adminService.listReservations(),
        adminService.listServices(),
        adminService.listMembers(),
        reportingService.buildReservationReport(),
      ]);

      setState({
        overview,
        cars,
        reservations,
        services,
        members,
        report,
        loading: false,
        error: null,
      });
    } catch (err) {
      console.error(err);
      setState((prev) => ({
        ...prev,
        loading: false,
        error: 'Unable to load admin dashboard data.',
      }));
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const exportReport = async (): Promise<string | null> => {
    if (!state.report) {
      return null;
    }
    return reportingService.exportReportAsCsv(state.report.rows);
  };

  const updateReservationStatus = async (reservationId: string, status: ReservationModel['status']) => {
    await adminService.updateReservationStatus(reservationId, status);
    await refresh();
  };

  return {
    state,
    refresh,
    exportReport,
    updateReservationStatus,
  };
}
