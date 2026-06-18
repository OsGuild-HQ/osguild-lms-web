import React from 'react';
import clsx from 'clsx';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hoverEffect?: boolean;
}

export const Card: React.FC<CardProps> = ({ children, hoverEffect = false, className, ...props }) => {
  return (
    <div 
      className={clsx(
        'glass-panel p-6',
        hoverEffect && 'cursor-pointer hover:border-[#6366f1]/50 hover:shadow-[0_8px_32px_0_rgba(99,102,241,0.15)] hover:-translate-y-1',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};
