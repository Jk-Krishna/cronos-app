import { useState } from 'react';
import type { ViewState, UserGroup } from './types.ts';
import Login from './views/Login';
import UserHome from './views/UserHome';
import AdminDashboard from './views/AdminDashboard';
import { store } from './services/store';

export default function App() {
  const [view, setView] = useState<ViewState>('LOGIN');
  const [activeGroup, setActiveGroup] = useState<UserGroup | null>(null);

  const handleLoginSuccess = (group: UserGroup) => {
    setActiveGroup(group);
    setView('USER_HOME');
  };

  const handleAdminLoginSuccess = () => {
    setView('ADMIN_DASHBOARD');
  };

  const handleLogout = () => {
    setActiveGroup(null);
    setView('LOGIN');
  };

  return (
    <div className="min-h-screen h-[100dvh] bg-background text-slate-100 font-sans overflow-hidden relative selection:bg-primary selection:text-white">
      {/* Background Ambience */}
      <div className="fixed top-[-20%] left-[-10%] w-[300px] sm:w-[500px] h-[300px] sm:h-[500px] bg-primary/10 rounded-full blur-[80px] sm:blur-[120px] pointer-events-none" />
      <div className="fixed bottom-[-20%] right-[-10%] w-[300px] sm:w-[600px] h-[300px] sm:h-[600px] bg-accent/5 rounded-full blur-[80px] sm:blur-[120px] pointer-events-none" />

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

        {view === 'USER_HOME' && activeGroup && (
          <UserHome 
            group={activeGroup} 
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