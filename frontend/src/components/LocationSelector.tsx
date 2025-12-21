import type { CSSProperties, ChangeEvent } from 'react';
import { BranchLocation } from '../types/car';

interface LocationSelectorProps {
  label: string;
  value?: string;
  locations: BranchLocation[];
  onChange: (locationId: string) => void;
  required?: boolean;
}

const fieldStyle: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '0.25rem',
};

export default function LocationSelector({
  label,
  value,
  locations,
  onChange,
  required,
}: LocationSelectorProps) {
  const handleChange = (event: ChangeEvent<HTMLSelectElement>) => {
    onChange(event.target.value);
  };

  return (
    <div style={fieldStyle}>
      <label>{label}</label>
      <select value={value ?? ''} onChange={handleChange} required={required}>
        <option value="">Select branch</option>
        {locations.map((location) => (
          <option key={location.id} value={location.id}>
            {location.name}
          </option>
        ))}
      </select>
    </div>
  );
}
