import React, { useMemo } from 'react'
import type { Card, ColumnKey, User } from '../../utils/constants'
import Column from '../Column/Column'

type BoardProps = {
  cards: Card[]
  columns: { key: ColumnKey; title: string }[]
  users: User[]
  onMove: (id: string, to: ColumnKey, from: ColumnKey) => Promise<void>
  onEdit: (cardId: string) => void
  onDelete: (cardId: string) => void
  onAssign: (cardId: string, assignedTo: string) => void
  isPending: (id: string) => boolean
  canDelete: (card: Card) => boolean
  canEdit: (card: Card) => boolean
}

function Board({ cards, columns, users, onMove, onEdit, onDelete, onAssign, isPending, canDelete, canEdit }: BoardProps) {
  const cardsByColumn = useMemo(
    () =>
      columns.reduce<Record<ColumnKey, Card[]>>((memo, column) => {
        memo[column.key] = cards.filter((card) => card.column === column.key)
        return memo
      }, { todo: [], inprogress: [], done: [] }),
    [cards, columns],
  )

  return (
    <div className="board-grid">
      {columns.map((column) => (
        <Column
          key={column.key}
          columnKey={column.key}
          title={column.title}
          cards={cardsByColumn[column.key]}
          users={users}
          onEdit={onEdit}
          onDelete={onDelete}
          onMove={onMove}
          onAssign={onAssign}
          isPending={isPending}
          canDelete={canDelete}
          canEdit={canEdit}
        />
      ))}
    </div>
  )
}

export default React.memo(Board)
