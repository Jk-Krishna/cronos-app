import { useState } from 'react';
import type { ViewState, UserGroup } from './types';
import Login from './views/Login';
import UserHome from './views/UserHome';
import ProfileSelect from './views/ProfileSelect';
import AdminDashboard from './views/AdminDashboard';
import { store } from './services/store';

export default function App() {
  const [view, setView] = useState<ViewState>('LOGIN');
  const [activeGroup, setActiveGroup] = useState<UserGroup | null>(null);
  const [currentUserProfileId, setCurrentUserProfileId] = useState<string>('');

  const handleLoginSuccess = (group: UserGroup) => {
    setActiveGroup(group);
    setView('PROFILE_SELECT');
  };

  const handleProfileSelected = (profileId: string) => {
    setCurrentUserProfileId(profileId);
    setView('USER_HOME');
  };

  const handleAddProfile = (name: string) => {
    if (activeGroup) {
        store.addProfileToGroup(activeGroup.id, name);
        // Force refresh group data from store
        const updatedGroup = store.getGroup(activeGroup.id);
        if (updatedGroup) {
            setActiveGroup({...updatedGroup});
        }
    }
  };

  const handleAdminLoginSuccess = () => {
    setView('ADMIN_DASHBOARD');
  };

  const handleLogout = () => {
    setActiveGroup(null);
    setCurrentUserProfileId('');
    setView('LOGIN');
  };

  const handleSwitchProfile = () => {
      setCurrentUserProfileId('');
      setView('PROFILE_SELECT');
  }

  return (
    <div className="min-h-screen h-[100dvh] bg-black text-white font-sans overflow-hidden relative selection:bg-indigo-500/30 selection:text-indigo-200">
      
      {/* Minimal Background - Barely Visible Outlines */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none select-none opacity-[0.03]">
        <svg className="absolute top-[5%] left-[5%] w-96 h-96 animate-float" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
           <circle cx="50" cy="50" r="45" stroke="white" strokeWidth="0.5" fill="none" />
        </svg>
        <svg className="absolute bottom-[5%] right-[5%] w-[30rem] h-[30rem] animate-float" style={{animationDelay: '2s'}} viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
           <rect x="20" y="20" width="60" height="60" rx="20" stroke="white" strokeWidth="0.5" fill="none" transform="rotate(15 50 50)"/>
        </svg>
      </div>

      <main className="relative z-10 w-full h-full flex flex-col">
        {view === 'LOGIN' && (
          <Login 
            mode="USER"
            onLogin={handleLoginSuccess}
            onAdminClick={() => setView('ADMIN_LOGIN')}
            store={store}
          />
        )}

        {view === 'ADMIN_LOGIN' && (
          <Login 
            mode="ADMIN"
            onLogin={handleAdminLoginSuccess}
            onBack={() => setView('LOGIN')}
            store={store}
          />
        )}

        {view === 'PROFILE_SELECT' && activeGroup && (
          <ProfileSelect 
            group={activeGroup} 
            onSelect={handleProfileSelected}
            onAddProfile={handleAddProfile}
            onLogout={handleLogout}
          />
        )}

        {view === 'USER_HOME' && activeGroup && currentUserProfileId && (
          <UserHome 
            group={activeGroup} 
            currentUserId={currentUserProfileId}
            onSwitchProfile={handleSwitchProfile}
            onLogout={handleLogout}
          />
        )}

        {view === 'ADMIN_DASHBOARD' && (
          <AdminDashboard 
            store={store}
            onLogout={handleLogout}
          />
        )}
      </main>
    </div>
  );
}