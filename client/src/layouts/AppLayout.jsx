import { NavLink, Outlet } from 'react-router-dom';
import ThemeToggle from '../components/ThemeToggle';

const navLinkClass = ({ isActive }) =>
  `text-sm font-medium transition ${
    isActive
      ? 'text-brand-700 dark:text-brand-200'
      : 'text-slate-500 hover:text-slate-700 dark:text-slate-300 dark:hover:text-white'
  }`;

const AppLayout = () => {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <header className="border-b border-slate-200/70 bg-white/80 backdrop-blur dark:border-slate-800/80 dark:bg-slate-950/70">
        <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-4 px-6 py-4">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
              NetOps
            </p>
            <h1 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              Operations Suite
            </h1>
          </div>
          <nav className="flex flex-wrap items-center gap-4">
            <NavLink to="/login" className={navLinkClass}>
              Login
            </NavLink>
            <NavLink to="/register" className={navLinkClass}>
              Register
            </NavLink>
            <NavLink to="/admin/dashboard" className={navLinkClass}>
              Admin
            </NavLink>
            <NavLink to="/customer/dashboard" className={navLinkClass}>
              Customer
            </NavLink>
            <ThemeToggle />
          </nav>
        </div>
      </header>
      <main className="mx-auto w-full max-w-6xl px-6 py-10">
        <Outlet />
      </main>
      <footer className="border-t border-slate-200/70 bg-white/80 backdrop-blur dark:border-slate-800/80 dark:bg-slate-950/70">
        <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-3 px-6 py-4 text-xs text-slate-400">
          <span>NetOps SaaS starter</span>
          <span>Ship reliable operations</span>
        </div>
      </footer>
    </div>
  );
};

export default AppLayout;
