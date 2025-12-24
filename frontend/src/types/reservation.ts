import { AdditionalService } from './service';
import { Equipment } from './equipment';

export type ReservationStatus = 'Active' | 'Completed' | 'Cancelled';

export interface ReservationModel {
  id: string;
  reservationNumber: string;
  memberId: string;
  carId: string;
  pickUpLocationId: string;
  dropOffLocationId: string;
  pickUpDate: string;
  dropOffDate: string;
  totalCost: number;
  status: ReservationStatus;
  createdAt: string;
  updatedAt: string;
  services: AdditionalService[];
  equipments: Equipment[];
  notes?: string;
}

export interface ReservationDraft {
  carId?: string;
  pickUpLocationId?: string;
  dropOffLocationId?: string;
  pickUpDate?: string;
  dropOffDate?: string;
  services: string[];
  equipments: string[];
  notes?: string;
}
