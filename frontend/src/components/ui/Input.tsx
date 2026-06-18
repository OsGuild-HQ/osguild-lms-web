import React from 'react';
import clsx from 'clsx';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input: React.FC<InputProps> = ({ label, error, className, id, ...props }) => {
  const inputId = id || Math.random().toString(36).substring(2, 9);
  
  return (
    <div className="flex flex-col gap-1.5 w-full">
      {label && (
        <label htmlFor={inputId} className="text-sm font-semibold text-[#f8fafc] tracking-wide">
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={clsx(
          'bg-[#06080d]/80 border border-[rgba(255,255,255,0.08)] rounded-lg px-4 py-3 text-white',
          'focus:outline-none focus:ring-1 focus:ring-[#06b6d4] focus:border-[#06b6d4] transition-all',
          'focus:shadow-[0_0_15px_rgba(6,182,212,0.15)]',
          'placeholder:text-[#475569]',
          error && 'border-[#ef4444] focus:ring-[#ef4444] focus:shadow-[0_0_15px_rgba(239,68,68,0.15)]',
          className
        )}
        {...props}
      />
      {error && <span className="text-xs font-medium text-[#ef4444] mt-0.5">{error}</span>}
    </div>
  );
};

export const Textarea: React.FC<React.TextareaHTMLAttributes<HTMLTextAreaElement> & { label?: string; error?: string }> = ({ 
  label, error, className, id, ...props 
}) => {
  const inputId = id || Math.random().toString(36).substring(2, 9);
  
  return (
    <div className="flex flex-col gap-1.5 w-full">
      {label && (
        <label htmlFor={inputId} className="text-sm font-semibold text-[#f8fafc] tracking-wide">
          {label}
        </label>
      )}
      <textarea
        id={inputId}
        className={clsx(
          'bg-[#06080d]/80 border border-[rgba(255,255,255,0.08)] rounded-lg px-4 py-3 text-white',
          'focus:outline-none focus:ring-1 focus:ring-[#06b6d4] focus:border-[#06b6d4] transition-all min-h-[120px]',
          'focus:shadow-[0_0_15px_rgba(6,182,212,0.15)]',
          'placeholder:text-[#475569]',
          error && 'border-[#ef4444] focus:ring-[#ef4444] focus:shadow-[0_0_15px_rgba(239,68,68,0.15)]',
          className
        )}
        {...props}
      />
      {error && <span className="text-xs font-medium text-[#ef4444] mt-0.5">{error}</span>}
    </div>
  );
};
