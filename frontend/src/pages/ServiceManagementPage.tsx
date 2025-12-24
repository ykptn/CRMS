import { useEffect, useState } from 'react';
import { adminService } from '../services/adminService';
import type { AdditionalService } from '../types/service';
import type { Equipment } from '../types/equipment';

const emptyService: Omit<AdditionalService, 'id'> = {
  name: '',
  price: 0,
  category: 'Equipment',
};

const emptyEquipment: Omit<Equipment, 'id'> = {
  name: '',
  price: 0,
};

export default function ServiceManagementPage() {
  const [services, setServices] = useState<AdditionalService[]>([]);
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [form, setForm] = useState({ ...emptyService });
  const [equipmentForm, setEquipmentForm] = useState({ ...emptyEquipment });
  const [editingServiceId, setEditingServiceId] = useState<string | null>(null);
  const [editingEquipmentId, setEditingEquipmentId] = useState<string | null>(null);

  const refresh = () => {
    adminService.listServices().then(setServices);
    adminService.listEquipment().then(setEquipment);
  };

  useEffect(() => {
    refresh();
  }, []);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    await adminService.saveService({ ...form, id: editingServiceId ?? undefined });
    setForm({ ...emptyService });
    setEditingServiceId(null);
    refresh();
  };

  const handleEquipmentSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    await adminService.saveEquipment({ ...equipmentForm, id: editingEquipmentId ?? undefined });
    setEquipmentForm({ ...emptyEquipment });
    setEditingEquipmentId(null);
    refresh();
  };

  return (
    <div>
      <h2>Additional services</h2>
      <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
        <input
          placeholder="Name"
          value={form.name}
          onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
          required
        />
        <input
          type="number"
          placeholder="Price"
          value={form.price}
          onChange={(event) => setForm((prev) => ({ ...prev, price: Number(event.target.value) }))}
          required
        />
        <select
          value={form.category}
          onChange={(event) =>
            setForm((prev) => ({ ...prev, category: event.target.value as AdditionalService['category'] }))
          }
        >
          <option value="Equipment">Equipment</option>
          <option value="Protection">Protection</option>
          <option value="Convenience">Convenience</option>
        </select>
        <button type="submit">Save service</button>
      </form>
      <table width="100%" cellPadding={12} style={{ marginTop: '1.5rem' }}>
        <thead>
          <tr>
            <th align="left">Name</th>
            <th align="left">Category</th>
            <th align="left">Price</th>
            <th align="left">Actions</th>
          </tr>
        </thead>
        <tbody>
          {services.map((service) => (
            <tr key={service.id}>
              <td>{service.name}</td>
              <td>{service.category}</td>
              <td>₺{service.price}</td>
              <td>
                <button
                  type="button"
                  onClick={() => {
                    setEditingServiceId(service.id);
                    setForm({
                      name: service.name,
                      price: service.price,
                      category: service.category,
                    });
                  }}
                >
                  Edit
                </button>
                <button type="button" onClick={() => adminService.deleteService(service.id).then(refresh)}>
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <h2 style={{ marginTop: '2rem' }}>Equipment</h2>
      <form onSubmit={handleEquipmentSubmit} style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
        <input
          placeholder="Name"
          value={equipmentForm.name}
          onChange={(event) => setEquipmentForm((prev) => ({ ...prev, name: event.target.value }))}
          required
        />
        <input
          type="number"
          placeholder="Daily price"
          value={equipmentForm.price}
          onChange={(event) => setEquipmentForm((prev) => ({ ...prev, price: Number(event.target.value) }))}
          required
        />
        <button type="submit">Save equipment</button>
      </form>
      <table width="100%" cellPadding={12} style={{ marginTop: '1.5rem' }}>
        <thead>
          <tr>
            <th align="left">Name</th>
            <th align="left">Price</th>
            <th align="left">Actions</th>
          </tr>
        </thead>
        <tbody>
          {equipment.map((item) => (
            <tr key={item.id}>
              <td>{item.name}</td>
              <td>₺{item.price}</td>
              <td>
                <button
                  type="button"
                  onClick={() => {
                    setEditingEquipmentId(item.id);
                    setEquipmentForm({ name: item.name, price: item.price });
                  }}
                >
                  Edit
                </button>
                <button type="button" onClick={() => adminService.deleteEquipment(item.id).then(refresh)}>
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
