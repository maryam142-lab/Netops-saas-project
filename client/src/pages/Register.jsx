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
      if (data.user?.tenantId) {
        localStorage.setItem('tenantId', data.user.tenantId);
      }
      setStatus(`Account created for ${data.user.name}`);
      if (data.user.role === 'admin') {
        navigate('/admin/dashboard', { replace: true });
      } else {
        navigate('/customer/dashboard', { replace: true });
      }
    } catch (err) {
      setError(err?.response?.data?.message || 'Unable to create account.');
      setStatus('');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12">
      <div className="grid w-full max-w-5xl gap-8 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="surface-card p-8">
          <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
            Create account
          </h2>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            Start managing operations with a new NetOps workspace.
          </p>
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <label className="block">
              Full name
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                autoComplete="name"
                required
              />
            </label>
            <label className="block">
              Email
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                autoComplete="email"
                required
              />
            </label>
            <label className="block">
              Password
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                autoComplete="new-password"
                required
              />
            </label>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                Phone
                <input
                  type="text"
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  autoComplete="tel"
                />
              </label>
              <label className="block">
                Role
                <select name="role" value={form.role} onChange={handleChange}>
                  <option value="customer">Customer</option>
                  <option value="admin">Admin</option>
                </select>
              </label>
            </div>
            <label className="block">
              Address
              <input
                type="text"
                name="address"
                value={form.address}
                onChange={handleChange}
                autoComplete="street-address"
              />
            </label>
            <button
              type="submit"
              className="w-full rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-brand-500/30 transition hover:bg-brand-700"
            >
              Create account
            </button>
            {status && <p className="text-sm text-brand-600">{status}</p>}
            {error && <p className="text-sm text-red-500">{error}</p>}
          </form>
        </div>

        <div className="surface-card flex flex-col justify-between p-8">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-slate-400">
              Customer Success
            </p>
            <h1 className="mt-4 text-3xl font-semibold text-slate-900 dark:text-slate-100">
              Launch your service hub in minutes.
            </h1>
            <p className="mt-3 text-base text-slate-600 dark:text-slate-300">
              Invite tenants, manage billing, and keep support in sync with a dashboard built
              for network operators.
            </p>
          </div>
          <div className="mt-10 rounded-2xl border border-slate-200/70 bg-gradient-to-br from-brand-600/10 via-white/60 to-white/80 p-6 text-slate-700 dark:border-slate-800/70 dark:from-brand-500/20 dark:via-slate-900/60 dark:to-slate-900/80 dark:text-slate-200">
            <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
              Included
            </p>
            <ul className="mt-3 space-y-2 text-sm">
              <li>Automated billing and reminders</li>
              <li>Connection request workflow</li>
              <li>Live support ticket routing</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;


