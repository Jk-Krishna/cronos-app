import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LogOut, CheckCircle, AlertCircle, Calendar, RotateCcw } from 'lucide-react';
import { Button } from '../components/UI';
import type { Client, Task } from '../types.ts';

interface ClientDashboardProps {
  user: Client;
  tasks: Task[];
  onLogout: () => void;
  onUpdateTask: (id: string, status: 'COMPLETED' | 'PENDING' | 'MISSED', timestamp?: string) => void;
  onPostpone: (id: string) => void;
  notify: (msg: string) => void;
}

const ClientDashboard: React.FC<ClientDashboardProps> = ({ user, tasks, onLogout, onUpdateTask, onPostpone, notify }) => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setCurrentTime(now);
      const timeStr = now.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' });
      
      tasks.forEach(task => {
        if (task.time === timeStr && task.status === 'PENDING') {
          notify(`It's time for: ${task.title}`);
        }
      });
    }, 10000);
    return () => clearInterval(timer);
  }, [tasks, notify]);

  const sortedTasks = [...tasks].sort((a, b) => a.time.localeCompare(b.time));

  return (
    <div className="flex-1 flex flex-col h-screen overflow-hidden">
      {/* Header */}
      <header className="bg-surface/80 backdrop-blur-md border-b border-white/5 sticky top-0 z-30">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={user.avatar} alt="User" className="w-8 h-8 rounded-full border border-slate-600" />
            <div className="leading-tight">
              <h2 className="text-sm font-semibold text-white">{user.name}</h2>
              <p className="text-[10px] text-slate-400 uppercase tracking-wide">Client Access</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden sm:block text-right">
               <p className="text-xs font-medium text-slate-300">
                {currentTime.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
               </p>
               <p className="text-xs text-primary font-mono">
                {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
               </p>
            </div>
            <Button variant="ghost" onClick={onLogout} size="sm" className="text-slate-400 hover:text-rose-400 px-2">
              <LogOut size={16} />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto bg-background">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
          
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-xl font-bold text-white flex items-center gap-2">
              <Calendar className="text-primary" size={20} /> Today's Schedule
            </h1>
            <span className="sm:hidden text-xs font-mono text-primary bg-primary/10 px-2 py-1 rounded">
              {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>

          <div className="space-y-3 pb-20">
            <AnimatePresence mode="popLayout">
              {sortedTasks.map((task) => {
                const isCompleted = task.status === 'COMPLETED';
                const isMissed = task.status === 'MISSED';
                
                return (
                  <motion.div
                    key={task.id}
                    layout
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className={`group relative overflow-hidden rounded-xl border transition-all ${
                      isCompleted 
                        ? 'bg-emerald-500/5 border-emerald-500/20' 
                        : isMissed 
                          ? 'bg-rose-500/5 border-rose-500/20' 
                          : 'bg-surface border-slate-700/50 hover:border-primary/50'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center p-4 gap-4">
                      {/* Time Column */}
                      <div className="flex items-center sm:block gap-3 sm:w-20 shrink-0">
                         <div className={`flex items-center justify-center w-full sm:w-auto px-2 py-1 rounded text-xs font-bold font-mono border ${
                           isCompleted ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                           isMissed ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' :
                           'bg-slate-800 text-slate-300 border-slate-700'
                         }`}>
                           {task.time}
                         </div>
                      </div>

                      {/* Content Column */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <h3 className={`text-base font-medium truncate ${isCompleted ? 'text-slate-500 line-through' : 'text-slate-200'}`}>
                            {task.title}
                          </h3>
                        </div>
                        <p className="text-xs text-slate-500 truncate">{task.description}</p>
                      </div>

                      {/* Action Column */}
                      <div className="flex items-center gap-2 sm:justify-end mt-2 sm:mt-0 pt-3 sm:pt-0 border-t sm:border-0 border-slate-700/50">
                        {!isCompleted && !isMissed && (
                          <>
                             <Button 
                              variant="secondary" 
                              size="sm"
                              onClick={() => onPostpone(task.id)}
                              className="flex-1 sm:flex-none text-[10px] h-8"
                              icon={<RotateCcw size={12}/>}
                            >
                              Snooze
                            </Button>
                            <Button 
                              size="sm"
                              onClick={() => {
                                onUpdateTask(task.id, 'COMPLETED', new Date().toISOString());
                                notify("Task completed!");
                              }}
                              className="flex-1 sm:flex-none h-8 bg-emerald-600 hover:bg-emerald-500"
                              icon={<CheckCircle size={14}/>}
                            >
                              Complete
                            </Button>
                          </>
                        )}
                        
                        {isCompleted && (
                          <div className="flex items-center text-emerald-500 text-xs font-medium px-3 py-1 bg-emerald-500/10 rounded-full">
                            <CheckCircle size={14} className="mr-1.5" /> Done
                          </div>
                        )}
                        
                        {isMissed && (
                          <div className="flex items-center text-rose-500 text-xs font-medium px-3 py-1 bg-rose-500/10 rounded-full">
                            <AlertCircle size={14} className="mr-1.5" /> Absent
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
            
            {sortedTasks.length === 0 && (
              <div className="text-center py-12 text-slate-500">
                <p className="text-sm">No tasks assigned.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientDashboard;