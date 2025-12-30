import { useEffect, useState, useRef } from 'react'
import { useFirestoreCollection } from '../hooks/useSiteSettings'
import Loader from './Loader'
import { doc, onSnapshot } from 'firebase/firestore'
import { db, isFirebaseConfigured } from '../firebase/config'

const Languages = () => {
  const [isVisible, setIsVisible] = useState(false)
  const [sectionSettings, setSectionSettings] = useState({
    sectionSubtitle: 'Communication',
    sectionTitle: 'Languages I',
    sectionTitleHighlight: 'Speak',
    sectionDescription: 'Languages I am proficient in'
  })
  const sectionRef = useRef(null)

  // Fetch languages from Firebase
  const { data: languagesData, loading: languagesLoading } = useFirestoreCollection('languages', [])

  // Fetch section settings
  useEffect(() => {
    if (!isFirebaseConfigured || !db) return

    const unsubscribe = onSnapshot(
      doc(db, 'settings', 'languages'),
      (docSnap) => {
        if (docSnap.exists()) {
          setSectionSettings(prev => ({ ...prev, ...docSnap.data() }))
        }
      },
      () => {}
    )

    return () => unsubscribe()
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
  }, [])

  // Trigger visibility when data loads
  useEffect(() => {
    if (languagesData.length > 0 && !isVisible) {
      const timer = setTimeout(() => setIsVisible(true), 200)
      return () => clearTimeout(timer)
    }
  }, [languagesData.length, isVisible])

  // Sort languages by order
  const languages = [...languagesData].sort((a, b) => (a.order || 0) - (b.order || 0))

  // Hide section if no languages (after loading)
  if (!languagesLoading && languages.length === 0) {
    return null
  }

  return (
    <section
      ref={sectionRef}
      id="languages"
      className="py-12 md:py-16 lg:py-20 bg-black text-white relative overflow-hidden"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div
          className={`text-center mb-8 md:mb-12 lg:mb-16 transition-all duration-[1200ms] ease-[cubic-bezier(0.4,0,0.2,1)] ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <p className="text-gray-500 text-xs md:text-sm uppercase tracking-widest mb-3 md:mb-4">
            {sectionSettings.sectionSubtitle || 'Communication'}
          </p>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold px-4">
            {sectionSettings.sectionTitle || 'Languages I'}{' '}
            <span className="text-gray-500">{sectionSettings.sectionTitleHighlight || 'Speak'}</span>
          </h2>
          {sectionSettings.sectionDescription && (
            <p className="text-gray-400 mt-4 max-w-2xl mx-auto text-sm md:text-base">
              {sectionSettings.sectionDescription}
            </p>
          )}
        </div>

        {/* Loading State */}
        {languagesLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader size="lg" color="white" />
          </div>
        ) : (
          <div className="flex flex-wrap justify-center gap-4 md:gap-6">
            {languages.map((language, index) => (
              <div
                key={language.id}
                className={`group p-6 border border-gray-800 bg-gray-900 hover:border-white hover:bg-gray-800 transition-all duration-300 text-center cursor-pointer w-full sm:w-[calc(50%-0.5rem)] md:w-[calc(33.333%-1rem)] lg:w-auto lg:min-w-[140px] ${
                  isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                }`}
                style={{ transitionDelay: `${0.1 + index * 0.05}s` }}
              >
                {/* Character */}
                <div className="text-5xl md:text-6xl font-bold mb-4 group-hover:scale-110 transition-transform duration-300">
                  {language.character || language.name?.charAt(0)?.toUpperCase() || '?'}
                </div>
                {/* Language Name */}
                <h3 className="text-sm md:text-base font-semibold text-white group-hover:text-gray-300 transition-colors">
                  {language.name}
                </h3>
                {/* Proficiency Level (optional) */}
                {language.proficiency && (
                  <p className="text-xs text-gray-500 mt-2">{language.proficiency}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

export default Languages

