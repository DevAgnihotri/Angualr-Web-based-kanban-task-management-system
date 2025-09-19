export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  createdDate: Date;
  dueDate?: Date;
  assignee?: string;
  tags?: string[];
}

export enum TaskStatus {
  TODO = 'todo',
  IN_PROGRESS = 'in-progress',
  DONE = 'done',
  CUSTOM = 'custom'
}

export enum TaskPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high'
}

export interface Column {
  id: string;
  title: string;
  status: TaskStatus;
  tasks: Task[];
  position: number;
  isCustom?: boolean;
  color?: string;
  createdDate?: Date;
}

export interface KanbanBoard {
  id: string;
  title: string;
  columns: Column[];
  createdDate: Date;
  lastModified: Date;
}
