import React from 'react';
import { motion } from 'framer-motion';
import type { HTMLMotionProps } from 'framer-motion';
import { Loader2 } from 'lucide-react';

// --- BUTTON ---
interface ButtonProps extends HTMLMotionProps<"button"> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'glass';
  isLoading?: boolean;
  icon?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(({ 
  children, 
  variant = 'primary', 
  isLoading, 
  icon, 
  size = 'md',
  className = '', 
  ...props 
}, ref) => {
  // Minimal styles: Matte, rounded, no complex shadows
  const baseStyle = "relative inline-flex items-center justify-center font-bold tracking-tight transition-transform active:scale-95 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed rounded-full";
  
  const sizes = {
    sm: "px-4 py-2 text-xs", 
    md: "px-6 py-3 text-sm",
    lg: "px-8 py-4 text-base",
    xl: "px-10 py-5 text-lg",
  };

  const variants = {
    primary: "bg-white text-black hover:bg-zinc-200",
    secondary: "bg-zinc-800 text-zinc-200 hover:bg-zinc-700 hover:text-white",
    danger: "bg-red-500/10 text-red-400 hover:bg-red-500/20",
    ghost: "bg-transparent text-zinc-500 hover:text-white hover:bg-zinc-900",
    glass: "bg-white/10 text-white hover:bg-white/20",
  };

  return (
    <motion.button
      ref={ref}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.96 }}
      className={`${baseStyle} ${sizes[size]} ${variants[variant]} ${className}`}
      disabled={isLoading || props.disabled}
      {...props}
    >
      <span className="flex items-center">
        {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
        {!isLoading && icon && <span className="mr-2 flex items-center">{icon}</span>}
        {children as React.ReactNode}
      </span>
    </motion.button>
  );
});
Button.displayName = "Button";

// --- INPUT ---
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export const Input: React.FC<InputProps> = ({ label, className = '', ...props }) => {
  return (
    <div className="w-full">
      {label && <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2 ml-1">{label}</label>}
      <input
        className={`w-full bg-zinc-900 border-2 border-transparent focus:border-indigo-500 text-white px-5 py-4 text-sm rounded-3xl focus:outline-none transition-colors placeholder:text-zinc-600 ${className}`}
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
      className={`bg-zinc-900/50 border border-zinc-800 rounded-3xl p-6 ${className} ${onClick ? 'cursor-pointer hover:bg-zinc-900 hover:border-zinc-700' : ''}`}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ duration: 0.2 }}
    >
      {children}
    </motion.div>
  );
};