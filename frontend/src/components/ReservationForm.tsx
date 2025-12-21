import type { ChangeEvent, CSSProperties, FormEvent } from 'react';
import { BranchLocation } from '../types/car';
import { ReservationDraft } from '../types/reservation';
import LocationSelector from './LocationSelector';

interface ReservationFormProps {
  draft: ReservationDraft;
  locations: BranchLocation[];
  onUpdate: (patch: Partial<ReservationDraft>) => void;
  onSubmit: () => void;
  submitting: boolean;
}

const formStyle: CSSProperties = {
  display: 'grid',
  gap: '1rem',
  backgroundColor: '#f9fafb',
  padding: '1rem',
  borderRadius: '12px',
};

export default function ReservationForm({
  draft,
  locations,
  onUpdate,
  onSubmit,
  submitting,
}: ReservationFormProps) {
  const handleDateChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    onUpdate({ [name]: value });
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    onSubmit();
  };

  return (
    <form onSubmit={handleSubmit} style={formStyle}>
      <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
        <LocationSelector
          label="Pick-up Location"
          locations={locations}
          value={draft.pickUpLocationId}
          onChange={(value) => onUpdate({ pickUpLocationId: value })}
          required
        />
        <LocationSelector
          label="Drop-off Location"
          locations={locations}
          value={draft.dropOffLocationId}
          onChange={(value) => onUpdate({ dropOffLocationId: value })}
          required
        />
        <div>
          <label>Pick-up Date</label>
          <input
            type="date"
            name="pickUpDate"
            value={draft.pickUpDate ?? ''}
            onChange={handleDateChange}
            required
          />
        </div>
        <div>
          <label>Drop-off Date</label>
          <input
            type="date"
            name="dropOffDate"
            value={draft.dropOffDate ?? ''}
            onChange={handleDateChange}
            required
          />
        </div>
      </div>
      <div>
        <label>Reservation Notes</label>
        <textarea
          name="notes"
          rows={3}
          value={draft.notes ?? ''}
          onChange={(event) => onUpdate({ notes: event.target.value })}
        />
      </div>
      <button type="submit" disabled={submitting}>
        {submitting ? 'Processing...' : 'Confirm Reservation'}
      </button>
    </form>
  );
}
