import { useCallback, useEffect, useState } from 'react';
import { carCatalogService } from '../services/carCatalogService';
import { BranchLocation, CarFilter, CarModel } from '../types/car';

interface CarSearchState {
  cars: CarModel[];
  locations: BranchLocation[];
  filters: CarFilter;
  loading: boolean;
  error: string | null;
}

const defaultFilters: CarFilter = {};

export function useCarSearch(initialFilters: CarFilter = {}): {
  state: CarSearchState;
  updateFilters: (patch: Partial<CarFilter>) => void;
  resetFilters: () => void;
  search: () => Promise<void>;
} {
  const [state, setState] = useState<CarSearchState>({
    cars: [],
    locations: [],
    filters: { ...defaultFilters, ...initialFilters },
    loading: true,
    error: null,
  });

  const loadData = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true }));
    try {
      const [cars, locations] = await Promise.all([
        carCatalogService.getCars(state.filters),
        carCatalogService.listLocations(),
      ]);
      setState((prev) => ({
        ...prev,
        cars,
        locations,
        loading: false,
        error: null,
      }));
    } catch (err) {
      console.error(err);
      setState((prev) => ({
        ...prev,
        loading: false,
        error: 'Unable to load cars at the moment.',
      }));
    }
  }, [state.filters]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const updateFilters = (patch: Partial<CarFilter>) => {
    setState((prev) => ({
      ...prev,
      filters: {
        ...prev.filters,
        ...patch,
      },
    }));
  };

  const resetFilters = () => {
    setState((prev) => ({
      ...prev,
      filters: { ...defaultFilters },
    }));
  };

  return {
    state,
    updateFilters,
    resetFilters,
    search: loadData,
  };
}
