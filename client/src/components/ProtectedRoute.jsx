import { Navigate } from 'react-router-dom';

const roleDashboard = (role) => {
  if (role === 'admin') return '/admin/dashboard';
  if (role === 'customer') return '/customer/dashboard';
  return '/';
};

export const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

export const AdminRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  if (role !== 'admin') {
    return <Navigate to={roleDashboard(role)} replace />;
  }
  return children;
};

export const CustomerRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  if (role !== 'customer') {
    return <Navigate to={roleDashboard(role)} replace />;
  }
  return children;
};

export const RoleRedirect = ({ fallback }) => {
  const role = localStorage.getItem('role');
  if (role === 'admin' || role === 'customer') {
    return <Navigate to={roleDashboard(role)} replace />;
  }
  return fallback || null;
};
