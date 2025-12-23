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
import { apiClient } from './apiClient';

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
    const cars = await this.listCars();
    const reservations = await this.listReservations();
    const members = await this.listMembers();

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
    try {
      const cars = await apiClient.get<any[]>('/api/cars');
      return cars.map((car) => ({
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
    } catch (err) {
      return readCars();
    }
  }

  async saveCar(car: Omit<CarModel, 'id'> & { id?: string }): Promise<CarModel> {
    const numericId = car.id ? Number(car.id) : null;
    if (numericId === null || !Number.isNaN(numericId)) {
      try {
        const payload = {
          make: car.brand,
          model: car.model,
          modelYear: car.year,
          locationId: Number(car.locationId),
          barcode: car.licensePlate,
          licensePlate: car.licensePlate,
          vin: '',
          carType: car.category,
          mileage: car.mileage,
          seats: car.seats,
          dailyRate: car.dailyPrice,
          transmission: car.transmission,
          fuelType: car.fuelType,
          gpsIncluded: car.features.includes('GPS'),
          childSeat: car.features.includes('Child Seat'),
          airConditioning: car.features.includes('Air Conditioning'),
          description: car.features.join(', '),
        };
        const response = car.id
          ? await apiClient.put<any>(`/api/admin/cars/${numericId}`, payload, { auth: true })
          : await apiClient.post<any>('/api/admin/cars', payload, { auth: true });
        return {
          id: String(response.id),
          licensePlate: response.licensePlate,
          brand: response.make,
          model: response.model,
          category: this.normalizeCategory(response.carType),
          seats: response.seats,
          transmission: response.transmission === 'Manual' ? 'Manual' : 'Automatic',
          fuelType: response.fuelType,
          dailyPrice: Number(response.dailyRate),
          locationId: String(response.locationId ?? ''),
          mileage: response.mileage,
          year: response.modelYear,
          rating: 4.5,
          available: (response.status ?? 'AVAILABLE') === 'AVAILABLE',
          features: [],
        };
      } catch (err) {
        // Fall back to mock updates.
      }
    }

    const next: CarModel = {
      ...car,
      id: car.id ?? generateId('car'),
    };
    upsertCar(next);
    return next;
  }

  async deleteCar(carId: string): Promise<void> {
    const numericId = Number(carId);
    if (!Number.isNaN(numericId)) {
      try {
        await apiClient.delete<void>(`/api/admin/cars/${numericId}`, { auth: true });
        return;
      } catch (err) {
        // Fall back to mock delete.
      }
    }
    deleteCarFromDb(carId);
  }

  async listReservations(): Promise<ReservationModel[]> {
    try {
      const reservations = await apiClient.get<any[]>('/api/admin/reservations', { auth: true });
      return reservations.map((reservation) => ({
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
    } catch (err) {
      return readReservations();
    }
  }

  async updateReservationStatus(
    reservationId: string,
    status: ReservationStatus
  ): Promise<ReservationModel> {
    const numericId = Number(reservationId);
    if (!Number.isNaN(numericId)) {
      try {
        if (status === 'Cancelled') {
          const response = await apiClient.post<any>(`/api/reservations/${numericId}/cancel`);
          return {
            id: String(response.id),
            reservationNumber: response.reservationNumber,
            memberId: String(response.memberId),
            carId: String(response.carId),
            pickUpLocationId: String(response.pickupLocationId),
            dropOffLocationId: String(response.dropoffLocationId),
            pickUpDate: response.startDate,
            dropOffDate: response.endDate,
            totalCost: Number(response.totalCost),
            status: 'Cancelled',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            services: [],
          };
        }
        if (status === 'Completed') {
          const response = await apiClient.post<any>(`/api/reservations/${numericId}/complete`);
          return {
            id: String(response.id),
            reservationNumber: response.reservationNumber,
            memberId: String(response.memberId),
            carId: String(response.carId),
            pickUpLocationId: String(response.pickupLocationId),
            dropOffLocationId: String(response.dropoffLocationId),
            pickUpDate: response.startDate,
            dropOffDate: response.endDate,
            totalCost: Number(response.totalCost),
            status: 'Completed',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            services: [],
          };
        }
      } catch (err) {
        // Fall back to mock update.
      }
    }

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
    try {
      const services = await apiClient.get<any[]>('/api/admin/services', { auth: true });
      return services.map((service) => ({
        id: String(service.id),
        name: service.name,
        description: '',
        price: Number(service.dailyPrice),
        category: 'Convenience',
      }));
    } catch (err) {
      return readServices();
    }
  }

  async saveService(service: Omit<AdditionalService, 'id'> & { id?: string }): Promise<AdditionalService> {
    const numericId = service.id ? Number(service.id) : null;
    if (numericId === null || !Number.isNaN(numericId)) {
      try {
        const payload = {
          name: service.name,
          dailyPrice: service.price,
        };
        const response = service.id
          ? await apiClient.put<any>(`/api/admin/services/${numericId}`, payload, { auth: true })
          : await apiClient.post<any>('/api/admin/services', payload, { auth: true });
        return {
          id: String(response.id),
          name: response.name,
          description: service.description,
          price: Number(response.dailyPrice),
          category: service.category,
        };
      } catch (err) {
        // Fall back to mock updates.
      }
    }

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
    const numericId = Number(serviceId);
    if (!Number.isNaN(numericId)) {
      try {
        await apiClient.delete<void>(`/api/admin/services/${numericId}`, { auth: true });
        return;
      } catch (err) {
        // Fall back to mock delete.
      }
    }

    const updated = readServices().filter((service) => service.id !== serviceId);
    saveServices(updated);
  }

  async listMembers(): Promise<AuthUser[]> {
    try {
      const members = await apiClient.get<any[]>('/api/admin/members', { auth: true });
      return members.map((member) => ({
        id: String(member.id),
        fullName: member.fullName,
        email: member.email,
        role: 'member',
        phone: member.phone ?? '',
        address: member.address ?? '',
        licenseNumber: member.drivingLicenseNumber ?? '',
        createdAt: new Date().toISOString(),
      }));
    } catch (err) {
      return listUsers()
        .filter((user) => user.role === 'member')
        .map((user) => toAuthUser(user));
    }
  }

  async listBranches(): Promise<BranchLocation[]> {
    try {
      const locations = await apiClient.get<any[]>('/api/admin/locations', { auth: true });
      return locations.map((location) => ({
        id: String(location.id),
        name: location.name,
        address: location.address,
        city: location.code ?? location.name,
        phone: '',
      }));
    } catch (err) {
      return getLocations();
    }
  }

  private normalizeCategory(value?: string): CarModel['category'] {
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

export const adminService = new AdminService();
