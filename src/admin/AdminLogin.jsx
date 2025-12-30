import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../firebase/AuthContext'
import { isFirebaseConfigured, ADMIN_EMAIL } from '../firebase/config'

const AdminLogin = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [attempts, setAttempts] = useState(0)
  const [lockoutTime, setLockoutTime] = useState(null)
  
  const { login, currentUser } = useAuth()
  const navigate = useNavigate()

  // Redirect if already logged in as admin
  useEffect(() => {
    if (currentUser && currentUser.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase()) {
      navigate('/admin/dashboard')
    }
  }, [currentUser, navigate])

  // Check lockout
  useEffect(() => {
    if (lockoutTime) {
      const timer = setInterval(() => {
        const remaining = lockoutTime - Date.now()
        if (remaining <= 0) {
          setLockoutTime(null)
          setAttempts(0)
        }
      }, 1000)
      return () => clearInterval(timer)
    }
  }, [lockoutTime])

  // Show setup message if Firebase isn't configured
  if (!isFirebaseConfigured) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center px-4">
        <div className="max-w-md text-center">
          <div className="w-16 h-16 rounded-2xl bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-white mb-4">Admin Panel Unavailable</h1>
          <p className="text-gray-400 mb-6">
            The admin panel is not configured. Please contact the administrator.
          </p>
          <a href="/" className="text-gray-500 text-sm hover:text-white transition-colors">
            ← Back to Portfolio
          </a>
        </div>
      </div>
    )
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    // Check if locked out
    if (lockoutTime && Date.now() < lockoutTime) {
      const remaining = Math.ceil((lockoutTime - Date.now()) / 1000)
      setError(`Too many attempts. Try again in ${remaining} seconds.`)
      return
    }

    // Check if email is allowed (case insensitive)
    if (email.toLowerCase().trim() !== ADMIN_EMAIL.toLowerCase()) {
      setAttempts(prev => prev + 1)
      if (attempts >= 4) {
        setLockoutTime(Date.now() + 60000) // 1 minute lockout
        setError('Too many failed attempts. Locked for 1 minute.')
      } else {
        setError('Access denied. You are not authorized.')
      }
      return
    }

    setLoading(true)

    const result = await login(email.trim(), password)
    
    if (result.success) {
      // Double-check the logged in user is the admin
      if (result.user?.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase()) {
        setAttempts(0)
        navigate('/admin/dashboard')
      } else {
        setError('Access denied.')
      }
    } else {
      setAttempts(prev => prev + 1)
      if (attempts >= 4) {
        setLockoutTime(Date.now() + 60000)
        setError('Too many failed attempts. Locked for 1 minute.')
      } else {
        setError(result.error)
      }
    }
    
    setLoading(false)
  }

  const isLockedOut = lockoutTime && Date.now() < lockoutTime
  const remainingLockout = isLockedOut ? Math.ceil((lockoutTime - Date.now()) / 1000) : 0

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gray-800/20 rounded-full blur-[150px]" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-gray-700/15 rounded-full blur-[120px]" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Logo/Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/5 border border-white/10 mb-4">
            <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-white">Admin Panel</h1>
          <p className="text-gray-500 text-sm mt-2">Authorized access only</p>
        </div>

        {/* Login Card */}
        <div className="bg-gray-900/50 backdrop-blur-xl rounded-2xl border border-gray-800 p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Error Message */}
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3 text-red-400 text-sm">
                {error}
              </div>
            )}

            {/* Lockout Warning */}
            {isLockedOut && (
              <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg px-4 py-3 text-yellow-400 text-sm text-center">
                🔒 Locked for {remainingLockout}s
              </div>
            )}

            {/* Email Field */}
            <div>
              <label className="block text-gray-400 text-sm font-medium mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLockedOut}
                autoComplete="email"
                className="w-full px-4 py-3 bg-black/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-white/50 focus:ring-1 focus:ring-white/20 transition-all disabled:opacity-50"
                placeholder="admin@example.com"
              />
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-gray-400 text-sm font-medium mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLockedOut}
                autoComplete="current-password"
                className="w-full px-4 py-3 bg-black/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-white/50 focus:ring-1 focus:ring-white/20 transition-all disabled:opacity-50"
                placeholder="••••••••"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || isLockedOut}
              className="w-full py-3 bg-white text-black font-medium rounded-xl hover:bg-gray-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Signing in...
                </>
              ) : isLockedOut ? (
                `Locked (${remainingLockout}s)`
              ) : (
                'Sign In'
              )}
            </button>
          </form>
        </div>

        {/* Back to Portfolio Link */}
        <div className="text-center mt-6">
          <a href="/" className="text-gray-500 text-sm hover:text-white transition-colors">
            ← Back to Portfolio
          </a>
        </div>
      </div>
    </div>
  )
}

export default AdminLogin
