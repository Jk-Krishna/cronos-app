import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X } from 'lucide-react';
import type { UserGroup } from '../types';
import { Button, Input } from '../components/UI';

interface ProfileSelectProps {
  group: UserGroup;
  onSelect: (profileId: string) => void;
  onAddProfile: (name: string) => void;
  onLogout: () => void;
}

const ProfileSelect: React.FC<ProfileSelectProps> = ({ group, onSelect, onAddProfile, onLogout }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [newName, setNewName] = useState('');

  const handleAdd = () => {
    if (newName.trim()) {
      onAddProfile(newName);
      setNewName('');
      setIsAdding(false);
    }
  };

  const MDiv = motion.div as any;

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 relative">
      <div className="absolute top-8 right-8 z-30">
         <Button variant="ghost" onClick={onLogout} size="sm" className="text-zinc-600 hover:text-white">Sign Out</Button>
      </div>

      <div className="max-w-6xl w-full text-center z-10">
        <h1 className="text-4xl sm:text-7xl font-black text-white mb-20 tracking-tighter">Who is working?</h1>
        
        <div className="flex flex-wrap items-center justify-center gap-10 sm:gap-16">
          {group.profiles.map((profile, i) => (
             <MDiv 
               key={profile.id}
               initial={{ opacity: 0, scale: 0.8 }}
               animate={{ opacity: 1, scale: 1 }}
               transition={{ delay: i * 0.05 }}
               whileHover={{ scale: 1.05 }}
               whileTap={{ scale: 0.95 }}
               onClick={() => onSelect(profile.id)}
               className="group flex flex-col items-center gap-8 cursor-pointer"
             >
                <div className="w-32 h-32 sm:w-48 sm:h-48 rounded-[3rem] overflow-hidden border-4 border-transparent group-hover:border-white transition-all shadow-2xl bg-zinc-950">
                   <img src={profile.avatar} className="w-full h-full object-cover" alt={profile.name} />
                </div>
                <span className="text-xl font-black text-zinc-600 group-hover:text-white transition-colors uppercase tracking-widest">{profile.name}</span>
             </MDiv>
          ))}

          <MDiv 
             initial={{ opacity: 0, scale: 0.8 }}
             animate={{ opacity: 1, scale: 1 }}
             transition={{ delay: group.profiles.length * 0.05 }}
             whileHover={{ scale: 1.05 }}
             whileTap={{ scale: 0.95 }}
             onClick={() => setIsAdding(true)}
             className="group flex flex-col items-center gap-8 cursor-pointer"
           >
              <div className="w-32 h-32 sm:w-48 sm:h-48 rounded-[3rem] bg-zinc-900/40 border-2 border-dashed border-zinc-800 flex items-center justify-center group-hover:bg-zinc-900 group-hover:border-white transition-all backdrop-blur-sm">
                 <Plus size={54} className="text-zinc-700 group-hover:text-white" />
              </div>
              <span className="text-xl font-black text-zinc-700 group-hover:text-white transition-colors uppercase tracking-widest">Add Profile</span>
           </MDiv>
        </div>

        <AnimatePresence>
          {isAdding && (
            <div className="fixed inset-0 bg-black/95 backdrop-blur-2xl z-50 flex items-center justify-center p-6">
               <MDiv 
                 initial={{ scale: 0.9, opacity: 0 }} 
                 animate={{ scale: 1, opacity: 1 }}
                 exit={{ scale: 0.9, opacity: 0 }}
                 className="bg-zinc-950 p-12 rounded-[4rem] border border-zinc-800/50 w-full max-w-md shadow-[0_0_100px_rgba(255,255,255,0.05)] relative"
               >
                  <button onClick={() => setIsAdding(false)} className="absolute top-10 right-10 text-zinc-600 hover:text-white transition-colors"><X size={24} /></button>
                  <h3 className="text-4xl font-black text-white mb-10 tracking-tighter">New User</h3>
                  <Input 
                    label="Enter Name" 
                    placeholder="e.g. Alex" 
                    value={newName} 
                    onChange={e => setNewName(e.target.value)} 
                    autoFocus 
                    className="mb-10" 
                  />
                  <div className="flex flex-col gap-4">
                     <Button onClick={handleAdd} className="w-full" size="lg" variant="primary">Create User</Button>
                     <Button variant="ghost" onClick={() => setIsAdding(false)} className="w-full text-zinc-600" size="md">Cancel</Button>
                  </div>
               </MDiv>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default ProfileSelect;