import { useEffect, useState } from 'react';
import ServiceSelectionPanel from '../components/ServiceSelectionPanel';
import { serviceSelectionService } from '../services/serviceSelectionService';
import type { AdditionalService } from '../types/service';

export default function AdditionalServicePage() {
  const [services, setServices] = useState<AdditionalService[]>([]);
  const [selected, setSelected] = useState<string[]>([]);

  useEffect(() => {
    serviceSelectionService.listAvailable().then(setServices);
  }, []);

  const toggle = (serviceId: string) => {
    setSelected((prev) =>
      prev.includes(serviceId) ? prev.filter((id) => id !== serviceId) : [...prev, serviceId]
    );
  };

  const total = serviceSelectionService.calculateTotal(selected);

  return (
    <div>
      <h2>Optional equipment & services</h2>
      <p>Select add-ons that match your trip. They can be included during reservation checkout.</p>
      <ServiceSelectionPanel services={services} selectedIds={selected} onToggle={toggle} />
      <p style={{ marginTop: '1rem' }}>
        Estimated total: <strong>₺{total}</strong>
      </p>
    </div>
  );
}
