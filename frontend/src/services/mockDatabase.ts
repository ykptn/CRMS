import { AuthUser } from '../types/auth';
import { BranchLocation, CarModel } from '../types/car';
import { ReservationModel } from '../types/reservation';
import { AdditionalService } from '../types/service';

interface StoredUser extends AuthUser {
  password: string;
}

interface MockDatabase {
  users: StoredUser[];
  cars: CarModel[];
  reservations: ReservationModel[];
  services: AdditionalService[];
  locations: BranchLocation[];
}

const STORAGE_KEY = 'crms-mock-db';

const DEFAULT_DB: MockDatabase = {
  users: [
    {
      id: 'u-admin',
      fullName: 'Fleet Admin',
      email: 'admin@crms.com',
      password: 'admin123',
      role: 'admin',
      phone: '+90 555 000 0000',
      address: 'Central Operations HQ',
      licenseNumber: '-',
      licenseExpiry: '2026-12-31',
      createdAt: new Date('2024-05-01').toISOString(),
    },
    {
      id: 'u-member-001',
      fullName: 'Beril Eda Teberci',
      email: 'beril@crms.com',
      password: 'member123',
      role: 'member',
      phone: '+90 555 111 2233',
      address: 'Atasehir, Istanbul',
      licenseNumber: 'TR-458921',
      licenseExpiry: '2025-08-15',
      createdAt: new Date('2024-05-04').toISOString(),
      preferredLocationId: 'loc-istanbul',
    },
  ],
  locations: [
    {
      id: 'loc-istanbul',
      name: 'Istanbul Airport Branch',
      address: 'Tayakadın, Terminal Cad., Arnavutköy',
      city: 'Istanbul',
      phone: '+90 212 444 4444',
    },
    {
      id: 'loc-izmir',
      name: 'Izmir Downtown Branch',
      address: 'Cumhuriyet Bulvarı No:32',
      city: 'Izmir',
      phone: '+90 232 555 5525',
    },
    {
      id: 'loc-ankara',
      name: 'Ankara Central Branch',
      address: 'Tunali Hilmi Cd. No:80',
      city: 'Ankara',
      phone: '+90 312 600 1200',
    },
    {
      id: 'loc-antalya',
      name: 'Antalya Airport Branch',
      address: 'Yeşilköy, Antalya Havalimanı',
      city: 'Antalya',
      phone: '+90 242 330 2424',
    },
  ],
  cars: [],
  services: [
    {
      id: 'srv-gps',
      name: 'GPS Navigation',
      price: 8,
      category: 'Equipment',
    },
    {
      id: 'srv-seat',
      name: 'Child Seat',
      price: 6,
      category: 'Equipment',
    },
    {
      id: 'srv-insurance',
      name: 'Full Protection',
      price: 18,
      category: 'Protection',
    },
    {
      id: 'srv-wifi',
      name: 'In-Car Wi-Fi',
      price: 10,
      category: 'Convenience',
    },
  ],
  reservations: [],
};

const defaultCars: CarModel[] = [
  {
    id: 'car-001',
    licensePlate: '34 CRMS 01',
    brand: 'Toyota',
    model: 'Corolla',
    category: 'Sedan',
    seats: 5,
    transmission: 'Automatic',
    fuelType: 'Hybrid',
    dailyPrice: 45,
    locationId: 'loc-istanbul',
    mileage: 22000,
    year: 2022,
    rating: 4.6,
    available: true,
    imageUrl: 'https://images.pexels.com/photos/112460/pexels-photo-112460.jpeg',
    features: ['Bluetooth', 'Cruise Control', 'Rear Camera'],
  },
  {
    id: 'car-002',
    licensePlate: '35 CRMS 21',
    brand: 'Hyundai',
    model: 'i20',
    category: 'Hatchback',
    seats: 5,
    transmission: 'Manual',
    fuelType: 'Gasoline',
    dailyPrice: 38,
    locationId: 'loc-izmir',
    mileage: 18000,
    year: 2023,
    rating: 4.5,
    available: true,
    imageUrl: 'https://images.pexels.com/photos/358070/pexels-photo-358070.jpeg',
    features: ['Apple CarPlay', 'USB Charging'],
  },
  {
    id: 'car-003',
    licensePlate: '06 CRMS 11',
    brand: 'Volkswagen',
    model: 'Passat',
    category: 'Sedan',
    seats: 5,
    transmission: 'Automatic',
    fuelType: 'Diesel',
    dailyPrice: 72,
    locationId: 'loc-ankara',
    mileage: 35000,
    year: 2021,
    rating: 4.7,
    available: true,
    imageUrl: 'https://images.pexels.com/photos/210019/pexels-photo-210019.jpeg',
    features: ['Leather Seats', 'Adaptive Cruise Control'],
  },
  {
    id: 'car-004',
    licensePlate: '07 CRMS 45',
    brand: 'Peugeot',
    model: '3008',
    category: 'SUV',
    seats: 5,
    transmission: 'Automatic',
    fuelType: 'Diesel',
    dailyPrice: 80,
    locationId: 'loc-antalya',
    mileage: 15000,
    year: 2023,
    rating: 4.8,
    available: true,
    imageUrl: 'https://images.pexels.com/photos/1402787/pexels-photo-1402787.jpeg',
    features: ['Panoramic Roof', 'Heads-up Display'],
  },
  {
    id: 'car-005',
    licensePlate: '34 CRMS 20',
    brand: 'Renault',
    model: 'Clio',
    category: 'Hatchback',
    seats: 5,
    transmission: 'Automatic',
    fuelType: 'Gasoline',
    dailyPrice: 34,
    locationId: 'loc-istanbul',
    mileage: 12000,
    year: 2024,
    rating: 4.3,
    available: true,
    features: ['Android Auto', 'Parking Sensors'],
  },
  {
    id: 'car-006',
    licensePlate: '06 CRMS 22',
    brand: 'Ford',
    model: 'Tourneo Custom',
    category: 'Van',
    seats: 8,
    transmission: 'Automatic',
    fuelType: 'Diesel',
    dailyPrice: 110,
    locationId: 'loc-ankara',
    mileage: 42000,
    year: 2020,
    rating: 4.4,
    available: true,
    features: ['Dual Zone AC', 'USB Charging'],
  },
];

DEFAULT_DB.cars = defaultCars;

const storage =
  typeof window !== 'undefined' && window.localStorage ? window.localStorage : null;

let workingDb: MockDatabase | null = null;

function cloneDb(db: MockDatabase): MockDatabase {
  return JSON.parse(JSON.stringify(db)) as MockDatabase;
}

function loadFromStorage(): MockDatabase | null {
  if (!storage) {
    return null;
  }

  const raw = storage.getItem(STORAGE_KEY);
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as MockDatabase;
  } catch {
    return null;
  }
}

function persist() {
  if (storage && workingDb) {
    storage.setItem(STORAGE_KEY, JSON.stringify(workingDb));
  }
}

function ensureDb(): MockDatabase {
  if (!workingDb) {
    workingDb = loadFromStorage() ?? cloneDb(DEFAULT_DB);
  }
  return workingDb;
}

export function getDbSnapshot(): MockDatabase {
  return cloneDb(ensureDb());
}

export function mutateDb(mutator: (db: MockDatabase) => void): MockDatabase {
  const db = ensureDb();
  mutator(db);
  persist();
  return getDbSnapshot();
}

export function generateId(prefix: string): string {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`;
}

export function findUserByEmail(email: string): StoredUser | undefined {
  return ensureDb().users.find((user) => user.email.toLowerCase() === email.toLowerCase());
}

export function addUser(user: StoredUser): StoredUser {
  mutateDb((db) => {
    db.users.push(user);
  });
  return user;
}

export function updateUser(userId: string, updater: (current: StoredUser) => StoredUser): void {
  mutateDb((db) => {
    db.users = db.users.map((user) => (user.id === userId ? updater(user) : user));
  });
}

export function saveReservation(reservation: ReservationModel): void {
  mutateDb((db) => {
    db.reservations = [reservation, ...db.reservations];
    db.cars = db.cars.map((car) =>
      car.id === reservation.carId ? { ...car, available: reservation.status !== 'Active' } : car
    );
  });
}

export function upsertCar(updatedCar: CarModel): void {
  mutateDb((db) => {
    const exists = db.cars.some((car) => car.id === updatedCar.id);
    db.cars = exists ? db.cars.map((car) => (car.id === updatedCar.id ? updatedCar : car)) : [updatedCar, ...db.cars];
  });
}

export function deleteCar(carId: string): void {
  mutateDb((db) => {
    db.cars = db.cars.filter((car) => car.id !== carId);
    db.reservations = db.reservations.filter((res) => res.carId !== carId);
  });
}

export function saveServices(services: AdditionalService[]): void {
  mutateDb((db) => {
    db.services = services;
  });
}

export function getLocations(): BranchLocation[] {
  return getDbSnapshot().locations;
}

export function listCars(): CarModel[] {
  return getDbSnapshot().cars;
}

export function listServices(): AdditionalService[] {
  return getDbSnapshot().services;
}

export function listReservations(): ReservationModel[] {
  return getDbSnapshot().reservations;
}

export function listUsers(): StoredUser[] {
  return getDbSnapshot().users;
}

export function toAuthUser(user: StoredUser): AuthUser {
  const { password, ...safe } = user;
  return safe;
}

export type { MockDatabase, StoredUser };
