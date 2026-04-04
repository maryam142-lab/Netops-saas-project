const baseStyles =
  'inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-semibold transition focus:outline-none focus:ring-4 focus:ring-brand-100/70 disabled:cursor-not-allowed disabled:opacity-60 dark:focus:ring-brand-900/40';

const variants = {
  primary: 'bg-brand-600 text-white hover:bg-brand-700',
  danger: 'bg-red-600 text-white hover:bg-red-700',
  success: 'bg-emerald-600 text-white hover:bg-emerald-700',
  outline:
    'border border-slate-300 text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800/60',
  ghost: 'text-slate-600 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800/60',
};

const Button = ({ variant = 'primary', className = '', ...props }) => {
  const variantStyles = variants[variant] || variants.primary;
  return <button className={`${baseStyles} ${variantStyles} ${className}`} {...props} />;
};

export default Button;
