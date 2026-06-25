import { useEffect, useState, useRef } from 'react'
import type { Card, User, ColumnKey, Priority } from '../utils/constants'
import { PRIORITY_OPTIONS, COLUMNS } from '../utils/constants'
import { Close, Check } from './Shared/Icons'

type Props = {
  card: Card | null
  users: User[]
  onClose: () => void
  onSave: (
    id: string | undefined,
    updates: {
      title: string
      description: string
      priority: Priority
      assignedTo: string
      column: ColumnKey
    }
  ) => void
  defaultColumn?: ColumnKey // preselect a column if creating a new card in a column
}

export default function EditModal({ card, users, onClose, onSave, defaultColumn }: Props) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [priority, setPriority] = useState<Priority>('Medium')
  const [assignedTo, setAssignedTo] = useState('')
  const [column, setColumn] = useState<ColumnKey>('todo')
  const [error, setError] = useState('')

  const modalRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (card) {
      setTitle(card.title)
      setDescription(card.description || '')
      setPriority(card.priority)
      setAssignedTo(card.assignedTo || '')
      setColumn(card.column)
    } else {
      setTitle('')
      setDescription('')
      setPriority('Medium')
      setAssignedTo('')
      setColumn(defaultColumn || 'todo')
    }
    setError('')
  }, [card, defaultColumn])

  // Accessibility and key handlers
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) {
      setError('Title is required')
      return
    }
    onSave(card?.id, {
      title: title.trim(),
      description: description.trim(),
      priority,
      assignedTo,
      column,
    })
    onClose()
  }

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
      onClose()
    }
  }

  return (
    <div className="modal-backdrop" onClick={handleBackdropClick}>
      <div className="modal" ref={modalRef} role="dialog" aria-modal="true">
        <header className="modal-header-section">
          <h3>{card ? 'Edit Task' : 'Create Task'}</h3>
          <button className="close-btn" onClick={onClose} aria-label="Close modal">
            <Close size={18} />
          </button>
        </header>

        <form onSubmit={handleSubmit} className="modal-form">
          {error && <div className="form-error">{error}</div>}

          <div className="form-group">
            <label htmlFor="task-title">Task Title</label>
            <input
              id="task-title"
              type="text"
              placeholder="What needs to be done?"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              autoFocus
            />
          </div>

          <div className="form-group">
            <label htmlFor="task-desc">Description</label>
            <textarea
              id="task-desc"
              rows={3}
              placeholder="Provide a short description..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="form-row">
            <div className="form-group half">
              <label>Priority</label>
              <div className="priority-selector">
                {PRIORITY_OPTIONS.map((p) => (
                  <button
                    key={p}
                    type="button"
                    className={`priority-opt opt-${p.toLowerCase()} ${priority === p ? 'active' : ''}`}
                    onClick={() => setPriority(p)}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            <div className="form-group half">
              <label htmlFor="task-column">Status Column</label>
              <select
                id="task-column"
                value={column}
                onChange={(e) => setColumn(e.target.value as ColumnKey)}
              >
                {COLUMNS.map((col) => (
                  <option key={col.key} value={col.key}>
                    {col.title}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="task-assignee">Assign To</label>
            <select
              id="task-assignee"
              value={assignedTo}
              onChange={(e) => setAssignedTo(e.target.value)}
            >
              <option value="">Unassigned</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name} ({u.role})
                </option>
              ))}
            </select>
          </div>

          <footer className="modal-footer">
            <button type="button" className="secondary-btn" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="primary-btn">
              <Check size={16} />
              <span>{card ? 'Save Changes' : 'Create Task'}</span>
            </button>
          </footer>
        </form>
      </div>
    </div>
  )
}
