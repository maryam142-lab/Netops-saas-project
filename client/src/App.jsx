import { Routes, Route, Navigate } from 'react-router-dom';
import AppLayout from './layouts/AppLayout';
import AdminLayout from './layouts/AdminLayout';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminDashboard from './pages/admin/Dashboard';
import AdminCustomers from './pages/admin/Customers';
import AdminPackages from './pages/admin/Packages';
import AdminConnections from './pages/admin/Connections';
import AdminBilling from './pages/admin/Billing';
import AdminReports from './pages/admin/Reports';
import AdminSupport from './pages/admin/Support';
import AdminSettings from './pages/admin/Settings';
import AdminNewCustomer from './pages/admin/NewCustomer';
import CustomerLayout from './layouts/CustomerLayout';
import CustomerDashboard from './pages/customer/Dashboard';
import CustomerRequestConnection from './pages/customer/RequestConnection';
import CustomerConnections from './pages/customer/Connections';
import CustomerBills from './pages/customer/Bills';
import CustomerSupport from './pages/customer/Support';
import CustomerProfile from './pages/customer/Profile';
import { AdminRoute, CustomerRoute, RoleRedirect } from './components/ProtectedRoute';

const App = () => {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/" element={<RoleRedirect fallback={<Navigate to="/login" replace />} />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Route>
      <Route
        path="/admin"
        element={
          <AdminRoute>
            <AdminLayout />
          </AdminRoute>
        }
      >
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="customers" element={<AdminCustomers />} />
        <Route path="customers/new" element={<AdminNewCustomer />} />
        <Route path="packages" element={<AdminPackages />} />
        <Route path="connections" element={<AdminConnections />} />
        <Route path="billing" element={<AdminBilling />} />
        <Route path="reports" element={<AdminReports />} />
        <Route path="support" element={<AdminSupport />} />
        <Route path="settings" element={<AdminSettings />} />
      </Route>
      <Route
        path="/customer"
        element={
          <CustomerRoute>
            <CustomerLayout />
          </CustomerRoute>
        }
      >
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<CustomerDashboard />} />
        <Route path="request-connection" element={<CustomerRequestConnection />} />
        <Route path="connections" element={<CustomerConnections />} />
        <Route path="bills" element={<CustomerBills />} />
        <Route path="support" element={<CustomerSupport />} />
        <Route path="profile" element={<CustomerProfile />} />
      </Route>
    </Routes>
  );
};

export default App;
