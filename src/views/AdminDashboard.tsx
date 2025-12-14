import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { LogOut, Search, ChevronRight } from 'lucide-react';
import { Button, Input } from '../components/UI';
import type { Client } from '../types.ts';

interface AdminDashboardProps {
  clients: Client[];
  onLogout: () => void;
  onSelectClient: (client: Client) => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ clients, onLogout, onSelectClient }) => {
  const [search, setSearch] = useState('');

  const filteredClients = clients.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase()) || 
    c.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex-1 flex flex-col h-screen overflow-hidden bg-background">
      {/* Navbar */}
      <nav className="bg-surface/80 backdrop-blur-md border-b border-white/5 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
           <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded bg-primary/20 flex items-center justify-center text-primary font-bold text-xs">A</div>
            <h1 className="text-sm font-bold text-white tracking-wide">
              Admin<span className="text-slate-500">Console</span>
            </h1>
           </div>
          <Button variant="ghost" size="sm" onClick={onLogout} className="text-slate-400 hover:text-white px-2">
            <LogOut size={16} className="mr-2" /> <span className="hidden sm:inline">Logout</span>
          </Button>
        </div>
      </nav>

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
            <div>
               <h2 className="text-2xl font-bold text-white mb-1">Overview</h2>
               <p className="text-sm text-slate-400">Manage client performance.</p>
            </div>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500" size={14} />
              <Input 
                placeholder="Find client..." 
                className="pl-9 py-2 text-sm"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredClients.map((client, idx) => (
              <motion.div
                key={client.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
              >
                <div 
                  onClick={() => onSelectClient(client)}
                  className="group cursor-pointer bg-surface/40 backdrop-blur-sm border border-white/5 hover:border-primary/50 hover:bg-surface/60 rounded-xl p-5 transition-all duration-200"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <img src={client.avatar} alt={client.name} className="w-10 h-10 rounded-full object-cover border border-slate-700" />
                      <div>
                        <h3 className="text-sm font-bold text-slate-200 group-hover:text-primary transition-colors">{client.name}</h3>
                        <p className="text-xs text-slate-500 flex items-center gap-1">
                          {client.email}
                        </p>
                      </div>
                    </div>
                    <ChevronRight size={16} className="text-slate-600 group-hover:text-primary transition-colors" />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
                      <span>Completion Rate</span>
                      <span className="text-emerald-400">75%</span>
                    </div>
                    <div className="w-full bg-slate-800 h-1 rounded-full overflow-hidden">
                      <div className="bg-emerald-500 h-full w-[75%]" />
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
            
            {filteredClients.length === 0 && (
              <div className="col-span-full text-center py-12 text-slate-500 text-sm">
                No clients found.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;