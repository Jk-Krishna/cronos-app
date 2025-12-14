import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { Button, Input, Card } from '../components/UI';
import type { Client, UserRole } from '../types.ts';

interface LoginProps {
  role: UserRole;
  onBack: () => void;
  onLogin: (role: UserRole, user?: Client) => void;
  clients: Client[];
}

const Login: React.FC<LoginProps> = ({ role, onBack, onLogin, clients }) => {
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      
      if (role === 'ADMIN') {
        if (userId === 'admin' && password === 'admin') {
          onLogin('ADMIN');
        } else {
          setError('Invalid Admin credentials (try admin/admin)');
        }
      } else {
        const client = clients.find(c => c.email.toLowerCase() === userId.toLowerCase());
        if (client && password === '1234') {
          onLogin('CLIENT', client);
        } else {
          setError('User not found or wrong password (try alice/1234)');
        }
      }
    }, 800);
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="flex items-center mb-6">
           <Button variant="ghost" onClick={onBack} size="sm" className="pl-0 text-slate-500 hover:text-white">
            <ArrowLeft size={16} className="mr-1" /> Back
          </Button>
        </div>
       
        <Card className="border-t-2 border-t-primary shadow-2xl shadow-black/50">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-white mb-1">
              {role === 'ADMIN' ? 'Admin Access' : 'Client Login'}
            </h2>
            <p className="text-xs text-slate-500">Secure entry for authorized personnel.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input 
              label="User ID" 
              placeholder="Enter User ID" 
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              required
              autoFocus
            />
            
            <Input 
              label="Password" 
              type="password" 
              placeholder="••••••••" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            {error && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="text-rose-500 text-xs bg-rose-500/10 p-2.5 rounded border border-rose-500/20"
              >
                {error}
              </motion.div>
            )}

            <Button type="submit" isLoading={loading} className="w-full mt-2" size="md">
              Sign In
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-[10px] text-slate-600 uppercase tracking-widest">
              {role === 'CLIENT' ? 'Demo: alice / 1234' : 'Demo: admin / admin'}
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Login;