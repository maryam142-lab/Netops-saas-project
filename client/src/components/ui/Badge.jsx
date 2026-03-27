const styles = {
  open: 'bg-red-100 text-red-700',
  closed: 'bg-green-100 text-green-700',
  unpaid: 'bg-yellow-100 text-yellow-700',
  paid: 'bg-green-100 text-green-700',
  pending: 'bg-yellow-100 text-yellow-700',
  active: 'bg-green-100 text-green-700',
  suspended: 'bg-red-100 text-red-700',
};

const Badge = ({ variant = 'open', className = '', children }) => {
  const style = styles[variant] || 'bg-gray-100 text-gray-700';
  return (
    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${style} ${className}`}>
      {children}
    </span>
  );
};

export default Badge;
