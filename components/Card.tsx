import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  variant?: 'elevated' | 'outlined' | 'filled';
}

export const Card: React.FC<CardProps> = ({ children, className = '', variant = 'elevated', ...props }) => {
  const baseStyles = "rounded-[24px] p-5 md:p-6 overflow-hidden transition-all";

  const variants = {
    elevated: "bg-white dark:bg-slate-900 shadow-soft",
    outlined: "bg-white dark:bg-slate-900 border-2 border-gray-100 dark:border-gray-800",
    filled: "bg-gray-50 dark:bg-slate-800/50",
  };

  return (
    <div
      className={`${baseStyles} ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};