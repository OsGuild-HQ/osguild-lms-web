import React from 'react';
import clsx from 'clsx';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input: React.FC<InputProps> = ({ label, error, className, id, ...props }) => {
  const inputId = id || Math.random().toString(36).substring(2, 9);
  
  return (
    <div className="flex flex-col gap-1 w-full">
      {label && (
        <label htmlFor={inputId} className="text-sm font-medium text-[#f8fafc]">
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={clsx(
          'bg-[#0f172a]/50 border border-[rgba(255,255,255,0.1)] rounded-lg px-4 py-2 text-white',
          'focus:outline-none focus:ring-2 focus:ring-[#6366f1] focus:border-transparent transition-all',
          'placeholder:text-[#64748b]',
          error && 'border-[#ef4444] focus:ring-[#ef4444]',
          className
        )}
        {...props}
      />
      {error && <span className="text-xs text-[#ef4444] mt-1">{error}</span>}
    </div>
  );
};

export const Textarea: React.FC<React.TextareaHTMLAttributes<HTMLTextAreaElement> & { label?: string; error?: string }> = ({ 
  label, error, className, id, ...props 
}) => {
  const inputId = id || Math.random().toString(36).substring(2, 9);
  
  return (
    <div className="flex flex-col gap-1 w-full">
      {label && (
        <label htmlFor={inputId} className="text-sm font-medium text-[#f8fafc]">
          {label}
        </label>
      )}
      <textarea
        id={inputId}
        className={clsx(
          'bg-[#0f172a]/50 border border-[rgba(255,255,255,0.1)] rounded-lg px-4 py-2 text-white',
          'focus:outline-none focus:ring-2 focus:ring-[#6366f1] focus:border-transparent transition-all min-h-[100px]',
          'placeholder:text-[#64748b]',
          error && 'border-[#ef4444] focus:ring-[#ef4444]',
          className
        )}
        {...props}
      />
      {error && <span className="text-xs text-[#ef4444] mt-1">{error}</span>}
    </div>
  );
};
