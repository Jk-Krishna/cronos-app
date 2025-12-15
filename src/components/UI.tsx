import React from 'react';
import { motion } from 'framer-motion';
import type { HTMLMotionProps } from 'framer-motion';
import { Loader2 } from 'lucide-react';

// --- BUTTON ---
interface ButtonProps extends Omit<HTMLMotionProps<"button">, "ref"> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  isLoading?: boolean;
  icon?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
  children?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  isLoading, 
  icon, 
  size = 'md',
  className = '', 
  ...props 
}) => {
  const baseStyle = "relative inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-offset-[#0f172a] disabled:opacity-50 disabled:cursor-not-allowed rounded-lg active:scale-95";
  
  const sizes = {
    sm: "px-3 py-2 text-xs", // Increased vertical padding for touch
    md: "px-4 py-2.5 text-sm",
    lg: "px-6 py-3.5 text-base",
  };

  const variants = {
    primary: "bg-primary hover:bg-indigo-400 text-white shadow-lg shadow-indigo-500/20 focus:ring-primary",
    secondary: "bg-surface border border-slate-700 text-slate-200 hover:bg-slate-700/80 focus:ring-slate-500",
    danger: "bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-500/20 focus:ring-rose-500",
    ghost: "bg-transparent text-slate-400 hover:text-white hover:bg-white/5",
  };

  return (
    <motion.button
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.98 }}
      className={`${baseStyle} ${sizes[size]} ${variants[variant]} ${className}`}
      disabled={isLoading || props.disabled}
      {...props}
    >
      {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
      {!isLoading && icon && <span className="mr-2 flex items-center">{icon}</span>}
      {children}
    </motion.button>
  );
};

// --- INPUT ---
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export const Input: React.FC<InputProps> = ({ label, className = '', ...props }) => {
  return (
    <div className="w-full">
      {label && <label className="block text-xs font-medium text-slate-400 mb-1.5 ml-0.5">{label}</label>}
      <input
        className={`w-full bg-surface/50 border border-slate-700 text-white px-3 py-3 text-base sm:text-sm rounded-lg focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors placeholder:text-slate-600 ${className}`}
        {...props}
      />
    </div>
  );
};

// --- CARD ---
export const Card: React.FC<{ children: React.ReactNode; className?: string; onClick?: () => void }> = ({ children, className = '', onClick }) => {
  return (
    <motion.div
      onClick={onClick}
      className={`bg-surface/40 backdrop-blur-sm border border-white/5 rounded-xl p-4 sm:p-6 ${className} ${onClick ? 'cursor-pointer hover:border-white/10 hover:bg-surface/60 transition-all' : ''}`}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
    >
      {children}
    </motion.div>
  );
};