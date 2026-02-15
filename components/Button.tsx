import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'tonal' | 'text';
  fullWidth?: boolean;
  icon?: string;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  fullWidth = false, 
  className = '', 
  icon,
  ...props 
}) => {
  const baseStyles = "ripple h-12 md:h-14 rounded-2xl font-bold text-[16px] md:text-[18px] transition-all active:scale-[0.98] flex items-center justify-center gap-2";
  
  const variants = {
    primary: "bg-gradient-primary text-white shadow-soft hover:shadow-glow",
    secondary: "bg-cy-dark text-white shadow-soft",
    tonal: "bg-cy-primary/10 text-cy-primary",
    text: "bg-transparent text-cy-primary hover:bg-cy-primary/5",
  };

  const widthStyle = fullWidth ? "w-full" : "w-auto px-6";

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${widthStyle} ${className}`}
      {...props}
    >
      {icon && <span className="material-symbols-outlined text-[20px]">{icon}</span>}
      {children}
    </button>
  );
};