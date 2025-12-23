
export interface Task {
  id: number;
  description: string;
}

export interface EmployeeData {
  name: string;
  checklistLink: string;
  tasks: Task[];
}

export enum TabType {
  DAILY = 'daily',
  WMY = 'wmy'
}
