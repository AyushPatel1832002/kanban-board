import React from 'react'
import type { Card, User, ColumnKey, Priority } from '../../utils/constants'
import Board from '../Board/Board'
import SearchBar from '../Search/SearchBar'
import { useSearch } from '../../hooks/useSearch'
import { Plus } from '../Shared/Icons'

export type UserFilters = {
  query: string
  priority: Priority | 'all'
  assignedTo: string | 'all'
  status: ColumnKey | 'all'
}

type Props = {
  cards: Card[]
  users: User[]
  currentUserId: string
  columns: { key: ColumnKey; title: string }[]
  filters: UserFilters
  onFiltersChange: (filters: UserFilters) => void
  onMove: (id: string, to: ColumnKey, from: ColumnKey) => Promise<void>
  onEdit: (cardId: string) => void
  onDelete: (cardId: string) => void
  onAssign: (cardId: string, assignedTo: string) => void
  isPending: (id: string) => boolean
  canDelete: (card: Card) => boolean
  canEdit: (card: Card) => boolean
  onCreateTask: (columnKey?: ColumnKey) => void
}

function UserPanel({
  cards,
  users,

  columns,
  filters,
  onFiltersChange,
  onMove,
  onEdit,
  onDelete,
  onAssign,
  isPending,
  canDelete,
  canEdit,
  onCreateTask,
}: Props) {
  const filteredCards = useSearch(cards, filters)

  return (
    <main className="page-shell">
      <div className="page-header">
        <div>
          <h1>My Workspace</h1>
          <p>Organize, prioritize, and track your active tasks.</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <button className="primary" onClick={() => onCreateTask('todo')}>
            <Plus size={16} />
            <span>Create Task</span>
          </button>
        </div>
      </div>

      <div className="search-bar-row">
        <SearchBar filters={filters} users={users} onChange={onFiltersChange} />
      </div>

      <Board
        cards={filteredCards}
        columns={columns}
        users={users}
        onMove={onMove}
        onEdit={onEdit}
        onDelete={onDelete}
        onAssign={onAssign}
        isPending={isPending}
        canDelete={canDelete}
        canEdit={canEdit}
      />
    </main>
  )
}

export default React.memo(UserPanel)
