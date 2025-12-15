import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Shield, Sparkles } from 'lucide-react';
import { Button, Input, Card } from '../components/UI';
import { ADMIN_CREDS } from '../services/store';

interface LoginProps {
  mode: 'USER' | 'ADMIN';
  onLogin: (data?: any) => void;
  onAdminClick?: () => void;
  onBack?: () => void;
  store: any;
}

type AuthMode = 'LOGIN' | 'REGISTER' | 'RESET';

const Login: React.FC<LoginProps> = ({ mode, onLogin, onAdminClick, onBack, store }) => {
  const [authMode, setAuthMode] = useState<AuthMode>('LOGIN'); 
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      
      if (mode === 'ADMIN') {
        if (userId === ADMIN_CREDS.id && password === ADMIN_CREDS.password) {
          onLogin();
        } else {
          setError('Admin Access Denied');
        }
        return;
      }

      if (authMode === 'RESET') {
        if (password !== confirmPassword) {
          setError("Passwords don't match");
          return;
        }
        const success = store.resetGroupPassword(userId, password);
        if (success) {
          alert('Key updated successfully.');
          setAuthMode('LOGIN');
          setPassword('');
          setConfirmPassword('');
        } else {
          setError('User ID not found');
        }
        return;
      }

      if (authMode === 'REGISTER') {
        if (password !== confirmPassword) {
          setError("Passwords don't match");
          return;
        }
        if (userId.length < 3) {
          setError("ID is too short");
          return;
        }
        const success = store.addGroup(userId, password);
        if (success) {
          alert('Welcome aboard!');
          setAuthMode('LOGIN');
        } else {
          setError('This ID is taken');
        }
        return;
      }

      const group = store.getGroup(userId);
      if (group && group.password === password) {
        onLogin(group);
      } else {
        setError('Incorrect ID or Password');
      }
    }, 800);
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 relative overflow-hidden">
      
      {/* Floating Header Actions */}
      {mode === 'USER' && (
        <motion.div 
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="absolute top-6 right-6 z-20"
        >
          <Button variant="glass" size="sm" onClick={onAdminClick}>
            <Shield size={16} className="mr-2 text-indigo-400" /> Admin
          </Button>
        </motion.div>
      )}

      {mode === 'ADMIN' && (
        <motion.div 
           initial={{ y: -50, opacity: 0 }}
           animate={{ y: 0, opacity: 1 }}
           className="absolute top-6 left-6 z-20"
        >
           <Button variant="glass" onClick={onBack} size="sm">
            <ArrowLeft size={16} className="mr-2" /> Back
          </Button>
        </motion.div>
      )}

      {/* Main Card */}
      <motion.div
        key={authMode} 
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 20 }}
        className="w-full max-w-[420px] z-10"
      >
        <div className="text-center mb-8">
            <motion.div 
              initial={{ scale: 0 }} 
              animate={{ scale: 1 }} 
              transition={{ delay: 0.1, type: "spring" }}
              className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-fuchsia-500 mb-6 shadow-lg shadow-indigo-500/30 text-white"
            >
              <Sparkles size={28} fill="currentColor" className="opacity-90" />
            </motion.div>
            <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-zinc-400 tracking-tight mb-2">
              {mode === 'ADMIN' ? 'Control Center' : (authMode === 'REGISTER' ? 'Join Cronos' : 'Welcome Back')}
            </h1>
            <p className="text-zinc-400 font-medium text-lg">
              {mode === 'ADMIN' ? 'Secure Login' : (authMode === 'REGISTER' ? 'Start your journey.' : 'Your day, organized.')}
            </p>
        </div>

        <Card className="!p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <Input 
              label={mode === 'ADMIN' ? "Administrator ID" : "Group Identity"}
              placeholder="e.g. creative_team" 
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              required
              autoFocus
              autoComplete="off"
            />
            
            <Input 
              label={authMode === 'RESET' ? "New Secret Key" : "Secret Key"}
              type="password" 
              placeholder="••••••••" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            {(authMode === 'REGISTER' || authMode === 'RESET') && (
              <Input 
                label="Confirm Key" 
                type="password" 
                placeholder="••••••••" 
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            )}

            {error && (
              <motion.div 
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                className="text-red-400 text-sm font-bold bg-red-500/10 p-3 rounded-lg border border-red-500/20 flex items-center justify-center"
              >
                {error}
              </motion.div>
            )}

            <Button type="submit" isLoading={loading} variant="gradient" className="w-full !py-3 shadow-lg shadow-indigo-500/20" size="lg">
              {mode === 'ADMIN' ? 'Access Console' : 
                (authMode === 'REGISTER' ? 'Create Account' : 
                (authMode === 'RESET' ? 'Update Key' : 'Enter Space'))}
            </Button>
          </form>

          {mode === 'USER' && (
             <div className="mt-6 pt-6 border-t border-white/5 flex flex-col gap-3 text-center">
               {authMode === 'LOGIN' && (
                 <>
                   <button 
                     onClick={() => { setAuthMode('RESET'); setError(''); }}
                     className="text-xs text-zinc-500 hover:text-white font-bold transition-colors"
                   >
                     Forgot Key?
                   </button>
                   <p className="text-sm text-zinc-500">
                     No account? <button onClick={() => { setAuthMode('REGISTER'); setError(''); }} className="text-fuchsia-400 hover:text-fuchsia-300 font-bold transition-colors">Create One</button>
                   </p>
                 </>
               )}
               {(authMode === 'REGISTER' || authMode === 'RESET') && (
                  <button 
                  onClick={() => { setAuthMode('LOGIN'); setError(''); }}
                  className="text-sm text-zinc-500 hover:text-white font-bold"
                >
                  Cancel
                </button>
               )}
             </div>
          )}
        </Card>
      </motion.div>
    </div>
  );
};

export default Login;