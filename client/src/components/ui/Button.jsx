const baseStyles =
  'inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60';

const variants = {
  primary: 'bg-blue-600 text-white hover:bg-blue-700',
  danger: 'bg-red-600 text-white hover:bg-red-700',
  success: 'bg-green-600 text-white hover:bg-green-700',
  outline: 'border border-gray-300 text-gray-700 hover:bg-gray-50',
  ghost: 'text-gray-600 hover:bg-gray-100',
};

const Button = ({ variant = 'primary', className = '', ...props }) => {
  const variantStyles = variants[variant] || variants.primary;
  return <button className={`${baseStyles} ${variantStyles} ${className}`} {...props} />;
};

export default Button;
