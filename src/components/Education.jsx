import { useEffect, useState, useRef } from 'react'
import { collection, doc, onSnapshot } from 'firebase/firestore'
import { db, isFirebaseConfigured } from '../firebase/config'
import educationImage from '../assets/education.png'

// Default data - empty (content comes from Firebase)
const defaultEducation = []

const defaultSectionSettings = {
  sectionSubtitle: 'Academic Background',
  sectionTitle: 'My',
  sectionTitleHighlight: 'Education',
  bottomNote: 'Continuous learner committed to staying updated with the latest technologies'
}

const Education = () => {
  const [isVisible, setIsVisible] = useState(false)
  const [education, setEducation] = useState(defaultEducation)
  const [sectionSettings, setSectionSettings] = useState(defaultSectionSettings)
  const sectionRef = useRef(null)

  // Fetch data from Firebase
  useEffect(() => {
    if (!isFirebaseConfigured || !db) return

    // Listen for section settings
    const settingsUnsubscribe = onSnapshot(
      doc(db, 'settings', 'education'),
      (docSnap) => {
        if (docSnap.exists()) {
          setSectionSettings(prev => ({ ...prev, ...docSnap.data() }))
        }
      },
      (error) => {}
    )

    // Listen for education entries
    const eduUnsubscribe = onSnapshot(
      collection(db, 'education'),
      (snapshot) => {
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
        data.sort((a, b) => (a.order || 0) - (b.order || 0))
        setEducation(data)
      },
      (error) => {}
    )

    return () => {
      settingsUnsubscribe()
      eduUnsubscribe()
    }
  }, [])

  // Trigger visibility when data loads
  useEffect(() => {
    if (education.length > 0 && !isVisible) {
      const timer = setTimeout(() => setIsVisible(true), 200)
      return () => clearTimeout(timer)
    }
  }, [education.length, isVisible])

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

  // Hide section if no education data
  if (education.length === 0) {
    return null
  }

  return (
    <section
      ref={sectionRef}
      id="education"
      className="py-12 md:py-16 lg:py-20 bg-black text-white relative overflow-hidden"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div
          className={`text-center mb-10 lg:mb-16 transition-all duration-[1200ms] ease-[cubic-bezier(0.4,0,0.2,1)] ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <p className="text-gray-500 text-sm uppercase tracking-widest mb-4">{sectionSettings.sectionSubtitle || 'Academic Background'}</p>
          <h2 className="text-4xl md:text-5xl font-bold">
            {sectionSettings.sectionTitle || 'My'} <span className="text-gray-500">{sectionSettings.sectionTitleHighlight || 'Education'}</span>
          </h2>
        </div>

        {/* Mobile Image - After Header */}
        <div
          className={`lg:hidden flex justify-center mb-10 transition-all duration-[1500ms] ease-[cubic-bezier(0.4,0,0.2,1)] ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
          style={{ transitionDelay: '0.2s' }}
        >
          <div className="border-2 border-gray-400 rounded-lg pl-2 pr-2 pt-2 pb-0">
            <img
              src={educationImage}
              alt="Student"
              className="w-48 h-auto object-contain"
            />
          </div>
        </div>

        {/* Main Content - Cards Left, Image Right */}
        <div className="flex flex-col lg:flex-row lg:items-center gap-6 md:gap-8 lg:gap-12">
          {/* Education Cards */}
          <div className="flex-1 space-y-4 md:space-y-5">
            {education.map((item, index) => (
              <div
                key={item.id}
                className={`relative border border-gray-400 p-4 md:p-5 hover:border-gray-600 transition-all duration-300 ${
                  isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                }`}
                style={{ transitionDelay: `${0.2 + index * 0.15}s` }}
              >
                <div className="flex flex-col md:flex-row gap-4">
                  {/* Logo */}
                  <div className="flex-shrink-0">
                    <div className="w-14 h-14 md:w-16 md:h-16 border border-gray-700 bg-gray-800 flex items-center justify-center overflow-hidden text-gray-400 hover:text-white hover:border-gray-500 transition-all duration-300 mx-auto md:mx-0">
                      {item.institutionLogo ? (
                        <img src={item.institutionLogo} alt={item.institution} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-2xl">🎓</span>
                      )}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1">
                    {/* Duration Badge */}
                    <span className="inline-block px-2 py-0.5 text-[10px] uppercase tracking-wider bg-gray-800 border border-gray-700 text-gray-400 mb-2">
                      {item.duration}
                    </span>

                    {/* Degree & Field */}
                    <h3 className="text-base md:text-lg font-bold text-white mb-0.5">{item.degree}</h3>
                    <p className="text-gray-400 text-sm mb-1">{item.field}</p>

                    {/* Institution & Location */}
                    <div className="flex items-center gap-2 text-gray-500 text-xs mb-2">
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                      <span>{item.institution}</span>
                      <span>•</span>
                      <span>{item.location}</span>
                    </div>

                    {/* Description */}
                    <p className="text-gray-400 text-xs leading-relaxed mb-3">
                      {item.description}
                    </p>

                    {/* Highlights */}
                    <div className="flex flex-wrap gap-1.5">
                      {item.highlights.map((highlight) => (
                        <span
                          key={highlight}
                          className="px-2 py-0.5 text-[10px] border border-gray-700 text-gray-400 hover:bg-white hover:text-black hover:border-white transition-all duration-200"
                        >
                          {highlight}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Right Side Image - Hidden on mobile, aligned to bottom */}
          <div
            className={`hidden lg:flex lg:w-[450px] flex-shrink-0 items-end justify-center transition-all duration-[1500ms] ease-[cubic-bezier(0.4,0,0.2,1)] ${
              isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-12'
            }`}
            style={{ transitionDelay: '0.4s' }}
          >
            <div className="border-2 border-gray-400 rounded-lg pl-2 pr-2 pt-2 pb-0">
              <img
                src={educationImage}
                alt="Student"
                className="w-full h-auto object-contain max-w-[450px]"
              />
            </div>
          </div>
        </div>

        {/* Bottom Note */}
        <div
          className={`text-center mt-12 transition-all duration-[1200ms] ease-[cubic-bezier(0.4,0,0.2,1)] ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
          style={{ transitionDelay: '0.8s' }}
        >
          <p className="text-gray-500 italic text-sm">
            {sectionSettings.bottomNote || 'Continuous learner committed to staying updated with the latest technologies'}
          </p>
        </div>
      </div>
    </section>
  )
}

export default Education

