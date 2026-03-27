import { useEffect, useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { getPendingConnections, getSupportTickets } from '../services/admin';

const navItems = [
  { label: 'Dashboard', to: '/admin/dashboard' },
  { label: 'Customers', to: '/admin/customers' },
  { label: 'Connections', to: '/admin/connections' },
  { label: 'Packages', to: '/admin/packages' },
  { label: 'Billing', to: '/admin/billing' },
  { label: 'Support Tickets', to: '/admin/support' },
  { label: 'Reports', to: '/admin/reports' },
  { label: 'Settings', to: '/admin/settings' },
  { label: 'Logout', type: 'button' },
];

const titleMap = {
  '/admin/dashboard': 'Dashboard',
  '/admin/customers': 'Customers',
  '/admin/customers/new': 'Add Customer',
  '/admin/connections': 'Connections',
  '/admin/packages': 'Packages',
  '/admin/billing': 'Billing',
  '/admin/support': 'Support Tickets',
  '/admin/reports': 'Reports',
  '/admin/settings': 'Settings',
};

const AdminLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const title = titleMap[location.pathname] || 'Dashboard';
  const [notifications, setNotifications] = useState({ tickets: [], connections: [] });

  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      try {
        const [tickets, connections] = await Promise.all([
          getSupportTickets(),
          getPendingConnections(),
        ]);
        if (!isMounted) return;
        setNotifications({
          tickets: tickets || [],
          connections: connections || [],
        });
      } catch (err) {
        if (!isMounted) return;
        setNotifications({ tickets: [], connections: [] });
      }
    };
    load();
    return () => {
      isMounted = false;
    };
  }, []);

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
      roleLabel="Admin"
      onLogout={handleLogout}
      notifications={notifications}
    >
      <Outlet />
    </Layout>
  );
};

export default AdminLayout;
