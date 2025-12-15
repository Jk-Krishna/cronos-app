import { useState } from 'react';
import type { ViewState, UserGroup } from './types';
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
    <div className="min-h-screen h-[100dvh] bg-black text-white font-sans overflow-hidden relative selection:bg-fuchsia-500/30 selection:text-fuchsia-200">
      
      {/* Playful Doodles Background - Low Opacity */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none select-none opacity-10">
        {/* Circle Top Left */}
        <svg className="absolute top-[10%] left-[5%] w-64 h-64 animate-float" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
           <circle cx="50" cy="50" r="40" stroke="white" strokeWidth="0.5" fill="none" />
           <circle cx="50" cy="50" r="30" stroke="white" strokeWidth="0.2" fill="none" strokeDasharray="4 4" />
        </svg>

        {/* Squiggle Top Right */}
        <svg className="absolute top-[15%] right-[10%] w-96 h-96 animate-float" style={{animationDelay: '1s'}} viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
          <path d="M10,100 C50,0 150,0 190,100 S50,200 10,100" stroke="white" strokeWidth="0.5" fill="none" />
          <path d="M20,100 C60,20 140,20 180,100 S60,180 20,100" stroke="white" strokeWidth="0.2" fill="none" />
        </svg>

        {/* Triangle Bottom Left */}
        <svg className="absolute bottom-[10%] left-[10%] w-72 h-72 animate-float" style={{animationDelay: '2s'}} viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
          <polygon points="50,15 90,85 10,85" stroke="white" strokeWidth="0.5" fill="none" />
        </svg>

        {/* Hexagon Bottom Right */}
        <svg className="absolute bottom-[20%] right-[5%] w-56 h-56 animate-float" style={{animationDelay: '3s'}} viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
          <path d="M50 10 L90 30 L90 70 L50 90 L10 70 L10 30 Z" stroke="white" strokeWidth="0.5" fill="none" />
        </svg>
        
        {/* Random Dots */}
        <div className="absolute top-1/2 left-1/3 w-2 h-2 bg-white rounded-full opacity-50"></div>
        <div className="absolute top-1/4 right-1/4 w-3 h-3 bg-white rounded-full opacity-30"></div>
        <div className="absolute bottom-1/3 right-1/2 w-1.5 h-1.5 bg-white rounded-full opacity-60"></div>
      </div>

      {/* Radial Gradient Overlays for "Glossy" feel */}
      <div className="absolute top-[-20%] left-[20%] w-[600px] h-[600px] bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-fuchsia-500/10 rounded-full blur-[100px] pointer-events-none" />


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