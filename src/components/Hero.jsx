import { useEffect, useState, useRef, useMemo } from 'react'
import heroImage from '../assets/hero.png'
import { useHeroSettings, useFirestoreCollection } from '../hooks/useSiteSettings'

// Default tracks as fallback
const defaultTracks = [
  { 
    id: 1,
    title: 'Chill Vibes', 
    artist: 'Lo-Fi Beats', 
    coverUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=200&h=200&fit=crop',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3'
  },
]

// Check if URL is a SoundCloud URL
const isSoundCloudUrl = (url) => {
  if (!url) return false
  return url.includes('soundcloud.com') || url.includes('api.soundcloud.com')
}

// Extract SoundCloud track URL from various formats
const extractSoundCloudUrl = (url) => {
  if (!url) return null
  
  // If it's already a SoundCloud URL, return it
  if (url.includes('soundcloud.com/')) {
    // Extract the track URL from full URL
    const match = url.match(/soundcloud\.com\/[^?]+/)
    if (match) {
      return `https://${match[0]}`
    }
    return url
  }
  
  // If it's an API URL, try to extract track info
  if (url.includes('api.soundcloud.com')) {
    return url
  }
  
  return null
}

// Helper to convert "3:45" to seconds
const parseTime = (timeStr) => {
  const [mins, secs] = timeStr.split(':').map(Number)
  return mins * 60 + secs
}

// Helper to format seconds to "m:ss"
const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

const Hero = () => {
  const { settings: heroSettings } = useHeroSettings()
  const [isVisible, setIsVisible] = useState(false)
  const [showMusicModal, setShowMusicModal] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [elapsedTime, setElapsedTime] = useState(0)
  const [totalDuration, setTotalDuration] = useState(30)
  const [isLoading, setIsLoading] = useState(false)

  // Fetch tracks from Firebase
  const { data: tracks, loading: tracksLoading } = useFirestoreCollection('music', defaultTracks)
  
  // Track state
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0)
  
  // Select random track when tracks load or modal opens
  const currentTrack = useMemo(() => {
    if (tracks.length === 0) return defaultTracks[0]
    return tracks[currentTrackIndex] || tracks[Math.floor(Math.random() * tracks.length)]
  }, [tracks, currentTrackIndex])

  const isSoundCloud = isSoundCloudUrl(currentTrack?.audioUrl)
  const soundCloudUrl = isSoundCloud ? extractSoundCloudUrl(currentTrack?.audioUrl) : null

  // Get hero data from Firebase or use defaults
  const greeting = heroSettings.greeting || "Hello! I'm"
  const name = heroSettings.name || 'Simrat'
  const nameSuffix = heroSettings.nameSuffix || 'Singh.'
  const headline = heroSettings.headline || 'Building scalable software solutions with emphasis on'
  const headlineHighlight = heroSettings.headlineHighlight || 'clean code'
  const description = heroSettings.description || 'A full-stack software engineer passionate about creating efficient, maintainable code and delivering exceptional digital experiences.'
  const ctaText = heroSettings.ctaText || "Let's Connect"
  const heroImageUrl = heroSettings.heroImage || heroImage

  // Audio refs
  const audioRef = useRef(null)
  const soundCloudEmbedRef = useRef(null)
  const soundCloudWidgetRef = useRef(null)

  // Initialize audio when modal opens (only for non-SoundCloud URLs)
  useEffect(() => {
    if (!showMusicModal || !currentTrack?.audioUrl || isSoundCloud) {
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current = null
      }
      return
    }

    setIsLoading(true)
    setIsPlaying(false)
    setElapsedTime(0)
    
    try {
      audioRef.current = new Audio(currentTrack.audioUrl)
      audioRef.current.volume = 0.5
      audioRef.current.preload = 'metadata'

      // Get actual duration when loaded
      const handleLoadedMetadata = () => {
        if (audioRef.current) {
          setTotalDuration(Math.floor(audioRef.current.duration))
          setIsLoading(false)
        }
      }

      // Handle song end
      const handleEnded = () => {
        setIsPlaying(false)
        setElapsedTime(0)
      }

      // Handle errors
      const handleError = (e) => {
        setIsLoading(false)
        setIsPlaying(false)
      }

      audioRef.current.addEventListener('loadedmetadata', handleLoadedMetadata)
      audioRef.current.addEventListener('ended', handleEnded)
      audioRef.current.addEventListener('error', handleError)

      // Load the audio
      audioRef.current.load()

      return () => {
        if (audioRef.current) {
          audioRef.current.removeEventListener('loadedmetadata', handleLoadedMetadata)
          audioRef.current.removeEventListener('ended', handleEnded)
          audioRef.current.removeEventListener('error', handleError)
          audioRef.current.pause()
          audioRef.current = null
        }
      }
    } catch (error) {
      setIsLoading(false)
    }
  }, [showMusicModal, currentTrack?.audioUrl, isSoundCloud])

  // Load SoundCloud widget script and initialize when modal opens
  useEffect(() => {
    if (!showMusicModal || !isSoundCloud || !soundCloudUrl) {
      soundCloudWidgetRef.current = null
      return
    }

    setIsLoading(true)
    setIsPlaying(false)
    setElapsedTime(0)
    
    const initializeWidget = () => {
      if (!soundCloudEmbedRef.current) {
        // Iframe not ready yet, try again
        setTimeout(initializeWidget, 100)
        return
      }
      
      if (!window.SC) {
        // Script not loaded yet, wait and try again
        setTimeout(initializeWidget, 200)
        return
      }
      
      try {
        const widget = window.SC.Widget(soundCloudEmbedRef.current)
        soundCloudWidgetRef.current = widget
        
        widget.bind(window.SC.Widget.Events.READY, () => {
          widget.getDuration((duration) => {
            setTotalDuration(Math.floor(duration / 1000)) // Convert to seconds
          })
          setIsLoading(false)
        })
        
        widget.bind(window.SC.Widget.Events.PLAY, () => {
          setIsPlaying(true)
        })
        
        widget.bind(window.SC.Widget.Events.PAUSE, () => {
          setIsPlaying(false)
        })
        
        widget.bind(window.SC.Widget.Events.FINISH, () => {
          setIsPlaying(false)
          setElapsedTime(0)
        })
        
        widget.bind(window.SC.Widget.Events.PLAY_PROGRESS, (e) => {
          setElapsedTime(Math.floor(e.currentPosition / 1000)) // Convert to seconds
        })
      } catch (error) {
        setIsLoading(false)
      }
    }

    // Load SoundCloud Widget API script if not already loaded
    if (!window.SC) {
      const script = document.createElement('script')
      script.src = 'https://w.soundcloud.com/player/api.js'
      script.async = true
      document.body.appendChild(script)
      
      script.onload = () => {
        // Wait for iframe to be ready
        setTimeout(initializeWidget, 500)
      }
    } else {
      // Script already loaded, wait for iframe to be ready
      setTimeout(initializeWidget, 300)
    }

    return () => {
      if (soundCloudWidgetRef.current) {
        try {
          soundCloudWidgetRef.current.unbind(window.SC.Widget.Events.READY)
          soundCloudWidgetRef.current.unbind(window.SC.Widget.Events.PLAY)
          soundCloudWidgetRef.current.unbind(window.SC.Widget.Events.PAUSE)
          soundCloudWidgetRef.current.unbind(window.SC.Widget.Events.FINISH)
          soundCloudWidgetRef.current.unbind(window.SC.Widget.Events.PLAY_PROGRESS)
        } catch (e) {
          // Ignore errors during cleanup
        }
        soundCloudWidgetRef.current = null
      }
    }
  }, [showMusicModal, isSoundCloud, soundCloudUrl])

  // Disable scroll when modal is open
  useEffect(() => {
    if (showMusicModal) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [showMusicModal])

  useEffect(() => {
    // Small delay to ensure smooth animation start
    const timer = setTimeout(() => {
      setIsVisible(true)
    }, 50)
    
    return () => clearTimeout(timer)
  }, [])

  // Timer effect for tracking elapsed time (only for non-SoundCloud)
  useEffect(() => {
    if (isSoundCloud) return // SoundCloud handles this via events
    
    let interval
    if (isPlaying && audioRef.current) {
      interval = setInterval(() => {
        if (audioRef.current) {
          setElapsedTime(Math.floor(audioRef.current.currentTime))
        }
      }, 500)
    }
    return () => clearInterval(interval)
  }, [isPlaying, isSoundCloud])

  const handlePlayClick = () => {
    // Select a random track when opening modal
    if (tracks.length > 0) {
      const randomIndex = Math.floor(Math.random() * tracks.length)
      setCurrentTrackIndex(randomIndex)
    }
    setShowMusicModal(true)
  }

  const handleCloseModal = () => {
    // Stop the song when closing
    if (isSoundCloud && soundCloudWidgetRef.current) {
      soundCloudWidgetRef.current.pause()
    } else if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
    }
    setIsPlaying(false)
    setElapsedTime(0)
    setShowMusicModal(false)
  }

  const handlePlayPause = async () => {
    if (isSoundCloud && soundCloudWidgetRef.current) {
      try {
        soundCloudWidgetRef.current.toggle()
      } catch (error) {
      }
    } else if (audioRef.current && currentTrack?.audioUrl) {
      try {
        if (isPlaying) {
          audioRef.current.pause()
          setIsPlaying(false)
        } else {
          await audioRef.current.play()
          setIsPlaying(true)
        }
      } catch (error) {
        setIsLoading(false)
      }
    }
  }

  const handleReset = () => {
    if (isSoundCloud && soundCloudWidgetRef.current) {
      soundCloudWidgetRef.current.seekTo(0)
      setElapsedTime(0)
    } else if (audioRef.current) {
      audioRef.current.currentTime = 0
      setElapsedTime(0)
    }
  }

  const handleSeek = (e) => {
    if (!totalDuration) return
    const rect = e.currentTarget.getBoundingClientRect()
    const clickX = e.clientX - rect.left
    const percentage = clickX / rect.width
    const newTime = percentage * totalDuration
    
    if (isSoundCloud && soundCloudWidgetRef.current) {
      soundCloudWidgetRef.current.seekTo(newTime * 1000) // Convert to milliseconds
      setElapsedTime(Math.floor(newTime))
    } else if (audioRef.current) {
      audioRef.current.currentTime = newTime
      setElapsedTime(Math.floor(newTime))
    }
  }

  const progressPercent = totalDuration > 0 ? (elapsedTime / totalDuration) * 100 : 0

  return (
    <section id="home" className="min-h-screen flex items-center pt-20 md:pt-24 relative overflow-hidden">
      {/* Abstract Background Elements */}
      
      {/* Gradient Orbs */}
      {/* <div 
        className={`absolute top-20 -left-32 w-96 h-96 bg-gradient-to-br from-gray-200 via-gray-100 to-transparent rounded-full blur-3xl opacity-0 transition-all duration-[2000ms] ease-out ${
          isVisible ? 'opacity-60' : ''
        }`}
      />
      <div 
        className={`absolute bottom-20 -right-32 w-80 h-80 bg-gradient-to-tl from-gray-300 via-gray-200 to-transparent rounded-full blur-3xl opacity-0 transition-all duration-[2000ms] ease-out ${
          isVisible ? 'opacity-50' : ''
        }`}
        style={{ transitionDelay: '0.3s' }}
      /> */}
      
      {/* Geometric Lines */}
      {/* <svg 
        className={`absolute top-32 left-10 w-32 h-32 text-gray-300 opacity-0 transition-all duration-[1500ms] ease-out ${
          isVisible ? 'opacity-100' : ''
        }`}
        style={{ transitionDelay: '0.5s' }}
        viewBox="0 0 100 100" 
        fill="none"
      >
        <circle cx="50" cy="50" r="45" stroke="currentColor" strokeWidth="0.75" strokeDasharray="4 4" />
        <circle cx="50" cy="50" r="30" stroke="currentColor" strokeWidth="0.5" />
      </svg> */}
      
      {/* Corner Accent - Top Right */}
      {/* <div 
        className={`absolute top-16 right-16 opacity-0 transition-all duration-[1200ms] ease-out ${
          isVisible ? 'opacity-100' : ''
        }`}
        style={{ transitionDelay: '0.7s' }}
      >
        <div className="relative">
          <div className="w-20 h-px bg-gradient-to-r from-gray-400 to-transparent" />
          <div className="absolute top-0 right-0 w-px h-20 bg-gradient-to-b from-gray-400 to-transparent" />
          <div className="absolute top-0 right-0 w-2 h-2 bg-gray-400 rounded-full" />
        </div>
      </div> */}
      
      {/* Floating Shapes */}
      {/* <div 
        className={`absolute bottom-40 left-20 w-3 h-3 border border-gray-400 rotate-45 opacity-0 transition-all duration-[1400ms] ease-out ${
          isVisible ? 'opacity-100' : ''
        }`}
        style={{ transitionDelay: '0.8s' }}
      />
      <div 
        className={`absolute top-1/3 right-1/4 w-2 h-2 bg-gray-400 rounded-full opacity-0 transition-all duration-[1400ms] ease-out ${
          isVisible ? 'opacity-70' : ''
        }`}
        style={{ transitionDelay: '0.6s' }}
      />
      <div 
        className={`absolute bottom-1/4 left-1/3 w-4 h-4 border border-gray-300 rounded-full opacity-0 transition-all duration-[1400ms] ease-out ${
          isVisible ? 'opacity-100' : ''
        }`}
        style={{ transitionDelay: '1s' }}
      /> */}
      
      {/*  Subtle Grid Pattern  */}
        <div 
          className={`absolute inset-0 opacity-0 transition-all duration-[2000ms] ease-out pointer-events-none ${
            isVisible ? 'opacity-[0.2]' : ''
          }`}
          style={{
            backgroundImage: `
          linear-gradient(to bottom, white 0%, transparent 50%, white 100%),
          linear-gradient(to right, #9ca3af 1px, transparent 1px),
          linear-gradient(to bottom, #9ca3af 1px, transparent 1px)
            `,
            backgroundSize: '100% 100%, 60px 60px, 60px 60px',
            transitionDelay: '0.2s'
          }}
        />
        
        {/* Diagonal Line Accent */}
      {/* <svg 
        className={`absolute bottom-32 right-32 w-48 h-48 text-gray-200 opacity-0 transition-all duration-[1600ms] ease-out ${
          isVisible ? 'opacity-100' : ''
        }`}
        style={{ transitionDelay: '0.9s' }}
        viewBox="0 0 100 100" 
        fill="none"
      >
        <line x1="0" y1="100" x2="100" y2="0" stroke="currentColor" strokeWidth="1" />
        <line x1="20" y1="100" x2="100" y2="20" stroke="currentColor" strokeWidth="0.75" />
        <line x1="40" y1="100" x2="100" y2="40" stroke="currentColor" strokeWidth="0.5" />
      </svg> */}
      
      {/* Animated Ring */}
      {/* <div 
        className={`absolute top-1/2 -left-20 w-40 h-40 border border-gray-200 rounded-full opacity-0 transition-all duration-[1800ms] ease-out ${
          isVisible ? 'opacity-100 scale-100' : 'scale-75'
        }`}
        style={{ transitionDelay: '0.4s' }}
      /> */}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full relative z-10 mt-5 lg:mt-0 md:mt-0">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-8 md:gap-12">
          {/* Left Column - Main Content */}
          <div className="flex-1 space-y-6 md:space-y-8 md:text-left text-center">
            {/* Greeting */}
            <p 
              className={`text-base md:text-lg font-medium text-black transition-all duration-[1200ms] ease-[cubic-bezier(0.4,0,0.2,1)] will-change-[opacity,transform] ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
              }`}
              style={{ transitionDelay: '0.1s' }}
            >
              {greeting} <span className='border p-1 rounded-[0px_15px_0px_15px] ml-1'>{name} <span className="text-gray-500">{nameSuffix}</span></span>
            </p>

            {/* Main Headline */}
            <h1 
              className={`text-7xl sm:text-6xl md:text-5xl lg:text-6xl xl:text-7xl font-bold leading-tight bg-gradient-to-b from-black to-gray-300 bg-clip-text text-transparent md:bg-none md:text-black transition-all duration-[1400ms] ease-[cubic-bezier(0.4,0,0.2,1)] will-change-[opacity,transform] ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`}
              style={{ transitionDelay: '0.25s' }}
            >
              {headline}{' '}
              <span className="md:text-gray-400">{headlineHighlight}</span>
            </h1>

            {/* Desktop: CTA Button, Play Button and Description Side by Side */}
            <div 
              className={`hidden md:flex items-start gap-6 pt-4 transition-all duration-[1300ms] ease-[cubic-bezier(0.4,0,0.2,1)] will-change-[opacity,transform] ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
              }`}
              style={{ transitionDelay: '0.45s' }}
            >
              <div className="flex items-center gap-4">
                <button
                  onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}
                className="flex items-center gap-2 px-6 py-3 bg-black text-white rounded-full font-medium hover:bg-gray-800 transition-all duration-300 whitespace-nowrap"
              >
                {ctaText}
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
                </button>
                
                {/* Song of the Day - Play Button Only */}
                <button
                  onClick={handlePlayClick}
                  className="group relative w-14 h-14 flex items-center justify-center"
                  title="Song of the Day"
                >
                  {/* Rotating Text Circle */}
                  <div className="absolute inset-0 animate-spin-text">
                    <svg className="w-full h-full" viewBox="0 0 100 100">
                      <defs>
                        <path id="textCircle" d="M 50,50 m -42,0 a 42,42 0 1,1 84,0 a 42,42 0 1,1 -84,0"/>
                      </defs>
                      <text fill="#6b7280" fontSize="10" fontWeight="600" letterSpacing="3">
                        <textPath href="#textCircle">
                          ♪ SONG OF THE DAY ♪ SONG OF THE DAY
                        </textPath>
                      </text>
                    </svg>
                  </div>
                  
                  {/* Play Icon */}
                  <div className="w-9 h-9 rounded-full bg-black flex items-center justify-center group-hover:scale-110 group-hover:bg-gray-800 transition-all duration-300 shadow-lg">
                    <svg className="w-4 h-4 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z"/>
                    </svg>
                  </div>
                </button>
              </div>
              <p className="text-gray-500 text-sm max-w-md leading-relaxed pt-2">
                {description}
              </p>
            </div>

            {/* Mobile: CTA Button with Play Button */}
            <div 
              className={`md:hidden pt-4 flex justify-center items-center gap-3 transition-all duration-[1300ms] ease-[cubic-bezier(0.4,0,0.2,1)] will-change-[opacity,transform] ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
              }`}
              style={{ transitionDelay: '0.45s' }}
            >
              <button
                onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}
                className="inline-flex items-center gap-2 px-6 py-3 bg-black text-white rounded-full font-medium hover:bg-gray-800 transition-all duration-300"
              >
                {ctaText}
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>

              {/* Mobile: Song of the Day - Play Button Only */}
              <button
                onClick={handlePlayClick}
                className="group relative w-12 h-12 flex items-center justify-center flex-shrink-0"
                title="Song of the Day"
              >
                {/* Rotating Text Circle */}
                <div className="absolute inset-0 animate-spin-text">
                  <svg className="w-full h-full" viewBox="0 0 100 100">
                    <defs>
                      <path id="textCircleMobile" d="M 50,50 m -42,0 a 42,42 0 1,1 84,0 a 42,42 0 1,1 -84,0"/>
                    </defs>
                    <text fill="#6b7280" fontSize="11" fontWeight="600" letterSpacing="3">
                      <textPath href="#textCircleMobile">
                        ♪ SONG OF THE DAY ♪ SONG
                      </textPath>
                    </text>
                  </svg>
                </div>
                
                {/* Play Icon */}
                <div className="w-7 h-7 rounded-full bg-black flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg">
                  <svg className="w-3 h-3 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z"/>
                  </svg>
                </div>
              </button>
            </div>

            {/* Mobile: Description */}
            <p 
              className={`md:hidden text-gray-500 text-sm leading-relaxed pt-2 transition-all duration-[1300ms] ease-[cubic-bezier(0.4,0,0.2,1)] will-change-[opacity,transform] ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
              }`}
              style={{ transitionDelay: '0.65s' }}
            >
                {description}
            </p>
          </div>

          {/* Right Column - Hero Image (Desktop) / Below Text (Mobile) */}
          <div 
            className={`hidden md:flex flex-1 md:flex-shrink-0 justify-center md:justify-end transition-all duration-[1500ms] ease-[cubic-bezier(0.4,0,0.2,1)] will-change-[opacity,transform] ${
              isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-12'
            }`}
            style={{ transitionDelay: '0.35s' }}
          >
            <img 
              src={heroImageUrl} 
              alt="Hero illustration" 
              className="w-full max-w-md md:max-w-lg lg:max-w-xl h-auto object-contain"
            />
          </div>
        </div>
      </div>

      {/* Music of the Day Modal */}
      {showMusicModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/70 backdrop-blur-sm animate-fadeIn"
            onClick={handleCloseModal}
          />

          {/* Modal */}
          <div className="relative bg-white w-full max-w-sm shadow-2xl animate-scaleIn overflow-hidden rounded-3xl">
            {/* Header with Blurred Cover Photo */}
            <div className="relative pt-12 pb-8 px-6">
              {/* Blurred Cover Photo Background */}
              <div className="absolute inset-0 overflow-hidden">
                {currentTrack.coverUrl ? (
                  <img 
                    src={currentTrack.coverUrl} 
                    alt=""
                    className="w-full h-full object-cover blur-[2px] scale-[1.02]"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-900" />
                )}
                {/* Gradient overlay from bottom to top with low black opacity */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/20 to-transparent" />
              </div>

              {/* Close Button - Black & White Theme */}
              <button
                onClick={handleCloseModal}
                className="absolute top-4 right-4 z-20 w-10 h-10 flex items-center justify-center bg-black text-white rounded-full shadow-lg hover:bg-white hover:text-black transition-all duration-300 hover:scale-110"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              {/* Vinyl Record with Cover */}
              <div className="relative flex justify-center mb-6">
                <div className={`relative w-44 h-44 ${isPlaying ? 'animate-spin-slow' : ''}`}>
                  {/* Outer Ring */}
                  <div className="absolute inset-0 rounded-full bg-gradient-to-br from-gray-800 via-gray-900 to-black border-4 border-gray-700 shadow-2xl" />
                  {/* Grooves */}
                  <div className="absolute inset-3 rounded-full border border-gray-600/50" />
                  <div className="absolute inset-6 rounded-full border border-gray-600/50" />
                  <div className="absolute inset-9 rounded-full border border-gray-600/50" />
                  <div className="absolute inset-12 rounded-full border border-gray-600/50" />
                  {/* Center Cover Image */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-20 h-20 rounded-full overflow-hidden shadow-xl border-2 border-gray-700">
                      {currentTrack.coverUrl ? (
                        <img 
                          src={currentTrack.coverUrl} 
                          alt={currentTrack.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                          <svg className="w-8 h-8 text-gray-600" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
                          </svg>
                        </div>
                      )}
                    </div>
                  </div>
                  {/* Shine effect */}
                  <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-transparent via-white/10 to-transparent" />
                </div>
              </div>

              {/* Track Info */}
              <div className="relative text-center text-white">
                <p className="text-xs uppercase tracking-[0.3em] text-white mb-2" style={{ textShadow: '0 2px 8px rgba(0,0,0,0.8)' }}>🎵 Song of the Day</p>
                <h3 className="text-2xl font-bold mb-1" style={{ textShadow: '0 2px 10px rgba(0,0,0,0.9), 0 4px 20px rgba(0,0,0,0.5)' }}>{currentTrack.title}</h3>
                <p className="text-white text-sm" style={{ textShadow: '0 2px 8px rgba(0,0,0,0.8)' }}>{currentTrack.artist}</p>
              </div>
            </div>

            {/* Controls */}
            <div className="p-6">
              {/* Progress Bar */}
              <div className="mb-6">
                <div className="flex justify-between text-xs text-gray-500 mb-2 font-medium">
                  <span>{formatTime(elapsedTime)}</span>
                  <span>{formatTime(totalDuration)}</span>
                </div>
                <div 
                  className="h-1.5 bg-gray-200 rounded-full overflow-hidden cursor-pointer"
                  onClick={handleSeek}
                >
                  <div 
                    className="h-full bg-black rounded-full transition-all duration-300 ease-linear" 
                    style={{ width: `${progressPercent}%` }} 
                  />
                </div>
              </div>

              {/* Hidden SoundCloud Widget (for API control) */}
              {isSoundCloud && soundCloudUrl && (
                <div className="hidden">
                  <iframe
                    ref={soundCloudEmbedRef}
                    width="100%"
                    height="300"
                    scrolling="no"
                    frameBorder="no"
                    allow="autoplay"
                    src={`https://w.soundcloud.com/player/?url=${encodeURIComponent(soundCloudUrl)}&color=%23ff5500&auto_play=false&hide_related=false&show_comments=false&show_user=false&show_reposts=false&show_teaser=false&visual=false`}
                  />
                </div>
              )}

              {/* Control Buttons */}
              <div className="flex items-center justify-center gap-6">
                {/* Previous (Reset) */}
                <button 
                  onClick={handleReset}
                  className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-black transition-colors"
                >
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z"/>
                  </svg>
                </button>

                {/* Play/Pause */}
                <button 
                  onClick={handlePlayPause}
                  disabled={isLoading}
                  className="w-16 h-16 rounded-full bg-black text-white flex items-center justify-center hover:bg-gray-800 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 disabled:opacity-50"
                >
                  {isLoading ? (
                    <svg className="w-7 h-7 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                  ) : isPlaying ? (
                    <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/>
                    </svg>
                  ) : (
                    <svg className="w-7 h-7 ml-1" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z"/>
                    </svg>
                  )}
                </button>

                {/* Next (Skip to end) */}
                <button className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-black transition-colors">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z"/>
                  </svg>
                </button>
              </div>

              {/* Note */}
              <p className="text-center text-xs text-gray-400 mt-6">
                🎵 Song of the Day from your playlist
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
            @keyframes spin-slow {
              from { transform: rotate(0deg); }
              to { transform: rotate(360deg); }
            }
            .animate-spin-slow {
              animation: spin-slow 3s linear infinite;
            }
            @keyframes progress {
              from { width: 0%; }
              to { width: 100%; }
            }
            .animate-progress {
              animation: progress 30s linear;
            }
          `}</style>
        </div>
      )}

      {/* Global Styles for Rotating Text */}
      <style>{`
        @keyframes spin-text {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-text {
          animation: spin-text 10s linear infinite;
        }
      `}</style>
    </section>
  )
}

export default Hero
