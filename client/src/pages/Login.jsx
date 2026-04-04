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
    <div className="flex min-h-screen items-center justify-center px-4 py-12">
      <div className="grid w-full max-w-5xl gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="surface-card flex flex-col justify-between p-8">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-slate-400">
              NetOps Platform
            </p>
            <h1 className="mt-4 text-3xl font-semibold text-slate-900 dark:text-slate-100">
              Operational clarity for every tenant.
            </h1>
            <p className="mt-3 text-base text-slate-600 dark:text-slate-300">
              Monitor customers, packages, billing, and support in one crisp workspace. Stay
              ahead with live alerts and streamlined workflows.
            </p>
          </div>
          <div className="mt-10 grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-slate-200/70 bg-white/80 p-4 text-sm text-slate-600 dark:border-slate-800/70 dark:bg-slate-900/60 dark:text-slate-300">
              <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Realtime</p>
              <p className="mt-2 text-lg font-semibold text-slate-900 dark:text-slate-100">
                Live health &amp; billing
              </p>
            </div>
            <div className="rounded-xl border border-slate-200/70 bg-white/80 p-4 text-sm text-slate-600 dark:border-slate-800/70 dark:bg-slate-900/60 dark:text-slate-300">
              <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Secure</p>
              <p className="mt-2 text-lg font-semibold text-slate-900 dark:text-slate-100">
                Tenant-aware access
              </p>
            </div>
          </div>
        </div>

        <div className="surface-card p-8">
          <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
            Login
          </h2>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            Access your NetOps workspace.
          </p>
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <label className="block">
              Email
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                autoComplete="username"
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
                autoComplete="current-password"
                required
              />
            </label>
            <button
              type="submit"
              className="w-full rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-brand-500/30 transition hover:bg-brand-700"
            >
              Sign in
            </button>
            {status && <p className="text-sm text-brand-600">{status}</p>}
            {error && <p className="text-sm text-red-500">{error}</p>}
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;


