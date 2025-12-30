import { Navigate } from 'react-router-dom'
import { useAuth } from '../firebase/AuthContext'
import { ADMIN_EMAIL } from '../firebase/config'

const ProtectedRoute = ({ children }) => {
  const { currentUser, loading, logout } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500">Verifying access...</p>
        </div>
      </div>
    )
  }

  // Not logged in - redirect to login
  if (!currentUser) {
    return <Navigate to="/admin" replace />
  }

  // Logged in but not the authorized admin - show access denied and sign out
  if (currentUser.email?.toLowerCase() !== ADMIN_EMAIL.toLowerCase()) {
    // Force logout unauthorized user
    logout()
    
    return (
      <div className="min-h-screen bg-black flex items-center justify-center px-4">
        <div className="max-w-md text-center">
          <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-white mb-4">Access Denied</h1>
          <p className="text-gray-400 mb-6">
            You are not authorized to access this area. This incident has been logged.
          </p>
          <a 
            href="/" 
            className="inline-block px-6 py-3 bg-white text-black font-medium rounded-xl hover:bg-gray-200 transition-all"
          >
            Go to Portfolio
          </a>
        </div>
      </div>
    )
  }

  return children
}

export default ProtectedRoute
