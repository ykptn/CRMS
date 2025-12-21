import type { CSSProperties } from 'react';
import { ReservationModel } from '../types/reservation';
import { BranchLocation, CarModel } from '../types/car';
import { formatDate } from '../utils/date';

interface ReservationSummaryCardProps {
  reservation: ReservationModel;
  car?: CarModel;
  locations: BranchLocation[];
}

const cardStyle: CSSProperties = {
  border: '1px solid #d1d5db',
  borderRadius: '12px',
  padding: '1rem',
  backgroundColor: '#fff',
};

export default function ReservationSummaryCard({
  reservation,
  car,
  locations,
}: ReservationSummaryCardProps) {
  const pickUp = locations.find((location) => location.id === reservation.pickUpLocationId);
  const dropOff = locations.find((location) => location.id === reservation.dropOffLocationId);

  return (
    <section style={cardStyle}>
      <header style={{ marginBottom: '0.5rem' }}>
        <h3 style={{ margin: 0 }}>Reservation {reservation.reservationNumber}</h3>
        <p style={{ margin: 0, color: '#6b7280' }}>{reservation.status}</p>
      </header>
      {car && (
        <p style={{ margin: '0 0 0.5rem 0' }}>
          {car.brand} {car.model} · {car.transmission} · ₺{car.dailyPrice}/day
        </p>
      )}
      <p style={{ margin: '0 0 0.25rem 0' }}>
        Pick-up: {formatDate(reservation.pickUpDate)} – {pickUp?.name}
      </p>
      <p style={{ margin: '0 0 0.25rem 0' }}>
        Drop-off: {formatDate(reservation.dropOffDate)} – {dropOff?.name}
      </p>
      <p style={{ margin: '0 0 0.25rem 0' }}>
        Total: <strong>₺{reservation.totalCost.toFixed(2)}</strong>
      </p>
      {reservation.services.length > 0 && (
        <div>
          <p style={{ margin: '0.5rem 0 0.25rem 0' }}>Additional services:</p>
          <ul>
            {reservation.services.map((service) => (
              <li key={service.id}>
                {service.name} – ₺{service.price}
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
