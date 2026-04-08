
export enum TaskStatus {
  NOT_DONE = 'לא בוצע',
  OPEN = 'פתוח',
  ONGOING = 'שוטף',
  DONE = 'בוצע',
  IN_PROGRESS = 'בתהליך',
  CANCELLED = 'בוטל'
}

export enum TaskPriority {
  LOW = 1,
  MED = 2,
  HIGH = 3
}

export interface User {
  id: string;
  name: string;
  avatar: string;
  org?: string;
}

export interface ListSection {
  id: string;
  title: string;
  isCollapsed: boolean;
  statusMatch: string[];
}

export interface List {
  id: string;
  name: string;
  isStarred: boolean;
  isPrivate: boolean;
  sections?: ListSection[];
}

export interface Workspace {
  id: string;
  name: string;
}

export type SidebarView = 'my-tasks' | 'due-soon' | 'overdue' | 'completed' | string;

export interface Task {
  id: string;
  id_num: string; // מס"ד
  creationTime: string; // זמן יצירה
  title: string[]; // גורם מנחה
  description: string; // מהות
  assignee: string[]; // אחריות
  status: string; // Changed from TaskStatus enum to string for dynamic statuses
  startTime: string; // תאריך התחלה
  endTime: string; // תאריך סיום
  fileCount: number; // קבצים
  priority: TaskPriority;
  archived: boolean;
  listId?: string;
  sectionId?: string; // Link to specific drawer
  assigneeId?: string;
  dueDate?: string;
  createdAt?: string;
  updatedAt?: string;
  tags?: string[];
}

export type ViewType = 'list' | 'board';