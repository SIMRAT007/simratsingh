import { useEffect, useState, useRef } from 'react'
import { useFirestoreCollection } from '../hooks/useSiteSettings'
import Loader from './Loader'
import { doc, onSnapshot } from 'firebase/firestore'
import { db, isFirebaseConfigured } from '../firebase/config'

const Organizations = () => {
  const [isVisible, setIsVisible] = useState(false)
  const [sectionSettings, setSectionSettings] = useState({
    sectionSubtitle: 'Affiliations',
    sectionTitle: 'Organizations &',
    sectionTitleHighlight: 'Associations',
    sectionDescription: 'Organizations I am associated with'
  })
  const sectionRef = useRef(null)

  // Fetch organizations from Firebase
  const { data: organizationsData, loading: organizationsLoading } = useFirestoreCollection('organizations', [])

  // Fetch section settings
  useEffect(() => {
    if (!isFirebaseConfigured || !db) return

    const unsubscribe = onSnapshot(
      doc(db, 'settings', 'organizations'),
      (docSnap) => {
        if (docSnap.exists()) {
          setSectionSettings(prev => ({ ...prev, ...docSnap.data() }))
        }
      },
      () => {}
    )

    return () => unsubscribe()
  }, [])

  // Sort organizations by order
  const organizations = [...organizationsData].sort((a, b) => (a.order || 0) - (b.order || 0))

  // Get initials from organization name
  const getInitials = (name) => {
    if (!name) return '?'
    const words = name.trim().split(/\s+/)
    if (words.length === 1) {
      return words[0].charAt(0).toUpperCase()
    }
    return words
      .slice(0, 2)
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
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
  }, [])

  // Trigger visibility when data loads
  useEffect(() => {
    if (organizations.length > 0 && !isVisible) {
      const timer = setTimeout(() => setIsVisible(true), 200)
      return () => clearTimeout(timer)
    }
  }, [organizations.length, isVisible])

  // Show loading state or hide if no data
  if (organizationsLoading) {
    return (
      <section
        ref={sectionRef}
        id="organizations"
        className="py-12 md:py-16 lg:py-20 bg-white text-black relative overflow-hidden"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex items-center justify-center py-20">
            <Loader size="lg" />
          </div>
        </div>
      </section>
    )
  }

  // Hide section if no organizations (after loading)
  if (organizations.length === 0) {
    return null
  }

  return (
    <section
      ref={sectionRef}
      id="organizations"
      className="py-12 md:py-16 lg:py-20 bg-white text-black relative overflow-hidden"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div
          className={`text-center mb-8 md:mb-12 lg:mb-16 transition-all duration-[1200ms] ease-[cubic-bezier(0.4,0,0.2,1)] ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <p className="text-gray-400 text-xs md:text-sm uppercase tracking-widest mb-3 md:mb-4">
            {sectionSettings.sectionSubtitle || 'Affiliations'}
          </p>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold px-4">
            {sectionSettings.sectionTitle || 'Organizations &'}{' '}
            <span className="text-gray-400">{sectionSettings.sectionTitleHighlight || 'Associations'}</span>
          </h2>
          {sectionSettings.sectionDescription && (
            <p className="text-gray-500 mt-4 max-w-2xl mx-auto text-sm md:text-base">
              {sectionSettings.sectionDescription}
            </p>
          )}
        </div>

        {/* Organizations List */}
        <div className="flex flex-wrap justify-center gap-4 md:gap-6">
          {organizations.map((org, index) => (
              <div
                key={org.id}
                className={`group p-6 border border-gray-200 bg-white hover:border-black hover:bg-black transition-all duration-300 text-center cursor-pointer w-full sm:w-[calc(50%-0.5rem)] md:w-[calc(33.333%-1rem)] lg:w-auto lg:min-w-[200px] ${
                  isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                }`}
                style={{ transitionDelay: `${0.1 + index * 0.05}s` }}
              >
                {/* Logo/Image */}
                {org.logoUrl ? (
                  <div className="mb-4 flex items-center justify-center h-20">
                    <img
                      src={org.logoUrl}
                      alt={org.name}
                      className="max-h-16 max-w-full object-contain filter grayscale group-hover:grayscale-0 transition-all duration-300 bg-white rounded-full"
                    />
                  </div>
                ) : (
                  <div className="mb-4 flex items-center justify-center h-20">
                    <div className="w-16 h-16 border-2 border-gray-300 group-hover:border-white bg-white group-hover:bg-black flex items-center justify-center font-bold text-lg group-hover:text-white transition-all duration-300 rounded-full">
                      {getInitials(org.name)}
                    </div>
                  </div>
                )}
                
                {/* Organization Name */}
                <h3 className="text-sm md:text-base font-semibold text-black group-hover:text-white transition-colors mb-2">
                  {org.name}
                </h3>
                
                {/* Role/Position (optional) */}
                {org.role && (
                  <p className="text-xs text-gray-500 group-hover:text-gray-300 transition-colors mb-2">
                    {org.role}
                  </p>
                )}
                
                {/* Duration/Period (optional) */}
                {org.duration && (
                  <p className="text-xs text-gray-400 group-hover:text-gray-400 transition-colors">
                    {org.duration}
                  </p>
                )}
              </div>
            ))}
        </div>
      </div>
    </section>
  )
}

export default Organizations

