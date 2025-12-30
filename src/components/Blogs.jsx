import { useState, useEffect, useRef } from 'react'
import ReactMarkdown from 'react-markdown'
import { useFirestoreCollection, useBlogsSettings } from '../hooks/useSiteSettings'
import Loader from './Loader'

const Blogs = () => {
  const { data: blogsData, loading: blogsLoading } = useFirestoreCollection('blogs', [])
  const { settings, loading: settingsLoading } = useBlogsSettings()
  const [isVisible, setIsVisible] = useState(false)
  const [selectedBlog, setSelectedBlog] = useState(null)
  const [hoveredBlog, setHoveredBlog] = useState(null)
  const [linkCopied, setLinkCopied] = useState(false)
  const sectionRef = useRef(null)

  // Sort blogs by order
  const blogs = [...blogsData].sort((a, b) => (a.order || 0) - (b.order || 0))

  // Check for blog parameter in URL and auto-open
  useEffect(() => {
    if (blogs.length === 0) return
    
    const params = new URLSearchParams(window.location.search)
    const blogId = params.get('blog')
    
    if (blogId) {
      const blog = blogs.find(b => b.id === blogId)
      if (blog) {
        // Small delay to ensure page is loaded
        setTimeout(() => {
          setSelectedBlog(blog)
          // Scroll to blogs section
          const blogsSection = document.getElementById('blogs')
          if (blogsSection) {
            blogsSection.scrollIntoView({ behavior: 'smooth' })
          }
        }, 500)
      }
    }
  }, [blogs])

  // Copy blog-specific link
  const copyLink = () => {
    if (!selectedBlog) return
    
    const blogLink = `${window.location.origin}${window.location.pathname}?blog=${selectedBlog.id}`
    navigator.clipboard.writeText(blogLink)
    setLinkCopied(true)
    setTimeout(() => setLinkCopied(false), 2000)
  }

  // Share to different platforms
  const handleShare = (platform) => {
    if (!selectedBlog) return
    
    const blogLink = `${window.location.origin}${window.location.pathname}?blog=${selectedBlog.id}`
    const url = encodeURIComponent(blogLink)
    const text = encodeURIComponent(`Check out this article: ${selectedBlog.title}`)
    
    const shareUrls = {
      twitter: `https://twitter.com/intent/tweet?text=${text}&url=${url}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${url}`,
    }

    if (shareUrls[platform]) {
      window.open(shareUrls[platform], '_blank', 'width=600,height=400')
    }
  }

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
  }, [blogs.length])

  // Trigger visibility when data loads
  useEffect(() => {
    if (blogs.length > 0 && !isVisible) {
      const timer = setTimeout(() => setIsVisible(true), 200)
      return () => clearTimeout(timer)
    }
  }, [blogs.length, isVisible])

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (selectedBlog) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [selectedBlog])

  // If no blogs, don't render the section
  if (blogs.length === 0) {
    return null
  }

  return (
    <>
      <section
        ref={sectionRef}
        id="blogs"
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

          {/* Loading State */}
          {(blogsLoading || settingsLoading) ? (
            <div className="flex items-center justify-center py-20">
              <Loader size="lg" />
            </div>
          ) : blogs.length === 0 ? null : (
            <>
              {/* Books Grid - Open Book Style */}
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 lg:gap-10">
            {blogs.map((blog, index) => {
              const isHovered = hoveredBlog === blog.id
              return (
                <div
                  key={blog.id}
                  className={`group cursor-pointer transition-all duration-[1200ms] ease-[cubic-bezier(0.4,0,0.2,1)] ${
                    isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                  }`}
                  style={{ transitionDelay: `${0.1 + index * 0.1}s` }}
                  onClick={() => setSelectedBlog(blog)}
                  onMouseEnter={() => setHoveredBlog(blog.id)}
                  onMouseLeave={() => setHoveredBlog(null)}
                >
                  {/* Open Book Card */}
                  <div className="relative h-72" style={{ transformStyle: 'preserve-3d' }}>
                    {/* Book Container */}
                    <div 
                      className="relative h-full"
                      style={{
                        transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
                        transform: isHovered ? 'translateY(-8px) scale(1.01)' : 'translateY(0) scale(1)'
                      }}
                    >
                      
                      {/* Open Book Shape */}
                      <div className="absolute inset-0 flex" style={{ perspective: '1000px' }}>
                        {/* Left Page - Square Image + Lines */}
                        <div 
                          className="relative w-1/2 bg-white rounded-l-sm border-l border-t border-b border-gray-300 overflow-hidden"
                          style={{ 
                            transformOrigin: 'right center',
                            transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
                            transform: isHovered ? 'rotateY(-8deg) translateZ(5px)' : 'rotateY(0) translateZ(0)',
                            boxShadow: isHovered 
                              ? 'inset -15px 0 25px -12px rgba(0,0,0,0.12), -4px 4px 12px rgba(0,0,0,0.08)' 
                              : 'inset -8px 0 15px -8px rgba(0,0,0,0.08), 0 2px 4px rgba(0,0,0,0.05)'
                          }}
                        >
                          {/* Content wrapper */}
                          <div className="absolute inset-3 flex flex-col">
                            {/* Square Image Box on Top */}
                            <div 
                              className="w-full h-50 mx-auto flex items-center justify-center border border-gray-300 bg-white overflow-hidden"
                              style={{
                                transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
                                borderColor: isHovered ? '#9ca3af' : '#d1d5db'
                              }}
                            >
                              {blog.imageUrl ? (
                                <img 
                                  src={blog.imageUrl} 
                                  alt={blog.title}
                                  className="w-full h-full object-cover"
                                  style={{
                                    transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
                                    transform: isHovered ? 'scale(1.1)' : 'scale(1)',
                                    filter: 'grayscale(100%)',
                                    opacity: isHovered ? 1 : 0.8
                                  }}
                                />
                              ) : (
                                <span 
                                  className="text-xl"
                                  style={{
                                    transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
                                    transform: isHovered ? 'scale(1.15) rotate(3deg)' : 'scale(1) rotate(0)',
                                    filter: 'grayscale(100%)',
                                    opacity: isHovered ? 1 : 0.8
                                  }}
                                >
                                  📝
                                </span>
                              )}
                            </div>
                            
                            {/* Lines Below Image - More space from image */}
                            <div className="flex-1 flex flex-col justify-end pb-6 space-y-1.5">
                              {[...Array(5)].map((_, i) => (
                                <div 
                                  key={i} 
                                  className="h-0.5 rounded-full"
                                  style={{ 
                                    width: `${75 + (i % 3) * 8}%`,
                                    transition: 'all 0.4s ease',
                                    transitionDelay: `${i * 30}ms`,
                                    backgroundColor: isHovered ? '#d1d5db' : '#e5e7eb'
                                  }}
                                />
                              ))}
                            </div>
                          </div>
                          
                          {/* Page curl effect */}
                          <div 
                            className="absolute bottom-0 left-0 bg-gradient-to-br from-gray-100 to-gray-200 rounded-tr-full"
                            style={{
                              transition: 'all 0.5s ease',
                              width: isHovered ? '36px' : '28px',
                              height: isHovered ? '36px' : '28px'
                            }}
                          />
                        </div>

                        {/* Right Page - Content */}
                        <div 
                          className="relative w-1/2 bg-white rounded-r-sm border-r border-t border-b border-gray-300"
                          style={{ 
                            transformOrigin: 'left center',
                            transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
                            transform: isHovered ? 'rotateY(8deg) translateZ(5px)' : 'rotateY(0) translateZ(0)',
                            boxShadow: isHovered 
                              ? 'inset 15px 0 25px -12px rgba(0,0,0,0.12), 4px 4px 12px rgba(0,0,0,0.08)' 
                              : 'inset 8px 0 15px -8px rgba(0,0,0,0.08), 0 2px 4px rgba(0,0,0,0.05)'
                          }}
                        >
                          {/* Content */}
                          <div className="absolute inset-3 flex flex-col text-black overflow-hidden">
                            {/* Category */}
                            <span className="text-[9px] uppercase tracking-wider text-gray-400 mb-1">{blog.category}</span>
                            
                            {/* Title */}
                            <h3 className="text-[16px] font-bold mb-1.5 leading-tight line-clamp-2">{blog.title}</h3>
                            
                            {/* Decorative Line */}
                            <div 
                              className="h-0.5 bg-black mb-2"
                              style={{
                                transition: 'width 0.4s ease',
                                width: isHovered ? '32px' : '24px'
                              }}
                            />
                            
                            {/* Date & Read Time */}
                            <div className="text-[9px] text-gray-500 mb-2">
                              <p>{blog.date} • {blog.readTime}</p>
                            </div>

                            {/* Excerpt */}
                            <p className="text-[9px] text-gray-500 leading-relaxed line-clamp-4 mb-2">{blog.excerpt}</p>

                            {/* Tags - After Content */}
                            <div className="flex flex-wrap gap-1 mt-auto mb-1">
                              {blog.tags?.slice(0, 3).map((tag, i) => (
                                <span 
                                  key={i} 
                                  className="px-1.5 py-0.5 bg-gray-200 text-gray-600 text-[7px]"
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>
                            
                            {/* Arrow */}
                            <div 
                              className="flex items-center text-[9px] font-medium text-black mt-2"
                              style={{
                                transition: 'gap 0.3s ease',
                                gap: isHovered ? '4px' : '0'
                              }}
                            >
                              <span>Read More</span>
                              <svg 
                                className="w-2.5 h-2.5 ml-0.5"
                                style={{
                                  transition: 'transform 0.3s ease',
                                  transform: isHovered ? 'translateX(4px)' : 'translateX(0)'
                                }}
                                fill="none" viewBox="0 0 24 24" stroke="currentColor"
                              >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                              </svg>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Book Spine (Center) */}
                      <div 
                        className="absolute left-1/2 top-0 bottom-0 w-1 -translate-x-1/2 z-10"
                        style={{
                          transition: 'background 0.4s ease',
                          background: isHovered 
                            ? 'linear-gradient(to bottom, #6b7280, #9ca3af, #6b7280)' 
                            : 'linear-gradient(to bottom, #9ca3af, #d1d5db, #9ca3af)'
                        }}
                      />
                      
                      {/* Book Binding Lines */}
                      <div className="absolute left-1/2 top-2 bottom-2 w-px -translate-x-2 bg-gray-300 z-10" />
                      <div className="absolute left-1/2 top-2 bottom-2 w-px translate-x-1 bg-gray-300 z-10" />

                      {/* Bottom Shadow */}
                      <div 
                        className="absolute left-4 right-4 h-3 bg-black/25 blur-lg rounded-full"
                        style={{
                          transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
                          opacity: isHovered ? 0.35 : 0.2,
                          bottom: isHovered ? '-12px' : '-8px',
                          transform: isHovered ? 'scaleX(1.01)' : 'scaleX(1)'
                        }}
                      />
                    </div>
                  </div>

                  {/* Book Title Below */}
                  <div className="mt-4 text-center">
                    <h4 
                      className="font-medium line-clamp-1"
                      style={{
                        transition: 'color 0.3s ease',
                        color: isHovered ? '#d1d5db' : '#ffffff'
                      }}
                    >
                      {blog.title}
                    </h4>
                    <p className="text-gray-500 text-sm">{blog.category} • {blog.readTime}</p>
                  </div>
                </div>
              )
            })}
              </div>

              {/* Bottom Note */}
              <div
                className={`text-center mt-16 transition-all duration-[1200ms] ease-[cubic-bezier(0.4,0,0.2,1)] ${
                  isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                }`}
                style={{ transitionDelay: '0.8s' }}
              >
                <p className="text-gray-500 italic flex items-center justify-center gap-2">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                  {settings.bottomNote}
                </p>
              </div>
            </>
          )}
        </div>
      </section>

      {/* Book Details Modal */}
      {selectedBlog && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedBlog(null)}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
          
          {/* Modal Content */}
          <div 
            className="relative bg-white w-full max-w-3xl max-h-[90vh] overflow-y-auto animate-scaleIn"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header - Sticky */}
            <div className="sticky top-0 z-20 flex items-center justify-between p-4 bg-white border-b border-gray-200 shadow-sm">
              <h2 className="text-xl font-bold text-black">Blogs</h2>
              <button
                onClick={() => setSelectedBlog(null)}
                className="w-10 h-10 flex items-center justify-center border border-gray-300 bg-white hover:bg-black hover:text-white hover:border-black transition-all duration-300 shadow-sm"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Book Header Image */}
            <div className="aspect-video bg-gray-100 flex items-center justify-center border-b border-gray-200 overflow-hidden">
              {selectedBlog.imageUrl ? (
                <img 
                  src={selectedBlog.imageUrl} 
                  alt={selectedBlog.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-8xl">📝</span>
              )}
            </div>

            {/* Book Content */}
            <div className="p-8">
              {/* Category & Meta */}
              <div className="flex flex-wrap items-center gap-4 mb-4">
                <span className="px-3 py-1 text-xs uppercase tracking-wider bg-black text-white">
                  {selectedBlog.category}
                </span>
                <span className="text-sm text-gray-400">{selectedBlog.date}</span>
                <span className="text-sm text-gray-400">•</span>
                <span className="text-sm text-gray-400">{selectedBlog.readTime}</span>
              </div>

              {/* Title */}
              <h2 className="text-3xl font-bold text-black mb-4">
                {selectedBlog.title}
              </h2>

              {/* Author */}
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-black text-white flex items-center justify-center font-semibold text-sm">
                  {selectedBlog.author?.split(' ').map(n => n[0]).join('') || 'SS'}
                </div>
                <div>
                  <p className="font-medium text-black">{selectedBlog.author || 'Simrat Singh'}</p>
                  <p className="text-sm text-gray-500">Author</p>
                </div>
              </div>

              {/* Tags */}
              {selectedBlog.tags && selectedBlog.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-8 pb-6 border-b border-gray-200">
                  {selectedBlog.tags.map((tag, i) => (
                    <span 
                      key={i} 
                      className="px-3 py-1.5 bg-gray-100 text-gray-700 text-sm hover:bg-gray-200 transition-colors"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Full Content with Markdown */}
              <div className="prose prose-gray max-w-none book-content">
                <ReactMarkdown
                  components={{
                    h1: ({ children }) => <h1 className="text-2xl font-bold text-black mt-8 mb-4">{children}</h1>,
                    h2: ({ children }) => <h2 className="text-xl font-bold text-black mt-8 mb-4 pb-2 border-b border-gray-200">{children}</h2>,
                    h3: ({ children }) => <h3 className="text-lg font-semibold text-black mt-6 mb-3">{children}</h3>,
                    p: ({ children }) => <p className="text-gray-700 leading-relaxed mb-4">{children}</p>,
                    ul: ({ children }) => <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">{children}</ul>,
                    ol: ({ children }) => <ol className="list-decimal list-inside text-gray-700 mb-4 space-y-2">{children}</ol>,
                    li: ({ children }) => <li className="text-gray-700">{children}</li>,
                    strong: ({ children }) => <strong className="font-semibold text-black">{children}</strong>,
                    em: ({ children }) => <em className="italic text-gray-600">{children}</em>,
                    code: ({ node, inline, className, children, ...props }) => 
                      inline ? (
                        <code className="bg-gray-100 text-gray-800 px-1.5 py-0.5 rounded text-sm font-mono" {...props}>{children}</code>
                      ) : (
                        <code className="text-gray-100 text-sm font-mono" {...props}>{children}</code>
                      ),
                    pre: ({ children }) => <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm font-mono my-4">{children}</pre>,
                    blockquote: ({ children }) => <blockquote className="border-l-4 border-black pl-4 italic text-gray-600 my-4">{children}</blockquote>,
                    hr: () => <hr className="border-t border-gray-200 my-8" />,
                    a: ({ href, children }) => <a href={href} className="text-black underline hover:text-gray-600 transition-colors" target="_blank" rel="noopener noreferrer">{children}</a>,
                    table: ({ children }) => <table className="w-full border-collapse my-4">{children}</table>,
                    thead: ({ children }) => <thead className="bg-gray-100">{children}</thead>,
                    tbody: ({ children }) => <tbody>{children}</tbody>,
                    tr: ({ children }) => <tr className="border-b border-gray-200">{children}</tr>,
                    th: ({ children }) => <th className="text-left p-3 font-semibold text-black">{children}</th>,
                    td: ({ children }) => <td className="p-3 text-gray-700">{children}</td>,
                  }}
                >
                  {selectedBlog.content}
                </ReactMarkdown>
              </div>

              {/* Share & Close */}
              <div className="mt-8 pt-6 border-t border-gray-200">
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500">Share:</span>
                    {/* Copy Link */}
                    <button 
                      onClick={copyLink}
                      className={`h-8 px-3 border flex items-center justify-center gap-1.5 transition-all duration-300 ${
                        linkCopied 
                          ? 'bg-green-500 border-green-500 text-white' 
                          : 'border-gray-300 hover:bg-black hover:text-white hover:border-black'
                      }`}
                    >
                      {linkCopied ? (
                        <>
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          <span className="text-xs">Copied!</span>
                        </>
                      ) : (
                        <>
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                          </svg>
                          <span className="text-xs">Copy Link</span>
                        </>
                      )}
                    </button>
                    {/* Twitter/X */}
                    <button 
                      onClick={() => handleShare('twitter')}
                      className="w-8 h-8 border border-gray-300 flex items-center justify-center hover:bg-black hover:text-white hover:border-black transition-all duration-300"
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                      </svg>
                    </button>
                    {/* LinkedIn */}
                    <button 
                      onClick={() => handleShare('linkedin')}
                      className="w-8 h-8 border border-gray-300 flex items-center justify-center hover:bg-black hover:text-white hover:border-black transition-all duration-300"
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                      </svg>
                    </button>
                  </div>
                  <button
                    onClick={() => setSelectedBlog(null)}
                    className="px-6 py-2 border border-gray-300 text-gray-700 font-medium hover:bg-black hover:text-white hover:border-black transition-all duration-300"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CSS for modal animation */}
      <style>{`
        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.95) translateY(10px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
        .animate-scaleIn {
          animation: scaleIn 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        }
      `}</style>
    </>
  )
}

export default Blogs
