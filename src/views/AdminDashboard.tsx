import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LogOut, UserPlus, Clock, Users, Plus, X } from 'lucide-react';
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
  const [selectedUserData, setSelectedUserData] = useState<{group: UserGroup, profile: UserProfile} | null>(null);
  
  // User Management State
  const [isAddingUser, setIsAddingUser] = useState(false);
  const [isExistingGroup, setIsExistingGroup] = useState<boolean | null>(null); // Explicit toggle
  const [targetGroupId, setTargetGroupId] = useState('');
  const [newGroupPassword, setNewGroupPassword] = useState('');
  const [newProfileName, setNewProfileName] = useState('');

  // Defaults State
  const [defaults, setDefaults] = useState(DEFAULT_TASKS);
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskTime, setNewTaskTime] = useState('');

  const handleCreateUser = () => {
    if (!newProfileName) { alert("Enter a name"); return; }
    
    if (isExistingGroup === true) {
      if (!targetGroupId) { alert("Select a User ID"); return; }
      store.addProfileToGroup(targetGroupId, newProfileName);
    } else {
      if (!targetGroupId || !newGroupPassword) { alert("Provide ID and Key"); return; }
      const success = store.addGroup(targetGroupId, newGroupPassword, newProfileName);
      if (!success) { alert("This ID is already taken"); return; }
    }
    
    // Reset
    setIsAddingUser(false);
    setIsExistingGroup(null);
    setTargetGroupId('');
    setNewGroupPassword('');
    setNewProfileName('');
  };

  const handleAdminAddTask = (title: string, time: string) => {
    if (selectedUserData) {
      store.addTaskToProfile(selectedUserData.group.id, selectedUserData.profile.id, title, time);
      const updatedGroup = store.getGroup(selectedUserData.group.id);
      const updatedProfile = updatedGroup?.profiles.find((p: UserProfile) => p.id === selectedUserData.profile.id);
      if (updatedGroup && updatedProfile) setSelectedUserData({ group: updatedGroup, profile: updatedProfile });
    }
  };
  
  const handleAdminDeleteTask = (taskId: string) => {
    if (selectedUserData) {
      store.deleteTaskFromProfile(selectedUserData.group.id, selectedUserData.profile.id, taskId);
      const updatedGroup = store.getGroup(selectedUserData.group.id);
      const updatedProfile = updatedGroup?.profiles.find((p: UserProfile) => p.id === selectedUserData.profile.id);
      if (updatedGroup && updatedProfile) setSelectedUserData({ group: updatedGroup, profile: updatedProfile });
    }
  };

  const MDiv = motion.div as any;

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
      <nav className="px-6 py-6 flex items-center justify-between z-20 flex-shrink-0">
        <h1 className="text-xl font-black text-white tracking-tighter uppercase">Console.</h1>
        <Button variant="ghost" size="sm" onClick={onLogout} className="text-zinc-500 hover:text-white">
          <LogOut size={20} />
        </Button>
      </nav>

      <div className="flex-1 flex overflow-hidden">
        <aside className="w-64 p-6 hidden md:flex flex-col gap-1 z-10 border-r border-zinc-900">
          <button 
            onClick={() => setActiveView('USERS')} 
            className={`flex items-center gap-3 px-6 py-4 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${activeView === 'USERS' ? 'bg-white text-black' : 'text-zinc-600 hover:text-white'}`}
          >
            <Users size={14} /> Profiles
          </button>
          <button 
            onClick={() => setActiveView('DEFAULTS')} 
            className={`flex items-center gap-3 px-6 py-4 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${activeView === 'DEFAULTS' ? 'bg-white text-black' : 'text-zinc-600 hover:text-white'}`}
          >
            <Clock size={14} /> Routine
          </button>
        </aside>

        <main className="flex-1 overflow-y-auto p-4 sm:p-8 pb-32 no-scrollbar">
          {activeView === 'USERS' && (
            <div className="max-w-5xl mx-auto">
              <div className="flex justify-between items-center mb-10">
                <h2 className="text-3xl font-black text-white">Clients</h2>
                <Button onClick={() => setIsAddingUser(true)} icon={<UserPlus size={18} />} size="md" variant="primary">New Client</Button>
              </div>

              <AnimatePresence>
                {isAddingUser && (
                  <Card className="mb-12 bg-zinc-950 border border-zinc-800 shadow-2xl relative">
                    <button onClick={() => { setIsAddingUser(false); setIsExistingGroup(null); }} className="absolute top-8 right-8 text-zinc-600 hover:text-white"><X size={20} /></button>
                    <h3 className="text-xl font-black text-white mb-8 uppercase tracking-tighter">New Assignment</h3>
                    
                    <div className="space-y-8">
                      <div>
                        <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest block mb-4">Existing User ID?</label>
                        <div className="flex gap-4">
                          <button 
                            onClick={() => setIsExistingGroup(true)} 
                            className={`flex-1 py-4 rounded-3xl font-black text-[10px] tracking-widest transition-all border ${isExistingGroup === true ? 'bg-white text-black border-white shadow-lg' : 'bg-transparent text-zinc-600 border-zinc-800 hover:border-zinc-700'}`}
                          >
                            YES
                          </button>
                          <button 
                            onClick={() => setIsExistingGroup(false)} 
                            className={`flex-1 py-4 rounded-3xl font-black text-[10px] tracking-widest transition-all border ${isExistingGroup === false ? 'bg-white text-black border-white shadow-lg' : 'bg-transparent text-zinc-600 border-zinc-800 hover:border-zinc-700'}`}
                          >
                            NO
                          </button>
                        </div>
                      </div>

                      <AnimatePresence mode="wait">
                        {isExistingGroup !== null && (
                          <MDiv initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
                            {isExistingGroup ? (
                              <div className="flex flex-col gap-2">
                                <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest ml-1">Select Group ID</label>
                                <select 
                                  className="w-full bg-zinc-900 border-2 border-transparent focus:border-white text-white px-6 py-4 text-sm rounded-3xl outline-none transition-colors appearance-none" 
                                  value={targetGroupId} 
                                  onChange={e => setTargetGroupId(e.target.value)}
                                >
                                  <option value="">Choose ID...</option>
                                  {store.groups.map((g: UserGroup) => <option key={g.id} value={g.id}>{g.id}</option>)}
                                </select>
                              </div>
                            ) : (
                              <>
                                <Input label="New User ID" placeholder="e.g. smith_fam" value={targetGroupId} onChange={e => setTargetGroupId(e.target.value)} />
                                <Input label="Set Secret Key" type="password" placeholder="••••" value={newGroupPassword} onChange={e => setNewGroupPassword(e.target.value)} />
                              </>
                            )}
                            <Input label="Enter Name" placeholder="e.g. Alice" value={newProfileName} onChange={e => setNewProfileName(e.target.value)} />
                            <Button onClick={handleCreateUser} className="w-full mt-4" size="lg">Create User</Button>
                          </MDiv>
                        )}
                      </AnimatePresence>
                    </div>
                  </Card>
                )}
              </AnimatePresence>

              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                {store.groups.map((group: UserGroup) => (
                  <MDiv key={group.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-zinc-900/50 rounded-[3rem] p-10 border border-zinc-800/50 hover:border-zinc-700 transition-all">
                    <div className="flex items-start justify-between mb-8">
                      <div>
                        <h3 className="text-2xl font-black text-white mb-1 uppercase tracking-tighter">{group.id}</h3>
                        <div className="text-zinc-600 font-mono text-[10px] uppercase tracking-widest">Key: {group.password}</div>
                      </div>
                      <div className="h-10 w-10 rounded-full bg-zinc-800 flex items-center justify-center text-white font-black text-xs">{group.profiles.length}</div>
                    </div>
                    <div className="flex flex-wrap gap-3">
                      {group.profiles.map(p => (
                        <div 
                          key={p.id} 
                          className="flex items-center gap-3 bg-black rounded-full pl-2 pr-5 py-2 border border-zinc-800 cursor-pointer hover:border-white transition-all group" 
                          onClick={() => setSelectedUserData({ group, profile: p })}
                        >
                          <img src={p.avatar} className="w-8 h-8 rounded-full bg-zinc-800" alt={p.name} />
                          <span className="text-[11px] font-black uppercase tracking-widest text-zinc-500 group-hover:text-white">{p.name}</span>
                        </div>
                      ))}
                    </div>
                  </MDiv>
                ))}
              </div>
            </div>
          )}

          {activeView === 'DEFAULTS' && (
            <div className="max-w-4xl mx-auto">
               <div className="flex items-center justify-between mb-10">
                 <h2 className="text-3xl font-black text-white">Daily Routine</h2>
                 <Button onClick={() => setIsAddingTask(!isAddingTask)} icon={<Plus size={18} />} variant="primary">New Schedule</Button>
               </div>
               {isAddingTask && (
                   <Card className="mb-10">
                     <div className="flex flex-col sm:flex-row gap-4 items-end">
                       <Input placeholder="Title" value={newTaskTitle} onChange={e => setNewTaskTitle(e.target.value)} />
                       <Input type="time" value={newTaskTime} onChange={e => setNewTaskTime(e.target.value)} className="sm:w-48" />
                       <Button onClick={() => { store.addDefaultTask(newTaskTitle, newTaskTime); setDefaults([...DEFAULT_TASKS]); setIsAddingTask(false); }} size="lg">Add</Button>
                     </div>
                   </Card>
               )}
               <div className="space-y-4">
                 {defaults.map((task) => (
                   <div key={task.id} className="bg-zinc-900 rounded-[2rem] p-8 flex items-center justify-between border border-zinc-800/30">
                     <div className="flex items-center gap-6">
                       <div className="w-14 h-14 rounded-2xl bg-zinc-800 flex items-center justify-center text-zinc-500"><Clock size={24} /></div>
                       <h4 className="text-xl font-black text-white">{task.title}</h4>
                     </div>
                     <input 
                       type="time" 
                       value={task.defaultTime} 
                       onChange={(e) => { store.updateDefaultTaskTime(task.id, e.target.value); setDefaults([...DEFAULT_TASKS]); }} 
                       className="bg-black text-white rounded-2xl px-6 py-4 font-black text-xl outline-none border border-zinc-800 focus:border-white shadow-inner" 
                       style={{ colorScheme: 'dark' }} 
                     />
                   </div>
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