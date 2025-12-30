import { useState, useEffect } from 'react'
import { useSiteSettings } from '../hooks/useSiteSettings'

// Default tips when Firebase not configured
const defaultTips = [
  { id: 1, text: "Use the navigation menu to explore different sections of my portfolio.", icon: "🏠" },
  { id: 2, text: "Take a break and try the games section - challenge the AI in Tic Tac Toe!", icon: "🎮" },
  { id: 3, text: "I'm available for freelance projects. Check the contact section to reach out!", icon: "📧" },
  { id: 4, text: "Browse my projects section to see my latest work and technical skills.", icon: "🚀" },
  { id: 5, text: "Check out the blogs section for insights on web development and tech trends.", icon: "📚" }
]

// Check if tip was already shown today
const hasShownToday = () => {
  if (typeof window === 'undefined') return true
  const lastShown = localStorage.getItem('tipOfTheDayLastShown')
  if (!lastShown) return false
  
  const lastShownDate = new Date(lastShown)
  const today = new Date()
  
  return (
    lastShownDate.getFullYear() === today.getFullYear() &&
    lastShownDate.getMonth() === today.getMonth() &&
    lastShownDate.getDate() === today.getDate()
  )
}

// Mark tip as shown today
const markAsShown = () => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('tipOfTheDayLastShown', new Date().toISOString())
  }
}

const TipOfTheDay = () => {
  const { settings, loading } = useSiteSettings()
  
  // Check URL immediately - if CV or Blog should open, don't show tip at all
  const shouldSkipUrl = typeof window !== 'undefined' && 
    (new URLSearchParams(window.location.search).get('cv') === 'open' ||
     new URLSearchParams(window.location.search).get('blog'))
  
  const alreadyShownToday = hasShownToday()
  
  const [isVisible, setIsVisible] = useState(false)
  const [currentTip, setCurrentTip] = useState(null)
  const [progress, setProgress] = useState(100)

  // Set random tip when settings load
  useEffect(() => {
    if (loading) return
    
    // Check if tips are enabled
    if (settings.tipOfDayEnabled === false) return
    
    // Get tips from settings or use defaults
    const tips = settings.tips?.length > 0 ? settings.tips : defaultTips
    
    // Select random tip
    const randomIndex = Math.floor(Math.random() * tips.length)
    setCurrentTip(tips[randomIndex])
  }, [loading, settings])

  // Show tip after 5 second delay
  useEffect(() => {
    if (shouldSkipUrl || alreadyShownToday || !currentTip || settings.tipOfDayEnabled === false) return

    const showDelay = setTimeout(() => {
      setIsVisible(true)
      markAsShown()
    }, 5000)

    return () => clearTimeout(showDelay)
  }, [shouldSkipUrl, alreadyShownToday, currentTip, settings.tipOfDayEnabled])

  useEffect(() => {
    if (!isVisible) return

    // Disable scroll
    document.body.style.overflow = 'hidden'

    // Progress bar countdown
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev <= 0) {
          clearInterval(progressInterval)
          return 0
        }
        return prev - 2
      })
    }, 100)

    // Auto close after 5 seconds
    const timer = setTimeout(() => {
      handleClose()
    }, 5000)

    return () => {
      clearTimeout(timer)
      clearInterval(progressInterval)
      document.body.style.overflow = 'unset'
    }
  }, [isVisible])

  const handleClose = () => {
    setIsVisible(false)
    document.body.style.overflow = 'unset'
  }

  if (!isVisible || !currentTip) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fadeIn"
        onClick={handleClose}
      />

      {/* Popup */}
      <div className="relative bg-white w-full max-w-md shadow-2xl animate-scaleIn overflow-hidden">
        {/* Progress Bar */}
        <div className="absolute top-0 left-0 h-1 bg-black transition-all duration-100 ease-linear" style={{ width: `${progress}%` }} />

        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center text-gray-400 hover:text-black hover:bg-gray-100 rounded-full transition-all duration-200"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Content */}
        <div className="p-8 pt-10 text-center">
          {/* Icon */}
          <div className="text-6xl mb-4 animate-bounce-slow">
            {currentTip.icon || '💡'}
          </div>

          {/* Badge */}
          <span className="inline-block px-3 py-1 bg-black text-white text-xs font-medium uppercase tracking-wider mb-4">
            Tip of the Day
          </span>

          {/* Tip Text */}
          <p className="text-gray-600 leading-relaxed text-lg mb-6">
            {currentTip.text}
          </p>

          {/* Buttons */}
          <div className="flex gap-3 justify-center">
            <button
              onClick={handleClose}
              className="px-6 py-3 bg-black text-white font-medium hover:bg-gray-800 transition-all duration-300"
            >
              Got it!
            </button>
          </div>

          {/* Auto-close hint */}
          <p className="text-gray-400 text-xs mt-4">
            Auto-closing in a few seconds...
          </p>
        </div>
      </div>

      {/* Styles */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
        @keyframes scaleIn {
          from { 
            opacity: 0; 
            transform: scale(0.9) translateY(20px); 
          }
          to { 
            opacity: 1; 
            transform: scale(1) translateY(0); 
          }
        }
        .animate-scaleIn {
          animation: scaleIn 0.3s ease-out;
        }
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        .animate-bounce-slow {
          animation: bounce-slow 2s infinite ease-in-out;
        }
      `}</style>
    </div>
  )
}

export default TipOfTheDay
