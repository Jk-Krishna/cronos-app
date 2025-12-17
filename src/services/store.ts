import type { UserGroup, TaskDefinition, TaskInstance, Admin } from '../types';

const TODAY = new Date().toISOString().split('T')[0];

export const DEFAULT_TASKS: TaskDefinition[] = [
  { id: 'dt1', title: 'Morning Medicine', defaultTime: '08:00', isDefault: true },
  { id: 'dt2', title: 'Afternoon Walk', defaultTime: '14:00', isDefault: true },
  { id: 'dt3', title: 'Evening Reading', defaultTime: '20:00', isDefault: true },
];

export const generateDailyTasks = (date: string): TaskInstance[] => {
  return DEFAULT_TASKS.map(dt => ({
    id: `inst-${dt.id}-${Math.random().toString(36).substr(2, 9)}`,
    defId: dt.id,
    title: dt.title,
    description: 'Scheduled Routine',
    time: dt.defaultTime,
    status: 'PENDING',
    date: date,
    isDefault: true
  }));
};

export const generateMockHistory = (_userId: string, days: number = 7) => {
  const history = [];
  const today = new Date();
  for (let i = 0; i < days; i++) {
    const d = new Date();
    d.setDate(today.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    const total = 5;
    const completed = Math.floor(Math.random() * (total + 1));
    const missed = total - completed;
    history.push({ date: dateStr, completed, missed, total });
  }
  return history.reverse();
};

class Store {
  groups: UserGroup[];
  admins: Admin[];
  
  constructor() {
    this.groups = [{
      id: 'family123',
      password: 'pass',
      profiles: [
        {
          id: 'p1',
          name: 'Felix',
          avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix',
          tasks: generateDailyTasks(TODAY)
        },
        {
          id: 'p2',
          name: 'Jack',
          avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jack',
          tasks: generateDailyTasks(TODAY)
        }
      ]
    }];
    this.admins = [{ id: '360Creator', password: 'creator@360' }];
  }

  validateAdmin(id: string, pass: string) {
    return this.admins.find(a => a.id === id && a.password === pass);
  }

  addAdmin(id: string, pass: string) {
    if (this.admins.find(a => a.id === id)) return false;
    this.admins.push({ id, password: pass });
    return true;
  }

  resetAdminPassword(id: string, newPass: string) {
    const admin = this.admins.find(a => a.id === id);
    if (admin) {
      admin.password = newPass;
      return true;
    }
    return false;
  }

  addGroup(id: string, password: string, initialProfileName: string = 'You') {
    if (this.groups.find(g => g.id === id)) return false;
    this.groups.push({
      id,
      password,
      profiles: [{
        id: `p-${Date.now()}`,
        name: initialProfileName,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${initialProfileName}`,
        tasks: generateDailyTasks(TODAY)
      }]
    });
    return true;
  }

  addProfileToGroup(groupId: string, name: string) {
    const group = this.groups.find(g => g.id === groupId);
    if (group) {
      group.profiles.push({
        id: `p-${Date.now()}`,
        name: name,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`,
        tasks: generateDailyTasks(TODAY)
      });
      return true;
    }
    return false;
  }

  addTaskToProfile(groupId: string, profileId: string, title: string, time: string) {
    const group = this.groups.find(g => g.id === groupId);
    if (group) {
      const profile = group.profiles.find(p => p.id === profileId);
      if (profile) {
        profile.tasks.push({
          id: `admin-${Date.now()}`,
          title,
          description: 'Admin Assigned',
          time,
          status: 'PENDING',
          date: TODAY,
          isDefault: false
        });
        return true;
      }
    }
    return false;
  }

  deleteTaskFromProfile(groupId: string, profileId: string, taskId: string) {
    const group = this.groups.find(g => g.id === groupId);
    if (group) {
      const profile = group.profiles.find(p => p.id === profileId);
      if (profile) {
        profile.tasks = profile.tasks.filter(t => t.id !== taskId);
        return true;
      }
    }
    return false;
  }

  deleteProfileFromGroup(groupId: string, profileId: string) {
    const group = this.groups.find(g => g.id === groupId);
    if (group) {
      group.profiles = group.profiles.filter(p => p.id !== profileId);
    }
  }

  getGroup(id: string) {
    return this.groups.find(g => g.id === id);
  }

  resetGroupPassword(id: string, newPassword: string) {
    const group = this.groups.find(g => g.id === id);
    if (group) {
      group.password = newPassword;
      return true;
    }
    return false;
  }

  updateDefaultTaskTime(defId: string, newTime: string) {
    const def = DEFAULT_TASKS.find(t => t.id === defId);
    if (def) def.defaultTime = newTime;
  }

  addDefaultTask(title: string, time: string) {
    const newId = `dt-${Date.now()}`;
    DEFAULT_TASKS.push({
      id: newId,
      title,
      defaultTime: time,
      isDefault: true
    });
    return true;
  }
}

export const store = new Store();