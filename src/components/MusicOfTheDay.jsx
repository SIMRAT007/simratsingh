import { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import { useFirestoreCollection, useMusicSettings } from '../hooks/useSiteSettings'
import Loader from './Loader'

// Default tracks as fallback
const defaultTracks = [
  { 
    id: 1,
    title: 'Midnight Coding', 
    artist: 'Lo-Fi Beats', 
    coverUrl: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=400&fit=crop',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3'
  },
]

// Format seconds to m:ss
const formatTime = (seconds) => {
  if (!seconds || isNaN(seconds)) return '0:00'
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

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
    // Try to get the track URL from API response or use as-is
    return url
  }
  
  return null
}

const MusicOfTheDay = () => {
  const [isVisible, setIsVisible] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [elapsedTime, setElapsedTime] = useState(0)
  const [totalDuration, setTotalDuration] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0)
  
  const sectionRef = useRef(null)
  const audioRef = useRef(null)
  const soundCloudWidgetRef = useRef(null)

  // Fetch tracks from Firebase
  const { data: tracks, loading: tracksLoading } = useFirestoreCollection('music', defaultTracks)
  const { settings, loading: settingsLoading } = useMusicSettings()

  // Select initial random track when tracks load
  const initialIndex = useMemo(() => {
    if (tracks.length === 0) return 0
    return Math.floor(Math.random() * tracks.length)
  }, [tracks.length])

  useEffect(() => {
    setCurrentTrackIndex(initialIndex)
  }, [initialIndex])

  const currentTrack = tracks[currentTrackIndex] || defaultTracks[0]
  const isSoundCloud = isSoundCloudUrl(currentTrack?.audioUrl)
  const soundCloudUrl = isSoundCloud ? extractSoundCloudUrl(currentTrack?.audioUrl) : null
  const soundCloudEmbedRef = useRef(null)

  // Define handleNext before useEffect hooks
  const handleNext = useCallback(() => {
    if (isSoundCloud && soundCloudEmbedRef.current && window.SC) {
      const widget = window.SC.Widget(soundCloudEmbedRef.current)
      widget.pause()
    } else if (audioRef.current) {
      audioRef.current.pause()
    }
    setIsPlaying(false)
    setElapsedTime(0)
    setCurrentTrackIndex((prev) => 
      prev === tracks.length - 1 ? 0 : prev + 1
    )
  }, [isSoundCloud, tracks.length])

  // Initialize audio (only for non-SoundCloud URLs)
  useEffect(() => {
    if (!currentTrack?.audioUrl || isSoundCloud) return

    audioRef.current = new Audio(currentTrack.audioUrl)
    audioRef.current.volume = 0.5
    setIsLoading(true)

    const handleLoadedMetadata = () => {
      setTotalDuration(audioRef.current.duration)
      setIsLoading(false)
    }

    const handleEnded = () => {
      setIsPlaying(false)
      setElapsedTime(0)
      // Auto play next
      handleNext()
    }

    const handleTimeUpdate = () => {
      setElapsedTime(audioRef.current.currentTime)
    }

    audioRef.current.addEventListener('loadedmetadata', handleLoadedMetadata)
    audioRef.current.addEventListener('ended', handleEnded)
    audioRef.current.addEventListener('timeupdate', handleTimeUpdate)

    return () => {
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current.removeEventListener('loadedmetadata', handleLoadedMetadata)
        audioRef.current.removeEventListener('ended', handleEnded)
        audioRef.current.removeEventListener('timeupdate', handleTimeUpdate)
        audioRef.current = null
      }
    }
  }, [currentTrackIndex, currentTrack?.audioUrl, isSoundCloud])

  // Load SoundCloud widget script and initialize
  useEffect(() => {
    if (!isSoundCloud || !soundCloudUrl) {
      soundCloudWidgetRef.current = null
      return
    }

    setIsLoading(true)
    const initializeWidget = () => {
      if (!soundCloudEmbedRef.current || !window.SC) return
      
      try {
        const widget = window.SC.Widget(soundCloudEmbedRef.current)
        soundCloudWidgetRef.current = widget
        
        widget.bind(window.SC.Widget.Events.READY, () => {
          widget.getDuration((duration) => {
            setTotalDuration(duration / 1000) // Convert to seconds
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
          handleNext()
        })
        
        widget.bind(window.SC.Widget.Events.PLAY_PROGRESS, (e) => {
          setElapsedTime(e.currentPosition / 1000) // Convert to seconds
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
        // Wait a bit for iframe to be ready
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
  }, [isSoundCloud, soundCloudUrl, currentTrackIndex, handleNext])

  // Intersection observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
        }
      },
      { threshold: 0.1 }
    )

    if (sectionRef.current) {
      observer.observe(sectionRef.current)
    }

    return () => observer.disconnect()
  }, [])

  const handlePlayPause = async () => {
    if (isSoundCloud && soundCloudWidgetRef.current) {
      soundCloudWidgetRef.current.toggle()
    } else if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause()
        setIsPlaying(false)
      } else {
        try {
          await audioRef.current.play()
          setIsPlaying(true)
        } catch (error) {
        }
      }
    }
  }

  const handlePrevious = () => {
    if (isSoundCloud && soundCloudWidgetRef.current) {
      soundCloudWidgetRef.current.pause()
    } else if (audioRef.current) {
      audioRef.current.pause()
    }
    setIsPlaying(false)
    setElapsedTime(0)
    setCurrentTrackIndex((prev) => 
      prev === 0 ? tracks.length - 1 : prev - 1
    )
  }


  const handleSeek = (e) => {
    if (!totalDuration) return
    const rect = e.currentTarget.getBoundingClientRect()
    const clickX = e.clientX - rect.left
    const percentage = clickX / rect.width
    const newTime = percentage * totalDuration
    
    if (isSoundCloud && soundCloudWidgetRef.current) {
      soundCloudWidgetRef.current.seekTo(newTime * 1000) // Convert to milliseconds
      setElapsedTime(newTime)
    } else if (audioRef.current) {
      audioRef.current.currentTime = newTime
      setElapsedTime(newTime)
    }
  }

  const progressPercent = totalDuration ? (elapsedTime / totalDuration) * 100 : 0

  // Extract unique genres from all tracks
  const genres = useMemo(() => {
    const genreSet = new Set()
    tracks.forEach(track => {
      if (track.genre) {
        // If genre is a string
        if (typeof track.genre === 'string') {
          genreSet.add(track.genre.trim())
        }
      } else if (track.genres && Array.isArray(track.genres)) {
        // If genres is an array
        track.genres.forEach(g => {
          if (g && typeof g === 'string') {
            genreSet.add(g.trim())
          }
        })
      }
    })
    return Array.from(genreSet).sort()
  }, [tracks])

  // Don't render if no tracks
  if (!tracksLoading && tracks.length === 0) {
    return null
  }

  return (
    <section 
      ref={sectionRef}
      id="music" 
      className="py-12 md:py-16 lg:py-24 bg-white relative overflow-hidden"
    >
      {/* Subtle Grid Pattern */}
      <div className="absolute inset-0 opacity-[0.02] pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(to right, black 1px, transparent 1px),
            linear-gradient(to bottom, black 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px'
        }}
      />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div
          className={`text-center mb-8 md:mb-12 lg:mb-16 transition-all duration-1000 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <p className="text-gray-500 text-xs uppercase tracking-[0.3em] mb-4 font-medium">{settings.sectionSubtitle}</p>
          <h2 className="text-4xl md:text-5xl font-bold text-black tracking-tight">
            {settings.sectionTitle} <span className="text-gray-400">{settings.sectionTitleHighlight}</span>
          </h2>
        </div>

        {/* Loading State */}
        {(tracksLoading || settingsLoading) ? (
          <div className="flex items-center justify-center py-20">
            <Loader size="lg" />
          </div>
        ) : (
          <>
            {/* Professional Player */}
            <div
              className={`transition-all duration-1000 delay-200 ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
              }`}
            >
          <div className="max-w-4xl mx-auto">
            {/* Main Player Card */}
            <div className="bg-white border-2 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                
                <div className="p-8 md:p-12">
                  <div className="flex flex-col lg:flex-row items-center gap-10 lg:gap-16">
                  
                  {/* Album Art */}
                  <div className="relative flex-shrink-0">
                    <div className="relative w-64 h-64 md:w-80 md:h-80 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                      {/* Spinning Vinyl Effect */}
                      <div 
                        className={`absolute inset-0 rounded-full overflow-hidden transition-transform duration-500 ${isPlaying ? 'animate-vinyl-spin' : ''}`}
                        style={{ transformOrigin: 'center center' }}
                      >
                        {/* Vinyl Base */}
                        <div className="absolute inset-0 rounded-full bg-black" />
                        
                        {/* Vinyl Grooves - Minimalist */}
                        {[...Array(6)].map((_, i) => (
                          <div 
                            key={i}
                            className="absolute rounded-full border border-white/10"
                            style={{
                              inset: `${15 + i * 8}%`,
                              borderWidth: '1px'
                            }}
                          />
                        ))}
                        
                        {/* Center Label - Album Art */}
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-32 h-32 md:w-40 md:h-40 rounded-full overflow-hidden border-4 border-white shadow-lg">
                            {currentTrack.coverUrl ? (
                              <img 
                                src={currentTrack.coverUrl} 
                                alt={currentTrack.title}
                                className="w-full h-full object-cover grayscale"
                              />
                            ) : (
                              <div className="w-full h-full bg-black flex items-center justify-center">
                                <svg className="w-12 h-12 text-white" fill="currentColor" viewBox="0 0 24 24">
                                  <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
                                </svg>
                              </div>
                            )}
                          </div>
                          {/* Center Hole */}
                          <div className="absolute w-4 h-4 md:w-5 md:h-5 rounded-full bg-white border-2 border-black" />
                        </div>
                      </div>
                    </div>
                    
                    {/* Status Indicator */}
                    <div className="absolute -bottom-2 left-1/2 -translate-x-1/2">
                      <div className={`px-4 py-1.5 border-2 border-black bg-white text-xs font-bold uppercase tracking-wider ${
                        isPlaying ? 'text-black' : 'text-gray-400'
                      }`}>
                        {isPlaying ? '● PLAYING' : '○ PAUSED'}
                      </div>
                    </div>
                  </div>

                  {/* Track Info & Controls */}
                  <div className="flex-1 w-full text-center lg:text-left">
                    {/* Track Number Badge */}
                    {tracks.length > 1 && (
                      <div className="flex items-center justify-center lg:justify-start mb-4">
                        <span className="px-3 py-1 border border-black bg-white text-black text-xs font-bold uppercase tracking-wider">
                          TRACK {currentTrackIndex + 1} / {tracks.length}
                        </span>
                      </div>
                    )}
                    
                    {/* Title & Artist */}
                    <h3 className="text-3xl md:text-4xl lg:text-5xl font-bold text-black mb-2 tracking-tight">{currentTrack.title}</h3>
                    <p className="text-gray-600 text-lg md:text-xl mb-6 md:mb-8 font-medium">{currentTrack.artist}</p>

                    {/* Progress Bar */}
                    <div className="mb-6 md:mb-8">
                      <div 
                        className="h-2 bg-gray-200 border border-black cursor-pointer group relative"
                        onClick={handleSeek}
                      >
                        <div 
                          className="h-full bg-black transition-all duration-150 group-hover:bg-gray-800"
                          style={{ width: `${progressPercent}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-xs text-gray-600 mt-3 font-mono font-bold">
                        <span>{formatTime(elapsedTime)}</span>
                        <span>{formatTime(totalDuration)}</span>
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
                          src={`https://w.soundcloud.com/player/?url=${encodeURIComponent(soundCloudUrl)}&color=%23000000&auto_play=false&hide_related=false&show_comments=false&show_user=false&show_reposts=false&show_teaser=false&visual=false`}
                        />
                      </div>
                    )}

                    {/* Mobile: Release Date and Genres Above Controls */}
                    <div className="lg:hidden mb-6">
                      <div className="flex flex-col gap-3 items-center">
                        {/* Release Date */}
                        {currentTrack.releaseDate && (
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-black font-bold bg-white">
                            <span className="text-xs uppercase tracking-wider text-gray-600 font-bold">RELEASE DATE:</span> {currentTrack.releaseDate}
                            </span>
                          </div>
                        )}

                        {/* Genres */}
                        {genres.length > 0 && (
                          <div className="flex flex-wrap items-center justify-center gap-2">
                            {genres.map((genre, index) => (
                              <span
                                key={index}
                                className="bg-white text-black text-xs font-bold uppercase tracking-wider hover:bg-black hover:text-white transition-all duration-200 cursor-default"
                              >
                                <span className="text-xs uppercase tracking-wider text-gray-600 font-bold">GENRES: </span>{genre}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Control Buttons with Release Date and Genres on Right (Desktop) */}
                    <div className="flex items-end justify-center lg:justify-start gap-4 flex-wrap">
                      {/* Left Side - Control Buttons */}
                      <div className="flex items-center gap-3">
                        {/* Previous */}
                        {tracks.length > 1 && (
                          <button 
                            onClick={handlePrevious}
                            className="w-12 h-12 border-2 border-black bg-white hover:bg-black hover:text-white transition-all duration-200 flex items-center justify-center group"
                            aria-label="Previous track"
                          >
                            <svg className="w-5 h-5 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z"/>
                            </svg>
                          </button>
                        )}

                        {/* Play/Pause */}
                        <button 
                          onClick={handlePlayPause}
                          disabled={isLoading}
                          className="w-16 h-16 border-2 border-black bg-black text-white hover:bg-white hover:text-black transition-all duration-200 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed group"
                          aria-label={isPlaying ? 'Pause' : 'Play'}
                        >
                          {isLoading ? (
                            <svg className="w-6 h-6 animate-spin" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                            </svg>
                          ) : isPlaying ? (
                            <svg className="w-6 h-6 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/>
                            </svg>
                          ) : (
                            <svg className="w-6 h-6 ml-1 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M8 5v14l11-7z"/>
                            </svg>
                          )}
                        </button>

                        {/* Next */}
                        {tracks.length > 1 && (
                          <button 
                            onClick={handleNext}
                            className="w-12 h-12 border-2 border-black bg-white hover:bg-black hover:text-white transition-all duration-200 flex items-center justify-center group"
                            aria-label="Next track"
                          >
                            <svg className="w-5 h-5 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z"/>
                            </svg>
                          </button>
                        )}
                      </div>

                      {/* Right Side - Release Date and Genres (Desktop Only) */}
                      <div className="hidden lg:flex flex-col gap-3 items-start justify-end">
                        {/* Release Date - Top */}
                        {currentTrack.releaseDate && (
                          <div className="flex items-center gap-2">
                            <span className="text-xs uppercase tracking-wider text-gray-600 font-bold">RELEASE DATE:</span>
                            <span className="text-xs text-black font-bold bg-white">
                              {currentTrack.releaseDate}
                            </span>
                          </div>
                        )}

                        {/* Genres - Below Release Date */}
                        {genres.length > 0 && (
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-xs uppercase tracking-wider text-gray-600 font-bold">GENRES:</span>
                            {genres.map((genre, index) => (
                              <span
                                key={index}
                                className="bg-white text-black text-xs font-bold uppercase tracking-wider hover:bg-black hover:text-white transition-all duration-200 cursor-default"
                              >
                                {genre}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Note */}
        <p
          className={`text-center text-gray-500 text-sm mt-12 transition-all duration-1000 delay-400 font-medium ${
            isVisible ? 'opacity-100' : 'opacity-0'
          }`}
        >
              {settings.bottomNote}
            </p>
          </>
        )}
      </div>

      {/* Styles */}
      <style>{`
        @keyframes vinyl-spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-vinyl-spin {
          animation: vinyl-spin 3s linear infinite;
        }
      `}</style>
    </section>
  )
}

export default MusicOfTheDay
