import { Outlet } from 'react-router-dom';
import NavigationBar from '../components/NavigationBar';

export default function MemberLayout() {
  return (
    <div>
      <NavigationBar />
      <main>
        <Outlet />
      </main>
    </div>
  );
}
