const StatCard = ({ title, value, trend, accent }) => {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div
        className="absolute -right-10 -top-10 h-24 w-24 rounded-full opacity-20"
        style={{ background: accent }}
      />
      <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-400 dark:text-slate-500">
        {title}
      </p>
      <div className="mt-3 flex items-end justify-between">
        <p className="text-3xl font-semibold text-slate-900 dark:text-slate-100">
          {value}
        </p>
        {trend ? <span className="text-xs text-emerald-600">{trend}</span> : null}
      </div>
    </div>
  );
};

export default StatCard;
