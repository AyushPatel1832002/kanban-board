import type { User } from '../../utils/constants'
import { Logout, Shield, User as UserIcon } from './Icons'

type Props = {
  currentUser: User | null
  onLogout: () => void
  onSwitchPanel: (panel: 'admin' | 'user') => void
  activePanel: 'admin' | 'user'
}

export default function TopNav({ currentUser, onLogout, onSwitchPanel, activePanel }: Props) {
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .substring(0, 2)
      .toUpperCase()
  }

  return (
    <header className="top-nav">
      <div className="brand">
        <span className="brand-mark">K</span>
        <div>
          <h1>Kanban Board</h1>
          <p>Role-based workspace</p>
        </div>
      </div>

      <div className="nav-actions">
        {currentUser && (
          <nav className="nav-tabs">
            <button
              className={`nav-tab-btn ${activePanel === 'user' ? 'active' : ''}`}
              onClick={() => onSwitchPanel('user')}
            >
              <UserIcon size={14} />
              <span>User Panel</span>
            </button>
            {currentUser.role === 'admin' && (
              <button
                className={`nav-tab-btn ${activePanel === 'admin' ? 'active' : ''}`}
                onClick={() => onSwitchPanel('admin')}
              >
                <Shield size={14} />
                <span>Admin Panel</span>
              </button>
            )}
          </nav>
        )}

        {currentUser && (
          <div className="user-avatar-pill">
            <div className="avatar-circle">
              {getInitials(currentUser.name)}
            </div>
            <span className="user-name-text">{currentUser.name}</span>
            <button
              className="logout-icon-btn"
              onClick={onLogout}
              title={`Logout ${currentUser.name}`}
              aria-label="Logout"
            >
              <Logout size={16} />
            </button>
          </div>
        )}
      </div>
    </header>
  )
}
