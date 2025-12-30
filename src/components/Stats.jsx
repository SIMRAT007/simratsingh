import { useEffect, useState, useRef } from 'react'
import { useAboutSettings } from '../hooks/useSiteSettings'

const Stats = () => {
  const { settings } = useAboutSettings()
  const [isVisible, setIsVisible] = useState(false)
  const sectionRef = useRef(null)

  // Build stats from Firebase settings
  const stats = [
    { number: settings.yearsExperience || '3+', label: 'Years of Experience', description: 'As a working professional' },
    { number: settings.projectsCompleted || '50+', label: 'Projects Completed', description: 'Across various domains' },
    { number: settings.happyClients || '30+', label: 'Happy Clients', description: 'Worldwide satisfaction' },
    { number: settings.technologies || '10+', label: 'Technologies', description: 'Mastered & growing' },
  ]

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
        }
      },
      { threshold: 0.2 }
    )

    if (sectionRef.current) {
      observer.observe(sectionRef.current)
    }

    return () => observer.disconnect()
  }, [])

  return (
    <section
      ref={sectionRef}
      className="py-20 relative overflow-hidden bg-black"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div
          className={`text-center mb-16 transition-all duration-[1200ms] ease-[cubic-bezier(0.4,0,0.2,1)] ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <p className="text-gray-500 text-sm uppercase tracking-widest mb-4">{settings.statsSubtitle || 'Numbers speak'}</p>
          <h2 className="text-4xl md:text-5xl font-bold text-white">
            {settings.statsTitle || 'My'} <span className="text-gray-500">{settings.statsTitleHighlight || 'Stats'}</span>
          </h2>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12">
          {stats.map((stat, index) => (
            <div
              key={index}
              className={`text-center group transition-all duration-[1000ms] ease-[cubic-bezier(0.4,0,0.2,1)] ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`}
              style={{ transitionDelay: `${0.2 + index * 0.1}s` }}
            >
              {/* Number */}
              <div className="relative inline-block">
                <span className="text-5xl md:text-6xl lg:text-7xl font-bold text-white group-hover:text-gray-300 transition-colors duration-300">
                  {stat.number}
                </span>
                {/* Decorative line */}
                <div className="absolute -bottom-2 left-0 w-full h-px bg-gradient-to-r from-transparent via-gray-600 to-transparent" />
              </div>
              
              {/* Label */}
              <h3 className="text-white font-medium mt-6 mb-2 text-lg">
                {stat.label}
              </h3>
              
              {/* Description */}
              <p className="text-gray-500 text-sm">
                {stat.description}
              </p>
            </div>
          ))}
        </div>

        {/* Bottom decorative element */}
        {/* <div
          className={`flex justify-center mt-16 gap-2 transition-all duration-[1200ms] ease-[cubic-bezier(0.4,0,0.2,1)] ${
            isVisible ? 'opacity-100' : 'opacity-0'
          }`}
          style={{ transitionDelay: '0.7s' }}
        >
          <div className="w-2 h-2 bg-gray-600 rounded-full" />
          <div className="w-2 h-2 bg-gray-700 rounded-full" />
          <div className="w-2 h-2 bg-gray-800 rounded-full" />
        </div> */}
      </div>
    </section>
  )
}

export default Stats

