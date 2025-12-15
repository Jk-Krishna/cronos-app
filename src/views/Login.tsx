import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Shield } from 'lucide-react';
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
  const [authMode, setAuthMode] = useState<AuthMode>('LOGIN'); // Replaces isRegistering boolean
  
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
      
      // --- ADMIN LOGIN ---
      if (mode === 'ADMIN') {
        if (userId === ADMIN_CREDS.id && password === ADMIN_CREDS.password) {
          onLogin();
        } else {
          setError('Invalid Admin Credentials');
        }
        return;
      }

      // --- USER FLOWS ---
      if (authMode === 'RESET') {
        if (password !== confirmPassword) {
          setError("Passwords don't match");
          return;
        }
        const success = store.resetGroupPassword(userId, password);
        if (success) {
          alert('Password reset successful! Please login.');
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
          setError("User ID too short");
          return;
        }
        const success = store.addGroup(userId, password);
        if (success) {
          alert('Registration successful! Please login.');
          setAuthMode('LOGIN');
        } else {
          setError('User ID already exists');
        }
        return;
      }

      // Default: LOGIN
      const group = store.getGroup(userId);
      if (group && group.password === password) {
        onLogin(group);
      } else {
        setError('Invalid User ID or Password');
      }
    }, 600);
  };

  const getTitle = () => {
    if (mode === 'ADMIN') return 'Admin Access';
    switch (authMode) {
      case 'REGISTER': return 'New Account';
      case 'RESET': return 'Reset Password';
      default: return 'Welcome Back';
    }
  };

  const getDescription = () => {
    if (mode === 'ADMIN') return 'Secure system configuration.';
    switch (authMode) {
      case 'REGISTER': return 'Create your group ID to get started.';
      case 'RESET': return 'Enter your ID and new password.';
      default: return 'Please sign in to continue.';
    }
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-4 relative overflow-y-auto min-h-full">
      {/* Top Right Admin Button */}
      {mode === 'USER' && (
        <div className="absolute top-4 right-4 z-20">
          <Button variant="ghost" size="sm" onClick={onAdminClick} className="text-slate-500 hover:text-white bg-slate-900/50 backdrop-blur-sm">
            <Shield size={16} className="mr-1" /> Admin
          </Button>
        </div>
      )}

      <div className="w-full max-w-sm my-auto">
        {mode === 'ADMIN' && (
          <div className="flex items-center mb-6">
             <Button variant="ghost" onClick={onBack} size="sm" className="pl-0 text-slate-500 hover:text-white">
              <ArrowLeft size={16} className="mr-1" /> Back to User Login
            </Button>
          </div>
        )}

        <motion.div
          key={authMode} // Animate on mode switch
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full"
        >
          <Card className="border-t-2 border-t-primary shadow-2xl shadow-black/50">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-white mb-2">
                {getTitle()}
              </h2>
              <p className="text-sm text-slate-500 leading-relaxed">
                {getDescription()}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <Input 
                label={mode === 'ADMIN' ? "Admin ID" : "User ID"}
                placeholder="Enter ID" 
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                required
                autoFocus
                autoComplete="off"
              />
              
              <Input 
                label={authMode === 'RESET' ? "New Password" : "Password"}
                type="password" 
                placeholder="••••••••" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />

              {(authMode === 'REGISTER' || authMode === 'RESET') && (
                <Input 
                  label="Confirm Password" 
                  type="password" 
                  placeholder="••••••••" 
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              )}

              {error && (
                <div className="text-rose-500 text-xs bg-rose-500/10 p-3 rounded-lg border border-rose-500/20">
                  {error}
                </div>
              )}

              <Button type="submit" isLoading={loading} className="w-full !mt-6" size="lg">
                {mode === 'ADMIN' ? 'Login' : 
                  (authMode === 'REGISTER' ? 'Create Account' : 
                  (authMode === 'RESET' ? 'Reset Password' : 'Sign In'))}
              </Button>
            </form>

            {mode === 'USER' && (
              <div className="mt-6 flex flex-col gap-3 text-center border-t border-slate-700/50 pt-4">
                {authMode === 'LOGIN' && (
                  <>
                    <button 
                      onClick={() => { setAuthMode('RESET'); setError(''); setPassword(''); }}
                      className="text-xs text-slate-400 hover:text-white transition-colors"
                    >
                      Forgot Password?
                    </button>
                    <button 
                      onClick={() => { setAuthMode('REGISTER'); setError(''); setPassword(''); }}
                      className="text-sm text-primary hover:text-indigo-400 font-medium p-2 rounded hover:bg-white/5 transition-colors"
                    >
                      New User? Create ID
                    </button>
                  </>
                )}
                
                {(authMode === 'REGISTER' || authMode === 'RESET') && (
                   <button 
                   onClick={() => { setAuthMode('LOGIN'); setError(''); setPassword(''); }}
                   className="text-sm text-slate-400 hover:text-white font-medium p-2 rounded hover:bg-white/5 transition-colors"
                 >
                   Back to Login
                 </button>
                )}
              </div>
            )}
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;