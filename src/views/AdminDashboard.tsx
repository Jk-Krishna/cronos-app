import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { LogOut, UserPlus, Clock, Users, ChevronRight, Plus, X, Trash2, Settings } from 'lucide-react';
import { Button, Input, Card } from '../components/UI';
import type { UserGroup, UserProfile } from '../types';
import { DEFAULT_TASKS } from '../services/store';
import AdminAnalytics from './AdminAnalytics';

interface AdminDashboardProps {
  store: any;
  onLogout: () => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ store, onLogout }) => {
  const [activeView, setActiveView] = useState<'USERS' | 'DEFAULTS'>('USERS');
  // Track both group and profile to allow updates
  const [selectedUserData, setSelectedUserData] = useState<{group: UserGroup, profile: UserProfile} | null>(null);
  
  const [isAddingUser, setIsAddingUser] = useState(false);
  const [targetGroupId, setTargetGroupId] = useState('');
  const [newProfileName, setNewProfileName] = useState('');

  const [defaults, setDefaults] = useState(DEFAULT_TASKS);
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskTime, setNewTaskTime] = useState('');

  const handleAddUser = () => {
    if(!targetGroupId || !newProfileName) return;
    if (targetGroupId.endsWith('_new')) {
        const cleanId = targetGroupId.replace('_new', '');
        const success = store.addGroup(cleanId, '1234'); 
        if(success) {
             store.addProfileToGroup(cleanId, newProfileName);
             alert(`Created Group ${cleanId}`);
        }
    } else {
        store.addProfileToGroup(targetGroupId, newProfileName);
    }
    setIsAddingUser(false);
    setNewProfileName('');
    setTargetGroupId('');
  };

  const handleDeleteUser = (groupId: string, profileId: string, profileName: string) => {
    if (window.confirm(`Remove ${profileName}?`)) {
        store.deleteProfileFromGroup(groupId, profileId);
        setActiveView(prev => prev); // Force re-render
    }
  };

  const handleTimeChange = (defId: string, newTime: string) => {
    store.updateDefaultTaskTime(defId, newTime);
    setDefaults([...DEFAULT_TASKS]);
  };

  const handleAddDefaultTask = () => {
      if(!newTaskTitle || !newTaskTime) return;
      store.addDefaultTask(newTaskTitle, newTaskTime);
      setDefaults([...DEFAULT_TASKS]);
      setIsAddingTask(false);
      setNewTaskTitle('');
      setNewTaskTime('');
  };

  const handleAdminAddTask = (title: string, time: string) => {
    if (selectedUserData) {
        store.addTaskToProfile(selectedUserData.group.id, selectedUserData.profile.id, title, time);
        // Refresh selected user data to update the view
        const updatedGroup = store.getGroup(selectedUserData.group.id);
        const updatedProfile = updatedGroup?.profiles.find((p: UserProfile) => p.id === selectedUserData.profile.id);
        if (updatedGroup && updatedProfile) {
            setSelectedUserData({ group: updatedGroup, profile: updatedProfile });
        }
    }
  }
  
  const handleAdminDeleteTask = (taskId: string) => {
     if (selectedUserData) {
        store.deleteTaskFromProfile(selectedUserData.group.id, selectedUserData.profile.id, taskId);
        const updatedGroup = store.getGroup(selectedUserData.group.id);
        const updatedProfile = updatedGroup?.profiles.find((p: UserProfile) => p.id === selectedUserData.profile.id);
        if (updatedGroup && updatedProfile) {
            setSelectedUserData({ group: updatedGroup, profile: updatedProfile });
        }
     }
  }

  if (selectedUserData) {
    return (
      <AdminAnalytics 
        client={selectedUserData.profile} 
        tasks={selectedUserData.profile.tasks} 
        onBack={() => setSelectedUserData(null)}
        onAddTask={handleAdminAddTask}
        onDeleteTask={handleAdminDeleteTask}
      />
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      {/* Navbar */}
      <nav className="px-6 py-5 flex items-center justify-between z-20 flex-shrink-0">
        <h1 className="text-xl font-black text-white tracking-tight flex items-center gap-3">
          <div className="w-10 h-10 bg-white rounded-2xl flex items-center justify-center text-black shadow-lg shadow-white/20">
             <Settings size={20} className="animate-spin-slow" />
          </div>
          Console
        </h1>
        <Button variant="secondary" size="sm" onClick={onLogout} className="text-zinc-500 hover:text-red-400 hover:border-red-500/30">
          <LogOut size={18} />
        </Button>
      </nav>

      <div className="flex-1 flex overflow-hidden relative">
        {/* Sidebar */}
        <aside className="w-72 p-6 hidden md:flex flex-col gap-4 z-10">
          <div className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2 px-4">Navigation</div>
          <button 
            onClick={() => setActiveView('USERS')}
            className={`flex items-center gap-4 px-6 py-4 rounded-[1.5rem] text-sm font-bold transition-all text-left ${activeView === 'USERS' ? 'bg-zinc-900 border border-zinc-800 text-white shadow-lg shadow-black/50' : 'text-zinc-500 hover:bg-zinc-900/50 hover:text-white'}`}
          >
            <Users size={20} /> Profiles
          </button>
          <button 
             onClick={() => setActiveView('DEFAULTS')}
             className={`flex items-center gap-4 px-6 py-4 rounded-[1.5rem] text-sm font-bold transition-all text-left ${activeView === 'DEFAULTS' ? 'bg-zinc-900 border border-zinc-800 text-white shadow-lg shadow-black/50' : 'text-zinc-500 hover:bg-zinc-900/50 hover:text-white'}`}
          >
            <Clock size={20} /> Schedules
          </button>
        </aside>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8 pb-32">
          
          {/* --- USERS VIEW --- */}
          {activeView === 'USERS' && (
            <div className="max-w-6xl mx-auto">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-10 gap-6">
                <div>
                  <h2 className="text-4xl font-black text-white tracking-tight mb-2">Users</h2>
                  <p className="text-zinc-400 font-medium text-lg">Manage group access and individual profiles.</p>
                </div>
                <Button onClick={() => setIsAddingUser(true)} icon={<UserPlus size={20} />} size="lg" variant="gradient">New Profile</Button>
              </div>

              {isAddingUser && (
                <Card className="mb-12 border-white/10 bg-zinc-900/50">
                  <div className="flex items-center justify-between mb-8">
                     <h3 className="text-xl font-bold text-white">Create New Profile</h3>
                     <Button variant="ghost" size="sm" onClick={() => setIsAddingUser(false)}><X size={20}/></Button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                     <div className="flex flex-col gap-3">
                       <label className="text-xs text-zinc-500 font-bold uppercase tracking-wider ml-1">Group Assignment</label>
                       <div className="relative">
                           <select 
                             className="w-full appearance-none bg-black hover:bg-zinc-900 border border-zinc-700 text-white text-base font-bold rounded-xl p-5 focus:border-white focus:outline-none transition-all shadow-inner"
                             value={targetGroupId}
                             onChange={e => setTargetGroupId(e.target.value)}
                           >
                             <option value="">Select Group...</option>
                             <option value="new_group_new">+ Create New Group</option>
                             {store.groups.map((g: UserGroup) => (
                               <option key={g.id} value={g.id}>{g.id}</option>
                             ))}
                           </select>
                           <ChevronRight size={20} className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-500 rotate-90" />
                       </div>
                       {targetGroupId === 'new_group_new' && (
                          <Input 
                            placeholder="Enter New Group ID" 
                            onChange={e => setTargetGroupId(e.target.value + '_new')}
                            className="mt-2"
                          />
                       )}
                     </div>
                     <div className="flex flex-col gap-3">
                        <label className="text-xs text-zinc-500 font-bold uppercase tracking-wider ml-1">Profile Name</label>
                        <Input placeholder="e.g. Alex" value={newProfileName} onChange={e => setNewProfileName(e.target.value)} />
                     </div>
                  </div>
                  <div className="flex justify-end mt-8">
                    <Button onClick={handleAddUser} size="lg" className="w-full sm:w-auto">Confirm Creation</Button>
                  </div>
                </Card>
              )}

              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                {store.groups.map((group: UserGroup) => (
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    key={group.id} 
                    className="bg-zinc-900/40 backdrop-blur-md rounded-[2.5rem] p-8 border border-white/10 shadow-lg hover:shadow-2xl hover:bg-zinc-900/60 transition-all duration-500 group"
                  >
                    <div className="flex items-start justify-between mb-8">
                      <div>
                        <h3 className="text-2xl font-black text-white flex items-center gap-3 mb-2">
                           {group.id}
                        </h3>
                        <span className="inline-block px-3 py-1 rounded-lg bg-zinc-800 text-zinc-400 text-xs font-mono font-bold">
                           PIN: {group.password}
                        </span>
                      </div>
                      <div className="h-12 w-12 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-400 font-bold text-sm border border-zinc-700">
                        {group.profiles.length}
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-4">
                      {group.profiles.map(p => (
                        <div 
                          key={p.id} 
                          className="flex items-center gap-3 bg-black rounded-2xl pl-2 pr-4 py-2 border border-zinc-800 shadow-sm hover:scale-105 hover:border-white/30 transition-all cursor-pointer"
                          onClick={() => setSelectedUserData({ group, profile: p })}
                        >
                          <img src={p.avatar} className="w-10 h-10 rounded-xl bg-zinc-800" />
                          <span className="text-sm text-zinc-200 font-bold">{p.name}</span>
                          <button 
                            onClick={(e) => { e.stopPropagation(); handleDeleteUser(group.id, p.id, p.name); }}
                            className="ml-2 text-zinc-600 hover:text-red-500 transition-colors"
                          >
                             <Trash2 size={16} />
                          </button>
                        </div>
                      ))}
                      <Button variant="ghost" size="sm" className="rounded-2xl border-2 border-dashed border-zinc-700 text-zinc-500 hover:border-white/50 hover:text-white" onClick={() => { setIsAddingUser(true); setTargetGroupId(group.id); }}>
                        <Plus size={18} />
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* --- DEFAULTS VIEW --- */}
          {activeView === 'DEFAULTS' && (
            <div className="max-w-4xl mx-auto">
               <div className="flex items-center justify-between mb-10">
                 <div>
                    <h2 className="text-4xl font-black text-white tracking-tight">Schedule</h2>
                    <p className="text-zinc-400 font-medium text-lg mt-2">Global task definitions.</p>
                 </div>
                 <Button size="lg" onClick={() => setIsAddingTask(!isAddingTask)} icon={<Plus size={20} strokeWidth={3} />} variant="primary">New Task</Button>
               </div>
               
               {isAddingTask && (
                   <Card className="mb-10 border-indigo-500/30 shadow-lg shadow-indigo-500/10">
                       <h3 className="text-lg font-bold text-white mb-6">Define New Task</h3>
                       <div className="flex flex-col sm:flex-row gap-4 items-end">
                           <Input placeholder="Title" value={newTaskTitle} onChange={e => setNewTaskTitle(e.target.value)} />
                           <Input type="time" value={newTaskTime} onChange={e => setNewTaskTime(e.target.value)} className="sm:w-48" />
                           <Button onClick={handleAddDefaultTask} size="lg" className="w-full sm:w-auto">Add</Button>
                       </div>
                   </Card>
               )}

               <div className="space-y-4">
                 {defaults.map((task, i) => (
                   <motion.div 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    key={task.id} 
                    className="bg-zinc-900/50 rounded-[2rem] p-6 border border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-6 shadow-sm hover:shadow-lg hover:border-white/10 transition-all"
                   >
                     <div className="flex items-center gap-5">
                       <div className="w-16 h-16 rounded-2xl bg-zinc-800 flex items-center justify-center text-zinc-500 border border-zinc-700">
                           <Clock size={28} />
                       </div>
                       <div>
                            <h4 className="text-xl font-bold text-white">{task.title}</h4>
                            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider bg-black px-2 py-1 rounded-md border border-zinc-800">ID: {task.id}</span>
                       </div>
                     </div>
                     <div className="flex items-center gap-4 bg-black p-3 pr-6 rounded-2xl border border-zinc-800">
                       <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider ml-3">At</span>
                       <input 
                         type="time" 
                         value={task.defaultTime} 
                         onChange={(e) => handleTimeChange(task.id, e.target.value)}
                         className="bg-transparent border-none text-xl text-white rounded-xl px-4 py-2 focus:outline-none focus:ring-0 font-black w-40 text-center shadow-none"
                         style={{ colorScheme: 'dark' }}
                       />
                     </div>
                   </motion.div>
                 ))}
               </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;