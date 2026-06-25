import { useMemo, useState } from 'react'
import useBoardReducer from './hooks/useBoardReducer'
import { AuthProvider, useAuth } from './context/AuthContext'
import AdminDashboard from './components/Admin/AdminDashboard'
import UserManagement from './components/Admin/UserManagement'
import UserPanel, { type UserFilters } from './components/User/UserPanel'
import TopNav from './components/Shared/TopNav'
import EditModal from './components/EditModal'
import { COLUMNS, type Card, type ColumnKey, type Priority } from './utils/constants'
import './App.css'

const initialFilters: UserFilters = {
  query: '',
  priority: 'all',
  assignedTo: 'all',
  status: 'all',
}

function AppShell({ board }: { board: ReturnType<typeof useBoardReducer> }) {
  const {
    state,
    addCard,
    editCard,
    deleteCard,
    moveCard,
    assignUser,
    addUser,
    editUser,
    deleteUser,
    isPending,
  } = board
  const { currentUser, login, logout, users } = useAuth()
  const [selectedPanel, setSelectedPanel] = useState<'admin' | 'user'>('user')
  const [filters, setFilters] = useState<UserFilters>(initialFilters)
  const [toast, setToast] = useState<string | null>(null)

  // Card Modal State
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingCard, setEditingCard] = useState<Card | null>(null)
  const [defaultColumn, setDefaultColumn] = useState<ColumnKey | undefined>(undefined)

  const currentUserId = currentUser?.id ?? 'admin'

  const handleMove = async (id: string, to: any, from: any) => {
    try {
      await moveCard(id, to, from, currentUserId)
    } catch (error: any) {
      setToast(error.message || 'Save failed')
      window.setTimeout(() => setToast(null), 2500)
    }
  }

  const handleSaveCard = (
    id: string | undefined,
    data: { title: string; description: string; priority: Priority; assignedTo: string; column: ColumnKey },
  ) => {
    if (id) {
      editCard(id, data, currentUserId)
    } else {
      addCard(data.title, data.description, data.column, data.priority, data.assignedTo, currentUserId)
    }
  }

  const handleCreateTaskTrigger = (columnKey?: ColumnKey) => {
    setEditingCard(null)
    setDefaultColumn(columnKey)
    setIsModalOpen(true)
  }

  const handleEditTaskTrigger = (cardId: string) => {
    const card = state.cards.find((c) => c.id === cardId)
    if (card) {
      setEditingCard(card)
      setIsModalOpen(true)
    }
  }

  const canEdit = useMemo(
    () => (card: any) =>
      currentUser?.role === 'admin' || card.createdBy === currentUserId || card.assignedTo === currentUserId,
    [currentUser?.role, currentUserId],
  )

  const canDelete = useMemo(
    () => (card: any) => currentUser?.role === 'admin' || card.createdBy === currentUserId,
    [currentUser?.role, currentUserId],
  )

  if (!currentUser) {
    return (
      <main className="login-shell">
        <div className="login-card glass-panel">
          <div className="login-logo">🌌</div>
          <h2>Welcome Workspace</h2>
          <p>Sign in to manage your task columns and track project lifecycle</p>
          <div className="login-grid">
            {users.map((user) => (
              <button key={user.id} className="login-user-button" onClick={() => login(user.id)}>
                <div className="login-user-info">
                  <div className="avatar-circle">
                    {user.name.split(' ').map((n) => n[0]).join('').substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <div style={{ fontWeight: 600 }}>{user.name}</div>
                    <div style={{ fontSize: '0.75rem', opacity: 0.7 }}>{user.email}</div>
                  </div>
                </div>
                <span className={`login-role-badge ${user.role}`}>{user.role}</span>
              </button>
            ))}
          </div>
        </div>
      </main>
    )
  }

  return (
    <div className="app-shell">
      <TopNav currentUser={currentUser} onLogout={logout} onSwitchPanel={setSelectedPanel} activePanel={selectedPanel} />
      {selectedPanel === 'admin' && currentUser.role === 'admin' ? (
        <div className="admin-shell">
          <AdminDashboard boardState={state} />
          <UserManagement
            users={state.users}
            onAdd={(name, email, role) => addUser(name, email, role, currentUserId)}
            onEdit={(id, updates) => editUser(id, updates, currentUserId)}
            onDelete={(id) => deleteUser(id, currentUserId)}
          />
        </div>
      ) : (
        <UserPanel
          cards={state.cards}
          users={state.users}
          currentUserId={currentUserId}
          columns={COLUMNS}
          filters={filters}
          onFiltersChange={setFilters}
          onMove={handleMove}
          onEdit={handleEditTaskTrigger}
          onDelete={(id) => deleteCard(id, currentUserId)}
          onAssign={(cardId, assignedTo) => assignUser(cardId, assignedTo, currentUserId)}
          isPending={isPending}
          canDelete={canDelete}
          canEdit={canEdit}
          onCreateTask={handleCreateTaskTrigger}
        />
      )}
      {isModalOpen && (
        <EditModal
          card={editingCard}
          users={state.users}
          defaultColumn={defaultColumn}
          onClose={() => {
            setIsModalOpen(false)
            setEditingCard(null)
            setDefaultColumn(undefined)
          }}
          onSave={handleSaveCard}
        />
      )}
      {toast && <div className="toast">{toast}</div>}
    </div>
  )
}

export default function App() {
  const board = useBoardReducer()
  return (
    <AuthProvider initialUsers={board.state.users}>
      <AppShell board={board} />
    </AuthProvider>
  )
}
