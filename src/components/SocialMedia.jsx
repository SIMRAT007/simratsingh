import { useEffect, useState, useRef } from 'react'
import { useFirestoreCollection, useSocialMediaSettings } from '../hooks/useSiteSettings'
import Loader from './Loader'

// Platform icons
const youtubeIcon = (
  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
  </svg>
)

const linkedinIcon = (
  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
  </svg>
)

const instagramIcon = (
  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
  </svg>
)

const SocialMedia = () => {
  const { settings, loading: settingsLoading } = useSocialMediaSettings()
  const { data: youtubeVideos, loading: youtubeLoading } = useFirestoreCollection('socialMedia_youtube', [])
  const { data: linkedinPosts, loading: linkedinLoading } = useFirestoreCollection('socialMedia_linkedin', [])
  const { data: instagramPosts, loading: instagramLoading } = useFirestoreCollection('socialMedia_instagram', [])
  
  const [isVisible, setIsVisible] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [modalData, setModalData] = useState(null)
  const sectionRef = useRef(null)

  // Sort data by order
  const sortedYoutubeVideos = [...youtubeVideos].sort((a, b) => (a.order || 0) - (b.order || 0))
  const sortedLinkedinPosts = [...linkedinPosts].sort((a, b) => (a.order || 0) - (b.order || 0))
  const sortedInstagramPosts = [...instagramPosts].sort((a, b) => (a.order || 0) - (b.order || 0))

  // Check if platform is enabled and has content
  const showYoutube = settings.youtubeEnabled && sortedYoutubeVideos.length > 0
  const showLinkedin = settings.linkedinEnabled && sortedLinkedinPosts.length > 0
  const showInstagram = settings.instagramEnabled && sortedInstagramPosts.length > 0
  
  // Check if there's any content to show
  const hasContent = showYoutube || showLinkedin || showInstagram

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
  }, [hasContent])

  // Trigger visibility when data loads
  useEffect(() => {
    if (hasContent && !isVisible) {
      const timer = setTimeout(() => setIsVisible(true), 200)
      return () => clearTimeout(timer)
    }
  }, [hasContent, isVisible])

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (modalOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [modalOpen])

  const openModal = (platform, url, icon, color) => {
    setModalData({ platform, url, icon, color })
    setModalOpen(true)
  }

  const closeModal = () => {
    setModalOpen(false)
    setModalData(null)
  }

  // If no content, don't render
  if (!hasContent) {
    return null
  }

  return (
    <>
      <section
        ref={sectionRef}
        id="social"
        className="py-12 md:py-16 lg:py-20 bg-black text-white relative overflow-hidden"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {/* Section Header */}
          <div
            className={`text-center mb-8 md:mb-12 lg:mb-16 transition-all duration-[1200ms] ease-[cubic-bezier(0.4,0,0.2,1)] ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
          >
            <p className="text-gray-500 text-sm uppercase tracking-widest mb-4">{settings.sectionSubtitle}</p>
            <h2 className="text-4xl md:text-5xl font-bold">
              {settings.sectionTitle} <span className="text-gray-500">{settings.sectionTitleHighlight}</span>
            </h2>
            <p className="text-gray-400 mt-4 max-w-xl mx-auto">
              {settings.sectionDescription}
            </p>
          </div>

          {/* YouTube Section */}
          {showYoutube && (
            <div
              className={`mb-8 md:mb-12 lg:mb-16 transition-all duration-[1200ms] ease-[cubic-bezier(0.4,0,0.2,1)] ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`}
              style={{ transitionDelay: '0.2s' }}
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-red-600 text-white flex items-center justify-center rounded">
                    {youtubeIcon}
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-white">YouTube</h3>
                    <p className="text-gray-500 text-sm">{settings.youtubeHandle}</p>
                  </div>
                </div>
                <button
                  onClick={() => openModal('YouTube', settings.youtubeProfileUrl, youtubeIcon, 'bg-red-600')}
                  className="flex items-center gap-2 px-4 py-2 border border-gray-700 text-sm font-medium text-gray-300 hover:border-red-600 hover:text-red-500 transition-all duration-300"
                >
                  View Channel
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </button>
              </div>

              <div className="grid md:grid-cols-3 gap-4 md:gap-6">
                {sortedYoutubeVideos.map((video, index) => (
                  <a
                    key={video.id}
                    href={video.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`group bg-gray-900 border border-gray-800 hover:border-red-600 transition-all duration-300 ${
                      isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                    }`}
                    style={{ transitionDelay: `${0.3 + index * 0.1}s` }}
                  >
                    <div className="relative aspect-video overflow-hidden">
                      <img
                        src={video.thumbnail}
                        alt={video.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="w-14 h-14 bg-red-600 rounded-full flex items-center justify-center">
                          <svg className="w-6 h-6 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M8 5v14l11-7z"/>
                          </svg>
                        </div>
                      </div>
                      {video.duration && (
                        <span className="absolute bottom-2 right-2 px-2 py-1 bg-black/80 text-white text-xs font-medium">
                          {video.duration}
                        </span>
                      )}
                    </div>
                    <div className="p-4">
                      <h4 className="font-medium text-white group-hover:text-red-500 transition-colors line-clamp-2 mb-2">
                        {video.title}
                      </h4>
                      {video.views && <p className="text-gray-500 text-sm">{video.views} views</p>}
                    </div>
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* LinkedIn Section */}
          {showLinkedin && (
            <div
              className={`mb-8 md:mb-12 lg:mb-16 transition-all duration-[1200ms] ease-[cubic-bezier(0.4,0,0.2,1)] ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`}
              style={{ transitionDelay: '0.5s' }}
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-700 text-white flex items-center justify-center rounded">
                    {linkedinIcon}
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-white">LinkedIn</h3>
                    <p className="text-gray-500 text-sm">{settings.linkedinHandle}</p>
                  </div>
                </div>
                <button
                  onClick={() => openModal('LinkedIn', settings.linkedinProfileUrl, linkedinIcon, 'bg-blue-700')}
                  className="flex items-center gap-2 px-4 py-2 border border-gray-700 text-sm font-medium text-gray-300 hover:border-blue-600 hover:text-blue-500 transition-all duration-300"
                >
                  View Profile
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </button>
              </div>

              <div className="grid md:grid-cols-3 gap-4 md:gap-6">
                {sortedLinkedinPosts.map((post, index) => (
                  <a
                    key={post.id}
                    href={post.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`group p-6 bg-gray-900 border border-gray-800 hover:border-blue-600 transition-all duration-300 ${
                      isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                    }`}
                    style={{ transitionDelay: `${0.6 + index * 0.1}s` }}
                  >
                    <p className="text-gray-300 text-sm leading-relaxed line-clamp-4 mb-4">
                      {post.content}
                    </p>
                    <div className="flex items-center justify-between text-gray-500 text-sm">
                      <div className="flex items-center gap-4">
                        <span className="flex items-center gap-1">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                          </svg>
                          {post.likes || 0}
                        </span>
                        <span className="flex items-center gap-1">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                          </svg>
                          {post.comments || 0}
                        </span>
                      </div>
                      <span>{post.date}</span>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Instagram Section */}
          {showInstagram && (
            <div
              className={`transition-all duration-[1200ms] ease-[cubic-bezier(0.4,0,0.2,1)] ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`}
              style={{ transitionDelay: '0.8s' }}
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 text-white flex items-center justify-center rounded">
                    {instagramIcon}
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-white">Instagram</h3>
                    <p className="text-gray-500 text-sm">{settings.instagramHandle}</p>
                  </div>
                </div>
                <button
                  onClick={() => openModal('Instagram', settings.instagramProfileUrl, instagramIcon, 'bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500')}
                  className="flex items-center gap-2 px-4 py-2 border border-gray-700 text-sm font-medium text-gray-300 hover:border-pink-500 hover:text-pink-500 transition-all duration-300"
                >
                  View Profile
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </button>
              </div>

              <div className="grid md:grid-cols-3 gap-4 md:gap-6">
                {sortedInstagramPosts.map((post, index) => (
                  <a
                    key={post.id}
                    href={post.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`group bg-gray-900 border border-gray-800 hover:border-pink-500 transition-all duration-300 overflow-hidden ${
                      isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                    }`}
                    style={{ transitionDelay: `${0.9 + index * 0.1}s` }}
                  >
                    <div className="relative aspect-square overflow-hidden">
                      <img
                        src={post.image}
                        alt={post.caption}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="flex items-center gap-4 text-white">
                          <span className="flex items-center gap-1">
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                            </svg>
                            {post.likes || 0}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="p-4">
                      <p className="text-gray-400 text-sm line-clamp-2">{post.caption}</p>
                      <p className="text-gray-600 text-xs mt-2">{post.date}</p>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Bottom Note */}
          <div
            className={`text-center mt-16 transition-all duration-[1200ms] ease-[cubic-bezier(0.4,0,0.2,1)] ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
            style={{ transitionDelay: '1.2s' }}
          >
            <p className="text-gray-500 italic text-sm mb-6">
              {settings.bottomNote}
            </p>
            <div className="flex items-center justify-center gap-4">
              {showYoutube && (
                <button
                  onClick={() => openModal('YouTube', settings.youtubeProfileUrl, youtubeIcon, 'bg-red-600')}
                  className="w-12 h-12 border border-gray-700 flex items-center justify-center text-gray-400 hover:bg-red-600 hover:text-white hover:border-red-600 transition-all duration-300"
                >
                  {youtubeIcon}
                </button>
              )}
              {showLinkedin && (
                <button
                  onClick={() => openModal('LinkedIn', settings.linkedinProfileUrl, linkedinIcon, 'bg-blue-700')}
                  className="w-12 h-12 border border-gray-700 flex items-center justify-center text-gray-400 hover:bg-blue-700 hover:text-white hover:border-blue-700 transition-all duration-300"
                >
                  {linkedinIcon}
                </button>
              )}
              {showInstagram && (
                <button
                  onClick={() => openModal('Instagram', settings.instagramProfileUrl, instagramIcon, 'bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500')}
                  className="w-12 h-12 border border-gray-700 flex items-center justify-center text-gray-400 hover:bg-gradient-to-r hover:from-purple-600 hover:via-pink-600 hover:to-orange-500 hover:text-white hover:border-pink-500 transition-all duration-300"
                >
                  {instagramIcon}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* CSS for line clamp */}
        <style>{`
          .line-clamp-2 {
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
            overflow: hidden;
          }
          .line-clamp-4 {
            display: -webkit-box;
            -webkit-line-clamp: 4;
            -webkit-box-orient: vertical;
            overflow: hidden;
          }
        `}</style>
      </section>

      {/* Social Media Modal with Iframe */}
      {modalOpen && modalData && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center p-4"
          onClick={closeModal}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />

          {/* Modal Content */}
          <div
            className="relative bg-white w-full max-w-5xl h-[85vh] shadow-2xl flex flex-col animate-scaleIn"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className={`flex items-center justify-between p-4 ${modalData.color} text-white`}>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 flex items-center justify-center">
                  {modalData.icon}
                </div>
                <h2 className="text-lg font-semibold">{modalData.platform}</h2>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href={modalData.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 text-sm font-medium transition-all duration-300 rounded"
                >
                  Open in New Tab
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
                <button
                  onClick={closeModal}
                  className="p-2 hover:bg-white/20 rounded transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Iframe Container */}
            <div className="flex-1 bg-gray-100 relative">
              {/* Loading State */}
              <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                <div className="text-center">
                  <div className="w-12 h-12 border-4 border-gray-300 border-t-gray-600 rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-gray-500">Loading {modalData.platform}...</p>
                </div>
              </div>
              
              {/* Iframe */}
              <iframe
                src={modalData.url}
                title={modalData.platform}
                className="w-full h-full relative z-10"
                style={{ border: 'none' }}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>

            {/* Footer Note */}
            <div className="p-3 bg-gray-50 border-t border-gray-200 text-center">
              <p className="text-gray-500 text-xs">
                Some content may not display correctly due to security restrictions. 
                <a 
                  href={modalData.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline ml-1"
                >
                  Open directly →
                </a>
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Animation Styles */}
      <style>{`
        @keyframes scaleIn {
          from { 
            opacity: 0; 
            transform: scale(0.95); 
          }
          to { 
            opacity: 1; 
            transform: scale(1); 
          }
        }
        .animate-scaleIn {
          animation: scaleIn 0.2s ease-out;
        }
      `}</style>
    </>
  )
}

export default SocialMedia
