import React from 'react';
import clsx from 'clsx';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hoverEffect?: boolean;
  neonBorder?: boolean;
}

export const Card: React.FC<CardProps> = ({ children, hoverEffect = false, neonBorder = false, className, ...props }) => {
  return (
    <div 
      className={clsx(
        'glass-panel p-6',
        hoverEffect && 'cursor-pointer hover:shadow-[0_0_20px_rgba(6,182,212,0.15)]',
        neonBorder && 'neon-border',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};
