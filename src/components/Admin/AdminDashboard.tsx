import React from 'react'
import type { BoardState } from '../../reducers/boardReducer'

type Props = {
  boardState: BoardState
}

function AdminDashboard({ boardState }: Props) {
  const totalCards = boardState.cards.length
  const todoCount = boardState.cards.filter((card) => card.column === 'todo').length
  const progressCount = boardState.cards.filter((card) => card.column === 'inprogress').length
  const doneCount = boardState.cards.filter((card) => card.column === 'done').length
  const totalUsers = boardState.users.length

  return (
    <section className="admin-dashboard">
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
