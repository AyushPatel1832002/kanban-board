import React, { useCallback, useMemo, useState } from 'react'
import useBoard, { Card as CardType } from '../hooks/useBoard'
import Column from './Column'
import EditModal from './EditModal'
import Toast from './Toast'

const COLUMNS = [
  {key: 'todo', title: 'To Do'},
  {key: 'inprogress', title: 'In Progress'},
  {key: 'done', title: 'Done'},
]

function Kanban() {
  const {state, addCard, editCard, deleteCard, moveCard, isPending} = useBoard()
  const [search, setSearch] = useState('')
  const [editing, setEditing] = useState<CardType | null>(null)
  const [toast, setToast] = useState<string | null>(null)

  const onMove = useCallback((id: string, to: string, from: string) => {
    moveCard(id, to, from).catch((err: any) => {
      setToast(err?.message || 'Save failed')
      setTimeout(() => setToast(null), 2500)
    })
  }, [moveCard])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return state.cards
    return state.cards.filter(c => c.title.toLowerCase().includes(q))
  }, [state.cards, search])

  return (
    <div className="board">
      <header className="board-header">
        <h1>Kanban Board</h1>
        <div>
          <input
            className="search-input"
            placeholder="Search cards..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </header>

      <div className="columns">
        {COLUMNS.map(col => (
          <Column
            key={col.key}
            columnKey={col.key}
            title={col.title}
            cards={filtered.filter(c => c.column === col.key)}
            count={state.cards.filter(c => c.column === col.key).length}
            onAdd={(title: string) => addCard(title, col.key)}
            onEdit={(card: CardType) => setEditing(card)}
            onDelete={(id: string) => deleteCard(id)}
            onMove={onMove}
            isPending={isPending}
          />
        ))}
      </div>

      <EditModal
        card={editing}
        onClose={() => setEditing(null)}
        onSave={(id, title) => { editCard(id, title); setEditing(null) }}
      />

      {toast && <Toast message={toast} />}
    </div>
  )
}

export default Kanban