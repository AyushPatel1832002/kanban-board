import React, { useCallback } from 'react'
import type { Card, User, ColumnKey } from '../../utils/constants'
import { Calendar, Edit, Trash, Spinner } from '../Shared/Icons'

type CardItemProps = {
  card: Card
  users: User[]
  onEdit: () => void
  onDelete: () => void
  onMove: (id: string, to: ColumnKey, from: ColumnKey) => Promise<void>
  onAssign: (cardId: string, assignedTo: string) => void
  isPending: (id: string) => boolean
  canDelete: boolean
  canEdit: boolean
  index: number
}

const destinationOrder: ColumnKey[] = ['todo', 'inprogress', 'done']

function CardItem({
  card,
  users,
  onEdit,
  onDelete,
  onMove,
  onAssign,
  isPending,
  canDelete,
  canEdit,
  index,
}: CardItemProps) {
  const assignedUser = users.find((user) => user.id === card.assignedTo)
  const pending = isPending(card.id)
  const draggable = !pending

  const dragStart = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.dataTransfer.setData(
        'application/json',
        JSON.stringify({ id: card.id, from: card.column }),
      )
      event.dataTransfer.effectAllowed = 'move'
    },
    [card.id, card.column],
  )

  const moveCard = useCallback(
    (to: ColumnKey) => {
      if (to === card.column || pending) return
      onMove(card.id, to, card.column).catch(() => {
        // error handled at parent
      })
    },
    [card.column, card.id, onMove, pending],
  )

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .substring(0, 2)
      .toUpperCase()
  }

  const formatCardDate = (isoString: string) => {
    const d = new Date(isoString)
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  return (
    <article
      className={`card-item ${pending ? 'card-pending' : ''}`}
      style={{ ['--index' as string]: index } as React.CSSProperties}
      draggable={draggable}
      onDragStart={dragStart}
    >
      <div className="card-main">
        <div className="card-title-row">
          <span className={`priority-badge priority-${card.priority.toLowerCase()}`}>
            {card.priority}
          </span>
          {pending && <Spinner size={14} style={{ color: 'var(--accent)' }} />}
        </div>
        <div className="card-title">{card.title}</div>
        {card.description && <p className="card-description">{card.description}</p>}

        <div className="card-meta">
          <div className="card-age">
            <Calendar size={12} />
            <span>{formatCardDate(card.createdAt)}</span>
          </div>

          <div
            title={assignedUser ? `Assigned to ${assignedUser.name}` : 'Unassigned'}
            className={`card-assignee-avatar ${!assignedUser ? 'unassigned' : ''}`}
          >
            {assignedUser ? getInitials(assignedUser.name) : '?'}
          </div>
        </div>
      </div>

      <div className="card-actions">
        <div className="card-actions-row">
          <div className="assignee-select-row">
            <select
              value={card.assignedTo}
              onChange={(e) => onAssign(card.id, e.target.value)}
              disabled={!canEdit || pending}
              aria-label="Assign task to user"
            >
              <option value="">Unassigned</option>
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.name}
                </option>
              ))}
            </select>
          </div>

          <div className="button-icon-group">
            <button
              onClick={onEdit}
              disabled={!canEdit || pending}
              title="Edit Task"
              aria-label="Edit Task"
            >
              <Edit size={14} />
            </button>
            <button
              className="delete-btn"
              onClick={onDelete}
              disabled={!canDelete || pending}
              title="Delete Task"
              aria-label="Delete Task"
            >
              <Trash size={14} />
            </button>
          </div>
        </div>

        <div className="move-btn-row">
          {destinationOrder.map((dest) => (
            <button
              key={dest}
              className={dest === card.column ? 'active-col' : ''}
              onClick={() => moveCard(dest)}
              disabled={dest === card.column || pending}
              title={`Move to ${dest}`}
            >
              {dest === 'todo' ? 'To Do' : dest === 'inprogress' ? 'Progress' : 'Done'}
            </button>
          ))}
        </div>
      </div>
    </article>
  )
}

export default React.memo(CardItem)
