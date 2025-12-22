import { useEffect, useState } from 'react';
import { adminService } from '../services/adminService';
import type { BranchLocation } from '../types/car';

export default function BranchManagementPage() {
  const [branches, setBranches] = useState<BranchLocation[]>([]);

  useEffect(() => {
    adminService.listBranches().then(setBranches);
  }, []);

  return (
    <div>
      <h2>Company branches</h2>
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
            </tr>
          </thead>
          <tbody>
            {branches.map((branch) => (
              <tr key={branch.id}>
                <td>{branch.name}</td>
                <td>{branch.city}</td>
                <td>{branch.address}</td>
                <td>{branch.phone}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
