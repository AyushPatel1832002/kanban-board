import { DEFAULT_USERS, INITIAL_CARDS, formatTimestamp } from '../utils/constants'
import type { ActivityLog, Card, ColumnKey, Priority, User } from '../utils/constants'

export type BoardState = {
  cards: Card[]
  users: User[]
  logs: ActivityLog[]
  pendingMoves: Record<string, boolean>
}

export type BoardAction =
  | { type: 'ADD_CARD'; payload: { title: string; description: string; column: ColumnKey; priority: Priority; assignedTo: string; createdBy: string } }
  | { type: 'EDIT_CARD'; payload: { id: string; updates: Partial<Pick<Card, 'title' | 'description' | 'priority' | 'assignedTo' | 'column'>>; actor: string } }
  | { type: 'DELETE_CARD'; payload: { id: string; actor: string } }
  | { type: 'MOVE_CARD'; payload: { id: string; from: ColumnKey; to: ColumnKey; actor: string } }
  | { type: 'RESOLVE_MOVE'; payload: { id: string; from: ColumnKey; to: ColumnKey; actor: string } }
  | { type: 'ROLLBACK_MOVE'; payload: { id: string; from: ColumnKey; reason: string } }
  | { type: 'ASSIGN_USER'; payload: { id: string; assignedTo: string; actor: string } }
  | { type: 'ADD_USER'; payload: { name: string; email: string; role: User['role']; actor: string } }
  | { type: 'EDIT_USER'; payload: { id: string; updates: Partial<Pick<User, 'name' | 'email' | 'role'>>; actor: string } }
  | { type: 'DELETE_USER'; payload: { id: string; actor: string } }

export const initialBoardState: BoardState = {
  cards: INITIAL_CARDS,
  users: DEFAULT_USERS,
  logs: [
    {
      id: 'log_1',
      timestamp: formatTimestamp(new Date().toISOString()),
      message: 'Admin initialized the board with starter tasks.',
    },
  ],
  pendingMoves: {},
}

function createLog(message: string): ActivityLog {
  return {
    id: `log_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    timestamp: formatTimestamp(new Date().toISOString()),
    message,
  }
}

function reducer(state: BoardState, action: BoardAction): BoardState {
  switch (action.type) {
    case 'ADD_CARD': {
      const card: Card = {
        id: `card_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        title: action.payload.title,
        description: action.payload.description,
        priority: action.payload.priority,
        assignedTo: action.payload.assignedTo,
        column: action.payload.column,
        createdAt: new Date().toISOString(),
        createdBy: action.payload.createdBy,
      }
      return {
        ...state,
        cards: [card, ...state.cards],
        logs: [
          createLog(`${action.payload.createdBy} created "${card.title}" in ${action.payload.column.replace(/^./, s => s.toUpperCase())}.`),
          ...state.logs,
        ],
      }
    }
    case 'EDIT_CARD': {
      const cards = state.cards.map((card) =>
        card.id === action.payload.id
          ? { ...card, ...action.payload.updates }
          : card,
      )
      return {
        ...state,
        cards,
        logs: [
          createLog(`${action.payload.actor} updated a card.`),
          ...state.logs,
        ],
      }
    }
    case 'DELETE_CARD': {
      return {
        ...state,
        cards: state.cards.filter((card) => card.id !== action.payload.id),
        pendingMoves: Object.fromEntries(
          Object.entries(state.pendingMoves).filter(([key]) => key !== action.payload.id),
        ),
        logs: [
          createLog(`${action.payload.actor} deleted a card.`),
          ...state.logs,
        ],
      }
    }
    case 'MOVE_CARD': {
      const cards = state.cards.map((card) =>
        card.id === action.payload.id ? { ...card, column: action.payload.to } : card,
      )
      return {
        ...state,
        cards,
        pendingMoves: { ...state.pendingMoves, [action.payload.id]: true },
      }
    }
    case 'RESOLVE_MOVE': {
      return {
        ...state,
        pendingMoves: Object.fromEntries(
          Object.entries(state.pendingMoves).filter(([key]) => key !== action.payload.id),
        ),
        logs: [
          createLog(
            `${action.payload.actor} moved a card from ${action.payload.from} to ${action.payload.to}.`,
          ),
          ...state.logs,
        ],
      }
    }
    case 'ROLLBACK_MOVE': {
      const cards = state.cards.map((card) =>
        card.id === action.payload.id ? { ...card, column: action.payload.from } : card,
      )
      return {
        ...state,
        cards,
        pendingMoves: Object.fromEntries(
          Object.entries(state.pendingMoves).filter(([key]) => key !== action.payload.id),
        ),
        logs: [
          createLog(`Failed to move card: ${action.payload.reason}`),
          ...state.logs,
        ],
      }
    }
    case 'ASSIGN_USER': {
      const cards = state.cards.map((card) =>
        card.id === action.payload.id ? { ...card, assignedTo: action.payload.assignedTo } : card,
      )
      return {
        ...state,
        cards,
        logs: [
          createLog(`${action.payload.actor} assigned a card.`),
          ...state.logs,
        ],
      }
    }
    case 'ADD_USER': {
      const user: User = {
        id: `user_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        name: action.payload.name,
        email: action.payload.email,
        role: action.payload.role,
      }
      return {
        ...state,
        users: [...state.users, user],
        logs: [
          createLog(`${action.payload.actor} added ${user.name}.`),
          ...state.logs,
        ],
      }
    }
    case 'EDIT_USER': {
      const users = state.users.map((user) =>
        user.id === action.payload.id ? { ...user, ...action.payload.updates } : user,
      )
      return {
        ...state,
        users,
        logs: [
          createLog(`${action.payload.actor} updated a user.`),
          ...state.logs,
        ],
      }
    }
    case 'DELETE_USER': {
      const users = state.users.filter((user) => user.id !== action.payload.id)
      const cards = state.cards.map((card) =>
        card.assignedTo === action.payload.id ? { ...card, assignedTo: '' } : card,
      )
      return {
        ...state,
        users,
        cards,
        logs: [
          createLog(`${action.payload.actor} deleted a user.`),
          ...state.logs,
        ],
      }
    }
    default:
      return state
  }
}

export default reducer
