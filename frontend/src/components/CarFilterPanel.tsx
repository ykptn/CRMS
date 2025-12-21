import type { ChangeEvent, CSSProperties } from 'react';
import { BranchLocation, CarFilter } from '../types/car';

interface FilterPanelProps {
  filters: CarFilter;
  locations: BranchLocation[];
  onChange: (patch: Partial<CarFilter>) => void;
  onReset: () => void;
  onSearch: () => void;
}

const panelStyle: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
  gap: '1rem',
  backgroundColor: '#f3f4f6',
  padding: '1rem',
  borderRadius: '12px',
  marginBottom: '1rem',
};

export default function CarFilterPanel({
  filters,
  locations,
  onChange,
  onReset,
  onSearch,
}: FilterPanelProps) {
  const handleInput = (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = event.target;
    const numericFields: Array<keyof CarFilter> = ['minPrice', 'maxPrice', 'seats'];
    if (numericFields.includes(name as keyof CarFilter)) {
      onChange({ [name]: value ? Number(value) : undefined });
    } else {
      onChange({ [name]: value || undefined });
    }
  };

  return (
    <section style={panelStyle}>
      <div>
        <label>Search</label>
        <input
          type="text"
          name="searchText"
          value={filters.searchText ?? ''}
          onChange={handleInput}
          placeholder="Brand, model, or feature"
        />
      </div>
      <div>
        <label>Location</label>
        <select
          name="locationId"
          value={filters.locationId ?? ''}
          onChange={handleInput}
        >
          <option value="">Any branch</option>
          {locations.map((location) => (
            <option key={location.id} value={location.id}>
              {location.city}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label>Pick-up Date</label>
        <input
          type="date"
          name="pickUpDate"
          value={filters.pickUpDate ?? ''}
          onChange={handleInput}
        />
      </div>
      <div>
        <label>Drop-off Date</label>
        <input
          type="date"
          name="dropOffDate"
          value={filters.dropOffDate ?? ''}
          onChange={handleInput}
        />
      </div>
      <div>
        <label>Category</label>
        <select
          name="category"
          value={filters.category ?? ''}
          onChange={handleInput}
        >
          <option value="">All</option>
          <option value="Sedan">Sedan</option>
          <option value="SUV">SUV</option>
          <option value="Hatchback">Hatchback</option>
          <option value="Truck">Truck</option>
          <option value="Van">Van</option>
        </select>
      </div>
      <div>
        <label>Transmission</label>
        <select
          name="transmission"
          value={filters.transmission ?? ''}
          onChange={handleInput}
        >
          <option value="">Any</option>
          <option value="Automatic">Automatic</option>
          <option value="Manual">Manual</option>
        </select>
      </div>
      <div>
        <label>Min Price</label>
        <input
          type="number"
          name="minPrice"
          value={filters.minPrice ?? ''}
          onChange={handleInput}
        />
      </div>
      <div>
        <label>Max Price</label>
        <input
          type="number"
          name="maxPrice"
          value={filters.maxPrice ?? ''}
          onChange={handleInput}
        />
      </div>
      <div>
        <label>Seats</label>
        <input
          type="number"
          name="seats"
          value={filters.seats ?? ''}
          onChange={handleInput}
          min={2}
          max={9}
        />
      </div>
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: '0.5rem' }}>
        <button type="button" onClick={onSearch}>
          Apply
        </button>
        <button type="button" onClick={onReset}>
          Reset
        </button>
      </div>
    </section>
  );
}
