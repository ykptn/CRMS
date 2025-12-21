import { Link } from 'react-router-dom';
import type { CSSProperties } from 'react';
import { useAuth } from '../hooks/useAuth';

const navStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '1rem 0',
  borderBottom: '1px solid #e5e7eb',
  marginBottom: '1rem',
};

const menuStyle: CSSProperties = {
  display: 'flex',
  gap: '1rem',
  alignItems: 'center',
};

export default function NavigationBar() {
  const { user, logout } = useAuth();

  const memberLinks = [
    { to: '/', label: 'Browse Cars' },
    { to: '/reservations/new', label: 'New Reservation' },
    { to: '/reservations/history', label: 'History' },
    { to: '/services', label: 'Extras' },
    { to: '/member/dashboard', label: 'Dashboard' },
  ];

  const adminLinks = [
    { to: '/admin', label: 'Admin Dashboard' },
    { to: '/admin/cars', label: 'Cars' },
    { to: '/admin/reservations', label: 'Reservations' },
  ];

  const links = user?.role === 'admin' ? adminLinks : memberLinks;

  return (
    <nav style={navStyle}>
      <Link to="/" style={{ fontSize: '1.25rem', fontWeight: 600 }}>
        CRMS
      </Link>
      <div style={menuStyle}>
        {links.map((link) => (
          <Link key={link.to} to={link.to}>
            {link.label}
          </Link>
        ))}
      </div>
      <div style={menuStyle}>
        {user ? (
          <>
            <span style={{ color: '#6b7280' }}>{user.fullName}</span>
            <button type="button" onClick={logout}>
              Log out
            </button>
          </>
        ) : (
          <>
            <Link to="/login">Login</Link>
            <Link to="/register">Register</Link>
          </>
        )}
      </div>
    </nav>
  );
}
