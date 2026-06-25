import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'
import type { User } from '../utils/constants'

type AuthContextValue = {
  currentUser: User | null
  users: User[]
  login: (id: string) => void
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children, initialUsers }: { children: React.ReactNode; initialUsers: User[] }) {
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem('kanban_current_user')
      return saved ? JSON.parse(saved) : null
    } catch {
      return null
    }
  })
  const [users, setUsers] = useState<User[]>(initialUsers)

  useEffect(() => {
    setUsers(initialUsers)
    if (currentUser) {
      const match = initialUsers.find((user) => user.id === currentUser.id)
      if (match) {
        if (JSON.stringify(match) !== JSON.stringify(currentUser)) {
          setCurrentUser(match)
          localStorage.setItem('kanban_current_user', JSON.stringify(match))
        }
      } else {
        setCurrentUser(null)
        localStorage.removeItem('kanban_current_user')
      }
    }
  }, [initialUsers])

  const value = useMemo(
    () => ({
      currentUser,
      users,
      login: (id: string) => {
        const user = initialUsers.find((item) => item.id === id)
        if (user) {
          setCurrentUser(user)
          try {
            localStorage.setItem('kanban_current_user', JSON.stringify(user))
          } catch {
            // ignore
          }
        }
      },
      logout: () => {
        setCurrentUser(null)
        try {
          localStorage.removeItem('kanban_current_user')
        } catch {
          // ignore
        }
      },
    }),
    [currentUser, users, initialUsers],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
