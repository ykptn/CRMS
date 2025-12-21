import type { CSSProperties } from 'react';
import { CarModel } from '../types/car';

interface CarListProps {
  cars: CarModel[];
  onSelect?: (car: CarModel) => void;
  selectedCarId?: string;
  emptyMessage?: string;
}

const gridStyle: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
  gap: '1rem',
};

const cardStyle: CSSProperties = {
  border: '1px solid #e5e7eb',
  borderRadius: '12px',
  padding: '1rem',
  display: 'flex',
  flexDirection: 'column',
  gap: '0.5rem',
  backgroundColor: '#fff',
};

export default function CarList({
  cars,
  onSelect,
  selectedCarId,
  emptyMessage = 'No cars match the selected filters.',
}: CarListProps) {
  if (cars.length === 0) {
    return <p>{emptyMessage}</p>;
  }

  return (
    <section style={gridStyle}>
      {cars.map((car) => (
        <article
          key={car.id}
          style={{
            ...cardStyle,
            borderColor: selectedCarId === car.id ? '#2563eb' : '#e5e7eb',
          }}
        >
          <header style={{ display: 'flex', justifyContent: 'space-between' }}>
            <h3 style={{ margin: 0 }}>
              {car.brand} {car.model}
            </h3>
            <span style={{ fontWeight: 600 }}>₺{car.dailyPrice}/day</span>
          </header>
          <p style={{ margin: 0, color: '#6b7280' }}>
            {car.category} · {car.transmission} · {car.seats} seats
          </p>
          <p style={{ margin: 0, fontSize: '0.9rem', color: '#374151' }}>
            Features: {car.features.join(', ')}
          </p>
          <footer style={{ marginTop: 'auto' }}>
            <button type="button" onClick={() => onSelect?.(car)}>
              {selectedCarId === car.id ? 'Selected' : 'Select'}
            </button>
          </footer>
        </article>
      ))}
    </section>
  );
}
