import { useTheme } from '../context/ThemeContext';

const ThemeToggle = ({ className = '' }) => {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={`inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-slate-600 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800 ${className}`}
      aria-label="Toggle theme"
    >
      <span>{isDark ? 'Dark' : 'Light'}</span>
      <span
        className={`h-4 w-4 rounded-full ${
          isDark ? 'bg-slate-100' : 'bg-slate-900'
        }`}
      />
    </button>
  );
};

export default ThemeToggle;
