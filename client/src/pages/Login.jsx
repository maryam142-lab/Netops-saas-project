import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginUser } from '../services/auth';

const Login = () => {
  const [form, setForm] = useState({ email: '', password: '' });
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
    setStatus('Signing in...');
    try {
      const data = await loginUser(form);
      localStorage.setItem('token', data.token);
      localStorage.setItem('role', data.user.role);
      if (data.user?.tenantId) {
        localStorage.setItem('tenantId', data.user.tenantId);
      }
      setStatus(`Welcome back, ${data.user.name}`);
      if (data.user.role === 'admin') {
        navigate('/admin/dashboard', { replace: true });
      } else {
        navigate('/customer/dashboard', { replace: true });
      }
    } catch (err) {
      setError(err?.response?.data?.message || 'Unable to sign in with those credentials.');
      setStatus('');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 px-4">
      <div className="w-full max-w-sm rounded-xl bg-white p-8 shadow">
        <h2 className="text-2xl font-bold text-gray-900">Login</h2>
        <p className="mt-2 text-sm text-gray-500">
          Access your NetOps workspace.
        </p>
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <label className="block text-sm text-gray-600">
            Email
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              className="mt-2 w-full rounded-lg border border-gray-200 px-4 py-2 text-gray-900"
              autoComplete="username"
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
              autoComplete="current-password"
              required
            />
          </label>
          <button
            type="submit"
            className="w-full rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
          >
            Sign in
          </button>
          {status && <p className="text-sm text-blue-600">{status}</p>}
          {error && <p className="text-sm text-red-500">{error}</p>}
        </form>
      </div>
    </div>
  );
};

export default Login;


