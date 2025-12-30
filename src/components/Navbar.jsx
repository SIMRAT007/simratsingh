import { useState, useEffect, useRef } from 'react'
import ReactMarkdown from 'react-markdown'
import logo from '../assets/logo.jpg'
import CVModal from './CVModal'
import { useSiteSettings } from '../hooks/useSiteSettings'

const Navbar = () => {
  const { settings, loading } = useSiteSettings()
  const [isOpen, setIsOpen] = useState(false)
  const [isBlinking, setIsBlinking] = useState(true)
  const [showNotifications, setShowNotifications] = useState(false)
  const [selectedNotification, setSelectedNotification] = useState(null)
  const [showCVModal, setShowCVModal] = useState(false)
  const notificationRef = useRef(null)

  // Get logo from Firebase or use default
  const logoSrc = settings.logoUrl || logo

  // Get notifications from Firebase - wait for loading to complete
  const notificationsEnabled = !loading && settings.notificationsEnabled !== false
  // Only use Firebase notifications, no defaults - show empty until loaded
  const rawNotifications = loading ? [] : (settings.notifications || [])
  
  // Transform notifications with proper action text
  const notifications = rawNotifications.map(n => ({
    ...n,
    // Use separate details field, fallback to message if not provided
    details: n.details || n.message || '',
    actionText: n.link ? 'View' : '',
    actionLink: n.link || ''
  }))

  // Check URL for cv=open parameter on load and clean up hash
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    if (urlParams.get('cv') === 'open') {
      // Small delay to ensure other components have mounted
      const timer = setTimeout(() => {
        setShowCVModal(true)
        // Clean up the URL without reloading
        window.history.replaceState({}, '', window.location.pathname)
      }, 100)
      return () => clearTimeout(timer)
    }
    
    // Clean up any hash in URL on page load
    if (window.location.hash) {
      const sectionId = window.location.hash.replace('#', '')
      const section = document.getElementById(sectionId)
      if (section) {
        // Scroll to section after a small delay
        setTimeout(() => {
          section.scrollIntoView({ behavior: 'smooth' })
        }, 100)
      }
      // Remove hash from URL
      window.history.replaceState({}, '', window.location.pathname)
    }
  }, [])

  // Stop blinking after 10 seconds
  useEffect(() => {
    const blinkTimer = setTimeout(() => {
      setIsBlinking(false)
    }, 10000)

    return () => clearTimeout(blinkTimer)
  }, [])

  // Close sidebar when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isOpen && !event.target.closest('.sidebar-container') && !event.target.closest('.menu-button')) {
        setIsOpen(false)
      }
      // Close notification popup when clicking outside
      if (showNotifications && notificationRef.current && !notificationRef.current.contains(event.target) && !event.target.closest('.notification-button')) {
        setShowNotifications(false)
        setSelectedNotification(null)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }

    document.addEventListener('mousedown', handleClickOutside)

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, showNotifications])

  const navLinks = [
    { name: 'Home', href: 'home' },
    { name: 'About', href: 'about' },
    { name: 'Projects', href: 'projects' },
    { name: 'Contact', href: 'contact' },
  ]

  // Smooth scroll to section without changing URL
  const scrollToSection = (sectionId, e) => {
    if (e) e.preventDefault()
    const section = document.getElementById(sectionId)
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' })
    }
    setIsOpen(false)
  }

  const handleNotificationClick = (notification) => {
    setSelectedNotification(notification)
  }

  const handleBackClick = () => {
    setSelectedNotification(null)
  }

  const handleCloseNotifications = () => {
    setShowNotifications(false)
    setSelectedNotification(null)
  }

  // Handle notification action - supports both internal (#section) and external links
  const handleNotificationAction = (link) => {
    handleCloseNotifications()
    
    if (!link) return
    
    // Check if it's an internal section link
    if (link.startsWith('#')) {
      const sectionId = link.replace('#', '')
      const section = document.getElementById(sectionId)
      if (section) {
        section.scrollIntoView({ behavior: 'smooth' })
      }
    } else if (link.startsWith('http://') || link.startsWith('https://')) {
      // External URL - open in new tab
      window.open(link, '_blank', 'noopener,noreferrer')
    } else {
      // Assume it's a relative path or section ID without #
      const section = document.getElementById(link)
      if (section) {
        section.scrollIntoView({ behavior: 'smooth' })
      }
    }
  }

  const NotificationBell = ({ className = '' }) => {
    if (!notificationsEnabled || notifications.length === 0) return null
    
    return (
      <button
        onClick={() => setShowNotifications(!showNotifications)}
        className={`notification-button relative p-2 border border-black rounded-full hover:bg-black hover:text-white transition-all duration-300 ${className}`}
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        {/* Notification Badge */}
        <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center shadow-lg border-2 border-white animate-badge-pulse">
          {notifications.length}
        </span>
      </button>
    )
  }

  return (
    <>
      <nav className="fixed w-full bg-[#FFFFFF] z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 md:h-20">
            {/* Logo */}
            <a 
              href="/" 
              onClick={(e) => scrollToSection('home', e)}
              className="flex items-center"
            >
              <img 
                src={logoSrc} 
                alt="Logo" 
                className={`h-8 md:h-10 w-auto object-contain transition-opacity duration-700 ${
                  isBlinking ? 'animate-logo-blink' : ''
                }`}
              />
            </a>

            {/* Desktop Right Side - Notification + View CV Button */}
            <div className="hidden md:flex items-center gap-3">
              <NotificationBell />
              <button
                onClick={() => setShowCVModal(true)}
                className="flex items-center gap-2 px-4 py-2 border border-black rounded-full text-sm font-medium hover:bg-black hover:text-white transition-all duration-300"
              >
                Let's View CV
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>

            {/* Mobile Right Side - Notification + Menu Button */}
            <div className="flex md:hidden items-center gap-2">
              <NotificationBell />
            <button
              onClick={() => setIsOpen(!isOpen)}
                className="menu-button p-2 border border-black rounded-full z-50 relative"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {isOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Notification Popup */}
      {showNotifications && (
        <>
          {/* Backdrop for mobile */}
          <div 
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[45] md:hidden"
            onClick={handleCloseNotifications}
          />
          
          <div
            ref={notificationRef}
            className="fixed right-4 top-20 w-[calc(100%-2rem)] md:w-96 max-h-[70vh] bg-white border border-gray-200 shadow-2xl z-50 overflow-hidden animate-fadeIn"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-black text-white">
              <div className="flex items-center gap-2">
                {selectedNotification ? (
                  <button
                    onClick={handleBackClick}
                    className="p-1 hover:bg-white/20 rounded transition-colors mr-1"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                ) : (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                )}
                <h3 className="font-semibold">
                  {selectedNotification ? 'Details' : 'Notifications'}
                </h3>
              </div>
              <button
                onClick={handleCloseNotifications}
                className="p-1 hover:bg-white/20 rounded transition-colors"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Content */}
            {selectedNotification ? (
              /* Detailed View - Scrollable */
              <div className="overflow-y-auto max-h-[50vh] animate-slideIn">
                <div className="p-6 pb-8">
                  {/* Icon and Title */}
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-14 h-14 bg-white border border-black rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-2xl grayscale contrast-200">{selectedNotification.icon || '🔔'}</span>
                    </div>
                    <div>
                      <h4 className="font-bold text-black text-lg">{selectedNotification.title}</h4>
                      <span className="text-xs text-gray-400">{selectedNotification.time}</span>
                    </div>
                  </div>

                  {/* Short Message */}
                  <div className="text-gray-600 text-sm mb-4 pb-4 border-b border-gray-200">
                    <ReactMarkdown
                      components={{
                        p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                        strong: ({ children }) => <strong className="font-semibold text-gray-800">{children}</strong>,
                        em: ({ children }) => <em className="italic">{children}</em>,
                        code: ({ children }) => <code className="bg-gray-100 text-gray-800 px-1.5 py-0.5 rounded text-xs font-mono">{children}</code>,
                        ul: ({ children }) => <ul className="list-disc list-inside space-y-1 ml-2">{children}</ul>,
                        ol: ({ children }) => <ol className="list-decimal list-inside space-y-1 ml-2">{children}</ol>,
                        li: ({ children }) => <li className="text-gray-600">{children}</li>,
                        a: ({ href, children }) => <a href={href} className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">{children}</a>,
                      }}
                    >
                      {selectedNotification.message}
                    </ReactMarkdown>
                  </div>

                  {/* Detailed Description */}
                  <div className="mb-6">
                    <h5 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-2">Details</h5>
                    <div className="text-gray-700 text-sm leading-relaxed">
                      <ReactMarkdown
                        components={{
                          p: ({ children }) => <p className="mb-3 last:mb-0">{children}</p>,
                          h1: ({ children }) => <h1 className="text-lg font-bold text-gray-900 mb-2 mt-4 first:mt-0">{children}</h1>,
                          h2: ({ children }) => <h2 className="text-base font-bold text-gray-900 mb-2 mt-4 first:mt-0">{children}</h2>,
                          h3: ({ children }) => <h3 className="text-sm font-semibold text-gray-900 mb-2 mt-3 first:mt-0">{children}</h3>,
                          strong: ({ children }) => <strong className="font-semibold text-gray-900">{children}</strong>,
                          em: ({ children }) => <em className="italic">{children}</em>,
                          code: ({ children }) => <code className="bg-gray-100 text-gray-800 px-1.5 py-0.5 rounded text-xs font-mono">{children}</code>,
                          pre: ({ children }) => <pre className="bg-gray-100 p-3 rounded text-xs overflow-x-auto mb-3">{children}</pre>,
                          ul: ({ children }) => <ul className="list-disc list-inside space-y-1.5 ml-2 mb-3">{children}</ul>,
                          ol: ({ children }) => <ol className="list-decimal list-inside space-y-1.5 ml-2 mb-3">{children}</ol>,
                          li: ({ children }) => <li className="text-gray-700">{children}</li>,
                          a: ({ href, children }) => <a href={href} className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">{children}</a>,
                          blockquote: ({ children }) => <blockquote className="border-l-4 border-gray-300 pl-3 italic text-gray-600 mb-3">{children}</blockquote>,
                          hr: () => <hr className="my-4 border-gray-200" />,
                        }}
                      >
                        {selectedNotification.details}
                      </ReactMarkdown>
                    </div>
                  </div>

                  {/* Action Button */}
                  {selectedNotification.actionLink && selectedNotification.actionText && (
                    <button
                      onClick={() => handleNotificationAction(selectedNotification.actionLink)}
                      className="flex items-center justify-center gap-2 w-full py-3 bg-black text-white font-medium hover:bg-gray-800 transition-all duration-300"
                    >
                      {selectedNotification.actionText}
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                    </button>
                  )}
                </div>
              </div>
            ) : (
              /* Notifications List */
              <div className="overflow-y-auto max-h-[50vh]">
                {notifications.map((notification, index) => (
                  <div
                    key={notification.id}
                    onClick={() => handleNotificationClick(notification)}
                    className="flex gap-3 p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer group"
                    style={{ animationDelay: `${index * 0.05}s` }}
                  >
                    {/* Icon - White background with black border, grayscale emoji */}
                    <div className="flex-shrink-0 w-10 h-10 bg-white border border-gray-300 rounded-full flex items-center justify-center">
                      <span className="text-lg grayscale contrast-200">{notification.icon || '🔔'}</span>
                    </div>
                    
                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="font-semibold text-black text-sm truncate">{notification.title}</h4>
                        <span className="text-xs text-gray-400 flex-shrink-0">{notification.time}</span>
                      </div>
                      <div className="text-gray-600 text-sm mt-1 line-clamp-2">
                        <ReactMarkdown
                          components={{
                            p: ({ children }) => <span className="inline">{children}</span>,
                            strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
                            em: ({ children }) => <em className="italic">{children}</em>,
                            code: ({ children }) => <code className="bg-gray-100 text-gray-800 px-1 rounded text-xs">{children}</code>,
                          }}
                        >
                          {notification.message}
                        </ReactMarkdown>
                      </div>
                    </div>

                    {/* Arrow */}
                    <svg className="w-4 h-4 text-gray-300 group-hover:text-black group-hover:translate-x-1 transition-all flex-shrink-0 mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {/* Blur Overlay - Covers entire page including navbar */}
      <div
        className={`fixed inset-0 bg-black bg-opacity-20 backdrop-blur-md z-[45] md:hidden transition-opacity duration-500 ease-out ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setIsOpen(false)}
      />

      {/* Mobile Sidebar - Right Side */}
      <div
        className={`sidebar-container fixed top-0 right-0 h-full w-64 bg-white shadow-2xl z-50 md:hidden transform transition-transform duration-500 ease-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Sidebar Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <a 
              href="/" 
              onClick={(e) => scrollToSection('home', e)}
            >
              <img 
                src={logoSrc} 
                alt="Logo" 
                className="h-8 w-auto object-contain"
              />
            </a>
            <button
              onClick={() => setIsOpen(false)}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 p-6 space-y-4">
            {navLinks.map((link) => (
              <button
                key={link.name}
                onClick={(e) => scrollToSection(link.href, e)}
                className="block w-full text-left py-3 text-gray-600 hover:text-black transition-colors duration-300 text-lg"
              >
                {link.name}
              </button>
            ))}
          </nav>

          {/* Sidebar Footer */}
          <div className="p-6 border-t border-gray-200">
            <button
              onClick={() => {
                setIsOpen(false)
                setShowCVModal(true)
              }}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-black text-white rounded-full font-medium hover:bg-gray-800 transition-all duration-300"
            >
              Let's View CV
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* CV Modal */}
      <CVModal isOpen={showCVModal} onClose={() => setShowCVModal(false)} />

      {/* CSS for animations */}
      <style>{`
        @keyframes logo-blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
        .animate-logo-blink {
          animation: logo-blink 1.5s ease-in-out infinite;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
        @keyframes slideIn {
          from { opacity: 0; transform: translateX(10px); }
          to { opacity: 1; transform: translateX(0); }
        }
        .animate-slideIn {
          animation: slideIn 0.2s ease-out;
        }
        @keyframes badge-pulse {
          0%, 100% { 
            transform: scale(0.9);
            box-shadow: 0 0 0 0 rgba(220, 38, 38, 0.7);
          }
          50% { 
            transform: scale(1.1);
            box-shadow: 0 0 0 4px rgba(220, 38, 38, 0);
          }
        }
        .animate-badge-pulse {
          animation: badge-pulse 1.5s ease-in-out infinite;
        }
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </>
  )
}

export default Navbar
