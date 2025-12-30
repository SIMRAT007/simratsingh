import { useEffect, useState, useRef } from 'react'
import { useFirestoreCollection, useTestimonialsSettings } from '../hooks/useSiteSettings'
import Loader from './Loader'

const Testimonials = () => {
  const { data: testimonials, loading: testimonialsLoading } = useFirestoreCollection('testimonials', [])
  const { settings, loading: settingsLoading } = useTestimonialsSettings()
  const [isVisible, setIsVisible] = useState(false)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)
  const sectionRef = useRef(null)
  const trackRef = useRef(null)

  // Sort testimonials by order
  const sortedTestimonials = [...testimonials].sort((a, b) => (a.order || 0) - (b.order || 0))

  // Number of cards to show based on screen size
  const getVisibleCards = () => {
    if (typeof window !== 'undefined') {
      if (window.innerWidth < 768) return 1
      if (window.innerWidth < 1024) return 2
      return 3
    }
    return 3
  }

  const [visibleCards, setVisibleCards] = useState(3)
  const totalSlides = sortedTestimonials.length

  // Create extended array: [clone of last 3] + [all items] + [clone of first 3]
  const extendedItems = totalSlides > 0 ? [
    ...sortedTestimonials.slice(-Math.min(visibleCards, totalSlides)),
    ...sortedTestimonials,
    ...sortedTestimonials.slice(0, Math.min(visibleCards, totalSlides))
  ] : []

  useEffect(() => {
    const handleResize = () => {
      setVisibleCards(getVisibleCards())
    }
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

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
  }, [sortedTestimonials.length])

  // Trigger visibility when data loads
  useEffect(() => {
    if (sortedTestimonials.length > 0 && !isVisible) {
      const timer = setTimeout(() => setIsVisible(true), 200)
      return () => clearTimeout(timer)
    }
  }, [sortedTestimonials.length, isVisible])

  // Auto-rotate testimonials
  useEffect(() => {
    if (totalSlides === 0) return
    const interval = setInterval(() => {
      if (!isAnimating) {
        goToNext()
      }
    }, 5000)
    return () => clearInterval(interval)
  }, [isAnimating, totalSlides])

  const goToNext = () => {
    if (isAnimating || totalSlides === 0) return
    setIsAnimating(true)
    setCurrentIndex((prev) => prev + 1)
  }

  const goToPrev = () => {
    if (isAnimating || totalSlides === 0) return
    setIsAnimating(true)
    setCurrentIndex((prev) => prev - 1)
  }

  const goToSlide = (index) => {
    if (isAnimating) return
    setIsAnimating(true)
    setCurrentIndex(index)
  }

  // Handle the seamless loop transition
  const handleTransitionEnd = () => {
    setIsAnimating(false)
    
    // If we've gone past the last real slide, jump to the first real slide
    if (currentIndex >= totalSlides) {
      if (trackRef.current) {
        trackRef.current.style.transition = 'none'
        setCurrentIndex(0)
        // Force reflow
        void trackRef.current.offsetHeight
        setTimeout(() => {
          if (trackRef.current) {
            trackRef.current.style.transition = 'transform 700ms cubic-bezier(0.25, 0.1, 0.25, 1)'
          }
        }, 20)
      }
    }
    // If we've gone before the first real slide, jump to the last real slide
    else if (currentIndex < 0) {
      if (trackRef.current) {
        trackRef.current.style.transition = 'none'
        setCurrentIndex(totalSlides - 1)
        // Force reflow
        void trackRef.current.offsetHeight
        setTimeout(() => {
          if (trackRef.current) {
            trackRef.current.style.transition = 'transform 700ms cubic-bezier(0.25, 0.1, 0.25, 1)'
          }
        }, 20)
      }
    }
  }

  // Calculate card width percentage
  const cardWidthPercent = 100 / visibleCards

  // Calculate translateX - offset by visibleCards for the clones at the start
  const cloneCount = Math.min(visibleCards, totalSlides)
  const translateX = (currentIndex + cloneCount) * cardWidthPercent

  // Get actual index for dots (wrap around)
  const getActualIndex = () => {
    if (totalSlides === 0) return 0
    if (currentIndex < 0) return totalSlides + currentIndex
    if (currentIndex >= totalSlides) return currentIndex - totalSlides
    return currentIndex
  }

  // Get initials from name
  const getInitials = (name) => {
    if (!name) return '?'
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  }

  // If no testimonials, don't render the section
  if (sortedTestimonials.length === 0) {
    return null
  }

  return (
    <section
      ref={sectionRef}
      id="testimonials"
      className="py-12 md:py-16 lg:py-20 bg-black text-white relative overflow-hidden"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div
          className={`text-center mb-8 md:mb-12 lg:mb-16 transition-all duration-[1200ms] ease-[cubic-bezier(0.4,0,0.2,1)] ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <p className="text-gray-500 text-sm uppercase tracking-widest mb-4">
            {settings.sectionSubtitle}
          </p>
          <h2 className="text-4xl md:text-5xl font-bold">
            {settings.sectionTitle} <span className="text-gray-500">{settings.sectionTitleHighlight}</span>
          </h2>
        </div>

        {/* Carousel Container */}
        <div
          className={`relative transition-all duration-[1200ms] ease-[cubic-bezier(0.4,0,0.2,1)] ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
          style={{ transitionDelay: '0.2s' }}
        >
          {/* Navigation Arrows */}
          <button
            onClick={goToPrev}
            className="absolute -left-2 md:-left-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 md:w-12 md:h-12 border border-gray-700 bg-white flex items-center justify-center text-gray-900 hover:bg-white hover:text-black hover:border-white transition-all duration-300"
            aria-label="Previous testimonial"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <button
            onClick={goToNext}
            className="absolute -right-2 md:-right-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 md:w-12 md:h-12 border border-gray-700 bg-white flex items-center justify-center text-gray-900 hover:bg-white hover:text-black hover:border-white transition-all duration-300"
            aria-label="Next testimonial"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>

          {/* Testimonial Cards - Infinite Sliding Carousel */}
          <div className="px-8 md:px-14">
            <div className="relative overflow-hidden">
              {/* Left Fade Gradient */}
              <div className="absolute left-0 top-0 bottom-0 w-12 md:w-20 bg-gradient-to-r from-black to-transparent z-10 pointer-events-none" />
              {/* Right Fade Gradient */}
              <div className="absolute right-0 top-0 bottom-0 w-12 md:w-20 bg-gradient-to-l from-black to-transparent z-10 pointer-events-none" />
              
              <div 
                ref={trackRef}
                className="flex transition-transform duration-700 ease-[cubic-bezier(0.25,0.1,0.25,1)]"
                style={{
                  transform: `translateX(-${translateX}%)`,
                }}
                onTransitionEnd={handleTransitionEnd}
              >
              {extendedItems.map((item, index) => {
                // Check if this card is the middle one (center of visible cards)
                const middleIndex = currentIndex + cloneCount + Math.floor(visibleCards / 2)
                const isMiddle = index === middleIndex && visibleCards === 3

                return (
                  <div
                    key={`${item.id}-${index}`}
                    className="flex-shrink-0 px-3"
                    style={{ width: `${cardWidthPercent}%` }}
                  >
                    <div className={`p-6 border transition-all duration-500 h-full flex flex-col ${
                      isMiddle 
                        ? 'bg-white border-white scale-105' 
                        : 'border-gray-800 hover:border-gray-600'
                    }`}>
                      {/* Quote Icon */}
                      <div className="mb-4">
                        <svg className={`w-8 h-8 ${isMiddle ? 'text-gray-300' : 'text-gray-700'}`} fill="currentColor" viewBox="0 0 24 24">
                          <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                        </svg>
                      </div>

                      {/* Testimonial Text */}
                      <p className={`text-sm leading-relaxed mb-2 md:mb-6 flex-1 min-h-[80px] ${isMiddle ? 'text-gray-700' : 'text-gray-300'}`}>
                        "{item.testimonial}"
                      </p>

                      {/* Bottom Section - Fixed */}
                      <div className="mt-auto">
                        {/* Rating */}
                        <div className="flex gap-1 mb-2 md:mb-4">
                          {[...Array(item.rating || 5)].map((_, i) => (
                            <svg key={i} className={`w-4 h-4 ${isMiddle ? 'text-black' : 'text-white'}`} fill="currentColor" viewBox="0 0 20 20">
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                          ))}
                        </div>

                        {/* Author */}
                        <div className="flex items-center gap-4">
                          <div className={`w-12 h-12 border flex items-center justify-center font-semibold text-sm overflow-hidden flex-shrink-0 ${
                            isMiddle 
                              ? 'bg-black border-black text-white' 
                              : 'bg-gray-800 border-gray-700 text-white'
                          }`}>
                            {item.image ? (
                              item.image.startsWith('http') ? (
                                <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                              ) : (
                                item.image
                              )
                            ) : (
                              getInitials(item.name)
                            )}
                          </div>
                          <div className="min-w-0">
                            <h4 className={`font-semibold ${isMiddle ? 'text-black' : 'text-white'}`}>{item.name}</h4>
                            <p className={`text-sm ${isMiddle ? 'text-gray-600' : 'text-gray-500'}`}>{item.role}, {item.company}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
              </div>
            </div>
          </div>

          {/* Dots Navigation */}
          <div className="flex justify-center gap-2 mt-8">
            {sortedTestimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`h-2 rounded-full transition-all duration-500 ${
                  getActualIndex() === index ? 'bg-white w-6' : 'bg-gray-700 w-2 hover:bg-gray-500'
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </div>

        {/* Bottom Note */}
        <div
          className={`text-center mt-12 transition-all duration-[1200ms] ease-[cubic-bezier(0.4,0,0.2,1)] ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
          style={{ transitionDelay: '0.6s' }}
        >
          <p className="text-gray-500 italic text-sm">
            {settings.bottomNote}
          </p>
        </div>
      </div>
    </section>
  )
}

export default Testimonials
