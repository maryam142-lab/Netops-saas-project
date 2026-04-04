const Loader = ({ label = 'Loading...' }) => {
  return (
    <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-300">
      <span className="inline-flex h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-brand-500 dark:border-slate-600 dark:border-t-brand-300" />
      {label}
    </div>
  );
};

export default Loader;
