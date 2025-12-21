import { NavLink } from 'react-router-dom';
import type { CSSProperties } from 'react';

const sidebarStyle: CSSProperties = {
  backgroundColor: '#111827',
  color: '#f9fafb',
  padding: '1.5rem 1rem',
  minWidth: '220px',
  borderRadius: '12px',
  height: '100%',
};

const linkStyle: CSSProperties = {
  display: 'block',
  padding: '0.6rem 0.8rem',
  borderRadius: '8px',
  color: '#e5e7eb',
  textDecoration: 'none',
  marginBottom: '0.4rem',
  fontSize: '0.95rem',
};

const activeLinkStyle: CSSProperties = {
  ...linkStyle,
  backgroundColor: '#2563eb',
  color: '#fff',
};

export default function AdminSidebar() {
  const links = [
    { to: '/admin', label: 'Dashboard' },
    { to: '/admin/cars', label: 'Cars' },
    { to: '/admin/reservations', label: 'Reservations' },
    { to: '/admin/members', label: 'Members' },
    { to: '/admin/branches', label: 'Branches' },
    { to: '/admin/services', label: 'Services' },
    { to: '/admin/reports', label: 'Reports' },
  ];

  return (
    <aside style={sidebarStyle}>
      <h2 style={{ fontSize: '1.2rem', fontWeight: 600, marginBottom: '1rem' }}>Admin Panel</h2>
      {links.map((link) => (
        <NavLink
          key={link.to}
          to={link.to}
          style={({ isActive }) => (isActive ? activeLinkStyle : linkStyle)}
        >
          {link.label}
        </NavLink>
      ))}
    </aside>
  );
}
