import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { registerUser } from '../services/auth';

const Register = () => {
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'customer',
    phone: '',
    address: '',
  });
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    if (token && role) {
      navigate(role === 'admin' ? '/admin/dashboard' : '/customer/dashboard', { replace: true });
    }
  }, [navigate]);

  const handleChange = (event) => {
    setForm((prev) => ({ ...prev, [event.target.name]: event.target.value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setStatus('Creating account...');
    try {
      const data = await registerUser(form);
      localStorage.setItem('token', data.token);
      localStorage.setItem('role', data.user.role);
      setStatus(`Account created for ${data.user.name}`);
      if (data.user.role === 'admin') {
        navigate('/admin/dashboard', { replace: true });
      } else {
        navigate('/customer/dashboard', { replace: true });
      }
    } catch (err) {
      setError('Unable to create account.');
      setStatus('');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 px-4">
      <div className="w-full max-w-sm rounded-xl bg-white p-8 shadow">
        <h2 className="text-2xl font-bold text-gray-900">Register</h2>
        <p className="mt-2 text-sm text-gray-500">
          Create a NetOps account to access the suite.
        </p>
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <label className="block text-sm text-gray-600">
            Full name
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              className="mt-2 w-full rounded-lg border border-gray-200 px-4 py-2 text-gray-900"
              required
            />
          </label>
          <label className="block text-sm text-gray-600">
            Email
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              className="mt-2 w-full rounded-lg border border-gray-200 px-4 py-2 text-gray-900"
              required
            />
          </label>
          <label className="block text-sm text-gray-600">
            Password
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              className="mt-2 w-full rounded-lg border border-gray-200 px-4 py-2 text-gray-900"
              required
            />
          </label>
          <label className="block text-sm text-gray-600">
            Phone
            <input
              type="text"
              name="phone"
              value={form.phone}
              onChange={handleChange}
              className="mt-2 w-full rounded-lg border border-gray-200 px-4 py-2 text-gray-900"
            />
          </label>
          <label className="block text-sm text-gray-600">
            Address
            <input
              type="text"
              name="address"
              value={form.address}
              onChange={handleChange}
              className="mt-2 w-full rounded-lg border border-gray-200 px-4 py-2 text-gray-900"
            />
          </label>
          <label className="block text-sm text-gray-600">
            Role
            <select
              name="role"
              value={form.role}
              onChange={handleChange}
              className="mt-2 w-full rounded-lg border border-gray-200 px-4 py-2 text-gray-900"
            >
              <option value="customer">Customer</option>
              <option value="admin">Admin</option>
            </select>
          </label>
          <button
            type="submit"
            className="w-full rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
          >
            Create account
          </button>
          {status && <p className="text-sm text-blue-600">{status}</p>}
          {error && <p className="text-sm text-red-500">{error}</p>}
        </form>
      </div>
    </div>
  );
};

export default Register;


