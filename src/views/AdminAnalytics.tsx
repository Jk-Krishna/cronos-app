import React, { useState, useMemo } from 'react';
import { ArrowLeft, Calendar as CalendarIcon, PieChart as PieChartIcon } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';
import { Button, Card } from '../components/UI';
import type { Client } from '../types.ts';
import { generateMockHistory } from '../services/store';

interface AdminAnalyticsProps {
  client: Client;
  onBack: () => void;
}

const AdminAnalytics: React.FC<AdminAnalyticsProps> = ({ client, onBack }) => {
  const historyData = useMemo(() => generateMockHistory(client.id, 7), [client.id]);
  const [selectedDate, setSelectedDate] = useState<string>(historyData[historyData.length - 1].date);
  const selectedDayStats = historyData.find(d => d.date === selectedDate) || historyData[0];
  
  const pieData = [
    { name: 'Completed', value: selectedDayStats.completed, color: '#10b981' },
    { name: 'Missed', value: selectedDayStats.missed, color: '#f43f5e' },
  ];

  return (
    <div className="flex-1 flex flex-col h-screen overflow-hidden bg-background">
       <nav className="bg-surface/80 backdrop-blur-md border-b border-white/5 sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={onBack} className="p-1.5 -ml-2 text-slate-400 hover:text-white">
            <ArrowLeft size={18} />
          </Button>
          <div className="flex items-center gap-3">
            <img src={client.avatar} className="w-6 h-6 rounded-full border border-slate-600" alt="avatar" />
            <h1 className="text-sm font-bold text-white">
              {client.name} <span className="text-slate-500 font-normal hidden sm:inline">/ Analytics</span>
            </h1>
          </div>
        </div>
      </nav>

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
          
          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2 min-h-[300px] flex flex-col">
              <h3 className="text-sm font-semibold text-slate-200 mb-6 flex items-center gap-2">
                <CalendarIcon size={16} className="text-primary" /> 7-Day Performance
              </h3>
              <div className="flex-1 w-full min-h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={historyData} barSize={20} margin={{top: 0, right: 0, left: -20, bottom: 0}}>
                    <XAxis 
                      dataKey="date" 
                      stroke="#64748b" 
                      fontSize={10} 
                      tickFormatter={(val) => val.slice(5)} 
                      tickLine={false}
                      axisLine={false}
                      dy={10}
                    />
                    <YAxis 
                      stroke="#64748b" 
                      fontSize={10} 
                      tickLine={false}
                      axisLine={false}
                    />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.5)', fontSize: '12px' }}
                      cursor={{fill: 'rgba(255,255,255,0.03)'}}
                    />
                    <Bar dataKey="completed" stackId="a" fill="#10b981" radius={[0, 0, 2, 2]} />
                    <Bar dataKey="missed" stackId="a" fill="#f43f5e" radius={[2, 2, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>

            <div className="space-y-4">
              <Card className="h-full flex flex-col">
                <h3 className="text-sm font-semibold text-slate-200 mb-4">Select Date</h3>
                <div className="flex-1 overflow-y-auto max-h-[300px] pr-2 space-y-2 custom-scrollbar">
                  {historyData.slice().reverse().map((d) => (
                    <button
                      key={d.date}
                      onClick={() => setSelectedDate(d.date)}
                      className={`w-full text-left px-3 py-2.5 rounded-lg flex justify-between items-center transition-all text-xs ${selectedDate === d.date ? 'bg-primary text-white' : 'bg-slate-800/40 text-slate-400 hover:bg-slate-800'}`}
                    >
                      <span>{d.date}</span>
                      <div className="flex gap-1">
                        <span className="text-emerald-400 font-medium">{d.completed}</span>
                        <span className="text-slate-600">/</span>
                        <span className="text-rose-400 font-medium">{d.missed}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </Card>
            </div>
          </div>

          {/* Breakdown Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="flex flex-col items-center justify-center p-6 min-h-[280px]">
              <h3 className="text-sm font-semibold text-slate-200 mb-4 w-full text-left flex items-center gap-2">
                 <PieChartIcon size={16} className="text-accent" /> Status Split ({selectedDate})
              </h3>
              <div className="w-full h-[180px] relative">
                 <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={55}
                        outerRadius={70}
                        paddingAngle={5}
                        dataKey="value"
                        stroke="none"
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                 </ResponsiveContainer>
                 <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
                    <span className="text-2xl font-bold text-white">{Math.round((selectedDayStats.completed / (selectedDayStats.total || 1)) * 100)}%</span>
                    <span className="block text-[10px] text-slate-500 uppercase tracking-wider">Complete</span>
                 </div>
              </div>
              <div className="flex gap-4 mt-2">
                 <div className="flex items-center gap-1.5 text-xs text-slate-400">
                    <div className="w-2 h-2 rounded-full bg-emerald-500" /> Completed ({selectedDayStats.completed})
                 </div>
                 <div className="flex items-center gap-1.5 text-xs text-slate-400">
                    <div className="w-2 h-2 rounded-full bg-rose-500" /> Missed ({selectedDayStats.missed})
                 </div>
              </div>
            </Card>

            <Card className="flex flex-col">
              <h3 className="text-sm font-semibold text-slate-200 mb-4">Activity Log</h3>
              <div className="space-y-3 flex-1 overflow-y-auto max-h-[220px] custom-scrollbar pr-2">
                {selectedDayStats.completed > 0 && Array.from({ length: selectedDayStats.completed }).map((_, i) => (
                  <div key={`comp-${i}`} className="flex items-start gap-3 p-2.5 rounded-lg bg-emerald-500/5 border border-emerald-500/10">
                    <div className="mt-0.5 w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                    <div>
                      <p className="text-xs font-medium text-emerald-100">Task Completed</p>
                      <p className="text-[10px] text-slate-500">Recorded at {8 + i}:30 AM</p>
                    </div>
                  </div>
                ))}
                {selectedDayStats.missed > 0 && Array.from({ length: selectedDayStats.missed }).map((_, i) => (
                  <div key={`miss-${i}`} className="flex items-start gap-3 p-2.5 rounded-lg bg-rose-500/5 border border-rose-500/10">
                     <div className="mt-0.5 w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0" />
                    <div>
                      <p className="text-xs font-medium text-rose-100">Task Missed</p>
                      <p className="text-[10px] text-slate-500">Auto-marked as absent</p>
                    </div>
                  </div>
                ))}
                {selectedDayStats.total === 0 && (
                   <div className="h-full flex items-center justify-center text-xs text-slate-600">
                     No data available
                   </div>
                )}
              </div>
            </Card>
          </div>

        </div>
      </div>
    </div>
  );
};

export default AdminAnalytics;