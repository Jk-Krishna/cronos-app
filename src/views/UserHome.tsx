import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LogOut, Plus, CheckCircle, RotateCcw, BarChart2, Calendar, Users } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Button, Card, Input } from '../components/UI';
import type { UserGroup, TaskInstance, UserProfile } from '../types';

interface UserHomeProps {
  group: UserGroup;
  currentUserId: string;
  onSwitchProfile: () => void;
  onLogout: () => void;
}

const UserHome: React.FC<UserHomeProps> = ({ group, currentUserId, onSwitchProfile, onLogout }) => {
  // Tabs: currentUserId (index 0 logic replaced by ID matching), 'COMPARE' (special)
  const [activeTab, setActiveTab] = useState<string>(currentUserId); 
  const [viewMode, setViewMode] = useState<'TASKS' | 'COMPARE'>('TASKS');
  const [profiles, setProfiles] = useState<UserProfile[]>(group.profiles); // Local state for updates
  const [currentTime, setCurrentTime] = useState(new Date());

  // Task Inputs
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskTime, setNewTaskTime] = useState('');
  const [isAddingTask, setIsAddingTask] = useState(false);

  // Compare Inputs
  const [compareDate, setCompareDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 10000);
    return () => clearInterval(timer);
  }, []);

  const activeProfile = profiles.find(p => p.id === activeTab);
  const currentUserProfile = profiles.find(p => p.id === currentUserId);

  // Handlers
  const handleTaskAction = (profileId: string, taskId: string, action: 'COMPLETE' | 'SNOOZE') => {
    setProfiles(prev => prev.map(p => {
      if (p.id !== profileId) return p;
      return {
        ...p,
        tasks: p.tasks.map(t => {
          if (t.id !== taskId) return t;
          
          if (action === 'COMPLETE') {
            return { ...t, status: 'COMPLETED' };
          }
          if (action === 'SNOOZE') {
             // Logic: Check if next 30 mins crosses midnight
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

  // Compare Data Prep
  const compareData = profiles.map(p => {
    const tasksForDate = p.tasks.filter(t => t.date === compareDate);
    const completed = tasksForDate.filter(t => t.status === 'COMPLETED').length;
    const isPastDate = compareDate < new Date().toISOString().split('T')[0];
    const missed = tasksForDate.filter(t => t.status === 'MISSED' || (isPastDate && t.status === 'PENDING')).length; 
    
    return {
      name: p.name,
      Completed: completed,
      Pending: tasksForDate.length - completed - missed,
      Missed: missed
    };
  });

  return (
    <div className="flex-1 flex flex-col h-screen overflow-hidden bg-background">
      {/* Header */}
      <header className="bg-surface/80 backdrop-blur-md border-b border-white/5 sticky top-0 z-30">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
             <h1 className="text-lg font-bold text-white tracking-tight">Cronos</h1>
             <span className="text-zinc-600 text-sm">/</span>
             <div className="flex items-center gap-2">
                <img src={currentUserProfile?.avatar} className="w-5 h-5 rounded-full bg-zinc-800" />
                <span className="text-sm font-bold text-zinc-400">{currentUserProfile?.name}</span>
             </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={onSwitchProfile} className="text-slate-400 hover:text-white flex items-center gap-2">
              <Users size={14} /> <span className="hidden sm:inline">Switch Profile</span>
            </Button>
            <div className="w-px h-4 bg-zinc-800 mx-1"></div>
            <Button variant="ghost" size="sm" onClick={onLogout} className="text-slate-400 hover:text-rose-400" title="Sign Out">
              <LogOut size={16} />
            </Button>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="bg-surface/40 border-b border-white/5">
        <div className="max-w-4xl mx-auto px-4 overflow-x-auto flex gap-2 py-2">
          {profiles.map((p) => (
            <button
              key={p.id}
              onClick={() => { setActiveTab(p.id); setViewMode('TASKS'); }}
              className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all whitespace-nowrap ${
                activeTab === p.id && viewMode === 'TASKS'
                  ? 'bg-primary text-white shadow-lg shadow-primary/20' 
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {p.id === currentUserId ? 'You' : p.name}
            </button>
          ))}
          <div className="w-px h-6 bg-slate-700 mx-1 self-center" />
          <button
            onClick={() => setViewMode('COMPARE')}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-medium transition-all ${
              viewMode === 'COMPARE'
                ? 'bg-accent text-white shadow-lg shadow-accent/20' 
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <BarChart2 size={12} /> Insight
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto px-4 py-6">
          
          {viewMode === 'TASKS' && activeProfile && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }}>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <Calendar className="text-primary" size={20} /> 
                  {activeTab === currentUserId ? 'Your Schedule' : `${activeProfile.name}'s Schedule`}
                </h2>
                {activeTab === currentUserId && ( 
                   <Button size="sm" onClick={() => setIsAddingTask(!isAddingTask)} variant="secondary" icon={<Plus size={14}/>}>
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
                        <Input type="time" value={newTaskTime} onChange={e => setNewTaskTime(e.target.value)} className="sm:w-32" />
                        <Button size="sm" onClick={handleAddTask}>Save</Button>
                      </div>
                    </Card>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Task List */}
              <div className="space-y-3 pb-20">
                {activeProfile.tasks
                  .sort((a, b) => a.time.localeCompare(b.time))
                  .map(task => {
                    const isDone = task.status === 'COMPLETED';
                    const isMissed = task.status === 'MISSED';
                    // Simulating missed if time passed
                    const [h, m] = task.time.split(':').map(Number);
                    const taskMin = h * 60 + m;
                    const nowMin = currentTime.getHours() * 60 + currentTime.getMinutes();
                    const isPastDue = !isDone && !isMissed && (taskMin < nowMin - 60);

                    return (
                      <Card key={task.id} className={`p-4 transition-all ${isDone ? 'opacity-60 bg-emerald-900/10' : ''}`}>
                        <div className="flex items-center gap-4">
                          <div className={`px-2 py-1 rounded text-xs font-mono font-bold ${isDone ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-700 text-slate-300'}`}>
                            {task.time}
                          </div>
                          <div className="flex-1">
                            <h3 className={`text-sm font-medium ${isDone ? 'line-through text-slate-500' : 'text-slate-200'}`}>{task.title}</h3>
                            <p className="text-[10px] text-slate-500">{task.isDefault ? 'Default Task' : 'Custom Task'}</p>
                          </div>
                          
                          {/* Actions only for current user if it's their tab */}
                          {activeTab === currentUserId && !isDone && (
                            <div className="flex items-center gap-2">
                               <Button 
                                variant="ghost" 
                                size="sm" 
                                className="h-8 w-8 p-0 rounded-full hover:bg-slate-700 text-slate-400"
                                onClick={() => handleTaskAction(activeProfile.id, task.id, 'SNOOZE')}
                                title="Snooze"
                              >
                                <RotateCcw size={14} />
                              </Button>
                              <Button 
                                size="sm" 
                                className="h-8 bg-emerald-600 hover:bg-emerald-500 px-3"
                                onClick={() => handleTaskAction(activeProfile.id, task.id, 'COMPLETE')}
                              >
                                <CheckCircle size={14} className="mr-1" /> Done
                              </Button>
                            </div>
                          )}
                          {/* Read Only Status for others or Done */}
                          {(activeTab !== currentUserId || isDone) && (
                            <div className="text-xs font-medium">
                              {isDone && <span className="text-emerald-500">Completed</span>}
                              {!isDone && isPastDue && <span className="text-rose-500">Late</span>}
                              {!isDone && !isPastDue && <span className="text-slate-500">Pending</span>}
                            </div>
                          )}
                        </div>
                      </Card>
                    );
                  })}
                 {activeProfile.tasks.length === 0 && <p className="text-center text-slate-500 py-8">No tasks for today.</p>}
              </div>
            </motion.div>
          )}

          {viewMode === 'COMPARE' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className="flex items-center justify-between mb-6">
                 <h2 className="text-xl font-bold text-white">Comparison</h2>
                 <Input 
                   type="date" 
                   value={compareDate} 
                   onChange={e => setCompareDate(e.target.value)}
                   className="w-auto py-1 text-xs"
                 />
              </div>

              <Card className="h-[400px] mb-8">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={compareData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                    <Tooltip cursor={{fill: 'rgba(255,255,255,0.05)'}} contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px' }} />
                    <Legend />
                    <Bar dataKey="Completed" stackId="a" fill="#10b981" radius={[0,0,4,4]} barSize={40} />
                    <Bar dataKey="Pending" stackId="a" fill="#334155" />
                    <Bar dataKey="Missed" stackId="a" fill="#f43f5e" radius={[4,4,0,0]} />
                  </BarChart>
                </ResponsiveContainer>
              </Card>

              {/* Task Detail Lists */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-20">
                {profiles.map(profile => {
                  const dailyTasks = profile.tasks.filter(t => t.date === compareDate);
                  const completedTasks = dailyTasks.filter(t => t.status === 'COMPLETED');
                  const notCompletedTasks = dailyTasks.filter(t => t.status !== 'COMPLETED');

                  if (dailyTasks.length === 0) return null;

                  return (
                    <Card key={profile.id} className="flex flex-col gap-4">
                      <div className="flex items-center gap-3 border-b border-zinc-800 pb-3">
                        <img src={profile.avatar} className="w-8 h-8 rounded-full bg-zinc-800" alt={profile.name} />
                        <h3 className="text-lg font-bold text-white">{profile.name}</h3>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        {/* Completed Column */}
                        <div>
                          <h4 className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-3">Completed ({completedTasks.length})</h4>
                          <div className="space-y-2">
                            {completedTasks.length > 0 ? completedTasks.map(t => (
                              <div key={t.id} className="text-xs text-zinc-500 flex items-start gap-2">
                                 <CheckCircle size={12} className="text-emerald-500 mt-0.5 shrink-0" />
                                 <span className="line-through">{t.title}</span>
                              </div>
                            )) : <span className="text-xs text-zinc-700 italic">None</span>}
                          </div>
                        </div>

                        {/* Not Completed Column */}
                        <div>
                          <h4 className="text-[10px] font-black text-rose-400 uppercase tracking-widest mb-3">Incomplete ({notCompletedTasks.length})</h4>
                          <div className="space-y-2">
                            {notCompletedTasks.length > 0 ? notCompletedTasks.map(t => (
                              <div key={t.id} className="text-xs text-zinc-300 flex items-start gap-2">
                                 <div className={`w-3 h-3 rounded-full border border-zinc-700 mt-0.5 shrink-0 flex items-center justify-center ${t.status === 'MISSED' ? 'border-red-500/50 bg-red-500/10' : ''}`}>
                                    {t.status === 'MISSED' && <div className="w-1 h-1 bg-red-500 rounded-full" />}
                                 </div>
                                 <div className="flex flex-col">
                                   <span className={t.status === 'MISSED' ? 'text-red-400' : ''}>{t.title}</span>
                                   <span className="text-[10px] text-zinc-600 font-mono">{t.time}</span>
                                 </div>
                              </div>
                            )) : <span className="text-xs text-zinc-700 italic">All done</span>}
                          </div>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>

            </motion.div>
          )}

        </div>
      </div>
    </div>
  );
};

export default UserHome;