import { listReservations, listUsers, listCars, getLocations } from './mockDatabase';
import { ReservationStatus } from '../types/reservation';

export interface ReservationReportRow {
  reservationNumber: string;
  memberName: string;
  carLabel: string;
  pickUpDate: string;
  dropOffDate: string;
  status: ReservationStatus;
  totalCost: number;
}

export interface ReportingSummary {
  statusSummary: Record<ReservationStatus, number>;
  revenueByLocation: Array<{ location: string; total: number }>;
  fleetUtilization: number;
  rows: ReservationReportRow[];
}

export class ReportingService {
  async buildReservationReport(): Promise<ReportingSummary> {
    const reservations = listReservations();
    const users = listUsers();
    const cars = listCars();
    const locations = getLocations();

    const statusSummary: Record<ReservationStatus, number> = {
      Active: 0,
      Completed: 0,
      Cancelled: 0,
    };

    const revenueByLocationMap: Record<string, number> = {};

    const rows: ReservationReportRow[] = reservations.map((reservation) => {
      statusSummary[reservation.status] += 1;

      const member = users.find((user) => user.id === reservation.memberId);
      const car = cars.find((candidate) => candidate.id === reservation.carId);
      const location = locations.find((loc) => loc.id === reservation.pickUpLocationId);
      const locationLabel = location ? location.city : reservation.pickUpLocationId;
      revenueByLocationMap[locationLabel] =
        (revenueByLocationMap[locationLabel] ?? 0) + reservation.totalCost;

      return {
        reservationNumber: reservation.reservationNumber,
        memberName: member ? member.fullName : 'Unknown Member',
        carLabel: car ? `${car.brand} ${car.model}` : 'Unknown Car',
        pickUpDate: reservation.pickUpDate,
        dropOffDate: reservation.dropOffDate,
        status: reservation.status,
        totalCost: reservation.totalCost,
      };
    });

    const revenueByLocation = Object.entries(revenueByLocationMap).map(([location, total]) => ({
      location,
      total,
    }));

    const utilization =
      cars.length === 0 ? 0 : Math.round(((statusSummary.Active + statusSummary.Completed) / cars.length) * 100);

    return {
      statusSummary,
      revenueByLocation,
      fleetUtilization: utilization,
      rows,
    };
  }

  async exportReportAsCsv(rows: ReservationReportRow[]): Promise<string> {
    const header = 'Reservation,Member,Car,Pick-Up,Drop-Off,Status,Total';
    const csvRows = rows.map(
      (row) =>
        `${row.reservationNumber},"${row.memberName}","${row.carLabel}",${row.pickUpDate},${row.dropOffDate},${row.status},${row.totalCost}`
    );
    return [header, ...csvRows].join('\n');
  }
}

export const reportingService = new ReportingService();
