import React from 'react'
import type { BoardState } from '../../reducers/boardReducer'
import type { ColumnKey } from '../../utils/constants'
import { Edit, Plus, Trash } from '../Shared/Icons'

type Props = {
  boardState: BoardState
  onCreateTask: (columnKey?: ColumnKey) => void
  onEditTask: (cardId: string) => void
  onDeleteTask: (cardId: string) => void
  onAssignTask: (cardId: string, assignedTo: string) => void
}

function AdminDashboard({ boardState, onCreateTask, onEditTask, onDeleteTask, onAssignTask }: Props) {
  const totalCards = boardState.cards.length
  const todoCount = boardState.cards.filter((card) => card.column === 'todo').length
  const progressCount = boardState.cards.filter((card) => card.column === 'inprogress').length
  const doneCount = boardState.cards.filter((card) => card.column === 'done').length
  const totalUsers = boardState.users.length
  const highPriorityCount = boardState.cards.filter((card) => card.priority === 'High').length

  const getUserName = (id: string) =>
    boardState.users.find((user) => user.id === id)?.name ?? 'Unassigned'

  return (
    <section className="admin-dashboard">
      <div className="admin-panel-header">
        <div>
          <h2>Admin Panel</h2>
          <p>Manage users, review tasks, and keep the board moving.</p>
        </div>
        <button className="primary" onClick={() => onCreateTask('todo')}>
          <Plus size={16} />
          <span>Create Task</span>
        </button>
      </div>

      <div className="metrics-grid">
        <article className="metric-card">
          <h4>Total Tasks</h4>
          <p>{totalCards}</p>
        </article>
        <article className="metric-card">
          <h4>To Do</h4>
          <p>{todoCount}</p>
        </article>
        <article className="metric-card">
          <h4>In Progress</h4>
          <p>{progressCount}</p>
        </article>
        <article className="metric-card">
          <h4>Done</h4>
          <p>{doneCount}</p>
        </article>
        <article className="metric-card">
          <h4>Total Users</h4>
          <p>{totalUsers}</p>
        </article>
        <article className="metric-card">
          <h4>High Priority</h4>
          <p>{highPriorityCount}</p>
        </article>
      </div>

      <div className="admin-task-panel">
        <div className="admin-section-title">
          <h3>All Tasks</h3>
          <span>{totalCards} records</span>
        </div>
        <div className="admin-task-list">
          {boardState.cards.length === 0 ? (
            <p className="empty-admin-state">No tasks created yet.</p>
          ) : (
            boardState.cards.map((card) => (
              <article key={card.id} className="admin-task-row">
                <div className="admin-task-main">
                  <span className={`priority-badge priority-${card.priority.toLowerCase()}`}>
                    {card.priority}
                  </span>
                  <div>
                    <strong>{card.title}</strong>
                    <p>{card.description || 'No description'}</p>
                  </div>
                </div>

                <div className="admin-task-meta">
                  <span className={`admin-status status-${card.column}`}>
                    {card.column === 'todo' ? 'To Do' : card.column === 'inprogress' ? 'In Progress' : 'Done'}
                  </span>
                  <select
                    value={card.assignedTo}
                    onChange={(event) => onAssignTask(card.id, event.target.value)}
                    aria-label={`Assign ${card.title}`}
                  >
                    <option value="">Unassigned</option>
                    {boardState.users.map((user) => (
                      <option key={user.id} value={user.id}>
                        {user.name}
                      </option>
                    ))}
                  </select>
                  <span className="admin-assignee">{getUserName(card.assignedTo)}</span>
                </div>

                <div className="button-icon-group">
                  <button onClick={() => onEditTask(card.id)} title="Edit Task" aria-label="Edit Task">
                    <Edit size={14} />
                  </button>
                  <button
                    className="delete-btn"
                    onClick={() => onDeleteTask(card.id)}
                    title="Delete Task"
                    aria-label="Delete Task"
                  >
                    <Trash size={14} />
                  </button>
                </div>
              </article>
            ))
          )}
        </div>
      </div>

      <div className="activity-panel">
        <h3>Activity Logs</h3>
        {boardState.logs.length === 0 ? (
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>No activities recorded yet.</p>
        ) : (
          <div className="activity-list">
            {boardState.logs.map((log) => (
              <div key={log.id} className="activity-item">
                <span>{log.timestamp}</span>
                <p>{log.message}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

export default React.memo(AdminDashboard)
