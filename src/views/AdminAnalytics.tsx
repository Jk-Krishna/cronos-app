import React, { useState, useMemo } from 'react';
import { ArrowLeft, Calendar as CalendarIcon, PieChart as PieChartIcon, ChevronLeft, ChevronRight, Plus, Trash2, Check, Circle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';
import { Button, Card, Input } from '../components/UI';
import type { Client, Task } from '../types';
import { generateMockHistory } from '../services/store';

interface AdminAnalyticsProps {
  client: Client;
  tasks: Task[];
  onBack: () => void;
  onAddTask: (title: string, time: string) => void;
  onDeleteTask: (taskId: string) => void;
}

const AdminAnalytics: React.FC<AdminAnalyticsProps> = ({ client, tasks, onBack, onAddTask, onDeleteTask }) => {
  const historyData = useMemo(() => generateMockHistory(client.id, 7), [client.id]);
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [viewDate, setViewDate] = useState(new Date()); 
  
  // Task adding state
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskTime, setNewTaskTime] = useState('');

  const selectedDayStats = historyData.find(d => d.date === selectedDate) || {
    date: selectedDate,
    completed: 0,
    missed: 0,
    total: 0
  };
  
  const pieData = [
    { name: 'Completed', value: selectedDayStats.completed, color: '#10b981' }, 
    { name: 'Missed', value: selectedDayStats.missed, color: '#ef4444' }, 
  ];

  const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const handlePrevMonth = () => {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1));
  };

  const handleSubmitTask = () => {
    if (newTaskTitle && newTaskTime) {
        onAddTask(newTaskTitle, newTaskTime);
        setIsAddingTask(false);
        setNewTaskTitle('');
        setNewTaskTime('');
    }
  };

  const renderCalendarDays = () => {
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    const daysInMonth = getDaysInMonth(year, month);
    const startDay = getFirstDayOfMonth(year, month);
    
    const days = [];
    const weekDays = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

    weekDays.forEach(d => days.push(
      <div key={`head-${d}`} className="h-8 flex items-center justify-center text-[10px] font-black text-zinc-600">
        {d}
      </div>
    ));

    for (let i = 0; i < startDay; i++) {
      days.push(<div key={`pad-${i}`} />);
    }

    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const isSelected = selectedDate === dateStr;
      const hasData = historyData.some(h => h.date === dateStr);
      
      days.push(
        <button
          key={d}
          onClick={() => setSelectedDate(dateStr)}
          className={`
            h-9 w-9 rounded-xl flex items-center justify-center text-xs relative transition-all duration-300
            ${isSelected ? 'bg-white text-black font-bold shadow-lg shadow-white/20 scale-110 z-10' : 'text-zinc-500 hover:bg-zinc-800 hover:text-white'}
            ${!isSelected && hasData ? 'font-bold text-white bg-zinc-900 border border-zinc-700' : ''}
          `}
        >
          {d}
          {!isSelected && hasData && (
            <div className="absolute -top-1 -right-1 w-2 h-2 bg-emerald-500 rounded-full border border-black"></div>
          )}
        </button>
      );
    }
    return days;
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-black overflow-hidden">
       <nav className="px-6 py-6 flex items-center gap-6 z-20 flex-shrink-0">
         <Button variant="secondary" size="sm" onClick={onBack} className="!rounded-2xl !p-3 !h-auto">
            <ArrowLeft size={20} />
          </Button>
          <div className="flex items-center gap-4">
            <img src={client.avatar} className="w-12 h-12 rounded-[1rem] bg-zinc-900 shadow-sm border border-zinc-800" alt="avatar" />
            <div>
                 <h1 className="text-xl font-black text-white leading-none">{client.name}</h1>
                 <p className="text-xs font-bold text-zinc-500 uppercase tracking-wide mt-1">Details & Analytics</p>
            </div>
          </div>
      </nav>

      <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 pb-20">
        <div className="max-w-7xl mx-auto space-y-6">
          
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            <Card className="xl:col-span-2 min-h-[400px] flex flex-col p-8 border-white/5">
              <h3 className="text-lg font-black text-white mb-8 flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center text-indigo-400"><CalendarIcon size={18} /></span>
                Activity Trends
              </h3>
              <div className="flex-1 w-full min-h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={historyData} barSize={40} margin={{top: 0, right: 0, left: -20, bottom: 0}}>
                    <XAxis 
                      dataKey="date" 
                      stroke="#52525b" 
                      fontSize={12} 
                      fontWeight={700}
                      tickFormatter={(val) => val.slice(5)} 
                      tickLine={false}
                      axisLine={false}
                      dy={15}
                    />
                    <YAxis 
                      stroke="#52525b" 
                      fontSize={12} 
                      tickLine={false}
                      axisLine={false}
                    />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#000', color: '#fff', border: '1px solid #333', borderRadius: '16px', boxShadow: '0 20px 40px -10px rgba(0, 0, 0, 0.8)', fontSize: '13px', padding: '16px' }}
                      itemStyle={{color: '#fff'}}
                      cursor={{fill: 'rgba(255,255,255,0.05)', radius: 12}}
                    />
                    <Bar dataKey="completed" stackId="a" fill="#10b981" radius={[0, 0, 12, 12]} />
                    <Bar dataKey="missed" stackId="a" fill="#333" radius={[12, 12, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>

            <div className="space-y-6">
              <Card className="h-full flex flex-col p-8 border-white/5">
                <div className="flex items-center justify-between mb-8">
                  <h3 className="text-lg font-black text-white">Calendar</h3>
                  <div className="flex items-center gap-2 bg-zinc-900 p-1.5 rounded-xl border border-zinc-800">
                    <button onClick={handlePrevMonth} className="p-1 hover:bg-white rounded-lg text-zinc-500 hover:text-black transition-all">
                      <ChevronLeft size={18} />
                    </button>
                    <span className="text-xs font-bold text-zinc-300 w-24 text-center uppercase tracking-wide">
                       {viewDate.toLocaleString('default', { month: 'short', year: 'numeric' })}
                    </span>
                    <button onClick={handleNextMonth} className="p-1 hover:bg-white rounded-lg text-zinc-500 hover:text-black transition-all">
                      <ChevronRight size={18} />
                    </button>
                  </div>
                </div>
                
                <div className="flex-1 flex flex-col items-center justify-center">
                   <div className="grid grid-cols-7 gap-3 w-full">
                     {renderCalendarDays()}
                   </div>
                </div>
              </Card>
            </div>
          </div>

          {/* TASK MANAGEMENT SECTION */}
          <div className="w-full">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
               <div>
                  <h2 className="text-2xl font-black text-white tracking-tight">Manage Tasks</h2>
                  <p className="text-zinc-400 font-medium">Assign specific routines to {client.name}.</p>
               </div>
               <Button onClick={() => setIsAddingTask(!isAddingTask)} size="md" variant="primary" icon={<Plus size={18} />}>
                  Assign Task
               </Button>
            </div>

            {isAddingTask && (
                <Card className="mb-6 border-indigo-500/30 bg-indigo-500/5">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-bold text-white">New Assignment</h3>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-4 items-end">
                        <Input placeholder="Task Title" value={newTaskTitle} onChange={e => setNewTaskTitle(e.target.value)} autoFocus />
                        <Input type="time" value={newTaskTime} onChange={e => setNewTaskTime(e.target.value)} className="sm:w-48" />
                        <Button onClick={handleSubmitTask} size="lg" className="w-full sm:w-auto">Add to Schedule</Button>
                    </div>
                </Card>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {tasks.sort((a,b) => a.time.localeCompare(b.time)).map((task) => {
                    const isDone = task.status === 'COMPLETED';
                    return (
                        <div key={task.id} className="group flex items-center justify-between bg-zinc-900 border border-zinc-800 rounded-2xl p-4 hover:border-zinc-700 transition-all">
                            <div className="flex items-center gap-4">
                                <div className={`flex flex-col items-center justify-center w-12 h-12 rounded-xl bg-black border ${isDone ? 'border-emerald-900 text-emerald-500' : 'border-zinc-800 text-zinc-400'}`}>
                                    <span className="text-xs font-bold">{task.time}</span>
                                </div>
                                <div>
                                    <h4 className={`text-sm font-bold ${isDone ? 'text-zinc-500 line-through' : 'text-white'}`}>{task.title}</h4>
                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wide ${task.isDefault ? 'bg-zinc-800 text-zinc-500' : 'bg-fuchsia-900/30 text-fuchsia-400'}`}>
                                        {task.isDefault ? 'Routine' : 'Custom'}
                                    </span>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                {isDone ? <Check size={16} className="text-emerald-500"/> : <Circle size={16} className="text-zinc-700"/>}
                                <button 
                                    onClick={() => onDeleteTask(task.id)}
                                    className="p-2 rounded-lg text-zinc-600 hover:text-red-500 hover:bg-red-500/10 transition-colors"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>
                    );
                })}
                {tasks.length === 0 && (
                     <div className="col-span-full py-12 text-center text-zinc-600 font-medium bg-zinc-900/30 rounded-3xl border border-dashed border-zinc-800">
                        No tasks assigned for today.
                     </div>
                )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
            <Card className="flex flex-col items-center justify-center p-8 min-h-[320px] border-white/5">
              <h3 className="text-lg font-black text-white mb-6 w-full text-left flex items-center gap-3">
                 <span className="w-8 h-8 rounded-lg bg-pink-500/20 flex items-center justify-center text-pink-500"><PieChartIcon size={18} /></span>
                 Ratio ({selectedDate})
              </h3>
              
              {selectedDayStats.total > 0 ? (
                <div className="w-full flex items-center justify-between">
                  <div className="w-1/2 h-[200px] relative">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={pieData}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={8}
                            dataKey="value"
                            stroke="none"
                            cornerRadius={8}
                          >
                            {pieData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
                        <span className="text-3xl font-black text-white tracking-tighter">{Math.round((selectedDayStats.completed / (selectedDayStats.total || 1)) * 100)}%</span>
                    </div>
                  </div>
                  <div className="flex-1 flex flex-col gap-4 pl-8">
                     <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800">
                        <span className="text-xs font-bold text-zinc-500 uppercase tracking-wide">Completed</span>
                        <div className="text-2xl font-black text-emerald-400">{selectedDayStats.completed}</div>
                     </div>
                     <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800">
                        <span className="text-xs font-bold text-zinc-500 uppercase tracking-wide">Missed</span>
                        <div className="text-2xl font-black text-red-400">{selectedDayStats.missed}</div>
                     </div>
                  </div>
                </div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-zinc-700">
                  <PieChartIcon size={48} className="mb-4 opacity-20" />
                  <p className="text-sm font-bold">No data.</p>
                </div>
              )}
            </Card>

            <Card className="flex flex-col p-8 border-white/5">
              <h3 className="text-lg font-black text-white mb-6">Logs</h3>
              <div className="space-y-4 flex-1 overflow-y-auto max-h-[250px] custom-scrollbar pr-2">
                {selectedDayStats.completed > 0 && Array.from({ length: selectedDayStats.completed }).map((_, i) => (
                  <div key={`comp-${i}`} className="flex items-center gap-4 p-4 rounded-[1.25rem] bg-emerald-500/10 border border-emerald-500/20">
                    <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                        <div className="w-2.5 h-2.5 bg-black rounded-full" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white">Task Completed</p>
                      <p className="text-xs text-zinc-500 font-medium">Logged at {8 + i}:30 AM</p>
                    </div>
                  </div>
                ))}
                {selectedDayStats.missed > 0 && Array.from({ length: selectedDayStats.missed }).map((_, i) => (
                  <div key={`miss-${i}`} className="flex items-center gap-4 p-4 rounded-[1.25rem] bg-red-500/10 border border-red-500/20">
                     <div className="w-8 h-8 rounded-full bg-red-900/50 border border-red-800 flex items-center justify-center">
                        <div className="w-2.5 h-2.5 bg-red-500 rounded-full" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-red-200">Missed Task</p>
                      <p className="text-xs text-red-200/50 font-medium">Auto-recorded</p>
                    </div>
                  </div>
                ))}
                {selectedDayStats.total === 0 && (
                   <div className="h-full flex flex-col items-center justify-center text-xs text-zinc-600 font-medium">
                     No activity found.
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