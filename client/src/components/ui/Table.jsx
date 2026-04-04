const Table = ({ columns, data, emptyLabel = 'No data available' }) => {
  const safeData = Array.isArray(data) ? data : [];
  return (
    <div className="surface-panel overflow-x-auto">
      <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800">
        <thead className="bg-slate-50/80 dark:bg-slate-900/60">
          <tr>
            {columns.map((column) => (
              <th
                key={column.key}
                className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400"
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200 bg-white/80 dark:divide-slate-800 dark:bg-slate-950/40">
          {safeData.length === 0 ? (
            <tr>
              <td className="px-4 py-6 text-sm text-slate-500 dark:text-slate-400" colSpan={columns.length}>
                {emptyLabel}
              </td>
            </tr>
          ) : (
            safeData.map((row, index) => (
              <tr
                key={row.id || row._id || `${index}`}
                className="transition hover:bg-slate-50 dark:hover:bg-slate-900/40"
              >
                {columns.map((column) => (
                  <td key={column.key} className="px-4 py-4 text-sm text-slate-700 dark:text-slate-200">
                    {column.render ? column.render(row) : row[column.key]}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default Table;
