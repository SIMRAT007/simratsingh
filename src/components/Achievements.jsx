import { useEffect, useState, useRef } from 'react'
import { collection, doc, onSnapshot } from 'firebase/firestore'
import { db, isFirebaseConfigured } from '../firebase/config'
import achievementImage from '../assets/Ach_Cer.jpg'

// Default data - empty arrays (content comes from Firebase)
const defaultAchievements = []
const defaultCertifications = []

const defaultSectionSettings = {
  sectionSubtitle: 'Recognition',
  sectionTitle: 'Achievements &',
  sectionTitleHighlight: 'Certifications'
}

const Achievements = () => {
  const [isVisible, setIsVisible] = useState(false)
  const [selectedItem, setSelectedItem] = useState(null)
  const [showAllCerts, setShowAllCerts] = useState(false)
  const [achievements, setAchievements] = useState(defaultAchievements)
  const [certifications, setCertifications] = useState(defaultCertifications)
  const [sectionSettings, setSectionSettings] = useState(defaultSectionSettings)
  const sectionRef = useRef(null)

  // Fetch data from Firebase
  useEffect(() => {
    if (!isFirebaseConfigured || !db) return

    // Listen for section settings
    const settingsUnsubscribe = onSnapshot(
      doc(db, 'settings', 'achievements'),
      (docSnap) => {
        if (docSnap.exists()) {
          setSectionSettings(prev => ({ ...prev, ...docSnap.data() }))
        }
      },
      (error) => {}
    )

    // Listen for achievements
    const achUnsubscribe = onSnapshot(
      collection(db, 'achievements'),
      (snapshot) => {
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
        data.sort((a, b) => (a.order || 0) - (b.order || 0))
        setAchievements(data)
      },
      (error) => {}
    )

    // Listen for certifications
    const certUnsubscribe = onSnapshot(
      collection(db, 'certifications'),
      (snapshot) => {
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
        data.sort((a, b) => (a.order || 0) - (b.order || 0))
        setCertifications(data)
      },
      (error) => {}
    )

    return () => {
      settingsUnsubscribe()
      achUnsubscribe()
      certUnsubscribe()
    }
  }, [])
  
  // Show only first 4 certifications initially
  const visibleCerts = showAllCerts ? certifications : certifications.slice(0, 4)

  useEffect(() => {
    // If we have data but section is not visible yet, set it visible after a delay
    if ((achievements.length > 0 || certifications.length > 0) && !isVisible) {
      const timer = setTimeout(() => setIsVisible(true), 200)
      return () => clearTimeout(timer)
    }
  }, [achievements.length, certifications.length, isVisible])

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

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (selectedItem) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [selectedItem])

  // Prevent right-click on certificate image
  const preventContextMenu = (e) => {
    e.preventDefault()
    return false
  }

  // Hide entire section if both achievements and certifications are empty
  if (achievements.length === 0 && certifications.length === 0) {
    return null
  }

  return (
    <>
      <section
        ref={sectionRef}
        id="achievements"
        className="py-12 md:py-16 lg:py-20 bg-white text-black relative overflow-hidden"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {/* Section Header */}
          <div
            className={`text-center mb-8 md:mb-12 lg:mb-16 transition-all duration-[1200ms] ease-[cubic-bezier(0.4,0,0.2,1)] ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
          >
            <p className="text-gray-400 text-sm uppercase tracking-widest mb-4">{sectionSettings.sectionSubtitle || 'Recognition'}</p>
            {/* Desktop: Images on both sides */}
            <div className="hidden md:flex items-center justify-center gap-6">
              <img
                src={achievementImage}
                alt="Achievement"
                className={`w-24 h-24 md:w-32 md:h-32 object-contain opacity-0 transition-all duration-[1500ms] ease-[cubic-bezier(0.4,0,0.2,1)] ${
                  isVisible ? 'opacity-100' : ''
                }`}
                style={{ transitionDelay: '0.3s' }}
              />
              <h2 className="text-4xl md:text-5xl font-bold text-black">
                {sectionSettings.sectionTitle || 'Achievements &'} <span className="text-gray-400">{sectionSettings.sectionTitleHighlight || 'Certifications'}</span>
              </h2>
              <img
                src={achievementImage}
                alt="Achievement"
                className={`w-24 h-24 md:w-32 md:h-32 object-contain opacity-0 transition-all duration-[1500ms] ease-[cubic-bezier(0.4,0,0.2,1)] transform scale-x-[-1] ${
                  isVisible ? 'opacity-100' : ''
                }`}
                style={{ transitionDelay: '0.3s' }}
              />
            </div>
            {/* Mobile: Image below text */}
            <div className="md:hidden">
              <h2 className="text-4xl font-bold text-black mb-6">
                {sectionSettings.sectionTitle || 'Achievements &'} <span className="text-gray-400">{sectionSettings.sectionTitleHighlight || 'Certifications'}</span>
              </h2>
              <img
                src={achievementImage}
                alt="Achievement"
                className={`w-44 h-44 object-contain mx-auto opacity-0 transition-all duration-[1500ms] ease-[cubic-bezier(0.4,0,0.2,1)] ${
                  isVisible ? 'opacity-100' : ''
                }`}
                style={{ transitionDelay: '0.3s' }}
              />
            </div>
          </div>

          {/* Achievements Grid - Only show if there are achievements */}
          {achievements.length > 0 && (
            <div
              className={`mb-8 md:mb-12 lg:mb-16 transition-all duration-[1200ms] ease-[cubic-bezier(0.4,0,0.2,1)] ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`}
              style={{ transitionDelay: '0.1s' }}
            >
              <h3 className="text-xl font-semibold text-black mb-8 flex items-center gap-3">
                <span className="w-8 h-px bg-gray-300" />
                Achievements
              </h3>
              <div className="grid md:grid-cols-2 gap-6">
                {achievements.map((item, index) => (
                  <div
                    key={item.id}
                    onClick={() => setSelectedItem(item)}
                    className={`p-6 border border-gray-200 bg-white hover:border-black transition-all duration-500 group cursor-pointer flex flex-col h-full ${
                      isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                    }`}
                    style={{ transitionDelay: `${0.2 + index * 0.1}s` }}
                  >
                    <div className="flex items-start gap-4 flex-1">
                      <div className="text-4xl group-hover:scale-110 transition-transform duration-300">
                        {item.icon}
                      </div>
                      <div className="flex-1 flex flex-col">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="text-lg font-semibold text-black">{item.title}</h4>
                          <span className="text-xs text-gray-400">{item.year}</span>
                        </div>
                        <p className="text-gray-500 text-sm mb-2">{item.organization}</p>
                        <p className="text-gray-400 text-sm leading-relaxed flex-1 mb-3">{item.description}</p>
                        <div className="mt-auto">
                          {item.tags && Array.isArray(item.tags) && item.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 mb-3">
                              {item.tags.slice(0, 2).map((tag, tagIndex) => (
                                <span
                                  key={tagIndex}
                                  className="px-2.5 py-1 text-xs font-medium border border-gray-300 bg-gray-50 text-gray-700 hover:border-black hover:bg-black hover:text-white transition-all duration-300 rounded"
                                >
                                  {tag}
                                </span>
                              ))}
                              {item.tags.length > 2 && (
                                <span className="px-2.5 py-1 text-xs font-medium border border-gray-300 bg-gray-50 text-gray-500 rounded">
                                  +{item.tags.length - 2}
                                </span>
                              )}
                            </div>
                          )}
                          <div className="flex items-center justify-end text-sm font-medium text-black group-hover:gap-2 transition-all duration-300">
                            <span>View Details</span>
                            <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                            </svg>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Certifications Grid - Only show if there are certifications */}
          {certifications.length > 0 && (
            <div
              className={`transition-all duration-[1200ms] ease-[cubic-bezier(0.4,0,0.2,1)] ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`}
              style={{ transitionDelay: '0.5s' }}
            >
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-xl font-semibold text-black flex items-center gap-3">
                  <span className="w-8 h-px bg-gray-300" />
                  Certifications
                </h3>
                {certifications.length > 4 && (
                  <button
                    onClick={() => setShowAllCerts(!showAllCerts)}
                    className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-sm font-medium text-gray-600 hover:border-black hover:text-black transition-all duration-300"
                  >
                    {showAllCerts ? (
                      <>
                        Show Less
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                        </svg>
                      </>
                    ) : (
                      <>
                        View All ({certifications.length})
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </>
                    )}
                  </button>
                )}
              </div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {visibleCerts.map((cert, index) => (
                  <div
                    key={cert.id}
                    onClick={() => setSelectedItem(cert)}
                    className={`p-6 border border-gray-200 bg-white hover:border-black hover:bg-gray-50 transition-all duration-200 group text-center cursor-pointer flex flex-col h-full ${
                      isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                    }`}
                    style={{ transitionDelay: `${0.6 + index * 0.1}s` }}
                  >
                    <div className="w-16 h-16 mx-auto mb-4 border border-gray-300 flex items-center justify-center text-3xl group-hover:border-black transition-all duration-150">
                      {cert.icon || '📜'}
                    </div>
                    <h4 className="text-base font-semibold text-black mb-1">{cert.title}</h4>
                    <p className="text-gray-500 text-sm mb-2">{cert.issuer}</p>
                    <div className="flex items-center justify-center gap-2 text-xs text-gray-400 mb-3">
                      <span>{cert.year}</span>
                      <span>•</span>
                      <span className="font-mono">{cert.credentialId}</span>
                    </div>
                    <div className="mt-auto">
                      {cert.tags && Array.isArray(cert.tags) && cert.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 justify-center mb-3">
                          {cert.tags.slice(0, 2).map((tag, tagIndex) => (
                            <span
                              key={tagIndex}
                              className="px-2.5 py-1 text-xs font-medium border border-gray-300 bg-gray-50 text-gray-700 hover:border-black hover:bg-black hover:text-white transition-all duration-300 rounded"
                            >
                              {tag}
                            </span>
                          ))}
                          {cert.tags.length > 2 && (
                            <span className="px-2.5 py-1 text-xs font-medium border border-gray-300 bg-gray-50 text-gray-500 rounded">
                              +{cert.tags.length - 2}
                            </span>
                          )}
                        </div>
                      )}
                      <div className="flex items-center justify-center text-xs font-medium text-black group-hover:gap-1 transition-all duration-150">
                        <span>View</span>
                        <svg className="w-3 h-3 ml-1 group-hover:translate-x-1 transition-transform duration-150" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                        </svg>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Verify Link - Only show if there are items */}
          {(achievements.length > 0 || certifications.length > 0) && (
            <div
              className={`text-center mt-12 transition-all duration-[1200ms] ease-[cubic-bezier(0.4,0,0.2,1)] ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`}
              style={{ transitionDelay: '1s' }}
            >
              <p className="text-gray-400 text-sm italic">
                Click on any card to view certificate details
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Details Modal */}
      {selectedItem && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedItem(null)}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
          
          {/* Modal Content */}
          <div 
            className="relative bg-white w-full max-w-3xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={() => setSelectedItem(null)}
              className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center border border-gray-300 bg-white hover:bg-black hover:text-white hover:border-black transition-all duration-300 z-10"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Certificate Image - Protected */}
            <div 
              className="relative aspect-video bg-gray-100 overflow-hidden select-none"
              onContextMenu={preventContextMenu}
              onDragStart={(e) => e.preventDefault()}
            >
              <img
                src={selectedItem.certificateImage}
                alt={selectedItem.title}
                className="w-full h-full object-fit pointer-events-none"
                draggable="false"
                onContextMenu={preventContextMenu}
              />
              {/* Watermark Overlay */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <p className="text-white/20 text-4xl font-bold rotate-[-30deg] select-none">
                  SIMRAT SINGH
                </p>
              </div>
              {/* Protection Overlay */}
              <div className="absolute inset-0 bg-transparent" />
            </div>

            {/* Modal Info */}
            <div className="p-8">
              {/* Icon & Type Badge */}
              <div className="flex items-center gap-4 mb-4">
                <div className="text-5xl">
                  {selectedItem.icon || (selectedItem.type === 'achievement' ? '🏆' : '📜')}
                </div>
                <div>
                  <span className="px-3 py-1 text-xs uppercase tracking-wider bg-black text-white">
                    {selectedItem.type === 'achievement' ? 'Achievement' : 'Certification'}
                  </span>
                </div>
              </div>

              {/* Title */}
              <h3 className="text-2xl md:text-3xl font-bold text-black mb-2">
                {selectedItem.title}
              </h3>

              {/* Organization/Issuer & Year */}
              <div className="flex items-center gap-3 mb-4 text-gray-500">
                <span className="font-medium">{selectedItem.organization || selectedItem.issuer}</span>
                <span>•</span>
                <span>{selectedItem.year}</span>
                {selectedItem.credentialId && (
                  <>
                    <span>•</span>
                    <span className="font-mono text-sm">{selectedItem.credentialId}</span>
                  </>
                )}
              </div>

              {/* Full Description */}
              <p className="text-gray-600 leading-relaxed mb-4">
                {selectedItem.fullDescription || selectedItem.description}
              </p>

              {/* Tags - Show all in modal */}
              {selectedItem.tags && Array.isArray(selectedItem.tags) && selectedItem.tags.length > 0 && (
                <div className="mb-8">
                  <h4 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wider">Tags</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedItem.tags.map((tag, tagIndex) => (
                      <span
                        key={tagIndex}
                        className="px-3 py-1.5 text-sm font-medium border border-gray-300 bg-gray-50 text-gray-700 hover:border-black hover:bg-black hover:text-white transition-all duration-300 rounded-md shadow-sm"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Verify Button */}
              <a
                href={selectedItem.verifyLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 bg-black text-white font-medium hover:bg-gray-800 transition-all duration-300"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Verify Credential
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>

              {/* Protection Notice */}
              <p className="mt-6 text-xs text-gray-400 italic">
                This certificate is protected and cannot be downloaded. Please use the verification link to confirm authenticity.
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default Achievements
