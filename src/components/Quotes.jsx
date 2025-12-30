import { useEffect, useState, useRef, useMemo } from 'react'
import { useFirestoreCollection, useQuotesSettings } from '../hooks/useSiteSettings'
import Loader from './Loader'

// Default quotes as fallback
const defaultQuotes = [
  {
    id: 1,
    quote: "The only way to do great work is to love what you do.",
    author: "Steve Jobs",
    role: "Co-founder of Apple",
  },
  {
    id: 2,
    quote: "Innovation distinguishes between a leader and a follower.",
    author: "Steve Jobs",
    role: "Co-founder of Apple",
  },
  {
    id: 3,
    quote: "The best time to plant a tree was 20 years ago. The second best time is now.",
    author: "Chinese Proverb",
    role: "Ancient Wisdom",
  },
]

// Generate initials from author name
const getInitials = (author) => {
  if (!author) return '?'
  return author
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

const Quotes = () => {
  const [isVisible, setIsVisible] = useState(false)
  const sectionRef = useRef(null)
  
  // Fetch quotes from Firebase
  const { data: quotes, loading: quotesLoading } = useFirestoreCollection('quotes', defaultQuotes)
  const { settings, loading: settingsLoading } = useQuotesSettings()

  // Select a random quote (memoized to prevent changes on re-render)
  const randomQuote = useMemo(() => {
    if (quotes.length === 0) return defaultQuotes[0]
    const randomIndex = Math.floor(Math.random() * quotes.length)
    return quotes[randomIndex]
  }, [quotes])

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

  // Don't render if no quotes (after loading)
  if (!quotesLoading && !settingsLoading && quotes.length === 0) {
    return null
  }

  return (
    <section
      ref={sectionRef}
      id="quotes"
      className="py-12 md:py-16 lg:py-10 bg-white text-black relative overflow-hidden"
    >
      {/* Background Quote Mark */}
      <div className="absolute top-10 left-4 lg:left-30 text-[200px] md:text-[300px] font-serif text-gray-100 select-none pointer-events-none leading-none">
        "
      </div>
      <div className="absolute bottom-16 right-4 lg:right-30 text-[200px] md:text-[300px] font-serif text-gray-100 select-none pointer-events-none leading-none rotate-180">
        "
      </div>

      <div className="max-w-5xl mx-auto px-8 sm:px-6 lg:px-8 relative z-10 flex flex-col min-h-[60vh] lg:min-h-[70vh]">
        {(quotesLoading || settingsLoading) ? (
          <div className="flex items-center justify-center py-20">
            <Loader size="lg" />
          </div>
        ) : (
          <>
            <div
              className={`flex flex-col md:flex-row items-center gap-6 md:gap-10 lg:gap-16 transition-all duration-[1500ms] ease-[cubic-bezier(0.4,0,0.2,1)] flex-1 ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
              }`}
            >
              {/* Author Avatar */}
              <div
                className={`flex-shrink-0 transition-all duration-[1500ms] ease-[cubic-bezier(0.4,0,0.2,1)] ${
                  isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-90'
                }`}
                style={{ transitionDelay: '0.2s' }}
              >
                <div className="relative">
                  {/* Avatar Frame */}
                  <div className="w-40 h-40 md:w-48 md:h-48 border-2 border-gray-200 bg-black flex items-center justify-center overflow-hidden">
                    {randomQuote.imageUrl ? (
                      <img 
                        src={randomQuote.imageUrl} 
                        alt={randomQuote.author}
                        className="w-full h-full object-cover grayscale"
                      />
                    ) : (
                      <span className="text-5xl md:text-6xl font-bold text-white">
                        {getInitials(randomQuote.author)}
                      </span>
                    )}
                  </div>
                  {/* Decorative Corner */}
                  <div className="absolute -bottom-3 -right-3 w-10 h-10 border-r-2 border-b-2 border-black" />
                  <div className="absolute -top-3 -left-3 w-10 h-10 border-l-2 border-t-2 border-black" />
                </div>
              </div>

              {/* Quote Content */}
              <div className="flex-1 text-center md:text-left">
                {/* Quote Text */}
                <blockquote
                  className={`text-2xl md:text-3xl lg:text-4xl font-light text-black leading-relaxed mb-6 md:mb-8 transition-all duration-[1500ms] ease-[cubic-bezier(0.4,0,0.2,1)] ${
                    isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                  }`}
                  style={{ transitionDelay: '0.4s' }}
                >
                  "{randomQuote.quote}"
                </blockquote>

                {/* Author Info */}
                <div
                  className={`transition-all duration-[1500ms] ease-[cubic-bezier(0.4,0,0.2,1)] ${
                    isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                  }`}
                  style={{ transitionDelay: '0.6s' }}
                >
                  <div className="flex items-center justify-center md:justify-start gap-4">
                    <div className="hidden md:block w-12 h-px bg-black" />
                    <div className="text-center md:text-left">
                      <p className="text-lg font-semibold text-black">{randomQuote.author}</p>
                      {randomQuote.role && (
                        <p className="text-sm text-gray-500">{randomQuote.role}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Inspiration Note - Bottom of section on large screens */}
            <p
              className={`text-center text-gray-400 text-sm italic mt-8 lg:mt-auto lg:mb-0 transition-all duration-[1200ms] ease-[cubic-bezier(0.4,0,0.2,1)] ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`}
              style={{ transitionDelay: '0.8s' }}
            >
              {settings.bottomNote}
            </p>
          </>
        )}
      </div>
    </section>
  )
}

export default Quotes
