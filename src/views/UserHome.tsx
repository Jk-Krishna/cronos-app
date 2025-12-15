import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LogOut, Plus, Clock, Check, RefreshCw, BarChart2, User, Zap, Circle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Button, Card, Input } from '../components/UI';
import type { UserGroup, TaskInstance, UserProfile } from '../types';

interface UserHomeProps {
  group: UserGroup;
  onLogout: () => void;
}

const UserHome: React.FC<UserHomeProps> = ({ group, onLogout }) => {
  const [activeTab, setActiveTab] = useState<string>(group.profiles[0].id); 
  const [viewMode, setViewMode] = useState<'TASKS' | 'COMPARE'>('TASKS');
  const [profiles, setProfiles] = useState<UserProfile[]>(group.profiles); 
  const [currentTime, setCurrentTime] = useState(new Date());

  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskTime, setNewTaskTime] = useState('');
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [compareDate, setCompareDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 10000);
    return () => clearInterval(timer);
  }, []);

  const activeProfile = profiles.find(p => p.id === activeTab);

  const handleTaskAction = (profileId: string, taskId: string, action: 'COMPLETE' | 'SNOOZE') => {
    setProfiles(prev => prev.map(p => {
      if (p.id !== profileId) return p;
      return {
        ...p,
        tasks: p.tasks.map(t => {
          if (t.id !== taskId) return t;
          if (action === 'COMPLETE') return { ...t, status: 'COMPLETED' };
          if (action === 'SNOOZE') {
             const [h, m] = t.time.split(':').map(Number);
             const now = new Date();
             now.setHours(h, m + 30);
             const newTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
             return { ...t, time: newTime };
          }
          return t;
        })
      };
    }));
  };

  const handleAddTask = () => {
    if (!newTaskTitle || !newTaskTime || !activeProfile) return;
    const newTask: TaskInstance = {
      id: `custom-${Date.now()}`,
      title: newTaskTitle,
      description: 'Custom Task',
      time: newTaskTime,
      status: 'PENDING',
      date: new Date().toISOString().split('T')[0],
      isDefault: false
    };

    setProfiles(prev => prev.map(p => {
      if (p.id !== activeProfile.id) return p;
      return { ...p, tasks: [...p.tasks, newTask] };
    }));
    setIsAddingTask(false);
    setNewTaskTitle('');
    setNewTaskTime('');
  };

  const compareData = profiles.map(p => {
    const tasksForDate = p.tasks.filter(t => t.date === compareDate);
    const completed = tasksForDate.filter(t => t.status === 'COMPLETED').length;
    const missed = tasksForDate.filter(t => t.status === 'MISSED' || (t.status === 'PENDING' && t.date < new Date().toISOString().split('T')[0])).length; 
    return {
      name: p.name,
      Completed: completed,
      Pending: tasksForDate.length - completed - missed,
      Missed: missed
    };
  });

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      {/* Navbar */}
      <header className="px-6 py-6 flex items-center justify-between z-30 flex-shrink-0">
        <div className="flex items-center gap-3">
           <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-500 to-fuchsia-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/30">
              <Zap size={20} fill="currentColor" />
           </div>
           <div>
              <h1 className="text-lg font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-zinc-400 tracking-tight leading-none">Cronos</h1>
              <p className="text-xs font-bold text-zinc-500">Task Manager</p>
           </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex flex-col items-end mr-2">
            <span className="text-sm font-bold text-white">
               {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wide">
               {currentTime.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })}
            </span>
          </div>
          <Button variant="ghost" size="sm" onClick={onLogout} className="rounded-2xl h-10 w-10 p-0 text-zinc-400 hover:text-red-400">
            <LogOut size={18} />
          </Button>
        </div>
      </header>

      {/* Tabs */}
      <div className="px-6 pb-2 flex-shrink-0">
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
           {profiles.map((p, idx) => {
             const isActive = activeTab === p.id && viewMode === 'TASKS';
             return (
              <button
                key={p.id}
                onClick={() => { setActiveTab(p.id); setViewMode('TASKS'); }}
                className={`group relative flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold transition-all whitespace-nowrap outline-none ${
                  isActive ? 'text-black' : 'text-zinc-500 hover:text-white bg-zinc-900/50 hover:bg-zinc-800'
                }`}
              >
                {isActive && (
                   <motion.div layoutId="tabBg" className="absolute inset-0 bg-white rounded-full shadow-[0_0_20px_rgba(255,255,255,0.3)]" />
                )}
                <span className="relative z-10 flex items-center gap-2">
                  <User size={16} className={isActive ? "text-zinc-600" : "text-zinc-500"} />
                  {idx === 0 ? 'My Tasks' : p.name}
                </span>
              </button>
             );
           })}
           <div className="w-px h-8 bg-zinc-800 mx-2 self-center flex-shrink-0" />
            <button
              onClick={() => setViewMode('COMPARE')}
              className={`group relative flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold transition-all whitespace-nowrap ${
                viewMode === 'COMPARE' ? 'text-white' : 'text-zinc-500 bg-zinc-900/50 hover:bg-zinc-800'
              }`}
            >
              {viewMode === 'COMPARE' && (
                  <motion.div layoutId="tabBg" className="absolute inset-0 bg-fuchsia-600 rounded-full shadow-[0_0_20px_rgba(192,38,211,0.5)]" />
              )}
              <span className="relative z-10 flex items-center gap-2">
                <BarChart2 size={16} /> Insight
              </span>
            </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 pb-32">
        <div className="max-w-5xl mx-auto">
          
          <AnimatePresence mode="wait">
            {viewMode === 'TASKS' && activeProfile && (
              <motion.div 
                key="tasks"
                initial={{ opacity: 0, y: 20 }} 
                animate={{ opacity: 1, y: 0 }} 
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
                  <h2 className="text-3xl font-black text-white flex items-center gap-3">
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-white to-zinc-500">
                      {activeTab === profiles[0].id ? 'Today\'s Focus' : `${activeProfile.name}'s Plan`}
                    </span>
                  </h2>
                  {activeTab === profiles[0].id && ( 
                     <Button size="md" onClick={() => setIsAddingTask(!isAddingTask)} variant="primary" icon={<Plus size={18} strokeWidth={3}/>} className="shadow-lg shadow-white/20">
                       Add New
                     </Button>
                  )}
                </div>

                {isAddingTask && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} className="overflow-hidden mb-8">
                    <Card className="!p-4 border border-indigo-500/30">
                      <div className="flex flex-col sm:flex-row gap-4 items-end">
                        <Input placeholder="Task Name" value={newTaskTitle} onChange={e => setNewTaskTitle(e.target.value)} />
                        <Input type="time" value={newTaskTime} onChange={e => setNewTaskTime(e.target.value)} className="w-full sm:w-auto" />
                        <Button size="lg" onClick={handleAddTask} variant="gradient">Create Task</Button>
                      </div>
                    </Card>
                  </motion.div>
                )}

                <div className="grid grid-cols-1 gap-4">
                  {activeProfile.tasks
                    .sort((a, b) => a.time.localeCompare(b.time))
                    .map((task, index) => {
                      const isDone = task.status === 'COMPLETED';
                      const [h] = task.time.split(':').map(Number);
                      
                      // Dynamic color based on time of day (Dark Neon Style)
                      let timeColor = "bg-blue-500/20 text-blue-300 border-blue-500/30";
                      if (h >= 12 && h < 17) timeColor = "bg-orange-500/20 text-orange-300 border-orange-500/30"; 
                      if (h >= 17) timeColor = "bg-purple-500/20 text-purple-300 border-purple-500/30"; 

                      return (
                        <motion.div 
                          layout
                          key={task.id} 
                          initial={{ scale: 0.9, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ delay: index * 0.05 }}
                          className={`group relative bg-zinc-900/40 backdrop-blur-md rounded-2xl p-5 border shadow-lg hover:shadow-2xl transition-all duration-300 ${!isDone ? 'border-white/10 hover:border-white/20 hover:bg-zinc-900/60' : 'border-transparent opacity-40 grayscale bg-black/20'}`}
                        >
                           <div className="flex items-center gap-6">
                              {/* Time Pill */}
                              <div className={`flex flex-col items-center justify-center w-20 h-20 rounded-xl flex-shrink-0 border ${isDone ? 'bg-zinc-800 text-zinc-500 border-zinc-700' : timeColor}`}>
                                  <span className="text-lg font-black tracking-tight">{task.time}</span>
                                  <span className="text-[10px] font-bold uppercase tracking-wider opacity-80">
                                    {h < 12 ? 'AM' : 'PM'}
                                  </span>
                              </div>

                              <div className="flex-1 min-w-0 py-2">
                                  <h3 className={`text-lg font-bold truncate mb-1 ${isDone ? 'text-zinc-500 line-through decoration-2 decoration-zinc-700' : 'text-white'}`}>{task.title}</h3>
                                  <div className="flex items-center gap-2">
                                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide border ${task.isDefault ? 'bg-zinc-800 border-zinc-700 text-zinc-400' : 'bg-fuchsia-500/10 border-fuchsia-500/20 text-fuchsia-300'}`}>
                                          {task.isDefault ? 'Routine' : 'Personal'}
                                      </span>
                                  </div>
                              </div>

                               {/* Actions */}
                               {activeTab === profiles[0].id && !isDone && (
                                  <div className="flex items-center gap-3">
                                    <Button 
                                      variant="ghost" 
                                      className="h-12 w-12 rounded-xl p-0 text-zinc-500 hover:text-white hover:bg-white/10"
                                      onClick={() => handleTaskAction(activeProfile.id, task.id, 'SNOOZE')}
                                    >
                                      <RefreshCw size={20} />
                                    </Button>
                                    <Button 
                                      className="h-12 px-6 rounded-xl bg-white text-black hover:bg-zinc-200 shadow-[0_0_15px_rgba(255,255,255,0.2)] transition-all duration-300"
                                      onClick={() => handleTaskAction(activeProfile.id, task.id, 'COMPLETE')}
                                    >
                                      <Check size={20} className="mr-2" /> Done
                                    </Button>
                                  </div>
                                )}
                                {(activeTab !== profiles[0].id || isDone) && (
                                  <div className="pr-4">
                                      {isDone ? (
                                        <div className="w-10 h-10 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                                          <Check size={20} />
                                        </div>
                                      ) : (
                                        <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-600">
                                          <Circle size={20} />
                                        </div>
                                      )}
                                  </div>
                                )}
                           </div>
                        </motion.div>
                      );
                    })}
                   
                   {activeProfile.tasks.length === 0 && (
                     <div className="flex flex-col items-center justify-center py-24 text-center">
                       <div className="w-24 h-24 bg-zinc-900 rounded-full border border-zinc-800 flex items-center justify-center mb-6 text-zinc-600">
                         <Clock size={48} />
                       </div>
                       <h3 className="text-xl font-bold text-white">All Caught Up</h3>
                       <p className="text-zinc-500">No tasks scheduled for the rest of the day.</p>
                     </div>
                   )}
                </div>
              </motion.div>
            )}

            {viewMode === 'COMPARE' && (
              <motion.div 
                key="compare"
                initial={{ opacity: 0, scale: 0.95 }} 
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.05 }}
              >
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
                   <div>
                      <h2 className="text-3xl font-black text-white">Performance</h2>
                      <p className="text-zinc-400 font-medium">Daily completion rates.</p>
                   </div>
                   <div className="bg-zinc-900 border border-zinc-800 p-2 rounded-2xl">
                      <input 
                          type="date" 
                          value={compareDate} 
                          onChange={e => setCompareDate(e.target.value)}
                          className="bg-transparent border-none text-white font-bold text-sm focus:ring-0"
                          style={{ colorScheme: 'dark' }}
                      />
                   </div>
                </div>

                <Card className="h-[450px] !p-8 border-white/5 shadow-2xl">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={compareData} margin={{ top: 20, right: 10, left: -20, bottom: 0 }} barSize={48}>
                      <XAxis dataKey="name" stroke="#52525b" fontSize={13} tickLine={false} axisLine={false} dy={15} fontWeight={700} />
                      <YAxis stroke="#52525b" fontSize={12} tickLine={false} axisLine={false} />
                      <Tooltip 
                          cursor={{fill: 'rgba(255,255,255,0.05)', radius: 12}} 
                          contentStyle={{ backgroundColor: '#000', color: '#fff', border: '1px solid #333', borderRadius: '16px', fontSize: '12px', padding: '16px', boxShadow: '0 20px 40px -10px rgba(0,0,0,0.8)' }} 
                      />
                      <Legend wrapperStyle={{paddingTop: '30px', fontWeight: 600}} iconType="circle" />
                      <Bar dataKey="Completed" stackId="a" fill="#10b981" radius={[0,0,16,16]} />
                      <Bar dataKey="Pending" stackId="a" fill="#27272a" />
                      <Bar dataKey="Missed" stackId="a" fill="#ef4444" radius={[16,16,0,0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>

        </div>
      </div>
    </div>
  );
};

export default UserHome;