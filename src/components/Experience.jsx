import { useEffect, useState, useRef } from 'react'
import { collection, doc, onSnapshot } from 'firebase/firestore'
import { db, isFirebaseConfigured } from '../firebase/config'
import Loader from './Loader'

// Default experiences for fallback
const defaultExperiences = [
  {
    id: 1,
    role: 'Senior Frontend Developer',
    company: 'Tech Solutions Inc.',
    companyLogo: '',
    duration: '2023 - Present',
    location: 'Remote',
    description: 'Leading frontend development for enterprise applications. Building scalable React applications with TypeScript.',
    technologies: ['React', 'TypeScript', 'Next.js', 'Tailwind CSS'],
  },
  {
    id: 2,
    role: 'Full Stack Developer',
    company: 'Digital Agency Co.',
    companyLogo: '',
    duration: '2021 - 2023',
    location: 'Bangalore, India',
    description: 'Developed and maintained multiple client projects from concept to deployment.',
    technologies: ['React', 'Node.js', 'MongoDB', 'AWS'],
  },
  {
    id: 3,
    role: 'Frontend Developer',
    company: 'StartUp Labs',
    companyLogo: '',
    duration: '2020 - 2021',
    location: 'Delhi, India',
    description: 'Built responsive web applications and mobile-first interfaces.',
    technologies: ['React', 'Redux', 'SCSS', 'REST API'],
  },
]

const defaultSectionSettings = {
  sectionSubtitle: 'Career Path',
  sectionTitle: 'Work',
  sectionTitleHighlight: 'Experience',
  ctaText: 'Open to new opportunities and exciting challenges'
}

const Experience = () => {
  const [isVisible, setIsVisible] = useState(false)
  const [experiences, setExperiences] = useState(defaultExperiences)
  const [sectionSettings, setSectionSettings] = useState(defaultSectionSettings)
  const [loading, setLoading] = useState(true)
  const sectionRef = useRef(null)

  // Fetch experiences from Firebase
  useEffect(() => {
    if (!isFirebaseConfigured || !db) {
      setLoading(false)
      return
    }

    let settingsLoaded = false
    let experiencesLoaded = false

    const checkLoading = () => {
      if (settingsLoaded && experiencesLoaded) {
        setLoading(false)
      }
    }

    // Listen for section settings
    const settingsUnsubscribe = onSnapshot(
      doc(db, 'settings', 'experience'),
      (docSnap) => {
        if (docSnap.exists()) {
          setSectionSettings(prev => ({ ...prev, ...docSnap.data() }))
        }
        settingsLoaded = true
        checkLoading()
      },
      (error) => {
        settingsLoaded = true
        checkLoading()
      }
    )

    // Listen for experience collection
    const expUnsubscribe = onSnapshot(
      collection(db, 'experience'),
      (snapshot) => {
        if (!snapshot.empty) {
          const expData = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }))
          // Sort by order
          expData.sort((a, b) => (a.order || 0) - (b.order || 0))
          setExperiences(expData)
        }
        experiencesLoaded = true
        checkLoading()
      },
      (error) => {
        experiencesLoaded = true
        checkLoading()
      }
    )

    return () => {
      settingsUnsubscribe()
      expUnsubscribe()
    }
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

  return (
    <section
      ref={sectionRef}
      id="experience"
      className="py-12 md:py-16 lg:py-20 bg-black text-white relative overflow-hidden"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div
          className={`text-center mb-12 md:mb-16 transition-all duration-[1200ms] ease-[cubic-bezier(0.4,0,0.2,1)] ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <p className="text-gray-500 text-xs md:text-sm uppercase tracking-widest mb-3 md:mb-4">{sectionSettings.sectionSubtitle || 'Career Path'}</p>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold px-4">
            {sectionSettings.sectionTitle || 'Work'} <span className="text-gray-500">{sectionSettings.sectionTitleHighlight || 'Experience'}</span>
          </h2>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader size="lg" />
          </div>
        ) : (
          <>

            {/* Timeline */}
            <div className="relative">
          {/* Timeline Line */}
          <div className="absolute left-6 md:left-1/2 transform md:-translate-x-px top-0 bottom-0 w-px bg-gray-800" />

          {/* Experience Items */}
          <div className="space-y-6 md:space-y-8 lg:space-y-12">
            {experiences.map((exp, index) => (
              <div
                key={exp.id}
                className={`relative flex flex-col md:flex-row gap-6 md:gap-0 transition-all duration-[1400ms] ease-[cubic-bezier(0.4,0,0.2,1)] ${
                  isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                }`}
                style={{ transitionDelay: `${0.2 + index * 0.15}s` }}
              >
                {/* Timeline Dot - Company Logo */}
                <div className="absolute left-3 md:left-1/2 md:transform md:-translate-x-1/2 w-12 h-12 bg-white text-black  flex items-center justify-center z-10 overflow-hidden group hover:border-white transition-all duration-300 flex-shrink-0 rounded-full p-1">
                  {exp.companyLogo ? (
                    <img src={exp.companyLogo} alt={exp.company} className="w-full h-full object-fit" />
                  ) : (
                    <span className="text-xs font-bold">{exp.company?.substring(0, 2).toUpperCase() || '??'}</span>
                  )}
                </div>

                {/* Content - Alternating sides on desktop, consistent on mobile */}
                <div className={`w-full md:w-1/2 pl-18 md:pl-0 ${index % 2 === 0 ? 'md:pr-20 md:text-right' : 'md:pl-20 md:order-1 md:text-left'}`}>
                  {/* Duration Badge */}
                  <span className="inline-block px-3 py-1 text-xs uppercase tracking-wider bg-gray-900 border border-gray-800 text-gray-400 mb-3">
                    {exp.duration}
                  </span>

                  {/* Role & Company */}
                  <h3 className="text-lg md:text-xl font-bold text-white mb-2">{exp.role}</h3>
                  <p className={`text-gray-400 mb-3 flex flex-wrap items-center gap-2 justify-start ${index % 2 === 0 ? 'md:justify-end' : 'md:justify-start'}`}>
                    {index % 2 === 0 ? (
                      <>
                        {exp.location && (
                          <>
                            <span className="text-gray-500 text-xs md:text-sm w-full md:w-auto order-2 md:order-1">{exp.location}</span>
                            <span className="text-gray-600 hidden md:inline order-1 md:order-2">•</span>
                          </>
                        )}
                        <span className="flex items-center gap-2 order-3">
                          {exp.companyLogo && (
                            <span className="w-5 h-5 md:w-6 md:h-6 bg-white text-white text-xs flex items-center justify-center font-semibold overflow-hidden rounded flex-shrink-0 rounded-full p-1">
                              <img src={exp.companyLogo} alt={exp.company} className="w-full h-full object-fit" />
                            </span>
                          )}
                          <span className="text-sm md:text-base">{exp.company}</span>
                        </span>
                      </>
                    ) : (
                      <>
                        {exp.location && (
                          <>
                            <span className="text-gray-500 text-xs md:text-sm w-full md:w-auto order-2 md:order-1">{exp.location}</span>
                            <span className="text-gray-600 hidden md:inline order-1 md:order-2">•</span>
                          </>
                        )}
                        <span className="flex items-center gap-2 order-3">
                          {exp.companyLogo && (
                            <span className="w-5 h-5 md:w-6 md:h-6 bg-white text-white text-xs flex items-center justify-center font-semibold overflow-hidden rounded flex-shrink-0 rounded-full p-1">
                              <img src={exp.companyLogo} alt={exp.company} className="w-full h-full object-fit" />
                            </span>
                          )}
                          <span className="text-sm md:text-base">{exp.company}</span>
                        </span>
                      </>
                    )}
                  </p>

                  {/* Description */}
                  <p className="text-gray-400 text-sm md:text-base leading-relaxed mb-4">
                    {exp.description}
                  </p>

                  {/* Technologies */}
                  <div className={`flex flex-wrap gap-2 justify-start ${index % 2 === 0 ? 'md:justify-end' : 'md:justify-start'}`}>
                    {exp.technologies && exp.technologies.map((tech) => (
                      <span
                        key={tech}
                        className="px-2.5 md:px-3 py-1 text-xs border border-gray-700 text-gray-400 hover:bg-white hover:text-black hover:border-white transition-all duration-300"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Empty space for alternating layout */}
                <div className={`hidden md:block md:w-1/2 ${index % 2 === 0 ? 'md:order-1' : ''}`} />
              </div>
            ))}
          </div>
        </div>

            {/* Bottom CTA */}
            <div
              className={`text-center mt-12 md:mt-16 transition-all duration-[1200ms] ease-[cubic-bezier(0.4,0,0.2,1)] ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`}
              style={{ transitionDelay: '0.9s' }}
            >
              <p className="text-gray-500 italic mb-4 md:mb-6 text-sm md:text-base px-4">
                {sectionSettings.ctaText || 'Open to new opportunities and exciting challenges'}
              </p>
              <button
                onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}
                className="inline-flex items-center gap-2 md:gap-3 px-6 md:px-8 py-3 md:py-4 bg-white text-black font-medium hover:bg-gray-200 transition-all duration-300 text-sm md:text-base"
              >
                Let's Connect
                <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </button>
            </div>
          </>
        )}
      </div>
    </section>
  )
}

export default Experience
