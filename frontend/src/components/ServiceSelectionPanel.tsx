import type { CSSProperties } from 'react';
import { AdditionalService } from '../types/service';

interface ServiceSelectionPanelProps {
  services: AdditionalService[];
  selectedIds: string[];
  onToggle: (serviceId: string) => void;
  title?: string;
  emptyMessage?: string;
}

const gridStyle: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
  gap: '1rem',
};

export default function ServiceSelectionPanel({
  services,
  selectedIds,
  onToggle,
  title = 'Additional services',
  emptyMessage = 'No additional services configured.',
}: ServiceSelectionPanelProps) {
  if (services.length === 0) {
    return <p>{emptyMessage}</p>;
  }

  return (
    <section>
      <h3>{title}</h3>
      <div style={gridStyle}>
        {services.map((service) => {
          const selected = selectedIds.includes(service.id);
          return (
            <article
              key={service.id}
              style={{
                border: `1px solid ${selected ? '#2563eb' : '#d1d5db'}`,
                borderRadius: '12px',
                padding: '0.75rem',
              }}
            >
              <header style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <strong>{service.name}</strong>
                <span>₺{service.price}</span>
              </header>
              <button type="button" onClick={() => onToggle(service.id)}>
                {selected ? 'Remove' : 'Add'}
              </button>
            </article>
          );
        })}
      </div>
    </section>
  );
}
