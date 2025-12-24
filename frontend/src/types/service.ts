export type ServiceCategory = 'Equipment' | 'Protection' | 'Convenience';

export interface AdditionalService {
  id: string;
  name: string;
  price: number;
  category: ServiceCategory;
}

export interface ServiceSelection {
  serviceIds: string[];
  total: number;
}
