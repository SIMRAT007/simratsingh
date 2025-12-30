import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './index.css'

// Main Portfolio
import App from './App.jsx'
import NotFound from './pages/NotFound.jsx'

// Admin Panel
import { AuthProvider } from './firebase/AuthContext'
import AdminLogin from './admin/AdminLogin'
import AdminRoutes from './admin/AdminRoutes'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Portfolio Routes */}
          <Route path="/" element={<App />} />
          
          {/* Admin Login Route */}
          <Route path="/admin" element={<AdminLogin />} />
          
          {/* All Admin Dashboard Routes */}
          <Route path="/admin/*" element={<AdminRoutes />} />

          {/* 404 Page */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
)
