import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { Button, Input } from '../components/UI';
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
          alert('Key updated.');
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
    }, 500);
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 relative">
      
      {/* Top Actions */}
      {mode === 'USER' && (
        <div className="absolute top-6 right-6 z-20">
          <Button variant="ghost" size="sm" onClick={onAdminClick}>
             Admin
          </Button>
        </div>
      )}

      {mode === 'ADMIN' && (
        <div className="absolute top-6 left-6 z-20">
           <Button variant="ghost" onClick={onBack} size="sm">
            <ArrowLeft size={16} className="mr-2" /> Back
          </Button>
        </div>
      )}

      <motion.div
        key={authMode} 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-[360px] z-10"
      >
        <div className="text-center mb-10">
            <h1 className="text-5xl font-black text-white tracking-tighter mb-2">
              Cronos.
            </h1>
            <p className="text-zinc-500 font-medium">
              {mode === 'ADMIN' ? 'System Control' : (authMode === 'REGISTER' ? 'New Account' : 'Task Manager')}
            </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Input 
            placeholder={mode === 'ADMIN' ? "Admin ID" : "Group ID"} 
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            required
            autoFocus
          />
          
          <Input 
            type="password" 
            placeholder="Secret Key" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          {(authMode === 'REGISTER' || authMode === 'RESET') && (
            <Input 
              type="password" 
              placeholder="Confirm Key" 
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          )}

          {error && (
            <div className="text-red-400 text-sm font-bold text-center">
              {error}
            </div>
          )}

          <Button type="submit" isLoading={loading} variant="primary" className="w-full" size="lg">
            {mode === 'ADMIN' ? 'Enter' : 
              (authMode === 'REGISTER' ? 'Sign Up' : 
              (authMode === 'RESET' ? 'Reset' : 'Sign In'))}
          </Button>
        </form>

        {mode === 'USER' && (
            <div className="mt-8 flex justify-center gap-6 text-sm font-bold text-zinc-500">
              {authMode === 'LOGIN' && (
                <>
                  <button onClick={() => { setAuthMode('RESET'); setError(''); }} className="hover:text-white">Forgot?</button>
                  <button onClick={() => { setAuthMode('REGISTER'); setError(''); }} className="hover:text-white">Create ID</button>
                </>
              )}
              {(authMode === 'REGISTER' || authMode === 'RESET') && (
                <button onClick={() => { setAuthMode('LOGIN'); setError(''); }} className="hover:text-white">Cancel</button>
              )}
            </div>
        )}
      </motion.div>
    </div>
  );
};

export default Login;