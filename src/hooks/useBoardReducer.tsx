import { useCallback, useEffect, useReducer } from 'react'
import fakeSaveMove from '../services/fakeApi'
import boardReducer, { initialBoardState } from '../reducers/boardReducer'
import type { Card, ColumnKey, Priority, User } from '../utils/constants'

export type BoardState = typeof initialBoardState

export default function useBoardReducer() {
  const [state, dispatch] = useReducer(boardReducer, initialBoardState, () => {
    try {
      const saved = localStorage.getItem('kanban_board_state')
      if (saved) {
        const parsed = JSON.parse(saved)
        return {
          ...parsed,
          pendingMoves: {},
        }
      }
    } catch {
      // ignore fallback
    }
    return initialBoardState
  })

  useEffect(() => {
    try {
      localStorage.setItem(
        'kanban_board_state',
        JSON.stringify({
          cards: state.cards,
          users: state.users,
          logs: state.logs,
        }),
      )
    } catch (e) {
      console.error('Failed to save board state to localStorage', e)
    }
  }, [state.cards, state.users, state.logs])

  const addCard = useCallback(
    (title: string, description: string, column: ColumnKey, priority: Priority, assignedTo: string, createdBy: string) => {
      dispatch({
        type: 'ADD_CARD',
        payload: { title, description, column, priority, assignedTo, createdBy },
      })
    },
    [],
  )

  const editCard = useCallback(
    (id: string, updates: Partial<Pick<Card, 'title' | 'description' | 'priority' | 'assignedTo' | 'column'>>, actor: string) => {
      dispatch({ type: 'EDIT_CARD', payload: { id, updates, actor } })
    },
    [],
  )

  const deleteCard = useCallback((id: string, actor: string) => {
    dispatch({ type: 'DELETE_CARD', payload: { id, actor } })
  }, [])

  const moveCard = useCallback(
    (id: string, to: ColumnKey, from: ColumnKey, actor: string) => {
      dispatch({ type: 'MOVE_CARD', payload: { id, from, to, actor } })
      return fakeSaveMove()
        .then(() => {
          dispatch({ type: 'RESOLVE_MOVE', payload: { id, from, to, actor } })
        })
        .catch((error) => {
          dispatch({ type: 'ROLLBACK_MOVE', payload: { id, from, reason: error.message } })
          throw error
        })
    },
    [],
  )

  const assignUser = useCallback((id: string, assignedTo: string, actor: string) => {
    dispatch({ type: 'ASSIGN_USER', payload: { id, assignedTo, actor } })
  }, [])

  const addUser = useCallback((name: string, email: string, role: User['role'], actor: string) => {
    dispatch({ type: 'ADD_USER', payload: { name, email, role, actor } })
  }, [])

  const editUser = useCallback((id: string, updates: Partial<Pick<User, 'name' | 'email' | 'role'>>, actor: string) => {
    dispatch({ type: 'EDIT_USER', payload: { id, updates, actor } })
  }, [])

  const deleteUser = useCallback((id: string, actor: string) => {
    dispatch({ type: 'DELETE_USER', payload: { id, actor } })
  }, [])

  const isPending = useCallback(
    (id: string) => !!state.pendingMoves[id],
    [state.pendingMoves],
  )

  return {
    state,
    addCard,
    editCard,
    deleteCard,
    moveCard,
    assignUser,
    addUser,
    editUser,
    deleteUser,
    isPending,
  }
}
