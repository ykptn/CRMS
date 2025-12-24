import { BranchLocation, CarCategory, CarFilter, CarModel, FuelType, TransmissionType } from '../types/car';
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
  phone?: string;
};

export class CarCatalogService {
  async listLocations(): Promise<BranchLocation[]> {
    const locations = await apiClient.get<ApiLocationResponse[]>('/api/locations');
    return locations.map((location) => ({
      id: String(location.id),
      code: location.code,
      name: location.name,
      address: location.address,
      city: location.code ?? location.name,
      phone: location.phone ?? '',
    }));
  }

  async getCars(filter: CarFilter = {}): Promise<CarModel[]> {
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
    const mapped = cars.map((car) => this.mapCar(car));
    if (filter.searchText) {
      const text = filter.searchText.toLowerCase();
      return mapped.filter(
        (car) =>
          car.brand.toLowerCase().includes(text) ||
          car.model.toLowerCase().includes(text) ||
          car.features.some((feature) => feature.toLowerCase().includes(text))
      );
    }
    return mapped;
  }

  async getCarDetails(carId: string): Promise<CarModel | undefined> {
    const numericId = Number(carId);
    if (Number.isNaN(numericId)) {
      throw new Error('Invalid car id.');
    }
    const car = await apiClient.get<ApiCarResponse>(`/api/cars/${numericId}`);
    return this.mapCar(car);
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
      status: (car.status ?? 'AVAILABLE') as CarModel['status'],
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
