import type { Client, Task } from '../types.ts';

export const initialClients: Client[] = [
  {
    id: 'c1',
    name: 'Alice Freeman',
    email: 'alice',
    avatar: 'https://picsum.photos/200/200?random=1',
  },
  {
    id: 'c2',
    name: 'Bob Smith',
    email: 'bob',
    avatar: 'https://picsum.photos/200/200?random=2',
  },
  {
    id: 'c3',
    name: 'Charlie Davis',
    email: 'charlie',
    avatar: 'https://picsum.photos/200/200?random=3',
  },
];

const today = new Date().toISOString().split('T')[0];

export const initialTasks: Task[] = [
  // Alice's Tasks
  { id: 't1', clientId: 'c1', title: 'Morning Medication', description: 'Take 2 pills of supplement A', time: '08:00', status: 'PENDING', date: today },
  { id: 't2', clientId: 'c1', title: 'Drink Water', description: '1 Liter of water', time: '11:00', status: 'PENDING', date: today },
  { id: 't3', clientId: 'c1', title: 'Lunch Walk', description: '15 min walk after lunch', time: '13:00', status: 'PENDING', date: today },
  { id: 't4', clientId: 'c1', title: 'Evening Report', description: 'Submit daily report', time: '17:00', status: 'PENDING', date: today },

  // Bob's Tasks
  { id: 't5', clientId: 'c2', title: 'Gym Session', description: 'Cardio 30 mins', time: '07:00', status: 'PENDING', date: today },
  { id: 't6', clientId: 'c2', title: 'Client Meeting', description: 'Zoom call with Team A', time: '10:00', status: 'PENDING', date: today },
];

export const generateMockHistory = (_clientId: string, days = 7) => {
  const history = [];
  for (let i = days; i > 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    
    // Random stats
    const total = 5;
    const completed = Math.floor(Math.random() * (total + 1));
    const missed = total - completed;
    
    history.push({
      date: dateStr,
      completed,
      missed,
      total
    });
  }
  return history;
};  