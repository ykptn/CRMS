import { BranchLocation, CarModel } from '../types/car';
import { AdditionalService } from '../types/service';
import { ReservationModel, ReservationStatus } from '../types/reservation';
import {
  deleteCar as deleteCarFromDb,
  generateId,
  getLocations,
  listCars as readCars,
  listReservations as readReservations,
  listServices as readServices,
  listUsers,
  mutateDb,
  saveServices,
  toAuthUser,
  upsertCar,
} from './mockDatabase';
import { AuthUser } from '../types/auth';

export interface DashboardOverview {
  totalCars: number;
  availableCars: number;
  activeReservations: number;
  totalMembers: number;
  monthlyRevenue: number;
  utilizationRate: number;
}

export class AdminService {
  async getDashboardOverview(): Promise<DashboardOverview> {
    const cars = readCars();
    const reservations = readReservations();
    const members = listUsers().filter((user) => user.role === 'member');

    const activeReservations = reservations.filter((reservation) => reservation.status === 'Active');
    const monthlyRevenue = reservations
      .filter((reservation) => reservation.status !== 'Cancelled')
      .reduce((sum, reservation) => sum + reservation.totalCost, 0);

    const utilizationRate =
      cars.length === 0 ? 0 : Math.round((activeReservations.length / cars.length) * 100);

    return {
      totalCars: cars.length,
      availableCars: cars.filter((car) => car.available).length,
      activeReservations: activeReservations.length,
      totalMembers: members.length,
      monthlyRevenue,
      utilizationRate,
    };
  }

  async listCars(): Promise<CarModel[]> {
    return readCars();
  }

  async saveCar(car: Omit<CarModel, 'id'> & { id?: string }): Promise<CarModel> {
    const next: CarModel = {
      ...car,
      id: car.id ?? generateId('car'),
    };
    upsertCar(next);
    return next;
  }

  async deleteCar(carId: string): Promise<void> {
    deleteCarFromDb(carId);
  }

  async listReservations(): Promise<ReservationModel[]> {
    return readReservations();
  }

  async updateReservationStatus(
    reservationId: string,
    status: ReservationStatus
  ): Promise<ReservationModel> {
    let updated: ReservationModel | undefined;
    mutateDb((db) => {
      db.reservations = db.reservations.map((reservation) => {
        if (reservation.id !== reservationId) {
          return reservation;
        }
        updated = {
          ...reservation,
          status,
          updatedAt: new Date().toISOString(),
        };
        return updated!;
      });
    });

    if (!updated) {
      throw new Error('Reservation not found.');
    }
    return updated;
  }

  async listServices(): Promise<AdditionalService[]> {
    return readServices();
  }

  async saveService(service: Omit<AdditionalService, 'id'> & { id?: string }): Promise<AdditionalService> {
    const current = readServices();
    const next: AdditionalService =
      service.id && current.some((existing) => existing.id === service.id)
        ? (service as AdditionalService)
        : { ...service, id: generateId('srv') };
    const updated = service.id
      ? current.map((existing) => (existing.id === service.id ? next : existing))
      : [...current, next];
    saveServices(updated);
    return next;
  }

  async deleteService(serviceId: string): Promise<void> {
    const updated = readServices().filter((service) => service.id !== serviceId);
    saveServices(updated);
  }

  async listMembers(): Promise<AuthUser[]> {
    return listUsers()
      .filter((user) => user.role === 'member')
      .map((user) => toAuthUser(user));
  }

  async listBranches(): Promise<BranchLocation[]> {
    return getLocations();
  }
}

export const adminService = new AdminService();
