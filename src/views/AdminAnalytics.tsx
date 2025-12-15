import React, { useState, useMemo } from 'react';
import { ArrowLeft, Calendar as CalendarIcon, PieChart as PieChartIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';
import { Button, Card } from '../components/UI';
import type { Client } from '../types';
import { generateMockHistory } from '../services/store';

interface AdminAnalyticsProps {
  client: Client;
  onBack: () => void;
}

const AdminAnalytics: React.FC<AdminAnalyticsProps> = ({ client, onBack }) => {
  const historyData = useMemo(() => generateMockHistory(client.id, 7), [client.id]);
  
  // Default to today or the last available data point
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [viewDate, setViewDate] = useState(new Date()); // Calendar month view

  const selectedDayStats = historyData.find(d => d.date === selectedDate) || {
    date: selectedDate,
    completed: 0,
    missed: 0,
    total: 0
  };
  
  const pieData = [
    { name: 'Completed', value: selectedDayStats.completed, color: '#10b981' },
    { name: 'Missed', value: selectedDayStats.missed, color: '#f43f5e' },
  ];

  // Calendar Helpers
  const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const handlePrevMonth = () => {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1));
  };

  const renderCalendarDays = () => {
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    const daysInMonth = getDaysInMonth(year, month);
    const startDay = getFirstDayOfMonth(year, month);
    
    const days = [];
    const weekDays = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

    // Headers
    weekDays.forEach(d => days.push(
      <div key={`head-${d}`} className="h-8 flex items-center justify-center text-[10px] font-bold text-slate-500">
        {d}
      </div>
    ));

    // Padding
    for (let i = 0; i < startDay; i++) {
      days.push(<div key={`pad-${i}`} />);
    }

    // Days
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const isSelected = selectedDate === dateStr;
      const hasData = historyData.some(h => h.date === dateStr);
      
      days.push(
        <button
          key={d}
          onClick={() => setSelectedDate(dateStr)}
          className={`
            h-8 w-8 rounded-full flex items-center justify-center text-xs relative transition-all
            ${isSelected ? 'bg-primary text-white font-bold shadow-lg shadow-primary/25 scale-105' : 'text-slate-300 hover:bg-white/5'}
            ${!isSelected && hasData ? 'font-medium text-white' : ''}
          `}
        >
          {d}
          {!isSelected && hasData && (
            <div className="absolute bottom-1.5 w-1 h-1 bg-emerald-500 rounded-full"></div>
          )}
        </button>
      );
    }
    return days;
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-background overflow-hidden">
       <nav className="bg-surface/80 backdrop-blur-md border-b border-white/5 sticky top-0 z-20 flex-shrink-0">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={onBack} className="p-1.5 -ml-2 text-slate-400 hover:text-white">
            <ArrowLeft size={18} />
          </Button>
          <div className="flex items-center gap-3 overflow-hidden">
            <img src={client.avatar} className="w-8 h-8 rounded-full border border-slate-600 shrink-0" alt="avatar" />
            <h1 className="text-sm font-bold text-white truncate">
              {client.name} <span className="text-slate-500 font-normal opacity-75">/ Details</span>
            </h1>
          </div>
        </div>
      </nav>

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6 pb-20">
          
          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2 min-h-[300px] flex flex-col p-4 sm:p-6">
              <h3 className="text-sm font-semibold text-slate-200 mb-6 flex items-center gap-2">
                <CalendarIcon size={16} className="text-primary" /> 7-Day Performance
              </h3>
              <div className="flex-1 w-full min-h-[220px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={historyData} barSize={24} margin={{top: 0, right: 0, left: -20, bottom: 0}}>
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
              <Card className="h-full flex flex-col p-4 sm:p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold text-slate-200">Calendar</h3>
                  <div className="flex items-center gap-2">
                    <button onClick={handlePrevMonth} className="p-1 hover:bg-white/10 rounded-full text-slate-400 hover:text-white transition-colors">
                      <ChevronLeft size={16} />
                    </button>
                    <span className="text-xs font-mono font-bold text-white w-20 text-center">
                       {viewDate.toLocaleString('default', { month: 'short', year: 'numeric' })}
                    </span>
                    <button onClick={handleNextMonth} className="p-1 hover:bg-white/10 rounded-full text-slate-400 hover:text-white transition-colors">
                      <ChevronRight size={16} />
                    </button>
                  </div>
                </div>
                
                <div className="flex-1 flex flex-col items-center justify-center">
                   <div className="grid grid-cols-7 gap-1 w-full max-w-[280px]">
                     {renderCalendarDays()}
                   </div>
                </div>
                
                <div className="mt-4 pt-4 border-t border-white/5 flex justify-center items-center gap-4 text-[10px] text-slate-500">
                    <div className="flex items-center gap-1.5">
                       <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full" /> Has Data
                    </div>
                     <div className="flex items-center gap-1.5">
                       <div className="w-1.5 h-1.5 bg-primary rounded-full" /> Selected
                    </div>
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
              
              {selectedDayStats.total > 0 ? (
                <>
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
                        <span className="block text-[10px] text-slate-500 uppercase tracking-wider">Done</span>
                    </div>
                  </div>
                  <div className="flex justify-center gap-6 mt-4 w-full">
                    <div className="flex items-center gap-2 text-xs text-slate-300">
                        <div className="w-2.5 h-2.5 rounded-sm bg-emerald-500" /> Completed
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-300">
                        <div className="w-2.5 h-2.5 rounded-sm bg-rose-500" /> Missed
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-slate-600">
                  <PieChartIcon size={32} className="mb-2 opacity-20" />
                  <p className="text-xs">No activity recorded for this date.</p>
                </div>
              )}
            </Card>

            <Card className="flex flex-col p-4 sm:p-6">
              <h3 className="text-sm font-semibold text-slate-200 mb-4">Day Activity</h3>
              <div className="space-y-3 flex-1 overflow-y-auto max-h-[220px] custom-scrollbar pr-2">
                {selectedDayStats.completed > 0 && Array.from({ length: selectedDayStats.completed }).map((_, i) => (
                  <div key={`comp-${i}`} className="flex items-start gap-3 p-3 rounded-lg bg-emerald-500/5 border border-emerald-500/10">
                    <div className="mt-1 w-2 h-2 rounded-full bg-emerald-500 shrink-0 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                    <div>
                      <p className="text-xs font-bold text-emerald-100">Task Completed</p>
                      <p className="text-[10px] text-slate-500">Recorded at {8 + i}:30 AM</p>
                    </div>
                  </div>
                ))}
                {selectedDayStats.missed > 0 && Array.from({ length: selectedDayStats.missed }).map((_, i) => (
                  <div key={`miss-${i}`} className="flex items-start gap-3 p-3 rounded-lg bg-rose-500/5 border border-rose-500/10">
                     <div className="mt-1 w-2 h-2 rounded-full bg-rose-500 shrink-0 shadow-[0_0_8px_rgba(244,63,94,0.5)]" />
                    <div>
                      <p className="text-xs font-bold text-rose-100">Task Missed</p>
                      <p className="text-[10px] text-slate-500">Auto-marked as absent</p>
                    </div>
                  </div>
                ))}
                {selectedDayStats.total === 0 && (
                   <div className="h-full flex flex-col items-center justify-center text-xs text-slate-600">
                     <CalendarIcon size={24} className="mb-2 opacity-50" />
                     No data available for this date
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