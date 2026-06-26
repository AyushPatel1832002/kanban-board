import { useEffect, useMemo, useState, type FormEvent } from 'react'
import useBoardReducer from './hooks/useBoardReducer'
import { AuthProvider, useAuth } from './context/AuthContext'
import AdminDashboard from './components/Admin/AdminDashboard'
import UserManagement from './components/Admin/UserManagement'
import UserPanel, { type UserFilters } from './components/User/UserPanel'
import TopNav from './components/Shared/TopNav'
import EditModal from './components/EditModal'
import { COLUMNS, type Card, type ColumnKey, type Priority } from './utils/constants'
import './App.css'

type AuthMode = 'login' | 'register'

const defaultPasswords: Record<string, string> = {
  'admin@kanban.local': 'admin123',
}

const initialFilters: UserFilters = {
  query: '',
  priority: 'all',
  assignedTo: 'all',
  status: 'all',
}

function getStoredPasswords(): Record<string, string> {
  try {
    return {
      ...defaultPasswords,
      ...JSON.parse(localStorage.getItem('kanban_user_passwords') ?? '{}'),
    }
  } catch {
    return defaultPasswords
  }
}

function saveStoredPassword(email: string, password: string) {
  const passwords = getStoredPasswords()
  passwords[email.trim().toLowerCase()] = password
  localStorage.setItem('kanban_user_passwords', JSON.stringify(passwords))
}

function AuthScreen({
  users,
  onLogin,
  onRegister,
}: {
  users: ReturnType<typeof useAuth>['users']
  onLogin: (id: string) => void
  onRegister: (name: string, email: string, password: string) => string
}) {
  const [mode, setMode] = useState<AuthMode>('login')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(true)
  const [error, setError] = useState('')

  const isRegistering = mode === 'register'

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError('')

    const normalizedEmail = email.trim().toLowerCase()
    const cleanPassword = password.trim()

    if (!normalizedEmail || !cleanPassword || (isRegistering && !name.trim())) {
      setError('Please fill all required fields.')
      return
    }

    if (isRegistering) {
      if (cleanPassword.length < 4) {
        setError('Password must be at least 4 characters.')
        return
      }

      const userId = onRegister(name.trim(), normalizedEmail, cleanPassword)
      onLogin(userId)
      return
    }

    const matchedUser = users.find((user) => user.email.toLowerCase() === normalizedEmail)
    const passwords = getStoredPasswords()

    if (!matchedUser || !passwords[normalizedEmail]) {
      setMode('register')
      setError('Account not registered. Please create your account first.')
      return
    }

    if (passwords[normalizedEmail] !== cleanPassword) {
      setError('Invalid password.')
      return
    }

    onLogin(matchedUser.id)

    if (!rememberMe) {
      window.setTimeout(() => {
        try {
          localStorage.removeItem('kanban_current_user')
        } catch {
          // ignore
        }
      }, 0)
    }
  }

  return (
    <main className="auth-shell">
      <section className="auth-card">
        <h1>{isRegistering ? 'Register' : 'Login'}</h1>
        <form className="auth-form" onSubmit={handleSubmit}>
          {isRegistering && (
            <label className="auth-field">
              <span>Name</span>
              <input value={name} onChange={(event) => setName(event.target.value)} autoComplete="name" />
            </label>
          )}

          <label className="auth-field">
            <span>Email</span>
            <input
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              autoComplete="email"
              inputMode="email"
              autoFocus
            />
          </label>

          <label className="auth-field">
            <span className="auth-label-row">
              Password
              {!isRegistering && <button type="button" className="auth-link">Forgot password?</button>}
            </span>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete={isRegistering ? 'new-password' : 'current-password'}
            />
          </label>

          {!isRegistering && (
            <label className="remember-row">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(event) => setRememberMe(event.target.checked)}
              />
              <span>Remember me</span>
            </label>
          )}

          {error && <div className="auth-error">{error}</div>}

          <button type="submit" className="auth-submit">
            {isRegistering ? 'Register' : 'Log In'}
          </button>
        </form>

        <div className="auth-switch">
          {isRegistering ? 'Already registered?' : 'Not registered yet?'}
          <button
            type="button"
            onClick={() => {
              setMode(isRegistering ? 'login' : 'register')
              setError('')
            }}
          >
            {isRegistering ? 'Go to login' : 'Create account'}
          </button>
        </div>
      </section>
    </main>
  )
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
    isLoading,
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

  useEffect(() => {
    if (currentUser?.role === 'admin') {
      setSelectedPanel('admin')
    } else {
      setSelectedPanel('user')
    }
  }, [currentUser?.id, currentUser?.role])

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
      addCard(
        data.title,
        data.description,
        data.column,
        data.priority,
        data.assignedTo,
        currentUserId,
        currentUser?.role ?? 'user',
      )
    }
  }

  const handleCreateTaskTrigger = (columnKey?: ColumnKey) => {
    if (currentUser?.role !== 'admin') {
      setToast('Only admins can create tasks.')
      window.setTimeout(() => setToast(null), 2500)
      return
    }

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

  const visibleCards = useMemo(
    () =>
      currentUser?.role === 'admin'
        ? state.cards
        : state.cards.filter((card) => card.assignedTo === currentUserId || card.createdBy === currentUserId),
    [currentUser?.role, currentUserId, state.cards],
  )

  if (isLoading) {
    return (
      <main className="auth-shell">
        <section className="auth-card">
          <h1>Loading</h1>
          <p>Connecting to the task database...</p>
        </section>
      </main>
    )
  }

  if (!currentUser) {
    return (
      <AuthScreen
        users={users}
        onLogin={login}
        onRegister={(name, email, password) => {
          saveStoredPassword(email, password)
          const existingUser = state.users.find((user) => user.email.toLowerCase() === email)

          if (existingUser) {
            return existingUser.id
          }

          return addUser(name, email, 'user', 'registration')
        }}
      />
    )
  }

  return (
    <div className="app-shell">
      <TopNav currentUser={currentUser} onLogout={logout} onSwitchPanel={setSelectedPanel} activePanel={selectedPanel} />
      {selectedPanel === 'admin' && currentUser.role === 'admin' ? (
        <div className="admin-shell">
          <AdminDashboard
            boardState={state}
            onCreateTask={handleCreateTaskTrigger}
            onEditTask={handleEditTaskTrigger}
            onDeleteTask={(id) => deleteCard(id, currentUserId)}
            onAssignTask={(cardId, assignedTo) => assignUser(cardId, assignedTo, currentUserId)}
          />
          <UserManagement
            users={state.users}
            onAdd={(name, email, role) => addUser(name, email, role, currentUserId)}
            onEdit={(id, updates) => editUser(id, updates, currentUserId)}
            onDelete={(id) => deleteUser(id, currentUserId)}
          />
        </div>
      ) : (
        <UserPanel
          cards={visibleCards}
          users={state.users}
          currentUserId={currentUserId}
          canCreateTask={currentUser.role === 'admin'}
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
