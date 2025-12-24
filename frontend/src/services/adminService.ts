import { BranchLocation, CarModel } from '../types/car';
import { AdditionalService } from '../types/service';
import { Equipment } from '../types/equipment';
import { ReservationModel, ReservationStatus } from '../types/reservation';
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
      status: car.status ?? 'AVAILABLE',
      features: [],
    }));
  }

  async saveCar(car: Omit<CarModel, 'id'> & { id?: string }): Promise<CarModel> {
    const numericId = car.id ? Number(car.id) : null;
    if (numericId !== null && Number.isNaN(numericId)) {
      throw new Error('Invalid car id.');
    }
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
      status: response.status ?? 'AVAILABLE',
      features: [],
    };
  }

  async updateCarStatus(carId: string, status: NonNullable<CarModel['status']>): Promise<CarModel> {
    const numericId = Number(carId);
    if (Number.isNaN(numericId)) {
      throw new Error('Invalid car id.');
    }
    const response = await apiClient.patch<any>(
      `/api/admin/cars/${numericId}/status`,
      { status },
      { auth: true }
    );
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
      status: response.status ?? 'AVAILABLE',
      features: [],
    };
  }

  async deleteCar(carId: string): Promise<void> {
    const numericId = Number(carId);
    if (Number.isNaN(numericId)) {
      throw new Error('Invalid car id.');
    }
    await apiClient.delete<void>(`/api/admin/cars/${numericId}`, { auth: true });
  }

  async listReservations(status?: ReservationStatus): Promise<ReservationModel[]> {
    const statusParam =
      status === 'Active' ? 'ACTIVE' : status === 'Completed' ? 'COMPLETED' : status === 'Cancelled' ? 'CANCELED' : undefined;
    const reservations = await apiClient.get<any[]>('/api/admin/reservations', {
      auth: true,
      query: statusParam ? { status: statusParam } : undefined,
    });
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
      equipments: [],
    }));
  }

  async updateReservationStatus(
    reservationId: string,
    status: ReservationStatus
  ): Promise<ReservationModel> {
    const numericId = Number(reservationId);
    if (Number.isNaN(numericId)) {
      throw new Error('Invalid reservation id.');
    }
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
        equipments: [],
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
        equipments: [],
      };
    }
    throw new Error('Unsupported reservation status.');
  }

  async listServices(): Promise<AdditionalService[]> {
    const services = await apiClient.get<any[]>('/api/admin/services', { auth: true });
    return services.map((service) => ({
      id: String(service.id),
      name: service.name,
      price: Number(service.dailyPrice),
      category: 'Convenience',
    }));
  }

  async saveService(service: Omit<AdditionalService, 'id'> & { id?: string }): Promise<AdditionalService> {
    const numericId = service.id ? Number(service.id) : null;
    if (numericId !== null && Number.isNaN(numericId)) {
      throw new Error('Invalid service id.');
    }
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
      price: Number(response.dailyPrice),
      category: service.category,
    };
  }

  async deleteService(serviceId: string): Promise<void> {
    const numericId = Number(serviceId);
    if (Number.isNaN(numericId)) {
      throw new Error('Invalid service id.');
    }
    await apiClient.delete<void>(`/api/admin/services/${numericId}`, { auth: true });
  }

  async listEquipment(): Promise<Equipment[]> {
    const equipment = await apiClient.get<any[]>('/api/admin/equipment', { auth: true });
    return equipment.map((item) => ({
      id: String(item.id),
      name: item.name,
      price: Number(item.dailyPrice),
    }));
  }

  async saveEquipment(equipment: Omit<Equipment, 'id'> & { id?: string }): Promise<Equipment> {
    const numericId = equipment.id ? Number(equipment.id) : null;
    if (numericId !== null && Number.isNaN(numericId)) {
      throw new Error('Invalid equipment id.');
    }
    const payload = {
      name: equipment.name,
      dailyPrice: equipment.price,
    };
    const response = equipment.id
      ? await apiClient.put<any>(`/api/admin/equipment/${numericId}`, payload, { auth: true })
      : await apiClient.post<any>('/api/admin/equipment', payload, { auth: true });
    return {
      id: String(response.id),
      name: response.name,
      price: Number(response.dailyPrice),
    };
  }

  async deleteEquipment(equipmentId: string): Promise<void> {
    const numericId = Number(equipmentId);
    if (Number.isNaN(numericId)) {
      throw new Error('Invalid equipment id.');
    }
    await apiClient.delete<void>(`/api/admin/equipment/${numericId}`, { auth: true });
  }

  async listMembers(): Promise<AuthUser[]> {
    const members = await apiClient.get<any[]>('/api/admin/members', { auth: true });
    return members.map((member) => ({
      id: String(member.id),
      fullName: member.fullName,
      email: member.email,
      role: 'member',
      phone: member.phone ?? '',
      address: member.address ?? '',
      licenseNumber: member.drivingLicenseNumber ?? '',
      licenseExpiry: member.drivingLicenseExpiry ?? '',
      createdAt: new Date().toISOString(),
    }));
  }

  async listBranches(): Promise<BranchLocation[]> {
    const locations = await apiClient.get<any[]>('/api/admin/locations', { auth: true });
    return locations.map((location) => ({
      id: String(location.id),
      code: location.code,
      name: location.name,
      address: location.address,
      city: location.code ?? location.name,
      phone: location.phone ?? '',
    }));
  }

  async saveBranch(branch: Omit<BranchLocation, 'id' | 'city' | 'phone'> & { id?: string }): Promise<BranchLocation> {
    const numericId = branch.id ? Number(branch.id) : null;
    if (numericId !== null && Number.isNaN(numericId)) {
      throw new Error('Invalid branch id.');
    }
    const payload = {
      code: branch.code ?? '',
      name: branch.name,
      address: branch.address,
      phone: branch.phone ?? '',
    };
    const response = branch.id
      ? await apiClient.put<any>(`/api/admin/locations/${numericId}`, payload, { auth: true })
      : await apiClient.post<any>('/api/admin/locations', payload, { auth: true });
    return {
      id: String(response.id),
      code: response.code,
      name: response.name,
      address: response.address,
      city: response.code ?? response.name,
      phone: response.phone ?? '',
    };
  }

  async deleteBranch(branchId: string): Promise<void> {
    const numericId = Number(branchId);
    if (Number.isNaN(numericId)) {
      throw new Error('Invalid branch id.');
    }
    await apiClient.delete<void>(`/api/admin/locations/${numericId}`, { auth: true });
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
