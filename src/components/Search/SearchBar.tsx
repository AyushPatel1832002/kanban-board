import React from 'react'
import type { Priority, ColumnKey, User } from '../../utils/constants'

type SearchFilters = {
  query: string
  priority: Priority | 'all'
  assignedTo: string | 'all'
  status: ColumnKey | 'all'
}

type Props = {
  filters: SearchFilters
  users: User[]
  onChange: (filters: SearchFilters) => void
}

function SearchBar({ filters, users, onChange }: Props) {
  return (
    <section className="search-panel">
      <input
        className="search-input"
        placeholder="Search by title or description"
        value={filters.query}
        onChange={(event) => onChange({ ...filters, query: event.target.value })}
      />
      <select value={filters.priority} onChange={(event) => onChange({ ...filters, priority: event.target.value as Priority | 'all' })}>
        <option value="all">All priorities</option>
        <option value="Low">Low</option>
        <option value="Medium">Medium</option>
        <option value="High">High</option>
      </select>
      <select value={filters.status} onChange={(event) => onChange({ ...filters, status: event.target.value as ColumnKey | 'all' })}>
        <option value="all">All statuses</option>
        <option value="todo">To Do</option>
        <option value="inprogress">In Progress</option>
        <option value="done">Done</option>
      </select>
      <select value={filters.assignedTo} onChange={(event) => onChange({ ...filters, assignedTo: event.target.value })}>
        <option value="all">All users</option>
        {users.map((user) => (
          <option key={user.id} value={user.id}>
            {user.name}
          </option>
        ))}
      </select>
    </section>
  )
}

export default React.memo(SearchBar)
