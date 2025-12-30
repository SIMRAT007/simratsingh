import { useEffect, useState, useRef } from 'react'
import { useFirestoreCollection, useServicesSettings } from '../hooks/useSiteSettings'
import Loader from './Loader'

// Default icon for services
const defaultIcon = (
  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 7.5l3 2.25-3 2.25m4.5 0h3m-9 8.25h13.5A2.25 2.25 0 0021 18V6a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 6v12a2.25 2.25 0 002.25 2.25z" />
  </svg>
)

const Services = () => {
  const { settings, loading: settingsLoading } = useServicesSettings()
  const { data: servicesData, loading: servicesLoading } = useFirestoreCollection('services', [])
  const { data: processData, loading: processLoading } = useFirestoreCollection('services_process', [])
  
  const [isVisible, setIsVisible] = useState(false)
  const sectionRef = useRef(null)

  // Sort data by order
  const services = [...servicesData].sort((a, b) => (a.order || 0) - (b.order || 0))
  const process = [...processData].sort((a, b) => (a.order || 0) - (b.order || 0))

  // Check if there's any content
  const hasContent = services.length > 0

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

  const loading = servicesLoading || processLoading || settingsLoading

  // If no services, don't render
  if (!loading && !hasContent) {
    return null
  }

  return (
    <section
      ref={sectionRef}
      id="services"
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
          <p className="text-gray-400 mt-4 max-w-2xl mx-auto">
            {settings.sectionDescription}
          </p>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader size="lg" />
          </div>
        ) : (
          <>
            {/* Services Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-12 md:mb-16 lg:mb-20">
          {services.map((service, index) => (
            <div
              key={service.id}
              className={`group p-6 border border-gray-800 bg-gray-900/50 hover:bg-white hover:border-white transition-all duration-500 ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`}
              style={{ transitionDelay: `${0.1 + index * 0.1}s` }}
            >
              {/* Icon */}
              <div className="w-14 h-14 border border-gray-700 flex items-center justify-center text-white mb-5 group-hover:bg-black group-hover:border-black group-hover:text-white transition-all duration-300">
                {service.icon ? (
                  <span className="text-2xl" style={{ filter: 'grayscale(100%)' }}>{service.icon}</span>
                ) : (
                  defaultIcon
                )}
              </div>

              {/* Title & Price */}
              <div className="flex items-start justify-between mb-3">
                <h3 className="text-xl font-semibold text-white group-hover:text-black transition-colors">
                  {service.title}
                </h3>
                {service.price && (
                  <span className="text-xs font-medium text-gray-400 group-hover:text-gray-600 bg-gray-800 group-hover:bg-gray-100 px-2 py-1 transition-all duration-300">
                    {service.price}
                  </span>
                )}
              </div>

              {/* Description */}
              <p className="text-gray-400 text-sm mb-5 group-hover:text-gray-600 transition-colors">
                {service.description}
              </p>

              {/* Features */}
              {service.features && service.features.length > 0 && (
                <ul className="space-y-2 mb-5">
                  {service.features.map((feature, i) => (
                    <li
                      key={i}
                      className="flex items-center gap-2 text-sm text-gray-500 group-hover:text-gray-700 transition-colors"
                    >
                      <svg className="w-4 h-4 text-gray-600 group-hover:text-black transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      {feature}
                    </li>
                  ))}
                </ul>
              )}

              {/* CTA */}
              <button
                onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}
                className="flex items-center text-sm font-medium text-white group-hover:text-black transition-all duration-300 cursor-pointer"
              >
                <span>Get Quote</span>
                <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </button>
            </div>
          ))}
        </div>

        {/* Process Section */}
        {process.length > 0 && (
          <div
            className={`transition-all duration-[1200ms] ease-[cubic-bezier(0.4,0,0.2,1)] ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
            style={{ transitionDelay: '0.7s' }}
          >
            <h3 className="text-2xl font-bold text-center mb-8 md:mb-10 lg:mb-12">
              {settings.processTitle} <span className="text-gray-500">{settings.processTitleHighlight}</span>
            </h3>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              {process.map((item, index) => (
                <div
                  key={item.id}
                  className={`relative p-6 border border-gray-800 bg-gray-900/30 transition-all duration-500 ${
                    isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                  }`}
                  style={{ transitionDelay: `${0.8 + index * 0.1}s` }}
                >
                  {/* Step Number */}
                  <span className="text-5xl font-bold text-gray-800 absolute top-4 right-4">
                    {item.step}
                  </span>

                  {/* Content */}
                  <div className="relative z-10">
                    <h4 className="text-lg font-semibold text-white mb-2">{item.title}</h4>
                    <p className="text-gray-500 text-sm">{item.description}</p>
                  </div>

                  {/* Connector Line (except last) */}
                  {index < process.length - 1 && (
                    <div className="hidden lg:block absolute top-1/2 -right-3 w-6 border-t border-dashed border-gray-700" />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* CTA Section */}
        <div
          className={`text-center mt-16 transition-all duration-[1200ms] ease-[cubic-bezier(0.4,0,0.2,1)] ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
          style={{ transitionDelay: '1.2s' }}
        >
          <p className="text-gray-400 mb-6 italic">
            {settings.ctaText}
          </p>
          <div className="flex justify-center gap-4 flex-wrap">
            <button
              onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}
              className="inline-flex items-center gap-3 px-8 py-4 bg-white text-black font-medium hover:bg-gray-200 transition-all duration-300"
            >
              {settings.ctaButton1}
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </button>
            <button
              onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}
              className="inline-flex items-center gap-3 px-8 py-4 border border-gray-700 text-white font-medium hover:bg-white hover:text-black hover:border-white transition-all duration-300"
            >
              {settings.ctaButton2}
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
            </button>
            </div>
          </div>
          </>
        )}
      </div>
    </section>
  )
}

export default Services
