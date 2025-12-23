import { BranchLocation, CarCategory, CarFilter, CarModel, FuelType, TransmissionType } from '../types/car';
import { listCars, listReservations, getLocations } from './mockDatabase';
import { apiClient } from './apiClient';

type ApiCarResponse = {
  id: number;
  make: string;
  model: string;
  modelYear: number;
  locationId: number;
  locationCode?: string;
  locationName?: string;
  barcode?: string;
  licensePlate: string;
  vin?: string;
  carType: string;
  mileage: number;
  seats: number;
  dailyRate: number;
  transmission: string;
  fuelType: string;
  gpsIncluded?: boolean;
  childSeat?: boolean;
  airConditioning?: boolean;
  status?: string;
  description?: string;
};

type ApiLocationResponse = {
  id: number;
  code?: string;
  name: string;
  address: string;
};

function isBetween(date: Date, start: Date, end: Date): boolean {
  return date >= start && date <= end;
}

function hasOverlap(
  requestedStart: Date,
  requestedEnd: Date,
  reservationStart: Date,
  reservationEnd: Date
): boolean {
  return (
    isBetween(reservationStart, requestedStart, requestedEnd) ||
    isBetween(reservationEnd, requestedStart, requestedEnd) ||
    (reservationStart <= requestedStart && reservationEnd >= requestedEnd)
  );
}

export class CarCatalogService {
  async listLocations(): Promise<BranchLocation[]> {
    try {
      const locations = await apiClient.get<ApiLocationResponse[]>('/api/admin/locations', { auth: true });
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

  async getCars(filter: CarFilter = {}): Promise<CarModel[]> {
    try {
      const cars = await apiClient.get<ApiCarResponse[]>('/api/cars', {
        query: {
          make: filter.brand,
          carType: filter.category,
          locationId: filter.locationId,
          minDailyRate: filter.minPrice,
          maxDailyRate: filter.maxPrice,
          seats: filter.seats,
          transmission: filter.transmission,
          fuelType: filter.fuelType,
          startDate: filter.pickUpDate,
          endDate: filter.dropOffDate,
        },
      });
      return cars.map((car) => this.mapCar(car));
    } catch (err) {
      const cars = listCars();
      const reservations = listReservations().filter((res) => res.status === 'Active');
      const pick = filter.pickUpDate ? new Date(filter.pickUpDate) : null;
      const drop = filter.dropOffDate ? new Date(filter.dropOffDate) : null;

      return cars.filter((car) => {
        if (!this.matchesFilter(car, filter)) {
          return false;
        }

        if (pick && drop) {
          const conflicting = reservations.some(
            (reservation) =>
              reservation.carId === car.id &&
              hasOverlap(pick, drop, new Date(reservation.pickUpDate), new Date(reservation.dropOffDate))
          );
          return !conflicting;
        }

        return true;
      });
    }
  }

  async getCarDetails(carId: string): Promise<CarModel | undefined> {
    const numericId = Number(carId);
    if (!Number.isNaN(numericId)) {
      try {
        const car = await apiClient.get<ApiCarResponse>(`/api/cars/${numericId}`);
        return this.mapCar(car);
      } catch (err) {
        // Fall back to mock data.
      }
    }
    return listCars().find((car) => car.id === carId);
  }

  private matchesFilter(car: CarModel, filter: CarFilter): boolean {
    if (filter.locationId && car.locationId !== filter.locationId) {
      return false;
    }
    if (filter.brand && car.brand.toLowerCase() !== filter.brand.toLowerCase()) {
      return false;
    }
    if (filter.category && car.category !== filter.category) {
      return false;
    }
    if (typeof filter.minPrice === 'number' && car.dailyPrice < filter.minPrice) {
      return false;
    }
    if (typeof filter.maxPrice === 'number' && car.dailyPrice > filter.maxPrice) {
      return false;
    }
    if (filter.seats && car.seats < filter.seats) {
      return false;
    }
    if (filter.transmission && car.transmission !== filter.transmission) {
      return false;
    }
    if (filter.searchText) {
      const text = filter.searchText.toLowerCase();
      const matchesText =
        car.brand.toLowerCase().includes(text) ||
        car.model.toLowerCase().includes(text) ||
        car.features.some((feature) => feature.toLowerCase().includes(text));
      if (!matchesText) {
        return false;
      }
    }
    return true;
  }

  private mapCar(car: ApiCarResponse): CarModel {
    const category = this.normalizeCategory(car.carType);
    const transmission = this.normalizeTransmission(car.transmission);
    const fuelType = this.normalizeFuelType(car.fuelType);
    const features = [
      car.gpsIncluded ? 'GPS' : null,
      car.childSeat ? 'Child Seat' : null,
      car.airConditioning ? 'Air Conditioning' : null,
      car.description ? car.description : null,
    ].filter(Boolean) as string[];

    return {
      id: String(car.id),
      licensePlate: car.licensePlate,
      brand: car.make,
      model: car.model,
      category,
      seats: car.seats,
      transmission,
      fuelType,
      dailyPrice: Number(car.dailyRate),
      locationId: String(car.locationId ?? car.locationCode ?? ''),
      mileage: car.mileage,
      year: car.modelYear,
      rating: 4.5,
      available: (car.status ?? 'AVAILABLE') === 'AVAILABLE',
      features,
    };
  }

  private normalizeCategory(value?: string): CarCategory {
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

  private normalizeTransmission(value?: string): TransmissionType {
    return value?.toLowerCase() === 'manual' ? 'Manual' : 'Automatic';
  }

  private normalizeFuelType(value?: string): FuelType {
    const normalized = (value ?? '').toLowerCase();
    if (normalized === 'diesel') {
      return 'Diesel';
    }
    if (normalized === 'electric') {
      return 'Electric';
    }
    if (normalized === 'hybrid') {
      return 'Hybrid';
    }
    return 'Gasoline';
  }
}

export const carCatalogService = new CarCatalogService();
