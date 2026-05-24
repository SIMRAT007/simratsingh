// Firebase Configuration
import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'
import { getAnalytics } from 'firebase/analytics'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || '',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || '',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '',
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || ''
}

const normalizeEmail = (email) => email.trim().toLowerCase()
const parseAdminEmails = (emails) => emails
  .split(',')
  .map(normalizeEmail)
  .filter(Boolean)

// Admin email from environment variable
export const ADMIN_EMAILS = parseAdminEmails(
  import.meta.env.VITE_ADMIN_EMAILS || import.meta.env.VITE_ADMIN_EMAIL || 'simratsinghmehra01@gmail.com'
)
export const ADMIN_EMAIL = ADMIN_EMAILS[0] || ''
export const isAdminEmail = (email) => {
  return Boolean(email && ADMIN_EMAILS.includes(normalizeEmail(email)))
}

// Check if Firebase is configured
export const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey && 
  firebaseConfig.projectId &&
  firebaseConfig.authDomain
)

// Initialize Firebase only if configured
let app = null
let auth = null
let db = null
let storage = null
let analytics = null

if (isFirebaseConfigured) {
  try {
    app = initializeApp(firebaseConfig)
    auth = getAuth(app)
    db = getFirestore(app)
    storage = getStorage(app)
    analytics = getAnalytics(app)
  } catch (error) {
  }
}

export { auth, db, storage, analytics }
export default app
