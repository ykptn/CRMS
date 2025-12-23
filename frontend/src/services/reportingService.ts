import { listReservations, listUsers, listCars, getLocations } from './mockDatabase';
import { ReservationStatus } from '../types/reservation';
import { apiClient } from './apiClient';

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
    let reservations = listReservations();
    let users = listUsers();
    let cars = listCars();
    let locations = getLocations();

    try {
      const [apiReservations, apiMembers, apiCars, apiLocations] = await Promise.all([
        apiClient.get<any[]>('/api/admin/reservations', { auth: true }),
        apiClient.get<any[]>('/api/admin/members', { auth: true }),
        apiClient.get<any[]>('/api/cars'),
        apiClient.get<any[]>('/api/admin/locations', { auth: true }),
      ]);
      reservations = apiReservations.map((reservation) => ({
        id: String(reservation.id),
        reservationNumber: reservation.reservationNumber,
        memberId: String(reservation.memberId),
        carId: String(reservation.carId),
        pickUpLocationId: String(reservation.pickupLocationId),
        dropOffLocationId: String(reservation.dropoffLocationId),
        pickUpDate: reservation.startDate,
        dropOffDate: reservation.endDate,
        totalCost: Number(reservation.totalCost),
        status: reservation.status === 'COMPLETED' ? 'Completed' : reservation.status === 'CANCELED' ? 'Cancelled' : 'Active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        services: [],
      }));
      users = apiMembers.map((member) => ({
        id: String(member.id),
        fullName: member.fullName,
        email: member.email,
        role: 'member',
        phone: member.phone ?? '',
        address: member.address ?? '',
        licenseNumber: member.drivingLicenseNumber ?? '',
        createdAt: new Date().toISOString(),
      }));
      cars = apiCars.map((car) => ({
        id: String(car.id),
        licensePlate: car.licensePlate,
        brand: car.make,
        model: car.model,
        category: this.normalizeCategory(car.carType),
        seats: car.seats,
        transmission: car.transmission === 'Manual' ? 'Manual' : 'Automatic',
        fuelType: car.fuelType,
        dailyPrice: Number(car.dailyRate),
        locationId: String(car.locationId ?? ''),
        mileage: car.mileage,
        year: car.modelYear,
        rating: 4.5,
        available: (car.status ?? 'AVAILABLE') === 'AVAILABLE',
        features: [],
      }));
      locations = apiLocations.map((location) => ({
        id: String(location.id),
        name: location.name,
        address: location.address,
        city: location.code ?? location.name,
        phone: '',
      }));
    } catch (err) {
      // Fall back to mock data.
    }

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

  private normalizeCategory(value?: string): 'SUV' | 'Sedan' | 'Hatchback' | 'Truck' | 'Van' {
    const normalized = (value ?? '').toLowerCase();
    if (normalized === 'suv') {
      return 'SUV';
    }
    if (normalized === 'sedan') {
      return 'Sedan';
    }
    if (normalized === 'hatchback') {
      return 'Hatchback';
    }
    if (normalized === 'truck') {
      return 'Truck';
    }
    if (normalized === 'van') {
      return 'Van';
    }
    return 'Sedan';
  }
}

export const reportingService = new ReportingService();
