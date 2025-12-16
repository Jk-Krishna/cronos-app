import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';
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

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 relative animate-in fade-in duration-500">
      <div className="absolute top-6 right-6 z-30">
         <Button variant="ghost" onClick={onLogout}>Sign Out</Button>
      </div>

      <div className="max-w-5xl w-full text-center z-10">
        <h1 className="text-3xl sm:text-5xl font-black text-white mb-12 tracking-tight">Who is working?</h1>
        
        <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-10">
          {group.profiles.map((profile, i) => (
             <motion.div 
               key={profile.id}
               initial={{ opacity: 0, scale: 0.5 }}
               animate={{ opacity: 1, scale: 1 }}
               transition={{ delay: i * 0.1 }}
               whileHover={{ scale: 1.05 }}
               whileTap={{ scale: 0.95 }}
               onClick={() => onSelect(profile.id)}
               className="group flex flex-col items-center gap-4 cursor-pointer"
             >
                <div className="w-24 h-24 sm:w-40 sm:h-40 rounded-3xl overflow-hidden border-4 border-transparent group-hover:border-white transition-all shadow-2xl">
                   <img src={profile.avatar} className="w-full h-full object-cover bg-zinc-800" alt={profile.name} />
                </div>
                <span className="text-lg sm:text-xl font-bold text-zinc-400 group-hover:text-white transition-colors">{profile.name}</span>
             </motion.div>
          ))}

          {/* Add Profile Button */}
           <motion.div 
             initial={{ opacity: 0, scale: 0.5 }}
             animate={{ opacity: 1, scale: 1 }}
             transition={{ delay: group.profiles.length * 0.1 }}
             whileHover={{ scale: 1.05 }}
             whileTap={{ scale: 0.95 }}
             onClick={() => setIsAdding(true)}
             className="group flex flex-col items-center gap-4 cursor-pointer"
           >
              <div className="w-24 h-24 sm:w-40 sm:h-40 rounded-3xl bg-zinc-900/50 border-2 border-dashed border-zinc-700 flex items-center justify-center group-hover:bg-zinc-800 group-hover:border-zinc-500 transition-all backdrop-blur-sm">
                 <Plus size={40} className="text-zinc-600 group-hover:text-zinc-300" />
              </div>
              <span className="text-lg sm:text-xl font-bold text-zinc-500 group-hover:text-zinc-300">Add Profile</span>
           </motion.div>
        </div>

        {isAdding && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
             <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-zinc-900 p-8 rounded-[2rem] border border-zinc-800 w-full max-w-sm shadow-2xl">
                <h3 className="text-2xl font-black text-white mb-6">New User</h3>
                <Input placeholder="Enter Name" value={newName} onChange={e => setNewName(e.target.value)} autoFocus className="mb-6" />
                <div className="flex gap-4">
                   <Button variant="ghost" onClick={() => setIsAdding(false)} className="flex-1">Cancel</Button>
                   <Button onClick={handleAdd} className="flex-1" variant="primary">Create User</Button>
                </div>
             </motion.div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfileSelect;