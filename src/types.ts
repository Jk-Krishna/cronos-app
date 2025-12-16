
export type ViewState = 
  | 'LOGIN' 
  | 'REGISTER'
  | 'ADMIN_LOGIN'
  | 'PROFILE_SELECT'
  | 'USER_HOME' 
  | 'ADMIN_DASHBOARD';

export interface Admin {
  id: string; // 'admin'
  password: string; // 'admin'
}

export interface TaskDefinition {
  id: string;
  title: string;
  defaultTime: string; // HH:MM
  isDefault: boolean; // True if created by admin
}

export interface TaskInstance {
  id: string;
  defId?: string; // Link to definition if default
  title: string;
  description: string;
  time: string; // HH:MM
  status: 'PENDING' | 'COMPLETED' | 'MISSED';
  date: string; // YYYY-MM-DD
  isDefault: boolean; // Preserved from definition for quick checks
}

export interface UserProfile {
  id: string;
  name: string;
  avatar: string;
  tasks: TaskInstance[];
}

export interface UserGroup {
  id: string; // The "USER ID" used for login
  password: string;
  profiles: UserProfile[]; // "You", "User 1", etc.
}

export type Client = UserProfile;
export type Task = TaskInstance;