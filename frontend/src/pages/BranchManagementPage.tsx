import { useEffect, useState } from 'react';
import { adminService } from '../services/adminService';
import type { BranchLocation } from '../types/car';

export default function BranchManagementPage() {
  const [branches, setBranches] = useState<BranchLocation[]>([]);
  const [form, setForm] = useState({ code: '', name: '', address: '', phone: '' });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    refresh();
  }, []);

  const refresh = () => {
    adminService.listBranches().then(setBranches);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      await adminService.saveBranch({ ...form, id: editingId ?? undefined });
      setForm({ code: '', name: '', address: '', phone: '' });
      setEditingId(null);
      setError(null);
      refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to save branch.');
    }
  };

  const startEdit = (branch: BranchLocation) => {
    setEditingId(branch.id);
    setForm({
      code: branch.code ?? '',
      name: branch.name,
      address: branch.address,
      phone: branch.phone ?? '',
    });
    setError(null);
  };

  return (
    <div>
      <h2>Company branches</h2>
      {error && <p style={{ color: '#dc2626' }}>{error}</p>}
      <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '0.5rem', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
        <input
          placeholder="Code"
          value={form.code}
          onChange={(event) => setForm((prev) => ({ ...prev, code: event.target.value }))}
          required
        />
        <input
          placeholder="Name"
          value={form.name}
          onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
          required
        />
        <input
          placeholder="Address"
          value={form.address}
          onChange={(event) => setForm((prev) => ({ ...prev, address: event.target.value }))}
          required
        />
        <input
          placeholder="Phone"
          value={form.phone}
          onChange={(event) => setForm((prev) => ({ ...prev, phone: event.target.value }))}
          pattern="^\\+?[0-9()\\-\\s]{7,20}$"
          required
        />
        <button type="submit">{editingId ? 'Update branch' : 'Add branch'}</button>
      </form>
      {branches.length === 0 ? (
        <p>No branches defined.</p>
      ) : (
        <table width="100%" cellPadding={12}>
          <thead>
            <tr>
              <th align="left">Branch</th>
              <th align="left">City</th>
              <th align="left">Address</th>
              <th align="left">Phone</th>
              <th align="left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {branches.map((branch) => (
              <tr key={branch.id}>
                <td>{branch.name}</td>
                <td>{branch.city}</td>
                <td>{branch.address}</td>
                <td>{branch.phone}</td>
                <td>
                  <button type="button" onClick={() => startEdit(branch)}>
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      adminService.deleteBranch(branch.id).then(refresh).catch((err) => {
                        setError(err instanceof Error ? err.message : 'Unable to delete branch.');
                      })
                    }
                    style={{ marginLeft: '0.5rem' }}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
