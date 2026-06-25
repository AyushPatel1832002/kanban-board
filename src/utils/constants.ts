export type ColumnKey = 'todo' | 'inprogress' | 'done'
export type Priority = 'Low' | 'Medium' | 'High'
export type Role = 'admin' | 'user'

export type Card = {
  id: string
  title: string
  description: string
  assignedTo: string
  priority: Priority
  column: ColumnKey
  createdAt: string
  createdBy: string
}

export type User = {
  id: string
  name: string
  email: string
  role: Role
}

export type ActivityLog = {
  id: string
  timestamp: string
  message: string
}

export const COLUMNS = [
  { key: 'todo' as ColumnKey, title: 'To Do' },
  { key: 'inprogress' as ColumnKey, title: 'In Progress' },
  { key: 'done' as ColumnKey, title: 'Done' },
]

export const PRIORITY_OPTIONS: Priority[] = ['Low', 'Medium', 'High']
export const STATUS_OPTIONS = ['all', 'todo', 'inprogress', 'done'] as const
export const ASSIGNED_OPTIONS = ['all'] as const

export const DEFAULT_USERS: User[] = [
  { id: 'admin', name: 'Admin', email: 'admin@kanban.local', role: 'admin' },
  { id: 'u1', name: 'Maya', email: 'maya@kanban.local', role: 'user' },
  { id: 'u2', name: 'Leo', email: 'leo@kanban.local', role: 'user' },
  { id: 'u3', name: 'Tina', email: 'tina@kanban.local', role: 'user' },
]

export const INITIAL_CARDS: Card[] = [
  {
    id: 'c1',
    title: 'Finalize dashboard layout',
    description: 'Build the board layout with columns and cards.',
    assignedTo: 'u1',
    priority: 'High',
    column: 'todo',
    createdAt: new Date().toISOString(),
    createdBy: 'admin',
  },
  {
    id: 'c2',
    title: 'Write optimistic move logic',
    description: 'Implement optimistic UI updates with rollback.',
    assignedTo: 'u2',
    priority: 'Medium',
    column: 'inprogress',
    createdAt: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
    createdBy: 'admin',
  },
  {
    id: 'c3',
    title: 'Review access rules for users',
    description: 'Ensure users can only edit their own cards.',
    assignedTo: 'u3',
    priority: 'Low',
    column: 'done',
    createdAt: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
    createdBy: 'u3',
  },
]

export function formatTimestamp(timestamp: string) {
  return new Date(timestamp).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function formatCardAge(createdAt: string) {
  return new Date(createdAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  })
}
