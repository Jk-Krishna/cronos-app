import React from 'react';
import { motion } from 'framer-motion';
import { Users, ShieldCheck, ArrowRight } from 'lucide-react';
import { Button } from '../components/UI';

interface HomeProps {
  onNavigate: (to: 'CLIENT' | 'ADMIN') => void;
}

const Home: React.FC<HomeProps> = ({ onNavigate }) => {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-4 sm:p-8">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="max-w-4xl w-full"
      >
        <div className="text-center mb-10 sm:mb-16">
          <motion.div 
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="inline-flex items-center gap-2 py-1 px-3 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-bold tracking-widest uppercase mb-6"
          >
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse"/> System v1.0
          </motion.div>
          
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-white mb-4 leading-tight">
            Cronos <span className="text-slate-500">Task Manager.</span>
          </h1>
          <p className="text-sm sm:text-base text-slate-400 max-w-lg mx-auto leading-relaxed">
            Orchestrate daily routines with precision. A unified platform for real-time tracking and administrative oversight.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 max-w-3xl mx-auto">
          {/* Client Option */}
          <motion.div 
            whileHover={{ y: -4 }}
            className="group relative"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-indigo-500/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative h-full bg-surface/50 backdrop-blur-md border border-slate-700/50 p-6 sm:p-8 rounded-2xl overflow-hidden hover:border-primary/50 transition-colors">
              <div className="flex items-start justify-between mb-8">
                <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center text-primary">
                  <Users size={20} />
                </div>
                <div className="opacity-0 group-hover:opacity-100 transition-opacity transform translate-x-4 group-hover:translate-x-0">
                   <ArrowRight className="text-slate-500" size={18} />
                </div>
              </div>
              
              <h3 className="text-lg font-bold text-white mb-2">Client Portal</h3>
              <p className="text-xs sm:text-sm text-slate-400 mb-6 leading-relaxed">
                Log in to access your daily schedule, track your progress, and manage assigned tasks efficiently.
              </p>
              
              <Button onClick={() => onNavigate('CLIENT')} className="w-full text-sm" variant="secondary">
                Continue as Client
              </Button>
            </div>
          </motion.div>

          {/* Admin Option */}
          <motion.div 
            whileHover={{ y: -4 }}
            className="group relative"
          >
             <div className="absolute inset-0 bg-gradient-to-r from-accent/20 to-sky-500/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative h-full bg-surface/50 backdrop-blur-md border border-slate-700/50 p-6 sm:p-8 rounded-2xl overflow-hidden hover:border-accent/50 transition-colors">
              <div className="flex items-start justify-between mb-8">
                <div className="w-10 h-10 bg-accent/20 rounded-lg flex items-center justify-center text-accent">
                  <ShieldCheck size={20} />
                </div>
                 <div className="opacity-0 group-hover:opacity-100 transition-opacity transform translate-x-4 group-hover:translate-x-0">
                   <ArrowRight className="text-slate-500" size={18} />
                </div>
              </div>
              
              <h3 className="text-lg font-bold text-white mb-2">Admin Control</h3>
              <p className="text-xs sm:text-sm text-slate-400 mb-6 leading-relaxed">
                Monitor overall performance, analyze client data trends, and configure system tasks.
              </p>
              
              <Button onClick={() => onNavigate('ADMIN')} className="w-full text-sm" variant="secondary">
                Access Dashboard
              </Button>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default Home;