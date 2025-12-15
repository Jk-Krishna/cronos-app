import React, { useState } from 'react';
import { LogOut, UserPlus, Clock, Users, Plus, Trash2 } from 'lucide-react';
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
  const [selectedProfile, setSelectedProfile] = useState<UserProfile | null>(null);
  
  // Add User State
  const [isAddingUser, setIsAddingUser] = useState(false);
  const [targetGroupId, setTargetGroupId] = useState('');
  const [newProfileName, setNewProfileName] = useState('');

  // Add Task State
  const [defaults, setDefaults] = useState(DEFAULT_TASKS);
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskTime, setNewTaskTime] = useState('');

  // --- Handlers ---

  const handleAddUser = () => {
    if(!targetGroupId || !newProfileName) return;
    
    if (targetGroupId.endsWith('_new')) {
        const cleanId = targetGroupId.replace('_new', '');
        const success = store.addGroup(cleanId, '1234'); 
        if(success) {
             store.addProfileToGroup(cleanId, newProfileName);
             alert(`Created Group ${cleanId} with User ${newProfileName} (Pass: 1234)`);
        } else {
             alert('User ID already exists');
        }
    } else {
        store.addProfileToGroup(targetGroupId, newProfileName);
        alert(`Added ${newProfileName} to ${targetGroupId}`);
    }
    setIsAddingUser(false);
    setNewProfileName('');
    setTargetGroupId('');
  };

  const handleDeleteUser = (groupId: string, profileId: string, profileName: string) => {
    if (window.confirm(`Are you sure you want to remove ${profileName} from group ${groupId}?`)) {
        store.deleteProfileFromGroup(groupId, profileId);
        // Force re-render by creating a shallow copy (simplified for this mock)
        setActiveView(prev => prev); 
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

  // --- Render ---

  if (selectedProfile) {
    return (
      <AdminAnalytics 
        client={selectedProfile} 
        onBack={() => setSelectedProfile(null)} 
      />
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-background overflow-hidden">
      {/* Navbar */}
      <nav className="bg-surface/80 backdrop-blur-md border-b border-white/5 px-4 sm:px-6 py-3 flex items-center justify-between z-20 flex-shrink-0">
        <h1 className="text-sm font-bold text-white tracking-wide flex items-center gap-2">
          <div className="w-6 h-6 bg-rose-500 rounded flex items-center justify-center text-[10px]">AD</div>
          Admin Console
        </h1>
        <Button variant="ghost" size="sm" onClick={onLogout} className="text-slate-400 hover:text-white -mr-2">
          <LogOut size={18} />
        </Button>
      </nav>

      <div className="flex-1 flex overflow-hidden relative">
        {/* Desktop Sidebar */}
        <aside className="w-64 bg-surface/30 border-r border-white/5 p-4 hidden md:flex flex-col gap-2">
          <button 
            onClick={() => setActiveView('USERS')}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${activeView === 'USERS' ? 'bg-primary text-white' : 'text-slate-400 hover:bg-white/5'}`}
          >
            <Users size={18} /> User Management
          </button>
          <button 
             onClick={() => setActiveView('DEFAULTS')}
             className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${activeView === 'DEFAULTS' ? 'bg-primary text-white' : 'text-slate-400 hover:bg-white/5'}`}
          >
            <Clock size={18} /> Default Tasks
          </button>
        </aside>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-10 pb-20 md:pb-10">
          
          {/* --- USERS VIEW --- */}
          {activeView === 'USERS' && (
            <div className="max-w-5xl mx-auto">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 sm:mb-8 gap-4">
                <div>
                  <h2 className="text-2xl font-bold text-white">Users & Groups</h2>
                  <p className="text-slate-400 text-sm">Manage user accounts and profiles.</p>
                </div>
                <Button onClick={() => setIsAddingUser(true)} icon={<UserPlus size={16} />} className="w-full sm:w-auto">Add User</Button>
              </div>

              {isAddingUser && (
                <Card className="mb-8 border-primary/30">
                  <h3 className="font-bold text-white mb-4">Add Profile</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <div className="flex flex-col gap-2">
                       <label className="text-xs text-slate-400">Target Group</label>
                       <select 
                         className="bg-surface border border-slate-700 text-white text-sm rounded-lg p-3 focus:border-primary focus:outline-none"
                         value={targetGroupId}
                         onChange={e => setTargetGroupId(e.target.value)}
                       >
                         <option value="">Select or Create Group...</option>
                         <option value="new_group_new">+ Create New Group ID</option>
                         {store.groups.map((g: UserGroup) => (
                           <option key={g.id} value={g.id}>{g.id} ({g.profiles.length} profiles)</option>
                         ))}
                       </select>
                       {targetGroupId === 'new_group_new' && (
                          <Input 
                            placeholder="Enter New Group ID" 
                            onChange={e => setTargetGroupId(e.target.value + '_new')}
                            className="mt-2"
                          />
                       )}
                     </div>
                     <div className="flex flex-col gap-2">
                        <label className="text-xs text-slate-400">Profile Name</label>
                        <Input placeholder="e.g. John" value={newProfileName} onChange={e => setNewProfileName(e.target.value)} />
                     </div>
                  </div>
                  <div className="flex flex-col sm:flex-row justify-end gap-2 mt-6">
                    <Button variant="ghost" onClick={() => setIsAddingUser(false)} className="w-full sm:w-auto">Cancel</Button>
                    <Button onClick={handleAddUser} className="w-full sm:w-auto">Save Changes</Button>
                  </div>
                </Card>
              )}

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {store.groups.map((group: UserGroup) => (
                  <Card key={group.id} className="hover:bg-surface/50 transition-colors">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-bold text-white flex items-center gap-2 truncate">
                           <span className="truncate max-w-[120px] sm:max-w-[200px]">{group.id}</span>
                           <span className="text-xs bg-slate-700 px-2 py-0.5 rounded text-slate-300 font-normal shrink-0">Pass: {group.password}</span>
                        </h3>
                      </div>
                      <span className="text-xs text-slate-500 shrink-0">{group.profiles.length} Profiles</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {group.profiles.map(p => (
                        <div 
                          key={p.id} 
                          className="group flex items-center gap-2 bg-slate-800 rounded-full pl-2 pr-2 py-1.5 border border-slate-700 hover:border-primary transition-all active:scale-95"
                        >
                          <button onClick={() => setSelectedProfile(p)} className="flex items-center gap-2">
                              <img src={p.avatar} className="w-6 h-6 rounded-full" />
                              <span className="text-sm text-slate-200">{p.name}</span>
                          </button>
                          
                          <div className="w-px h-3 bg-slate-600 mx-1"></div>
                          
                          <button 
                            onClick={(e) => { e.stopPropagation(); handleDeleteUser(group.id, p.id, p.name); }}
                            className="text-slate-500 hover:text-rose-500 p-0.5 rounded-full hover:bg-rose-500/10 transition-colors"
                            title="Delete User"
                          >
                             <Trash2 size={12} />
                          </button>
                        </div>
                      ))}
                      {group.profiles.length === 0 && <span className="text-xs text-slate-600 italic">No profiles</span>}
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* --- DEFAULTS VIEW --- */}
          {activeView === 'DEFAULTS' && (
            <div className="max-w-2xl mx-auto">
               <div className="flex items-center justify-between mb-2">
                 <h2 className="text-2xl font-bold text-white">Global Default Tasks</h2>
                 <Button size="sm" onClick={() => setIsAddingTask(!isAddingTask)} icon={<Plus size={14}/>}>New Task</Button>
               </div>
               <p className="text-slate-400 text-sm mb-8">Set the mandatory schedule for all users.</p>
               
               {isAddingTask && (
                   <Card className="mb-6 border-primary/30">
                       <h3 className="text-sm font-bold text-white mb-4">Create New Default Task</h3>
                       <div className="flex flex-col sm:flex-row gap-4 items-end">
                           <Input placeholder="Task Title (e.g. Lunch)" value={newTaskTitle} onChange={e => setNewTaskTitle(e.target.value)} />
                           <Input type="time" value={newTaskTime} onChange={e => setNewTaskTime(e.target.value)} className="sm:w-32" />
                           <Button onClick={handleAddDefaultTask} className="w-full sm:w-auto">Add</Button>
                       </div>
                   </Card>
               )}

               <div className="space-y-4">
                 {defaults.map(task => (
                   <Card key={task.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 gap-4">
                     <div>
                       <h4 className="text-base font-semibold text-white">{task.title}</h4>
                       <span className="text-xs text-slate-500 bg-slate-800 px-2 py-0.5 rounded">Default ID: {task.id}</span>
                     </div>
                     <div className="flex items-center gap-2 bg-surface/50 p-2 rounded-lg border border-slate-700">
                       <label className="text-xs text-slate-400">Scheduled:</label>
                       <input 
                         type="time" 
                         value={task.defaultTime} 
                         onChange={(e) => handleTimeChange(task.id, e.target.value)}
                         className="bg-transparent text-sm text-white focus:outline-none font-mono"
                       />
                     </div>
                   </Card>
                 ))}
               </div>
            </div>
          )}
        </main>
        
        {/* Mobile Bottom Nav */}
        <div className="md:hidden absolute bottom-0 left-0 right-0 bg-surface border-t border-white/5 p-2 grid grid-cols-2 gap-2 z-30 pb-safe">
           <button 
            onClick={() => setActiveView('USERS')}
            className={`flex flex-col items-center justify-center p-2 rounded-lg text-xs font-medium ${activeView === 'USERS' ? 'text-primary bg-white/5' : 'text-slate-400'}`}
          >
            <Users size={20} className="mb-1" /> Users
          </button>
           <button 
            onClick={() => setActiveView('DEFAULTS')}
            className={`flex flex-col items-center justify-center p-2 rounded-lg text-xs font-medium ${activeView === 'DEFAULTS' ? 'text-primary bg-white/5' : 'text-slate-400'}`}
          >
            <Clock size={20} className="mb-1" /> Defaults
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;