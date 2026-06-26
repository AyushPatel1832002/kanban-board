import type { BoardState } from '../reducers/boardReducer'
import type { Card, ColumnKey, Priority, User } from '../utils/constants'

type ApiBoardState = Pick<BoardState, 'cards' | 'users' | 'logs'>

async function apiRequest<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(path, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  })

  if (!response.ok) {
    const payload = await response.json().catch(() => ({}))
    throw new Error(payload.error ?? 'Request failed')
  }

  return response.json()
}

export function fetchBoard() {
  return apiRequest<ApiBoardState>('/api/board')
}

export function createCard(card: Card) {
  return apiRequest<Card>('/api/cards', {
    method: 'POST',
    body: JSON.stringify(card),
  })
}

export function updateCard(
  id: string,
  updates: Partial<Pick<Card, 'title' | 'description' | 'priority' | 'assignedTo' | 'column'>>,
  actor: string,
) {
  return apiRequest<Card>(`/api/cards/${id}`, {
    method: 'PATCH',
    body: JSON.stringify({ updates, actor }),
  })
}

export function deleteCardById(id: string, actor: string) {
  return apiRequest<{ ok: true }>(`/api/cards/${id}`, {
    method: 'DELETE',
    body: JSON.stringify({ actor }),
  })
}

export function moveCardById(id: string, from: ColumnKey, to: ColumnKey, actor: string) {
  return apiRequest<Card>(`/api/cards/${id}/move`, {
    method: 'PATCH',
    body: JSON.stringify({ from, to, actor }),
  })
}

export function assignCardById(id: string, assignedTo: string, actor: string) {
  return apiRequest<Card>(`/api/cards/${id}/assign`, {
    method: 'PATCH',
    body: JSON.stringify({ assignedTo, actor }),
  })
}

export function createUser(user: User, actor: string) {
  return apiRequest<User>('/api/users', {
    method: 'POST',
    body: JSON.stringify({ ...user, actor }),
  })
}

export function updateUserById(id: string, updates: Partial<Pick<User, 'name' | 'email' | 'role'>>, actor: string) {
  return apiRequest<User>(`/api/users/${id}`, {
    method: 'PATCH',
    body: JSON.stringify({ updates, actor }),
  })
}

export function deleteUserById(id: string, actor: string) {
  return apiRequest<{ ok: true }>(`/api/users/${id}`, {
    method: 'DELETE',
    body: JSON.stringify({ actor }),
  })
}

export function newCardId() {
  return `card_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`
}

export function newUserId() {
  return `user_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`
}

export type CardInput = {
  title: string
  description: string
  column: ColumnKey
  priority: Priority
  assignedTo: string
  createdBy: string
}
