import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LogOut, Plus, CheckCircle, RotateCcw, BarChart2, Calendar, User } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Button, Card, Input } from '../components/UI';
import type { UserGroup, TaskInstance, UserProfile } from '../types.ts';

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
             if (now.getDate() !== new Date().getDate()) {
               alert("Cannot snooze to next day!");
               return t;
             }
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
    <div className="flex-1 flex flex-col h-full bg-background overflow-hidden">
      {/* Header */}
      <header className="bg-surface/80 backdrop-blur-md border-b border-white/5 sticky top-0 z-30 flex-shrink-0">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <h1 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
            Cronos <span className="text-[10px] bg-primary/20 text-primary px-1.5 py-0.5 rounded font-mono hidden sm:inline-block">BETA</span>
          </h1>
          <div className="flex items-center gap-4">
            <span className="text-xs font-mono text-slate-400 hidden sm:block">
               {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
            <Button variant="ghost" size="sm" onClick={onLogout} className="text-slate-400 hover:text-rose-400 -mr-2">
              <LogOut size={18} />
            </Button>
          </div>
        </div>
      </header>

      {/* Navigation Tabs - Horizontally scrollable on mobile */}
      <div className="bg-surface/40 border-b border-white/5 flex-shrink-0">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 overflow-x-auto no-scrollbar flex gap-2 py-3">
          {profiles.map((p, idx) => (
            <button
              key={p.id}
              onClick={() => { setActiveTab(p.id); setViewMode('TASKS'); }}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all whitespace-nowrap border ${
                activeTab === p.id && viewMode === 'TASKS'
                  ? 'bg-primary border-primary text-white shadow-lg shadow-primary/20' 
                  : 'bg-slate-800/50 border-slate-700 text-slate-400 hover:text-white hover:bg-slate-700'
              }`}
            >
              <User size={14} className={activeTab === p.id && viewMode === 'TASKS' ? "opacity-100" : "opacity-50"} />
              {idx === 0 ? 'You' : p.name}
            </button>
          ))}
          <div className="w-px h-6 bg-slate-700 mx-2 self-center flex-shrink-0" />
          <button
            onClick={() => setViewMode('COMPARE')}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all whitespace-nowrap border ${
              viewMode === 'COMPARE'
                ? 'bg-accent border-accent text-white shadow-lg shadow-accent/20' 
                : 'bg-slate-800/50 border-slate-700 text-slate-400 hover:text-white hover:bg-slate-700'
            }`}
          >
            <BarChart2 size={14} /> Compare
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 pb-24">
          
          {viewMode === 'TASKS' && activeProfile && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <Calendar className="text-primary" size={20} /> 
                  <span>{activeTab === profiles[0].id ? 'Your Schedule' : `${activeProfile.name}'s Schedule`}</span>
                </h2>
                {activeTab === profiles[0].id && ( 
                   <Button size="sm" onClick={() => setIsAddingTask(!isAddingTask)} variant="secondary" icon={<Plus size={14}/>} className="w-full sm:w-auto">
                     Add Task
                   </Button>
                )}
              </div>

              {/* Add Task Form */}
              <AnimatePresence>
                {isAddingTask && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden mb-4">
                    <Card className="bg-surface/50 border-primary/20">
                      <div className="flex flex-col sm:flex-row gap-3 items-end">
                        <Input placeholder="Task Title" value={newTaskTitle} onChange={e => setNewTaskTitle(e.target.value)} />
                        <Input type="time" value={newTaskTime} onChange={e => setNewTaskTime(e.target.value)} className="w-full sm:w-32" />
                        <Button size="md" onClick={handleAddTask} className="w-full sm:w-auto">Save</Button>
                      </div>
                    </Card>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Task List */}
              <div className="space-y-3">
                {activeProfile.tasks
                  .sort((a, b) => a.time.localeCompare(b.time))
                  .map(task => {
                    const isDone = task.status === 'COMPLETED';
                    const isMissed = task.status === 'MISSED'; 
                    const [h, m] = task.time.split(':').map(Number);
                    const taskMin = h * 60 + m;
                    const nowMin = currentTime.getHours() * 60 + currentTime.getMinutes();
                    const isPastDue = !isDone && !isMissed && (taskMin < nowMin - 60);

                    return (
                      <Card key={task.id} className={`p-4 transition-all ${isDone ? 'opacity-60 bg-emerald-900/10' : ''}`}>
                        <div className="flex items-center gap-3 sm:gap-4">
                          <div className={`shrink-0 w-14 sm:w-16 py-1.5 rounded text-center text-xs font-mono font-bold ${isDone ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-700 text-slate-300'}`}>
                            {task.time}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className={`text-sm font-medium truncate ${isDone ? 'line-through text-slate-500' : 'text-slate-200'}`}>{task.title}</h3>
                            <p className="text-[10px] text-slate-500 truncate">{task.isDefault ? 'Default Task' : 'Custom Task'}</p>
                          </div>
                          
                          {/* Actions only for "You" */}
                          {activeTab === profiles[0].id && !isDone && (
                            <div className="flex items-center gap-2 shrink-0">
                               <Button 
                                variant="ghost" 
                                size="sm" 
                                className="h-9 w-9 p-0 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400"
                                onClick={() => handleTaskAction(activeProfile.id, task.id, 'SNOOZE')}
                                title="Snooze"
                              >
                                <RotateCcw size={16} />
                              </Button>
                              <Button 
                                size="sm" 
                                className="h-9 px-3 sm:px-4 bg-emerald-600 hover:bg-emerald-500"
                                onClick={() => handleTaskAction(activeProfile.id, task.id, 'COMPLETE')}
                              >
                                <CheckCircle size={16} className="sm:mr-1" /> <span className="hidden sm:inline">Done</span>
                              </Button>
                            </div>
                          )}
                          {(activeTab !== profiles[0].id || isDone) && (
                            <div className="text-xs font-medium shrink-0">
                              {isDone && <span className="text-emerald-500 flex items-center gap-1"><CheckCircle size={12}/> Done</span>}
                              {!isDone && isPastDue && <span className="text-rose-500">Late</span>}
                              {!isDone && !isPastDue && <span className="text-slate-500">Pending</span>}
                            </div>
                          )}
                        </div>
                      </Card>
                    );
                  })}
                 {activeProfile.tasks.length === 0 && <p className="text-center text-slate-500 py-12">No tasks for today.</p>}
              </div>
            </motion.div>
          )}

          {viewMode === 'COMPARE' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
                 <h2 className="text-xl font-bold text-white">Daily Comparison</h2>
                 <Input 
                   type="date" 
                   value={compareDate} 
                   onChange={e => setCompareDate(e.target.value)}
                   className="w-full sm:w-auto py-2 text-sm"
                 />
              </div>

              <Card className="h-[300px] sm:h-[400px] p-2 sm:p-6">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={compareData} margin={{ top: 20, right: 10, left: -20, bottom: 5 }}>
                    <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} dy={10} />
                    <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                    <Tooltip cursor={{fill: 'rgba(255,255,255,0.05)'}} contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', fontSize: '12px' }} />
                    <Legend wrapperStyle={{paddingTop: '20px'}} />
                    <Bar dataKey="Completed" stackId="a" fill="#10b981" radius={[0,0,4,4]} barSize={32} />
                    <Bar dataKey="Pending" stackId="a" fill="#334155" />
                    <Bar dataKey="Missed" stackId="a" fill="#f43f5e" radius={[4,4,0,0]} />
                  </BarChart>
                </ResponsiveContainer>
              </Card>
            </motion.div>
          )}

        </div>
      </div>
    </div>
  );
};

export default UserHome;