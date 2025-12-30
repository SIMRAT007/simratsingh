import { useEffect, useState, useRef } from 'react'
import { collection, doc, onSnapshot } from 'firebase/firestore'
import { db, isFirebaseConfigured } from '../firebase/config'

// Default data - empty (content comes from Firebase)
const defaultHobbies = []

const defaultSectionSettings = {
  sectionSubtitle: 'Beyond Coding',
  sectionTitle: 'My',
  sectionTitleHighlight: 'Hobbies',
  bottomQuote: '"All work and no play makes Jack a dull boy" — finding balance in life'
}

const Hobbies = () => {
  const [isVisible, setIsVisible] = useState(false)
  const [hobbies, setHobbies] = useState(defaultHobbies)
  const [sectionSettings, setSectionSettings] = useState(defaultSectionSettings)
  const sectionRef = useRef(null)

  // Fetch data from Firebase
  useEffect(() => {
    if (!isFirebaseConfigured || !db) return

    // Listen for section settings
    const settingsUnsubscribe = onSnapshot(
      doc(db, 'settings', 'hobbies'),
      (docSnap) => {
        if (docSnap.exists()) {
          setSectionSettings(prev => ({ ...prev, ...docSnap.data() }))
        }
      },
      (error) => {}
    )

    // Listen for hobbies
    const hobbiesUnsubscribe = onSnapshot(
      collection(db, 'hobbies'),
      (snapshot) => {
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
        data.sort((a, b) => (a.order || 0) - (b.order || 0))
        setHobbies(data)
      },
      (error) => {}
    )

    return () => {
      settingsUnsubscribe()
      hobbiesUnsubscribe()
    }
  }, [])

  // Trigger visibility when data loads
  useEffect(() => {
    if (hobbies.length > 0 && !isVisible) {
      const timer = setTimeout(() => setIsVisible(true), 200)
      return () => clearTimeout(timer)
    }
  }, [hobbies.length, isVisible])

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

  // Hide section if no hobbies
  if (hobbies.length === 0) {
    return null
  }

  return (
    <section
      ref={sectionRef}
      id="hobbies"
      className="py-12 md:py-16 lg:py-20 bg-white text-black relative overflow-hidden"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div
          className={`text-center mb-8 md:mb-12 lg:mb-16 transition-all duration-[1200ms] ease-[cubic-bezier(0.4,0,0.2,1)] ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <p className="text-gray-400 text-sm uppercase tracking-widest mb-4">{sectionSettings.sectionSubtitle || 'Beyond Coding'}</p>
          <h2 className="text-4xl md:text-5xl font-bold text-black">
            {sectionSettings.sectionTitle || 'My'} <span className="text-gray-400">{sectionSettings.sectionTitleHighlight || 'Hobbies'}</span>
          </h2>
        </div>

        {/* Hobbies Grid */}
        <div className="flex flex-wrap justify-center gap-4 md:gap-6">
          {hobbies.map((hobby, index) => (
            <div
              key={hobby.id}
              className={`group p-6 border border-gray-200 bg-white hover:border-black hover:bg-black text-center cursor-default transform hover:-translate-y-2 hover:shadow-2xl transition-all duration-500 ease-out w-full sm:w-[calc(50%-0.5rem)] md:w-[calc(33.333%-1rem)] lg:w-auto lg:min-w-[160px] ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`}
              style={{ transitionDelay: `${0.1 + index * 0.1}s` }}
            >
              {/* Icon */}
              <div className="w-14 h-14 mx-auto mb-4 border border-gray-300 rounded-full flex items-center justify-center text-3xl group-hover:border-white group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 ease-out">
                <span style={{ filter: 'grayscale(100%) contrast(1.2)' }} className="group-hover:invert transition-all duration-500">
                  {hobby.icon || '🎯'}
                </span>
              </div>
              
              {/* Name */}
              <h3 className="text-base font-semibold text-black group-hover:text-white mb-2 transition-all duration-500 ease-out group-hover:tracking-wide">
                {hobby.name}
              </h3>
              
              {/* Description */}
              <p className="text-xs text-gray-500 group-hover:text-gray-300 transition-all duration-500 ease-out leading-relaxed">
                {hobby.description}
              </p>
            </div>
          ))}
        </div>

        {/* Bottom Quote */}
        <div
          className={`text-center mt-12 transition-all duration-[1200ms] ease-[cubic-bezier(0.4,0,0.2,1)] ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
          style={{ transitionDelay: '0.8s' }}
        >
          <p className="text-gray-400 italic text-sm">
            {sectionSettings.bottomQuote || '"All work and no play makes Jack a dull boy" — finding balance in life'}
          </p>
        </div>
      </div>
    </section>
  )
}

export default Hobbies

