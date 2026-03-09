import React from 'react';

const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
  onClick,
  className = '',
  ...props
}) => {
  const baseClasses = 'inline-flex items-center justify-center rounded-xl font-medium transition duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2';

  const variantClasses = {
    primary: 'bg-primary text-white shadow-lg shadow-primary/20 hover:bg-primary-lighter focus:ring-primary',
    secondary: 'bg-secondary text-white hover:bg-secondary-darker focus:ring-secondary',
    accent: 'bg-accent text-white hover:bg-accent-darker focus:ring-accent',
    success: 'bg-success text-text-primary hover:brightness-95 focus:ring-success',
    danger: 'bg-error text-white hover:brightness-95 focus:ring-error',
    outline: 'border border-border bg-container text-text-primary hover:border-primary hover:text-primary focus:ring-primary',
    ghost: 'text-text-primary hover:bg-background-secondary focus:ring-primary',
    dark: 'bg-dark text-white hover:bg-dark-lighter focus:ring-dark',
    darkOutline: 'border border-dark text-dark hover:bg-dark hover:text-white focus:ring-dark',
  };

  const sizeClasses = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-2.5 text-sm sm:text-base',
    lg: 'px-6 py-3 text-base',
  };

  const pressClasses = 'active:scale-[0.98]';
  const disabledClasses = disabled ? 'cursor-not-allowed opacity-50' : '';

  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${pressClasses} ${disabledClasses} ${className}`}
      disabled={disabled}
      onClick={onClick}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
