export type UserRole = 'ADMIN' | 'CLIENT';

export type ViewState = 
  | 'HOME' 
  | 'LOGIN_CLIENT' 
  | 'LOGIN_ADMIN' 
  | 'CLIENT_DASHBOARD' 
  | 'ADMIN_DASHBOARD' 
  | 'ADMIN_ANALYTICS';

export interface Client {
  id: string;
  name: string;
  email: string; // Used as ID for login
  avatar: string;
}

export interface Task {
  id: string;
  clientId: string;
  title: string;
  description: string;
  time: string; // "HH:MM" 24h format
  status: 'PENDING' | 'COMPLETED' | 'MISSED';
  date: string; // YYYY-MM-DD
  completedAt?: string;
}

export interface DailyStats {
  date: string;
  completed: number;
  missed: number;
  total: number;
}