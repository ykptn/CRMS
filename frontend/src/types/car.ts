export type TransmissionType = 'Automatic' | 'Manual';

export type FuelType = 'Gasoline' | 'Diesel' | 'Electric' | 'Hybrid';

export type CarCategory = 'SUV' | 'Sedan' | 'Hatchback' | 'Truck' | 'Van';

export interface BranchLocation {
  id: string;
  name: string;
  address: string;
  city: string;
  phone: string;
}

export interface CarModel {
  id: string;
  licensePlate: string;
  brand: string;
  model: string;
  category: CarCategory;
  seats: number;
  transmission: TransmissionType;
  fuelType: FuelType;
  dailyPrice: number;
  locationId: string;
  mileage: number;
  year: number;
  rating: number;
  available: boolean;
  imageUrl?: string;
  features: string[];
}

export interface CarFilter {
  searchText?: string;
  brand?: string;
  category?: CarCategory;
  minPrice?: number;
  maxPrice?: number;
  seats?: number;
  transmission?: TransmissionType;
  locationId?: string;
  pickUpDate?: string;
  dropOffDate?: string;
}
