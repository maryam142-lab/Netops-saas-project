import { useMemo, useState } from 'react';
import Navbar from './Navbar';
import Sidebar from './Sidebar';

const Layout = ({
  navItems = [],
  title,
  subtitle,
  brand = 'NetOps',
  roleLabel,
  notifications,
  onLogout,
  children,
}) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const resolvedTitle = useMemo(() => title || roleLabel || 'Dashboard', [title, roleLabel]);

  return (
    <div className="flex min-h-screen bg-slate-50/80 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <Sidebar
        navItems={navItems}
        brand={brand}
        roleLabel={roleLabel}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onLogout={onLogout}
      />
      <div className="flex min-w-0 flex-1 flex-col">
        <Navbar
          title={resolvedTitle}
          subtitle={subtitle}
          onMenu={() => setSidebarOpen(true)}
          onLogout={onLogout}
          notifications={notifications}
        />
        <main className="relative flex-1 overflow-y-auto px-4 py-6 sm:px-6 lg:px-8 pb-10">
          <div className="mx-auto w-full max-w-6xl">{children}</div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
