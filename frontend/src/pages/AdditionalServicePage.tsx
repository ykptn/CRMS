import { useEffect, useState } from 'react';
import ServiceSelectionPanel from '../components/ServiceSelectionPanel';
import { serviceSelectionService } from '../services/serviceSelectionService';
import { equipmentSelectionService } from '../services/equipmentSelectionService';
import type { AdditionalService } from '../types/service';
import type { Equipment } from '../types/equipment';

export default function AdditionalServicePage() {
  const [services, setServices] = useState<AdditionalService[]>([]);
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [selectedEquipment, setSelectedEquipment] = useState<string[]>([]);

  useEffect(() => {
    serviceSelectionService.listAvailable().then(setServices);
    equipmentSelectionService.listAvailable().then(setEquipment);
  }, []);

  const toggle = (serviceId: string) => {
    setSelected((prev) =>
      prev.includes(serviceId) ? prev.filter((id) => id !== serviceId) : [...prev, serviceId]
    );
  };

  const total = serviceSelectionService.calculateTotal(selected);
  const equipmentTotal = equipmentSelectionService.calculateTotal(selectedEquipment);

  return (
    <div>
      <h2>Optional equipment & services</h2>
      <p>Select add-ons that match your trip. They can be included during reservation checkout.</p>
      <ServiceSelectionPanel services={services} selectedIds={selected} onToggle={toggle} />
      <ServiceSelectionPanel
        services={equipment.map((item) => ({
          id: item.id,
          name: item.name,
          price: item.price,
          category: 'Equipment',
        }))}
        selectedIds={selectedEquipment}
        onToggle={(id) =>
          setSelectedEquipment((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]))
        }
        title="Optional equipment"
        emptyMessage="No equipment configured."
      />
      <p style={{ marginTop: '1rem' }}>
        Estimated total: <strong>₺{total + equipmentTotal}</strong>
      </p>
    </div>
  );
}
