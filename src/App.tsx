import { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import type { ViewState, UserRole, Client, Task } from './types.ts';
import { initialClients, initialTasks } from './services/store';
import Home from './views/Home';
import Login from './views/Login';
import ClientDashboard from './views/ClientDashboard';
import AdminDashboard from './views/AdminDashboard';
import AdminAnalytics from './views/AdminAnalytics';

export default function App() {
  const [view, setView] = useState<ViewState>('HOME');
  const [currentUser, setCurrentUser] = useState<Client | null>(null);
  const [selectedClientForAdmin, setSelectedClientForAdmin] = useState<Client | null>(null);
  
  // App-wide State (In a real app, this would be Redux/Context)
  const [clients, _setClients] = useState<Client[]>(initialClients);
  const [tasks, setTasks] = useState<Task[]>(initialTasks);

  // Simple Notification System
  const [notification, setNotification] = useState<string | null>(null);

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 4000);
  };

  // Navigation Handlers
  const handleLogin = (role: UserRole, user?: Client) => {
    if (role === 'CLIENT' && user) {
      setCurrentUser(user);
      setView('CLIENT_DASHBOARD');
    } else if (role === 'ADMIN') {
      setView('ADMIN_DASHBOARD');
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setSelectedClientForAdmin(null);
    setView('HOME');
  };

  const updateTaskStatus = (taskId: string, status: 'COMPLETED' | 'PENDING' | 'MISSED', timestamp?: string) => {
    setTasks(prev => prev.map(t => {
      if (t.id === taskId) {
        return { ...t, status, completedAt: timestamp || undefined };
      }
      return t;
    }));
  };

  const postponeTask = (taskId: string) => {
    setTasks(prev => prev.map(t => {
      if (t.id === taskId) {
        // Logic: Add 30 mins, but check if it crosses midnight (simplified here)
        const [hours, mins] = t.time.split(':').map(Number);
        const date = new Date();
        date.setHours(hours, mins + 30);
        
        // Prevent postponing to next day (rudimentary check)
        if (date.getHours() < hours && hours > 20) {
           showNotification("Cannot postpone to the next day!");
           return t;
        }

        const newTime = `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
        showNotification(`Task postponed to ${newTime}`);
        return { ...t, time: newTime };
      }
      return t;
    }));
  };

  return (
    <div className="min-h-screen bg-background text-slate-100 font-sans overflow-hidden relative selection:bg-primary selection:text-white">
      {/* Abstract Background Shapes */}
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-primary/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-accent/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Notification Toast */}
      <AnimatePresence>
        {notification && (
          <div className="fixed top-6 left-1/2 transform -translate-x-1/2 z-50 bg-surface border border-slate-700 shadow-2xl px-6 py-3 rounded-full flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-300">
            <div className="w-2 h-2 bg-accent rounded-full animate-pulse" />
            <span className="text-sm font-medium">{notification}</span>
          </div>
        )}
      </AnimatePresence>

      <main className="relative z-10 w-full h-full flex flex-col">
        {view === 'HOME' && (
          <Home 
            onNavigate={(target) => {
              if (target === 'CLIENT') setView('LOGIN_CLIENT');
              if (target === 'ADMIN') setView('LOGIN_ADMIN');
            }} 
          />
        )}

        {(view === 'LOGIN_CLIENT' || view === 'LOGIN_ADMIN') && (
          <Login 
            role={view === 'LOGIN_CLIENT' ? 'CLIENT' : 'ADMIN'} 
            onBack={() => setView('HOME')}
            onLogin={handleLogin}
            clients={clients}
          />
        )}

        {view === 'CLIENT_DASHBOARD' && currentUser && (
          <ClientDashboard 
            user={currentUser}
            tasks={tasks.filter(t => t.clientId === currentUser.id)}
            onLogout={handleLogout}
            onUpdateTask={updateTaskStatus}
            onPostpone={postponeTask}
            notify={showNotification}
          />
        )}

        {view === 'ADMIN_DASHBOARD' && (
          <AdminDashboard 
            clients={clients}
            onLogout={handleLogout}
            onSelectClient={(client) => {
              setSelectedClientForAdmin(client);
              setView('ADMIN_ANALYTICS');
            }}
          />
        )}

        {view === 'ADMIN_ANALYTICS' && selectedClientForAdmin && (
          <AdminAnalytics 
            client={selectedClientForAdmin}
            onBack={() => {
              setSelectedClientForAdmin(null);
              setView('ADMIN_DASHBOARD');
            }}
          />
        )}
      </main>
    </div>
  );
}