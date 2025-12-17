import React, { useState, useMemo } from 'react';
import { ArrowLeft, Plus, Trash2, PieChart as PieIcon, Calendar as CalendarIcon } from 'lucide-react';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';
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
  const [selectedDate, _setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskTime, setNewTaskTime] = useState('');
  const [isAddingTask, setIsAddingTask] = useState(false);

  const selectedDayStats = historyData.find(d => d.date === selectedDate) || {
    date: selectedDate,
    completed: 0,
    missed: 0,
    total: 0
  };
  
  const pieData = [
    { name: 'Completed', value: selectedDayStats.completed, color: '#ffffff' }, 
    { name: 'Missed', value: selectedDayStats.missed, color: '#27272a' }, 
  ];

  const handleSubmitTask = () => {
    if (newTaskTitle && newTaskTime) {
      onAddTask(newTaskTitle, newTaskTime);
      setIsAddingTask(false);
      setNewTaskTitle('');
      setNewTaskTime('');
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-black overflow-hidden">
       <nav className="px-6 py-6 flex items-center gap-6 z-20 flex-shrink-0">
         <Button variant="ghost" size="sm" onClick={onBack} className="rounded-full p-2 hover:bg-zinc-900 text-zinc-500">
            <ArrowLeft size={24} />
          </Button>
          <div className="flex items-center gap-4">
            <img src={client.avatar} className="w-10 h-10 rounded-full bg-zinc-900" alt="avatar" />
            <div className="flex flex-col">
              <h1 className="text-2xl font-black text-white leading-none tracking-tighter uppercase">{client.name}</h1>
              <span className="text-[10px] font-black text-zinc-600 uppercase tracking-widest mt-1">Operational Analytics</span>
            </div>
          </div>
      </nav>

      <div className="flex-1 overflow-y-auto px-4 sm:px-8 py-4 pb-20 no-scrollbar">
        <div className="max-w-6xl mx-auto space-y-6">
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2 min-h-[300px] flex flex-col border-zinc-800 bg-zinc-950">
              <h3 className="text-[10px] font-black text-zinc-600 uppercase tracking-widest mb-6 flex items-center gap-2">
                <CalendarIcon size={12} /> 7-Day Performance
              </h3>
              <div className="flex-1 w-full min-h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={historyData} barSize={32}>
                    <XAxis dataKey="date" stroke="#27272a" fontSize={10} tickFormatter={(val) => val.slice(5)} tickLine={false} axisLine={false} dy={10} fontWeight={900} />
                    <Tooltip cursor={{fill: 'rgba(255,255,255,0.02)', radius: 12}} contentStyle={{ backgroundColor: '#000', color: '#fff', border: '1px solid #27272a', borderRadius: '16px' }} />
                    <Bar dataKey="completed" stackId="a" fill="#ffffff" radius={[0, 0, 8, 8]} />
                    <Bar dataKey="missed" stackId="a" fill="#27272a" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>

            <Card className="flex flex-col items-center justify-center bg-zinc-950 border-zinc-800">
               <h3 className="text-[10px] font-black text-zinc-600 uppercase tracking-widest mb-4 w-full flex items-center gap-2">
                 <PieIcon size={12} /> Success Ratio
               </h3>
               <div className="w-full h-[200px] relative">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={65}
                        outerRadius={85}
                        paddingAngle={4}
                        dataKey="value"
                        stroke="none"
                        cornerRadius={100}
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
                    <span className="text-4xl font-black text-white">{Math.round((selectedDayStats.completed / (selectedDayStats.total || 1)) * 100)}%</span>
                  </div>
               </div>
            </Card>
          </div>

          <div className="w-full">
            <div className="flex items-center justify-between mb-8">
               <h2 className="text-2xl font-black text-white tracking-tighter uppercase">Directives</h2>
               <Button onClick={() => setIsAddingTask(!isAddingTask)} size="sm" variant="primary" icon={<Plus size={16} />}>Assign Task</Button>
            </div>

            {isAddingTask && (
                <Card className="mb-8 bg-zinc-950 border border-white/10 shadow-2xl animate-in slide-in-from-top-4 duration-300">
                    <div className="flex flex-col sm:flex-row gap-4 items-end">
                        <Input label="Directives Title" placeholder="e.g. Health Check" value={newTaskTitle} onChange={e => setNewTaskTitle(e.target.value)} autoFocus />
                        <Input label="Time" type="time" value={newTaskTime} onChange={e => setNewTaskTime(e.target.value)} className="sm:w-48" />
                        <Button onClick={handleSubmitTask} size="lg" className="w-full sm:w-auto">Assign</Button>
                    </div>
                </Card>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {tasks.sort((a,b) => a.time.localeCompare(b.time)).map((task) => {
                    const isDone = task.status === 'COMPLETED';
                    return (
                        <div key={task.id} className="group flex items-center justify-between bg-zinc-900/50 rounded-[2rem] p-6 hover:bg-zinc-900 border border-transparent hover:border-zinc-800 transition-all">
                            <div className="flex items-center gap-5">
                                <span className="font-mono text-sm font-black text-zinc-600 bg-black px-2 py-1 rounded-lg">{task.time}</span>
                                <div>
                                    <h4 className={`text-base font-black ${isDone ? 'text-zinc-700 line-through' : 'text-white'}`}>{task.title}</h4>
                                    <span className="text-[10px] font-black text-zinc-700 uppercase tracking-widest">
                                        {task.isDefault ? 'Recurring' : 'Ad-hoc'}
                                    </span>
                                </div>
                            </div>
                            <button 
                                onClick={() => onDeleteTask(task.id)}
                                className="text-zinc-800 hover:text-red-500 transition-colors p-2"
                            >
                                <Trash2 size={18} />
                            </button>
                        </div>
                    );
                })}
                {tasks.length === 0 && (
                   <div className="col-span-full py-20 text-center border-2 border-dashed border-zinc-900 rounded-[3rem]">
                      <span className="text-zinc-700 font-black uppercase tracking-widest text-xs">No active directives assigned</span>
                   </div>
                )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminAnalytics;