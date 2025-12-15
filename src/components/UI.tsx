import React from 'react';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';

// --- BUTTON ---
type ButtonProps = Omit<React.ComponentProps<typeof motion.button>, "ref"> & {
  children?: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'glass' | 'gradient';
  isLoading?: boolean;
  icon?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(({ 
  children, 
  variant = 'primary', 
  isLoading, 
  icon, 
  size = 'md',
  className = '', 
  ...props 
}, ref) => {
  const baseStyle = "relative inline-flex items-center justify-center font-bold tracking-tight transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-white/10 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl overflow-hidden group";
  
  const sizes = {
    sm: "px-4 py-2 text-xs", 
    md: "px-5 py-2.5 text-sm",
    lg: "px-8 py-3 text-base",
    xl: "px-10 py-4 text-lg",
  };

  const variants = {
    primary: "bg-white text-black shadow-lg shadow-white/10 hover:bg-zinc-200",
    gradient: "bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/40 hover:shadow-purple-500/60 border border-white/10",
    secondary: "bg-zinc-900 border border-zinc-800 text-zinc-300 hover:border-white/30 hover:text-white hover:bg-zinc-800",
    danger: "bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 hover:border-red-500/40",
    ghost: "bg-transparent text-zinc-400 hover:text-white hover:bg-white/5",
    glass: "bg-white/5 backdrop-blur-md border border-white/10 text-white hover:bg-white/10",
  };

  return (
    <motion.button
      ref={ref}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`${baseStyle} ${sizes[size]} ${variants[variant]} ${className}`}
      disabled={isLoading || props.disabled}
      {...props}
    >
      <span className="relative z-10 flex items-center">
        {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
        {!isLoading && icon && <span className="mr-2 flex items-center">{icon}</span>}
        {children}
      </span>
      {/* Gloss Effect */}
      {variant !== 'ghost' && <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent pointer-events-none" />}
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
    <div className="w-full group">
      {label && <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1.5 ml-1 group-focus-within:text-white transition-colors">{label}</label>}
      <div className="relative">
        <input
          className={`w-full bg-zinc-900/50 border border-zinc-800 hover:border-zinc-700 focus:border-white/40 text-white px-4 py-3 text-sm rounded-xl focus:outline-none focus:ring-4 focus:ring-white/5 transition-all placeholder:text-zinc-600 shadow-inner ${className}`}
          {...props}
        />
        <div className="absolute inset-0 pointer-events-none rounded-xl bg-gradient-to-b from-white/5 to-transparent opacity-50" />
      </div>
    </div>
  );
};

// --- CARD ---
export const Card: React.FC<{ children: React.ReactNode; className?: string; onClick?: () => void }> = ({ children, className = '', onClick }) => {
  return (
    <motion.div
      onClick={onClick}
      className={`bg-zinc-900/60 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl relative overflow-hidden ${className} ${onClick ? 'cursor-pointer hover:border-white/20 hover:bg-zinc-900/80 hover:-translate-y-1' : ''}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      {/* Glossy Top Highlight */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-50" />
      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </motion.div>
  );
};