import { useCallback, useReducer } from 'react'
import fakeSaveMove from '../utils/fakeApi'

export type ColumnKey = 'todo' | 'inprogress' | 'done'
export type Card = { id: string; title: string; column: ColumnKey }

type State = {
  cards: Card[]
  pending: Record<string, boolean>
}

type Action =
  | {type: 'ADD'; title: string; column: ColumnKey}
  | {type: 'EDIT'; id: string; title: string}
  | {type: 'DELETE'; id: string}
  | {type: 'OPTIMISTIC_MOVE'; id: string; from: ColumnKey; to: ColumnKey}
  | {type: 'ROLLBACK_MOVE'; id: string; from: ColumnKey}
  | {type: 'RESOLVE_MOVE'; id: string}

const seed: Card[] = [
  {id: 'c1', title: 'Set up project', column: 'todo'},
  {id: 'c2', title: 'Design board', column: 'todo'},
  {id: 'c3', title: 'Implement drag', column: 'inprogress'},
  {id: 'c4', title: 'Write tests', column: 'done'},
]

function reducer(state: State, action: Action): State {
  switch (action.type) {
      case 'ADD': {
        const card: Card = {id: `id_${Date.now()}_${Math.floor(Math.random()*10000)}`, title: action.title, column: action.column}
      return {...state, cards: [card, ...state.cards]}
    }
    case 'EDIT': {
      return {...state, cards: state.cards.map(c => c.id === action.id ? {...c, title: action.title} : c)}
    }
    case 'DELETE': {
      const pending = {...state.pending}
      delete pending[action.id]
      return {...state, cards: state.cards.filter(c => c.id !== action.id), pending}
    }
    case 'OPTIMISTIC_MOVE': {
      const cards = state.cards.map(c => c.id === action.id ? {...c, column: action.to} : c)
      return {...state, cards, pending: {...state.pending, [action.id]: true}}
    }
    case 'ROLLBACK_MOVE': {
      const cards = state.cards.map(c => c.id === action.id ? {...c, column: action.from} : c)
      const pending = {...state.pending}
      delete pending[action.id]
      return {...state, cards, pending}
    }
    case 'RESOLVE_MOVE': {
      const pending = {...state.pending}
      delete pending[action.id]
      return {...state, pending}
    }
    default:
      return state
  }
}

export default function useBoard() {
  const [state, dispatch] = useReducer(reducer, {cards: seed, pending: {}})

  const addCard = useCallback((title: string, column: ColumnKey) => dispatch({type: 'ADD', title, column}), [])
  const editCard = useCallback((id: string, title: string) => dispatch({type: 'EDIT', id, title}), [])
  const deleteCard = useCallback((id: string) => dispatch({type: 'DELETE', id}), [])

  const moveCard = useCallback((id: string, to: ColumnKey, from: ColumnKey) => {
    // apply optimistic update
    dispatch({type: 'OPTIMISTIC_MOVE', id, from, to})
    return fakeSaveMove().then(() => {
      dispatch({type: 'RESOLVE_MOVE', id})
    }).catch(err => {
      dispatch({type: 'ROLLBACK_MOVE', id, from})
      throw err
    })
  }, [])

  const isPending = useCallback((id: string) => !!state.pending[id], [state.pending])

  return {state, addCard, editCard, deleteCard, moveCard, isPending}
}
