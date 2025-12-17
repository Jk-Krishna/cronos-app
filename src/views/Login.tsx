import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { Button, Input } from '../components/UI';

interface LoginProps {
  mode: 'USER' | 'ADMIN';
  onLogin: (data?: any) => void;
  onAdminClick?: () => void;
  onBack?: () => void;
  store: any;
}

type AuthSubMode = 'LOGIN' | 'REGISTER' | 'RECOVER';

const Login: React.FC<LoginProps> = ({ mode, onLogin, onAdminClick, onBack, store }) => {
  const [subMode, setSubMode] = useState<AuthSubMode>('LOGIN');
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
        if (subMode === 'REGISTER') {
          if (password !== confirmPassword) {
            setError("Passwords don't match");
            return;
          }
          const success = store.addAdmin(userId, password);
          if (success) {
            alert('Admin account created successfully.');
            setSubMode('LOGIN');
          } else {
            setError('Admin ID already exists');
          }
          return;
        }

        if (subMode === 'RECOVER') {
          if (password !== confirmPassword) {
            setError("Passwords don't match");
            return;
          }
          const success = store.resetAdminPassword(userId, password);
          if (success) {
            alert('Admin password updated successfully.');
            setSubMode('LOGIN');
          } else {
            setError('Admin ID not found');
          }
          return;
        }

        const admin = store.validateAdmin(userId, password);
        if (admin) {
          onLogin();
        } else {
          setError('Admin access denied. Check credentials.');
        }
        return;
      }

      // User Mode
      if (subMode === 'REGISTER') {
        if (password !== confirmPassword) {
          setError("Passwords don't match");
          return;
        }
        if (userId.length < 3) {
          setError("User ID must be at least 3 characters");
          return;
        }
        const success = store.addGroup(userId, password);
        if (success) {
          alert('Account created. You can now sign in.');
          setSubMode('LOGIN');
        } else {
          setError('This ID is already taken');
        }
        return;
      }

      if (subMode === 'RECOVER') {
        if (password !== confirmPassword) {
          setError("Passwords don't match");
          return;
        }
        const success = store.resetGroupPassword(userId, password);
        if (success) {
          alert('Secret key updated successfully.');
          setSubMode('LOGIN');
        } else {
          setError('User ID not found in system');
        }
        return;
      }

      const group = store.getGroup(userId);
      if (group && group.password === password) {
        onLogin(group);
      } else {
        setError('Incorrect ID or Secret Key');
      }
    }, 600);
  };

  const getTitle = () => {
    if (mode === 'ADMIN') {
      if (subMode === 'REGISTER') return 'Create Admin';
      if (subMode === 'RECOVER') return 'Admin Recovery';
      return 'Console.';
    }
    if (subMode === 'REGISTER') return 'New Account';
    if (subMode === 'RECOVER') return 'Reset Key';
    return 'Cronos.';
  };

  const getSubtitle = () => {
    if (mode === 'ADMIN') return 'System Authority';
    if (subMode === 'REGISTER') return 'Join the network';
    return 'Task Manager';
  };

  const MDiv = motion.div as any;

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 relative">
      {mode === 'USER' && (
        <div className="absolute top-6 right-6 z-20">
          <Button variant="ghost" size="sm" onClick={onAdminClick}>
            Switch to Admin
          </Button>
        </div>
      )}

      {mode === 'ADMIN' && (
        <div className="absolute top-6 left-6 z-20">
          <Button variant="ghost" onClick={() => { if(subMode !== 'LOGIN') setSubMode('LOGIN'); else onBack?.(); }} size="sm">
            <ArrowLeft size={16} className="mr-2" /> Back
          </Button>
        </div>
      )}

      <MDiv
        key={`${mode}-${subMode}`} 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-[360px] z-10"
      >
        <div className="text-center mb-10">
          <h1 className="text-5xl font-black text-white tracking-tighter mb-2">{getTitle()}</h1>
          <p className="text-zinc-500 font-medium uppercase tracking-widest text-[10px]">{getSubtitle()}</p>
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
            placeholder={subMode === 'REGISTER' ? "Create Secret Key" : (subMode === 'RECOVER' ? "New Secret Key" : "Secret Key")} 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          {subMode !== 'LOGIN' && (
            <Input 
              type="password" 
              placeholder="Confirm Key" 
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          )}

          {error && (
            <div className="text-red-400 text-xs font-bold text-center bg-red-500/10 py-2 rounded-xl border border-red-500/20">
              {error}
            </div>
          )}

          <Button type="submit" isLoading={loading} variant="primary" className="w-full" size="lg">
            {subMode === 'LOGIN' ? 'Sign In' : (subMode === 'REGISTER' ? 'Register Account' : 'Update Key')}
          </Button>
        </form>

        <div className="mt-8 flex justify-center gap-6 text-[10px] font-black uppercase tracking-widest text-zinc-500">
          {subMode === 'LOGIN' ? (
            <>
              <button onClick={() => { setSubMode('RECOVER'); setError(''); }} className="hover:text-white transition-colors">Forgot Credentials?</button>
              <button onClick={() => { setSubMode('REGISTER'); setError(''); }} className="hover:text-white transition-colors">Create Account</button>
            </>
          ) : (
            <button onClick={() => { setSubMode('LOGIN'); setError(''); }} className="hover:text-white transition-colors">Cancel</button>
          )}
        </div>
      </MDiv>
    </div>
  );
};

export default Login;