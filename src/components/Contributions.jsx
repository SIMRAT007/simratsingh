import { useEffect, useState, useRef } from 'react'
import { useFirestoreCollection } from '../hooks/useSiteSettings'
import Loader from './Loader'
import { doc, onSnapshot } from 'firebase/firestore'
import { db, isFirebaseConfigured } from '../firebase/config'

const Contributions = () => {
  const [isVisible, setIsVisible] = useState(false)
  const [sectionSettings, setSectionSettings] = useState({
    sectionSubtitle: 'My Work',
    sectionTitle: 'Contributions &',
    sectionTitleHighlight: 'Publications',
    sectionDescription: 'Explore my published packages, code marketplace items, and open source contributions',
    npmEnabled: true,
    sellingEnabled: true,
    opensourceEnabled: true
  })
  const sectionRef = useRef(null)

  // Fetch data from Firebase
  const { data: npmPackages, loading: npmLoading } = useFirestoreCollection('contributions_npm', [])
  const { data: sellingItems, loading: sellingLoading } = useFirestoreCollection('contributions_selling', [])
  const { data: opensourceContribs, loading: opensourceLoading } = useFirestoreCollection('contributions_opensource', [])

  // Fetch section settings
  useEffect(() => {
    if (!isFirebaseConfigured || !db) return

    const unsubscribe = onSnapshot(
      doc(db, 'settings', 'contributions'),
      (docSnap) => {
        if (docSnap.exists()) {
          setSectionSettings(prev => ({ ...prev, ...docSnap.data() }))
        }
      },
      () => {}
    )

    return () => unsubscribe()
  }, [])

  // Check if section should be shown
  const hasContent = 
    (sectionSettings.npmEnabled && npmPackages.length > 0) ||
    (sectionSettings.sellingEnabled && sellingItems.length > 0) ||
    (sectionSettings.opensourceEnabled && opensourceContribs.length > 0)

  const loading = npmLoading || sellingLoading || opensourceLoading

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

  // Show loading state or hide if no content
  if (loading) {
    return (
      <section
        ref={sectionRef}
        id="contributions"
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

  // Hide section if no content (after loading)
  if (!hasContent) {
    return null
  }

  const sortedNpm = [...npmPackages].sort((a, b) => (a.order || 0) - (b.order || 0))
  const sortedSelling = [...sellingItems].sort((a, b) => (a.order || 0) - (b.order || 0))
  const sortedOpensource = [...opensourceContribs].sort((a, b) => (a.order || 0) - (b.order || 0))

  return (
    <section
      ref={sectionRef}
      id="contributions"
      className="py-12 md:py-16 lg:py-20 bg-white text-black relative overflow-hidden"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div
          className={`text-center mb-8 md:mb-12 lg:mb-16 transition-all duration-[1200ms] ease-[cubic-bezier(0.4,0,0.2,1)] ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <p className="text-gray-400 text-sm uppercase tracking-widest mb-4">
            {sectionSettings.sectionSubtitle}
          </p>
          <h2 className="text-4xl md:text-5xl font-bold text-black">
            {sectionSettings.sectionTitle} <span className="text-gray-400">{sectionSettings.sectionTitleHighlight}</span>
          </h2>
          <p className="text-gray-500 mt-4 max-w-2xl mx-auto">
            {sectionSettings.sectionDescription}
          </p>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader size="lg" />
          </div>
        ) : (
          <div className="space-y-12 md:space-y-16">
            {/* NPM Packages */}
            {sectionSettings.npmEnabled && sortedNpm.length > 0 && (
              <div
                className={`transition-all duration-[1200ms] ease-[cubic-bezier(0.4,0,0.2,1)] ${
                  isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                }`}
                style={{ transitionDelay: '0.2s' }}
              >
                <h3 className="text-2xl md:text-3xl font-bold text-black mb-6 flex items-center gap-3">
                  <span className="text-red-500">📦</span>
                  NPM Packages
                </h3>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {sortedNpm.map((pkg) => (
                    <a
                      key={pkg.id}
                      href={pkg.url || `https://www.npmjs.com/package/${pkg.name}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group p-6 border border-gray-200 hover:border-black transition-all duration-300 bg-white hover:shadow-lg"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <h4 className="text-lg font-semibold text-black group-hover:text-gray-600 transition-colors">
                          {pkg.name}
                        </h4>
                        <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded">
                          v{pkg.version || '1.0.0'}
                        </span>
                      </div>
                      <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                        {pkg.description}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500">
                          {pkg.downloads ? `${pkg.downloads} downloads` : 'NPM'}
                        </span>
                        <svg className="w-4 h-4 text-gray-400 group-hover:text-black group-hover:translate-x-1 transition-all" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Code/Website Selling */}
            {sectionSettings.sellingEnabled && sortedSelling.length > 0 && (
              <div
                className={`transition-all duration-[1200ms] ease-[cubic-bezier(0.4,0,0.2,1)] ${
                  isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                }`}
                style={{ transitionDelay: '0.4s' }}
              >
                <h3 className="text-2xl md:text-3xl font-bold text-black mb-6 flex items-center gap-3">
                  <span className="text-green-500">💰</span>
                  Code & Website Marketplace
                </h3>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {sortedSelling.map((item) => (
                    <a
                      key={item.id}
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group p-6 border border-gray-200 hover:border-black transition-all duration-300 bg-white hover:shadow-lg"
                    >
                      {item.imageUrl && (
                        <div className="aspect-video bg-gray-100 mb-4 overflow-hidden">
                          <img
                            src={item.imageUrl}
                            alt={item.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                      )}
                      <div className="flex items-start justify-between mb-3">
                        <h4 className="text-lg font-semibold text-black group-hover:text-gray-600 transition-colors">
                          {item.title}
                        </h4>
                        {item.price && (
                          <span className="text-sm font-bold text-green-600 bg-green-50 px-2 py-1 rounded">
                            ${item.price}
                          </span>
                        )}
                      </div>
                      <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                        {item.description}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500">
                          {item.platform || 'Marketplace'}
                        </span>
                        <svg className="w-4 h-4 text-gray-400 group-hover:text-black group-hover:translate-x-1 transition-all" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Open Source Contributions */}
            {sectionSettings.opensourceEnabled && sortedOpensource.length > 0 && (
              <div
                className={`transition-all duration-[1200ms] ease-[cubic-bezier(0.4,0,0.2,1)] ${
                  isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                }`}
                style={{ transitionDelay: '0.6s' }}
              >
                <h3 className="text-2xl md:text-3xl font-bold text-black mb-6 flex items-center gap-3">
                  <span className="text-blue-500">🌐</span>
                  Open Source Contributions
                </h3>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {sortedOpensource.map((contrib) => (
                    <a
                      key={contrib.id}
                      href={contrib.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group p-6 border border-gray-200 hover:border-black transition-all duration-300 bg-white hover:shadow-lg"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <h4 className="text-lg font-semibold text-black group-hover:text-gray-600 transition-colors">
                          {contrib.repository}
                        </h4>
                        {contrib.stars && (
                          <span className="text-xs text-gray-500 flex items-center gap-1">
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                            {contrib.stars}
                          </span>
                        )}
                      </div>
                      <p className="text-gray-600 text-sm mb-2">
                        <span className="font-medium">{contrib.contribution}</span>
                      </p>
                      {contrib.description && (
                        <p className="text-gray-500 text-xs mb-4 line-clamp-2">
                          {contrib.description}
                        </p>
                      )}
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500">
                          {contrib.type || 'Contribution'}
                        </span>
                        <svg className="w-4 h-4 text-gray-400 group-hover:text-black group-hover:translate-x-1 transition-all" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  )
}

export default Contributions

