import { createContext, useEffect, useMemo, useState } from 'react'
import {
  clearPasswordResetRequest,
  createPasswordResetRequest,
  getCurrentAccount,
  getPasswordResetRequest,
  getSelectedRole,
  getSession,
  initializeAuthStorage,
  loginUser,
  logoutUser,
  registerAccount,
  resetAccountPassword,
  setSelectedRole,
  updateUserProfile,
  verifyAccountEmail,
  verifyPasswordResetRequest,
} from '../utils/auth'

const AuthContext = createContext(null)

function getAuthSnapshot() {
  return {
    session: getSession(),
    selectedRole: getSelectedRole(),
    currentUser: getCurrentAccount(),
  }
}

export function AuthProvider({ children }) {
  const [authState, setAuthState] = useState(() => {
    initializeAuthStorage()
    return getAuthSnapshot()
  })

  useEffect(() => {
    initializeAuthStorage()

    const handleStorageChange = () => {
      setAuthState(getAuthSnapshot())
    }

    handleStorageChange()
    window.addEventListener('storage', handleStorageChange)

    return () => {
      window.removeEventListener('storage', handleStorageChange)
    }
  }, [])

  const value = useMemo(
    () => ({
      ...authState,
      isAuthenticated: Boolean(authState.session),
      selectRole(role) {
        const normalizedRole = setSelectedRole(role)
        setAuthState({
          ...getAuthSnapshot(),
          selectedRole: normalizedRole,
        })
        return normalizedRole
      },
      register(payload) {
        const account = registerAccount(payload)
        setAuthState(getAuthSnapshot())
        return account
      },
      verifyEmail({ email, role, mode }) {
        const result =
          mode === 'reset'
            ? verifyPasswordResetRequest({ email, role })
            : verifyAccountEmail({ email, role })

        setAuthState(getAuthSnapshot())
        return result
      },
      requestPasswordReset(payload) {
        const request = createPasswordResetRequest(payload)
        setAuthState(getAuthSnapshot())
        return request
      },
      getPasswordResetRequest,
      resetPassword(payload) {
        const account = resetAccountPassword(payload)
        setAuthState(getAuthSnapshot())
        return account
      },
      login(payload) {
        const session = loginUser(payload)
        setAuthState(getAuthSnapshot())
        return session
      },
      logout() {
        logoutUser()
        clearPasswordResetRequest()
        setAuthState(getAuthSnapshot())
      },
      saveProfile(payload) {
        const updatedAccount = updateUserProfile(payload)
        setAuthState(getAuthSnapshot())
        return updatedAccount
      },
    }),
    [authState],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export default AuthContext
