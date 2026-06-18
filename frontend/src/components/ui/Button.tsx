import React from 'react';
import clsx from 'clsx';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  className,
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#0d1117]';
  
  const variants = {
    primary: 'bg-[#6366f1] text-white hover:bg-[#4f46e5] focus:ring-[#6366f1] shadow-lg shadow-[#6366f1]/20',
    secondary: 'bg-[#1e293b] text-white hover:bg-[#334155] border border-[rgba(255,255,255,0.1)] focus:ring-[#94a3b8]',
    danger: 'bg-[#ef4444] text-white hover:bg-[#dc2626] focus:ring-[#ef4444] shadow-lg shadow-[#ef4444]/20',
    ghost: 'bg-transparent text-[#94a3b8] hover:text-white hover:bg-[#1e293b]',
  };
  
  const sizes = {
    sm: 'text-sm px-3 py-1.5',
    md: 'text-sm px-4 py-2',
    lg: 'text-base px-6 py-3',
  };

  return (
    <button
      className={clsx(baseStyles, variants[variant], sizes[size], className)}
      {...props}
    >
      {children}
    </button>
  );
};
