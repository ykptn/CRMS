import { useEffect, useState } from 'react';
import { adminService } from '../services/adminService';
import type { AdditionalService } from '../types/service';

const emptyService: Omit<AdditionalService, 'id'> = {
  name: '',
  description: '',
  price: 0,
  category: 'Equipment',
};

export default function ServiceManagementPage() {
  const [services, setServices] = useState<AdditionalService[]>([]);
  const [form, setForm] = useState({ ...emptyService });

  const refresh = () => {
    adminService.listServices().then(setServices);
  };

  useEffect(() => {
    refresh();
  }, []);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    await adminService.saveService(form);
    setForm({ ...emptyService });
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
          placeholder="Description"
          value={form.description}
          onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))}
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
            <th align="left">Description</th>
            <th align="left">Actions</th>
          </tr>
        </thead>
        <tbody>
          {services.map((service) => (
            <tr key={service.id}>
              <td>{service.name}</td>
              <td>{service.category}</td>
              <td>₺{service.price}</td>
              <td>{service.description}</td>
              <td>
                <button type="button" onClick={() => adminService.deleteService(service.id).then(refresh)}>
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
