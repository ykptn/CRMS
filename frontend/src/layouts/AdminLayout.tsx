import type { CSSProperties } from 'react';
import { Outlet } from 'react-router-dom';
import NavigationBar from '../components/NavigationBar';
import AdminSidebar from '../components/AdminSidebar';

const layoutStyle: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: '240px 1fr',
  gap: '1.5rem',
  minHeight: 'calc(100vh - 80px)',
};

export default function AdminLayout() {
  return (
    <div>
      <NavigationBar />
      <div style={layoutStyle}>
        <AdminSidebar />
        <main>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
