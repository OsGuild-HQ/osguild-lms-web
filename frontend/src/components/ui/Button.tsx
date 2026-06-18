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
  const baseStyles = 'inline-flex items-center justify-center rounded-lg font-bold transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#0b0f19] tracking-wide relative overflow-hidden';
  
  const variants = {
    primary: 'bg-gradient-to-r from-[#06b6d4] to-[#3b82f6] text-white hover:from-[#0891b2] hover:to-[#2563eb] shadow-[0_0_15px_rgba(6,182,212,0.4)] hover:shadow-[0_0_25px_rgba(6,182,212,0.6)] focus:ring-[#06b6d4] border border-transparent',
    secondary: 'bg-[#12182b] text-white hover:bg-[#1c243c] border border-[rgba(255,255,255,0.1)] focus:ring-[#a855f7] hover:border-[#a855f7]/50 hover:shadow-[0_0_15px_rgba(168,85,247,0.2)]',
    danger: 'bg-gradient-to-r from-[#ef4444] to-[#dc2626] text-white hover:from-[#dc2626] hover:to-[#b91c1c] shadow-[0_0_15px_rgba(239,68,68,0.3)] hover:shadow-[0_0_25px_rgba(239,68,68,0.5)] focus:ring-[#ef4444] border border-transparent',
    ghost: 'bg-transparent text-[#94a3b8] hover:text-[#06b6d4] hover:bg-[#06b6d4]/10',
  };
  
  const sizes = {
    sm: 'text-xs px-3 py-1.5',
    md: 'text-sm px-5 py-2.5',
    lg: 'text-base px-8 py-3.5',
  };

  return (
    <button
      className={clsx(baseStyles, variants[variant], sizes[size], className)}
      {...props}
    >
      <span className="relative z-10 flex items-center gap-2">{children}</span>
    </button>
  );
};
