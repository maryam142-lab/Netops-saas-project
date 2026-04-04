import {
  ArrowRightOnRectangleIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  CreditCardIcon,
  HomeIcon,
  LifebuoyIcon,
  Squares2X2Icon,
  UsersIcon,
  WifiIcon,
} from '@heroicons/react/24/outline';
import { NavLink } from 'react-router-dom';

const iconMap = {
  Dashboard: HomeIcon,
  Customers: UsersIcon,
  Connections: WifiIcon,
  Packages: Squares2X2Icon,
  Billing: CreditCardIcon,
  'Support Tickets': LifebuoyIcon,
  Reports: ChartBarIcon,
  Settings: Cog6ToothIcon,
  Logout: ArrowRightOnRectangleIcon,
  'My Connection': WifiIcon,
  'My Bills': CreditCardIcon,
  Support: LifebuoyIcon,
  Profile: Cog6ToothIcon,
};

const Sidebar = ({ navItems, brand, roleLabel, onLogout, open, onClose }) => {
  return (
    <>
      <div
        className={`fixed inset-0 z-30 bg-black/40 transition-opacity lg:hidden ${
          open ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
        onClick={onClose}
        role="presentation"
      />
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-72 -translate-x-full transform border-r border-white/10 bg-slate-950/95 p-6 text-white shadow-2xl shadow-slate-950/40 backdrop-blur transition-transform lg:static lg:translate-x-0 overflow-y-auto ${
          open ? 'translate-x-0' : ''
        }`}
      >
        <div className="mb-8 rounded-2xl border border-white/10 bg-white/5 p-4">
          <p className="text-xs uppercase tracking-[0.35em] text-slate-400">Workspace</p>
          <h1 className="mt-2 text-2xl font-semibold text-white">{brand}</h1>
          {roleLabel ? (
            <p className="mt-2 text-xs uppercase tracking-[0.3em] text-slate-500">
              {roleLabel}
            </p>
          ) : null}
        </div>
        <nav className="space-y-1.5">
          {navItems.map((item) => {
            const Icon = iconMap[item.label] || HomeIcon;
            if (item.type === 'button') {
              return (
                <button
                  key={item.label}
                  type="button"
                  onClick={item.onClick || onLogout}
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-200 transition hover:bg-white/10 hover:text-white"
                >
                  <Icon className="h-5 w-5" />
                  {item.label}
                </button>
              );
            }
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                    isActive
                      ? 'bg-white/15 text-white shadow-sm shadow-slate-950/30'
                      : 'text-slate-200 hover:bg-white/10 hover:text-white'
                  }`
                }
                onClick={onClose}
              >
                <Icon className="h-5 w-5" />
                {item.label}
              </NavLink>
            );
          })}
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;
