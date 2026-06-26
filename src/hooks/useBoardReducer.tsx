import { useCallback, useEffect, useReducer, useState } from 'react'
import {
  assignCardById,
  createCard,
  createUser,
  deleteCardById,
  deleteUserById,
  fetchBoard,
  moveCardById,
  newCardId,
  newUserId,
  updateCard,
  updateUserById,
} from '../services/boardApi'
import boardReducer, { initialBoardState } from '../reducers/boardReducer'
import type { Card, ColumnKey, Priority, User } from '../utils/constants'

export type BoardState = typeof initialBoardState

export default function useBoardReducer() {
  const [state, dispatch] = useReducer(boardReducer, initialBoardState)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let isMounted = true

    fetchBoard()
      .then((board) => {
        if (isMounted) {
          dispatch({ type: 'SET_BOARD', payload: board })
        }
      })
      .catch((error) => {
        console.error('Failed to load board from database', error)
      })
      .finally(() => {
        if (isMounted) {
          setIsLoading(false)
        }
      })

    return () => {
      isMounted = false
    }
  }, [])

  const syncBoard = useCallback(() => {
    return fetchBoard()
      .then((board) => {
        dispatch({ type: 'SET_BOARD', payload: board })
      })
      .catch((error) => {
        console.error('Failed to sync board from database', error)
      })
  }, [])

  const addCard = useCallback(
    (
      title: string,
      description: string,
      column: ColumnKey,
      priority: Priority,
      assignedTo: string,
      createdBy: string,
      actorRole: User['role'],
    ) => {
      if (actorRole !== 'admin') {
        throw new Error('Only admins can create tasks.')
      }

      const card: Card = {
        id: newCardId(),
        title,
        description,
        column,
        priority,
        assignedTo,
        createdBy,
        createdAt: new Date().toISOString(),
      }

      dispatch({
        type: 'ADD_CARD_RECORD',
        payload: { card, actor: createdBy },
      })
      createCard(card).then(syncBoard).catch((error) => {
        console.error('Failed to save card to database', error)
        syncBoard()
      })
    },
    [syncBoard],
  )

  const editCard = useCallback(
    (id: string, updates: Partial<Pick<Card, 'title' | 'description' | 'priority' | 'assignedTo' | 'column'>>, actor: string) => {
      dispatch({ type: 'EDIT_CARD', payload: { id, updates, actor } })
      updateCard(id, updates, actor).then(syncBoard).catch((error) => {
        console.error('Failed to update card in database', error)
        syncBoard()
      })
    },
    [syncBoard],
  )

  const deleteCard = useCallback((id: string, actor: string) => {
    dispatch({ type: 'DELETE_CARD', payload: { id, actor } })
    deleteCardById(id, actor).then(syncBoard).catch((error) => {
      console.error('Failed to delete card from database', error)
      syncBoard()
    })
  }, [syncBoard])

  const moveCard = useCallback(
    (id: string, to: ColumnKey, from: ColumnKey, actor: string) => {
      dispatch({ type: 'MOVE_CARD', payload: { id, from, to, actor } })
      return moveCardById(id, from, to, actor)
        .then(() => {
          dispatch({ type: 'RESOLVE_MOVE', payload: { id, from, to, actor } })
          return syncBoard()
        })
        .catch((error) => {
          dispatch({ type: 'ROLLBACK_MOVE', payload: { id, from, reason: error.message } })
          throw error
        })
    },
    [syncBoard],
  )

  const assignUser = useCallback((id: string, assignedTo: string, actor: string) => {
    dispatch({ type: 'ASSIGN_USER', payload: { id, assignedTo, actor } })
    assignCardById(id, assignedTo, actor).then(syncBoard).catch((error) => {
      console.error('Failed to assign card in database', error)
      syncBoard()
    })
  }, [syncBoard])

  const addUser = useCallback((name: string, email: string, role: User['role'], actor: string, id?: string) => {
    const userId = id ?? newUserId()
    const user: User = { id: userId, name, email, role }
    dispatch({ type: 'ADD_USER', payload: { id: userId, name, email, role, actor } })
    createUser(user, actor).then(syncBoard).catch((error) => {
      console.error('Failed to save user to database', error)
      syncBoard()
    })
    return userId
  }, [syncBoard])

  const editUser = useCallback((id: string, updates: Partial<Pick<User, 'name' | 'email' | 'role'>>, actor: string) => {
    dispatch({ type: 'EDIT_USER', payload: { id, updates, actor } })
    updateUserById(id, updates, actor).then(syncBoard).catch((error) => {
      console.error('Failed to update user in database', error)
      syncBoard()
    })
  }, [syncBoard])

  const deleteUser = useCallback((id: string, actor: string) => {
    dispatch({ type: 'DELETE_USER', payload: { id, actor } })
    deleteUserById(id, actor).then(syncBoard).catch((error) => {
      console.error('Failed to delete user from database', error)
      syncBoard()
    })
  }, [syncBoard])

  const isPending = useCallback(
    (id: string) => !!state.pendingMoves[id],
    [state.pendingMoves],
  )

  return {
    state,
    isLoading,
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
