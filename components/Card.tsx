import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'elevated' | 'outlined' | 'filled';
}

export const Card: React.FC<CardProps> = ({ children, className = '', variant = 'elevated' }) => {
  const baseStyles = "rounded-[24px] p-5 md:p-6 overflow-hidden transition-all";
  
  const variants = {
    elevated: "bg-white shadow-soft",
    outlined: "bg-white border-2 border-gray-100",
    filled: "bg-gray-50",
  };

  return (
    <div className={`${baseStyles} ${variants[variant]} ${className}`}>
      {children}
    </div>
  );
};