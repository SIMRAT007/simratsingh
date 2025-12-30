import { createContext, useContext, useState, useEffect } from 'react'
import { 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  sendPasswordResetEmail 
} from 'firebase/auth'
import { auth, isFirebaseConfigured } from './config'

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null)
  const [loading, setLoading] = useState(true)

  // Sign in with email and password
  const login = async (email, password) => {
    if (!isFirebaseConfigured || !auth) {
      return { success: false, error: 'Firebase is not configured. Please set up environment variables.' }
    }
    
    try {
      const result = await signInWithEmailAndPassword(auth, email, password)
      return { success: true, user: result.user }
    } catch (error) {
      let message = 'Login failed. Please try again.'
      switch (error.code) {
        case 'auth/user-not-found':
          message = 'No account found with this email.'
          break
        case 'auth/wrong-password':
          message = 'Incorrect password.'
          break
        case 'auth/invalid-email':
          message = 'Invalid email address.'
          break
        case 'auth/too-many-requests':
          message = 'Too many failed attempts. Please try again later.'
          break
        case 'auth/invalid-credential':
          message = 'Invalid email or password.'
          break
        default:
          message = error.message
      }
      return { success: false, error: message }
    }
  }

  // Sign out
  const logout = async () => {
    if (!auth) {
      return { success: false, error: 'Firebase is not configured.' }
    }
    
    try {
      await signOut(auth)
      return { success: true }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  // Reset password
  const resetPassword = async (email) => {
    if (!auth) {
      return { success: false, error: 'Firebase is not configured.' }
    }
    
    try {
      await sendPasswordResetEmail(auth, email)
      return { success: true }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  // Listen for auth state changes
  useEffect(() => {
    if (!isFirebaseConfigured || !auth) {
      setLoading(false)
      return
    }
    
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user)
      setLoading(false)
    })

    return unsubscribe
  }, [])

  const value = {
    currentUser,
    login,
    logout,
    resetPassword,
    loading,
    isFirebaseConfigured
  }

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  )
}
