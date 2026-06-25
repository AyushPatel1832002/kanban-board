import React, { useMemo, useState } from 'react'
import type { User } from '../../utils/constants'
import { Plus, Edit, Trash, Check, Shield, User as UserIcon } from '../Shared/Icons'

type Props = {
  users: User[]
  onAdd: (name: string, email: string, role: User['role']) => void
  onEdit: (id: string, updates: Partial<Pick<User, 'name' | 'email' | 'role'>>) => void
  onDelete: (id: string) => void
}

function UserManagement({ users, onAdd, onEdit, onDelete }: Props) {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [role, setRole] = useState<User['role']>('user')

  const editingUser = useMemo(
    () => users.find((user) => user.id === editingId) ?? null,
    [editingId, users],
  )

  const handleSave = () => {
    if (!name.trim() || !email.trim()) return
    if (editingUser) {
      onEdit(editingUser.id, { name: name.trim(), email: email.trim(), role })
      setEditingId(null)
    } else {
      onAdd(name.trim(), email.trim(), role)
    }
    setName('')
    setEmail('')
    setRole('user')
  }

  const handleCancel = () => {
    setEditingId(null)
    setName('')
    setEmail('')
    setRole('user')
  }

  const getInitials = (userName: string) => {
    return userName
      .split(' ')
      .map((n) => n[0])
      .join('')
      .substring(0, 2)
      .toUpperCase()
  }

  return (
    <section className="user-management">
      <div className="user-management-header">
        <h3>User Management</h3>
        <div className="user-input-row">
          <input
            placeholder="User Name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            aria-label="User Name"
          />
          <input
            type="email"
            placeholder="User Email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            aria-label="User Email"
          />
          <select
            value={role}
            onChange={(event) => setRole(event.target.value as User['role'])}
            aria-label="User Role"
            style={{ maxWidth: '180px' }}
          >
            <option value="user">User Role</option>
            <option value="admin">Admin Role</option>
          </select>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button className="primary" onClick={handleSave} disabled={!name.trim() || !email.trim()}>
              {editingUser ? <Check size={16} /> : <Plus size={16} />}
              <span>{editingUser ? 'Update' : 'Add'}</span>
            </button>
            {editingId && (
              <button className="secondary-btn" onClick={handleCancel}>
                Cancel
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="user-table">
        {users.map((user) => (
          <div key={user.id} className="user-row">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.9rem' }}>
              <div className="avatar-circle" style={{ width: '36px', height: '36px', fontSize: '0.9rem' }}>
                {getInitials(user.name)}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <strong>{user.name}</strong>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{user.email}</span>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
              <span className={`login-role-badge ${user.role}`} style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.65rem' }}>
                {user.role === 'admin' ? <Shield size={10} /> : <UserIcon size={10} />}
                {user.role}
              </span>
              <div className="user-actions">
                <button
                  onClick={() => {
                    setEditingId(user.id)
                    setName(user.name)
                    setEmail(user.email)
                    setRole(user.role)
                  }}
                  title="Edit User"
                  aria-label="Edit User"
                >
                  
                  <Edit size={14} />
                </button>
                <button
                  className="danger-btn"
                  onClick={() => onDelete(user.id)}
                  title="Delete User"
                  aria-label="Delete User"
                  disabled={user.id === 'admin'} // protect primary admin seed
                >
                  <Trash size={14} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

export default React.memo(UserManagement)
