import React, { useCallback, useState } from 'react'
import type { Card, ColumnKey, User } from '../../utils/constants'
import CardItem from '../Card/CardItem'

type ColumnProps = {
  columnKey: ColumnKey
  title: string
  cards: Card[]
  users: User[]
  onEdit: (cardId: string) => void
  onDelete: (cardId: string) => void
  onMove: (id: string, to: ColumnKey, from: ColumnKey) => Promise<void>
  onAssign: (cardId: string, assignedTo: string) => void
  isPending: (id: string) => boolean
  canDelete: (card: Card) => boolean
  canEdit: (card: Card) => boolean
}

function Column({
  columnKey,
  title,
  cards,
  users,
  onEdit,
  onDelete,
  onMove,
  onAssign,
  isPending,
  canDelete,
  canEdit,
}: ColumnProps) {
  const [isDragOver, setIsDragOver] = useState(false)

  const onDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    setIsDragOver(true)
  }, [])

  const onDragLeave = useCallback(() => {
    setIsDragOver(false)
  }, [])

  const onDrop = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault()
      setIsDragOver(false)
      const payload =
        event.dataTransfer.getData('application/json') ||
        event.dataTransfer.getData('text/plain')
      if (!payload) return
      try {
        const data = JSON.parse(payload)
        if (data?.id && data?.from && data.from !== columnKey) {
          onMove(data.id, columnKey, data.from)
        }
      } catch {
        // ignore invalid payload
      }
    },
    [columnKey, onMove],
  )

  return (
    <section
      className={`column-panel col-${columnKey} ${isDragOver ? 'drag-over' : ''}`}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
    >
      <div className="column-header">
        <h2>
          <span className="column-indicator"></span>
          <span>{title}</span>
        </h2>
        <span className="chip">{cards.length}</span>
      </div>
      <div className="column-body">
        {cards.map((card, index) => (
          <CardItem
            key={card.id}
            card={card}
            users={users}
            onEdit={() => onEdit(card.id)}
            onDelete={() => onDelete(card.id)}
            onMove={onMove}
            onAssign={onAssign}
            isPending={isPending}
            canDelete={canDelete(card)}
            canEdit={canEdit(card)}
            index={index}
          />
        ))}
      </div>
    </section>
  )
}

export default React.memo(Column)
