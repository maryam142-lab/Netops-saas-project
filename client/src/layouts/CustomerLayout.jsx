import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';

const navItems = [
  { label: 'Dashboard', to: '/customer/dashboard' },
  { label: 'Request Connection', to: '/customer/request-connection' },
  { label: 'My Connection', to: '/customer/connections' },
  { label: 'My Bills', to: '/customer/bills' },
  { label: 'Support', to: '/customer/support' },
  { label: 'Profile', to: '/customer/profile' },
  { label: 'Logout', type: 'button' },
];

const titleMap = {
  '/customer/dashboard': 'Dashboard',
  '/customer/request-connection': 'Request Connection',
  '/customer/connections': 'My Connection',
  '/customer/bills': 'My Bills',
  '/customer/support': 'Support',
  '/customer/profile': 'Profile',
};

const CustomerLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const title = titleMap[location.pathname] || 'Dashboard';

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    navigate('/login', { replace: true });
  };

  return (
    <Layout
      navItems={navItems}
      title={title}
      brand="NetOps"
      roleLabel="Customer"
      onLogout={handleLogout}
      notifications={{ tickets: [], connections: [] }}
    >
      <Outlet />
    </Layout>
  );
};

export default CustomerLayout;
