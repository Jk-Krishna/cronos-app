import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { LogOut, UserPlus, Clock, Users, ChevronRight, Plus, X, Trash2 } from 'lucide-react';
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
  
  // Add User State
  const [isAddingUser, setIsAddingUser] = useState(false);
  const [isExistingGroup, setIsExistingGroup] = useState<boolean | null>(null); // null = not selected yet
  
  const [targetGroupId, setTargetGroupId] = useState('');
  const [newGroupPassword, setNewGroupPassword] = useState('');
  const [newProfileName, setNewProfileName] = useState('');

  // Default Tasks State
  const [defaults, setDefaults] = useState(DEFAULT_TASKS);
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskTime, setNewTaskTime] = useState('');

  const handleCreateUser = () => {
    if (!newProfileName) {
        alert("Please enter a name");
        return;
    }

    if (isExistingGroup) {
        if (!targetGroupId) {
             alert("Please select a group ID");
             return;
        }
        store.addProfileToGroup(targetGroupId, newProfileName);
    } else {
        if (!targetGroupId || !newGroupPassword) {
            alert("Please fill in Group ID and Password");
            return;
        }
        const success = store.addGroup(targetGroupId, newGroupPassword, newProfileName);
        if (!success) {
            alert("Group ID already exists");
            return;
        }
    }

    // Reset Form
    setIsAddingUser(false);
    setIsExistingGroup(null);
    setTargetGroupId('');
    setNewGroupPassword('');
    setNewProfileName('');
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
      <nav className="px-6 py-6 flex items-center justify-between z-20 flex-shrink-0">
        <h1 className="text-xl font-black text-white tracking-tighter">Console.</h1>
        <Button variant="ghost" size="sm" onClick={onLogout} className="text-zinc-500 hover:text-white">
          <LogOut size={20} />
        </Button>
      </nav>

      <div className="flex-1 flex overflow-hidden">
        {/* Minimal Sidebar */}
        <aside className="w-64 p-6 hidden md:flex flex-col gap-1 z-10">
          <button 
            onClick={() => setActiveView('USERS')}
            className={`flex items-center gap-3 px-4 py-3 rounded-full text-sm font-bold transition-all ${activeView === 'USERS' ? 'bg-white text-black' : 'text-zinc-500 hover:text-white'}`}
          >
            <Users size={18} /> Profiles
          </button>
          <button 
             onClick={() => setActiveView('DEFAULTS')}
             className={`flex items-center gap-3 px-4 py-3 rounded-full text-sm font-bold transition-all ${activeView === 'DEFAULTS' ? 'bg-white text-black' : 'text-zinc-500 hover:text-white'}`}
          >
            <Clock size={18} /> Schedules
          </button>
        </aside>

        <main className="flex-1 overflow-y-auto p-4 sm:p-8 pb-32">
          {activeView === 'USERS' && (
            <div className="max-w-5xl mx-auto">
              <div className="flex justify-between items-center mb-10">
                <h2 className="text-3xl font-black text-white">Users</h2>
                <Button onClick={() => setIsAddingUser(true)} icon={<UserPlus size={18} />} size="md" variant="primary">New</Button>
              </div>

              {isAddingUser && (
                <Card className="mb-12 bg-zinc-900/80 border border-zinc-700">
                  <div className="flex items-center justify-between mb-6">
                     <h3 className="text-xl font-bold text-white">Create User</h3>
                     <Button variant="ghost" size="sm" onClick={() => { setIsAddingUser(false); setIsExistingGroup(null); }}><X size={20}/></Button>
                  </div>
                  
                  <div className="space-y-8">
                      {/* Step 1: Existing Group Toggle */}
                      <div className="flex flex-col gap-3">
                          <label className="text-xs text-zinc-500 font-bold uppercase tracking-wider ml-1">Existing User ID?</label>
                          <div className="flex gap-4">
                              <button 
                                onClick={() => { setIsExistingGroup(true); setTargetGroupId(''); }}
                                className={`flex-1 py-3 rounded-xl border text-sm font-bold transition-all ${isExistingGroup === true ? 'bg-white text-black border-white' : 'bg-transparent text-zinc-500 border-zinc-700 hover:border-zinc-500'}`}
                              >
                                YES
                              </button>
                              <button 
                                onClick={() => { setIsExistingGroup(false); setTargetGroupId(''); }}
                                className={`flex-1 py-3 rounded-xl border text-sm font-bold transition-all ${isExistingGroup === false ? 'bg-white text-black border-white' : 'bg-transparent text-zinc-500 border-zinc-700 hover:border-zinc-500'}`}
                              >
                                NO
                              </button>
                          </div>
                      </div>

                      {/* Step 2: Dynamic Fields based on selection */}
                      {isExistingGroup === true && (
                          <div className="space-y-6 animate-in fade-in slide-in-from-top-4">
                               <div className="flex flex-col gap-2">
                                   <label className="text-xs text-zinc-500 font-bold uppercase tracking-wider ml-1">Select User ID</label>
                                   <div className="relative">
                                       <select 
                                         className="w-full appearance-none bg-black border border-zinc-700 text-white text-base font-bold rounded-2xl p-4 focus:border-white focus:outline-none transition-colors"
                                         value={targetGroupId}
                                         onChange={e => setTargetGroupId(e.target.value)}
                                       >
                                         <option value="">Select...</option>
                                         {store.groups.map((g: UserGroup) => (
                                           <option key={g.id} value={g.id}>{g.id}</option>
                                         ))}
                                       </select>
                                       <ChevronRight size={20} className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-500 rotate-90" />
                                   </div>
                               </div>
                               <Input label="Enter Name" placeholder="e.g. Alex" value={newProfileName} onChange={e => setNewProfileName(e.target.value)} />
                               <div className="flex justify-end pt-2">
                                  <Button onClick={handleCreateUser} size="lg">Create User</Button>
                               </div>
                          </div>
                      )}

                      {isExistingGroup === false && (
                          <div className="space-y-6 animate-in fade-in slide-in-from-top-4">
                              <Input label="Enter New User ID" placeholder="e.g. family_smith" value={targetGroupId} onChange={e => setTargetGroupId(e.target.value)} />
                              <Input label="Set Password" type="password" placeholder="••••••" value={newGroupPassword} onChange={e => setNewGroupPassword(e.target.value)} />
                              <Input label="Enter Name" placeholder="e.g. John" value={newProfileName} onChange={e => setNewProfileName(e.target.value)} />
                              <div className="flex justify-end pt-2">
                                  <Button onClick={handleCreateUser} size="lg">Create User</Button>
                               </div>
                          </div>
                      )}
                  </div>
                </Card>
              )}

              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                {store.groups.map((group: UserGroup) => (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    key={group.id} 
                    className="bg-zinc-900 rounded-[2.5rem] p-8 border border-zinc-800"
                  >
                    <div className="flex items-start justify-between mb-8">
                      <div>
                        <h3 className="text-2xl font-black text-white mb-1">{group.id}</h3>
                        <div className="text-zinc-500 font-mono text-xs">PIN: {group.password}</div>
                      </div>
                      <div className="h-10 w-10 rounded-full bg-zinc-800 flex items-center justify-center text-white font-bold text-sm">
                        {group.profiles.length}
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-3">
                      {group.profiles.map(p => (
                        <div 
                          key={p.id} 
                          className="flex items-center gap-3 bg-black rounded-full pl-2 pr-4 py-2 border border-zinc-800 cursor-pointer hover:border-zinc-600 transition-colors"
                          onClick={() => setSelectedUserData({ group, profile: p })}
                        >
                          <img src={p.avatar} className="w-8 h-8 rounded-full bg-zinc-800" />
                          <span className="text-sm text-white font-bold">{p.name}</span>
                          <button 
                            onClick={(e) => { e.stopPropagation(); handleDeleteUser(group.id, p.id, p.name); }}
                            className="ml-1 text-zinc-600 hover:text-red-500"
                          >
                             <Trash2 size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {activeView === 'DEFAULTS' && (
            <div className="max-w-4xl mx-auto">
               <div className="flex items-center justify-between mb-10">
                 <h2 className="text-3xl font-black text-white">Defaults</h2>
                 <Button onClick={() => setIsAddingTask(!isAddingTask)} icon={<Plus size={18} />} variant="primary">New</Button>
               </div>
               
               {isAddingTask && (
                   <Card className="mb-10">
                       <div className="flex flex-col sm:flex-row gap-4 items-end">
                           <Input placeholder="Title" value={newTaskTitle} onChange={e => setNewTaskTitle(e.target.value)} />
                           <Input type="time" value={newTaskTime} onChange={e => setNewTaskTime(e.target.value)} className="sm:w-48" />
                           <Button onClick={handleAddDefaultTask} size="lg">Add</Button>
                       </div>
                   </Card>
               )}

               <div className="space-y-3">
                 {defaults.map((task) => (
                   <div key={task.id} className="bg-zinc-900 rounded-3xl p-6 flex items-center justify-between">
                     <div className="flex items-center gap-4">
                       <div className="w-12 h-12 rounded-2xl bg-zinc-800 flex items-center justify-center text-zinc-500">
                           <Clock size={20} />
                       </div>
                       <h4 className="text-lg font-bold text-white">{task.title}</h4>
                     </div>
                     <input 
                       type="time" 
                       value={task.defaultTime} 
                       onChange={(e) => handleTimeChange(task.id, e.target.value)}
                       className="bg-black text-white rounded-xl px-4 py-3 font-bold text-lg outline-none border border-zinc-800 focus:border-white"
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