import {
  BellIcon,
  Bars3BottomLeftIcon,
  ChevronDownIcon,
} from '@heroicons/react/24/outline';
import { useMemo, useState } from 'react';
import ThemeToggle from './ThemeToggle';

const Navbar = ({ title, subtitle, onMenu, onLogout, notifications }) => {
  const [open, setOpen] = useState(false);

  const ticketItems = useMemo(() => notifications?.tickets || [], [notifications]);
  const connectionItems = useMemo(() => notifications?.connections || [], [notifications]);

  return (
    <header className="sticky top-0 z-20 flex flex-wrap items-center justify-between gap-4 border-b border-slate-200/70 bg-white/80 px-4 py-4 backdrop-blur dark:border-slate-800/80 dark:bg-slate-950/70 sm:px-6">
      <div className="flex min-w-[200px] items-center gap-3">
        <button
          type="button"
          onClick={onMenu}
          className="rounded-xl border border-slate-200/70 p-2 text-slate-600 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800 lg:hidden"
        >
          <Bars3BottomLeftIcon className="h-5 w-5" />
        </button>
        <div>
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
            {title}
          </h2>
          {subtitle ? (
            <p className="text-sm text-slate-500 dark:text-slate-400">{subtitle}</p>
          ) : null}
        </div>
      </div>

      <div className="relative flex w-full flex-wrap items-center justify-between gap-3 sm:w-auto sm:justify-start sm:gap-4">
        <ThemeToggle />
        <button
          type="button"
          onClick={() => setOpen((prev) => !prev)}
          className="relative rounded-full border border-slate-200/70 p-2 text-slate-600 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
        >
          <BellIcon className="h-5 w-5" />
          {(ticketItems.length > 0 || connectionItems.length > 0) && (
            <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-red-500" />
          )}
        </button>
        {open ? (
          <div className="absolute right-0 top-12 z-40 w-80 rounded-2xl border border-slate-200/70 bg-white p-4 shadow-xl shadow-slate-200/50 dark:border-slate-700 dark:bg-slate-900">
            <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              Notifications
            </h4>
            <div className="mt-3 space-y-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">
                  Support Tickets
                </p>
                {ticketItems.length === 0 ? (
                  <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                    No new tickets.
                  </p>
                ) : (
                  <ul className="mt-2 space-y-2 text-sm text-slate-700 dark:text-slate-200">
                    {ticketItems.slice(0, 3).map((ticket) => (
                      <li key={ticket._id} className="flex flex-col">
                        <span className="font-medium">{ticket.subject}</span>
                        <span className="text-xs text-slate-500 dark:text-slate-400">
                          {ticket.customerId?.name || 'Customer'}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">
                  Connection Requests
                </p>
                {connectionItems.length === 0 ? (
                  <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                    No pending requests.
                  </p>
                ) : (
                  <ul className="mt-2 space-y-2 text-sm text-slate-700 dark:text-slate-200">
                    {connectionItems.slice(0, 3).map((connection) => (
                      <li key={connection._id} className="flex flex-col">
                        <span className="font-medium">
                          {connection.customerId?.name || 'Customer'}
                        </span>
                        <span className="text-xs text-slate-500 dark:text-slate-400">
                          {connection.packageId?.name || 'Package'}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
        ) : null}
        <div className="flex items-center gap-2 rounded-full border border-slate-200/70 bg-white/70 px-3 py-1.5 dark:border-slate-700 dark:bg-slate-900/60">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-900 text-xs font-semibold text-white dark:bg-slate-200 dark:text-slate-900">
            NA
          </div>
          <ChevronDownIcon className="h-4 w-4 text-slate-500 dark:text-slate-400" />
        </div>
        <button
          type="button"
          onClick={onLogout}
          className="rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white transition hover:bg-slate-800 dark:bg-slate-200 dark:text-slate-900 dark:hover:bg-slate-100"
        >
          Logout
        </button>
      </div>
    </header>
  );
};

export default Navbar;
