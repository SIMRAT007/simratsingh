import { useEffect, useState, useRef } from 'react'
import { collection, doc, onSnapshot } from 'firebase/firestore'
import { db, isFirebaseConfigured } from '../firebase/config'
import Loader from './Loader'

// Default projects for fallback
const defaultProjects = [
  {
    id: 1,
      title: 'Job Portal',
    description: 'A full-stack job portal application with authentication, job listings, and application management. Built with modern technologies for optimal performance.',
      tech: ['React', 'Tailwind CSS', 'Supabase', 'Clerk'],
    category: 'Web App',
    imageUrl: '',
      github: 'https://github.com',
    live: 'https://example.com',
    year: '2024'
    },
    {
    id: 2,
      title: 'News App',
    description: 'A React Native mobile application for browsing news articles with category filtering and bookmarks. Features dark mode support.',
      tech: ['React Native', 'TypeScript', 'REST API'],
    category: 'Mobile App',
    imageUrl: '',
      github: 'https://github.com',
    live: null,
    year: '2024'
    },
    {
    id: 3,
      title: 'Mortgage Solutions',
    description: 'A comprehensive mortgage calculator and information website with modern UI/UX. Features loan comparison tools and amortization schedules.',
      tech: ['React', 'Vite', 'Tailwind CSS'],
    category: 'Web App',
    imageUrl: '',
      github: 'https://github.com',
    live: 'https://example.com',
    year: '2024'
  },
  {
    id: 4,
    title: 'E-Commerce Dashboard',
    description: 'An admin dashboard for managing products, orders, and customer analytics. Built with performance and scalability in mind.',
    tech: ['Next.js', 'TypeScript', 'Prisma', 'PostgreSQL'],
    category: 'Dashboard',
    imageUrl: '',
      github: 'https://github.com',
    live: 'https://example.com',
    year: '2023'
  },
  {
    id: 5,
    title: 'Portfolio Website',
    description: 'A modern, responsive portfolio website showcasing projects and skills with smooth animations and optimized performance.',
    tech: ['React', 'Vite', 'Tailwind CSS'],
    category: 'Landing Page',
    imageUrl: '',
      github: 'https://github.com',
    live: 'https://example.com',
    year: '2024'
  },
  {
    id: 6,
    title: 'Task Management App',
    description: 'A productivity app for managing tasks, projects, and team collaboration with kanban boards and real-time updates.',
    tech: ['React', 'Node.js', 'MongoDB', 'Socket.io'],
    category: 'SaaS',
    imageUrl: '',
      github: 'https://github.com',
    live: 'https://example.com',
    year: '2023'
  }
]

const defaultSectionSettings = {
  sectionSubtitle: 'Featured Work',
  sectionTitle: 'My',
  sectionTitleHighlight: 'Projects'
}

const Projects = () => {
  const [isVisible, setIsVisible] = useState(false)
  const [selectedProject, setSelectedProject] = useState(null)
  const [showAllProjects, setShowAllProjects] = useState(false)
  const [allProjects, setAllProjects] = useState(defaultProjects)
  const [sectionSettings, setSectionSettings] = useState(defaultSectionSettings)
  const [loading, setLoading] = useState(true)
  const sectionRef = useRef(null)

  // Fetch projects from Firebase
  useEffect(() => {
    if (!isFirebaseConfigured || !db) {
      setLoading(false)
      return
    }

    let settingsLoaded = false
    let projectsLoaded = false

    const checkLoading = () => {
      if (settingsLoaded && projectsLoaded) {
        setLoading(false)
      }
    }

    // Listen for section settings
    const settingsUnsubscribe = onSnapshot(
      doc(db, 'settings', 'projects'),
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

    // Listen for projects collection
    const projectsUnsubscribe = onSnapshot(
      collection(db, 'projects'),
      (snapshot) => {
        if (!snapshot.empty) {
          const projectsData = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }))
          // Sort by order
          projectsData.sort((a, b) => (a.order || 0) - (b.order || 0))
          setAllProjects(projectsData)
        }
        projectsLoaded = true
        checkLoading()
      },
      (error) => {
        projectsLoaded = true
        checkLoading()
      }
    )

    return () => {
      settingsUnsubscribe()
      projectsUnsubscribe()
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

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (selectedProject || showAllProjects) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [selectedProject, showAllProjects])

  const displayedProjects = allProjects.slice(0, 6)

  return (
    <>
      <section
        ref={sectionRef}
        id="projects"
        className="py-12 md:py-16 lg:py-20 relative overflow-hidden"
      >
        {/* Subtle Grid Pattern */}
        {/* <div 
          className={`absolute inset-0 opacity-0 transition-all duration-[2000ms] ease-out pointer-events-none ${
            isVisible ? 'opacity-[0.15]' : ''
          }`}
          style={{
            backgroundImage: `
              linear-gradient(to bottom, white 0%, transparent 50%, white 100%),
              linear-gradient(to right, #9ca3af 1px, transparent 1px),
              linear-gradient(to bottom, #9ca3af 1px, transparent 1px)
            `,
            backgroundSize: '100% 100%, 60px 60px, 60px 60px',
          }}
        /> */}

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {/* Section Header */}
          <div
            className={`text-center mb-8 md:mb-12 lg:mb-16 transition-all duration-[1200ms] ease-[cubic-bezier(0.4,0,0.2,1)] ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
          >
            <p className="text-gray-400 text-sm uppercase tracking-widest mb-4">{sectionSettings.sectionSubtitle || 'Featured Work'}</p>
            <h2 className="text-4xl md:text-5xl font-bold text-black">
              {sectionSettings.sectionTitle || 'My'} <span className="text-gray-400">{sectionSettings.sectionTitleHighlight || 'Projects'}</span>
        </h2>
          </div>

          {/* Loading State */}
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader size="lg" />
            </div>
          ) : (
            <>
              {/* Projects Grid */}
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {displayedProjects.map((project, index) => (
              <div
                key={project.id}
                onClick={() => setSelectedProject(project)}
                className={`group cursor-pointer border border-gray-200 bg-white p-3 hover:border-black transition-all duration-500 ${
                  isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                }`}
                style={{ transitionDelay: `${0.1 + index * 0.1}s` }}
              >
                {/* Project Image */}
                <div className="aspect-video bg-gray-50 border border-gray-100 mb-4 flex items-center justify-center overflow-hidden group-hover:border-black transition-all duration-300">
                  {project.imageUrl ? (
                    <img src={project.imageUrl} alt={project.title} className="w-full h-full object-fit group-hover:scale-105 transition-transform duration-500" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                      <span className="text-4xl text-gray-400">{project.title?.charAt(0) || '?'}</span>
                    </div>
                  )}
                </div>

                {/* Category & Year */}
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs uppercase tracking-wider text-gray-400">{project.category}</span>
                  <span className="text-xs text-gray-400">{project.year}</span>
                </div>

                {/* Project Title */}
                <h3 className="text-xl font-semibold text-black mb-2 group-hover:text-gray-600 transition-colors">
                  {project.title}
                </h3>

                {/* Description */}
                <p className="text-gray-500 text-sm mb-4 line-clamp-2">
                  {project.description}
                </p>

                {/* Tech Stack */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {project.tech.slice(0, 3).map((tech) => (
                    <span
                      key={tech}
                      className="px-3 py-1 text-xs border border-gray-200 text-gray-600 hover:bg-black hover:text-white hover:border-black transition-all duration-300"
                    >
                      {tech}
                    </span>
                  ))}
                  {project.tech.length > 3 && (
                    <span className="px-3 py-1 text-xs border border-gray-200 text-gray-400">
                      +{project.tech.length - 3}
                    </span>
                  )}
                </div>

                {/* View Details */}
                <div className="flex items-center justify-end text-sm font-medium text-black group-hover:gap-2 transition-all duration-300">
                  <span>View Details</span>
                  <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </div>
              </div>
            ))}
          </div>

              {/* View All Button */}
              <div
                className={`text-center mt-12 transition-all duration-[1200ms] ease-[cubic-bezier(0.4,0,0.2,1)] ${
                  isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                }`}
                style={{ transitionDelay: '0.8s' }}
              >
                <button
                  onClick={() => setShowAllProjects(true)}
                  className="inline-flex items-center gap-3 px-8 py-4 bg-black text-white font-medium hover:bg-gray-800 transition-all duration-300"
                >
                  View All Projects
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </button>
              </div>
            </>
          )}
        </div>
      </section>

      {/* Project Details Modal */}
      {selectedProject && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedProject(null)}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
          
          {/* Modal Content */}
          <div 
            className="relative bg-white w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header - Sticky */}
            <div className="sticky top-0 z-20 flex items-center justify-between p-4 bg-white border-b border-gray-200 shadow-sm">
              <h2 className="text-xl font-bold text-black">Projects</h2>
              <button
                onClick={() => setSelectedProject(null)}
                className="w-10 h-10 flex items-center justify-center border border-gray-300 bg-white hover:bg-black hover:text-white hover:border-black transition-all duration-300 shadow-sm"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Project Image */}
            <div className="aspect-video bg-gray-100 flex items-center justify-center border-b border-gray-200 overflow-hidden m-1 rounded-lg">
              {selectedProject.imageUrl ? (
                <img src={selectedProject.imageUrl} alt={selectedProject.title} className="w-full h-full object-fit" />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                  <span className="text-6xl text-gray-400">{selectedProject.title?.charAt(0) || '?'}</span>
                </div>
              )}
            </div>

            {/* Project Info */}
            <div className="p-8">
              {/* Category & Year */}
              <div className="flex items-center gap-4 mb-4">
                <span className="px-3 py-1 text-xs uppercase tracking-wider bg-black text-white">
                  {selectedProject.category}
                </span>
                <span className="text-sm text-gray-400">{selectedProject.year}</span>
              </div>

              {/* Title */}
              <h3 className="text-3xl font-bold text-black mb-4">
                {selectedProject.title}
              </h3>

              {/* Description */}
              <p className="text-gray-600 leading-relaxed mb-6">
                {selectedProject.description}
              </p>

              {/* Tech Stack */}
              <div className="mb-8">
                <h4 className="text-sm uppercase tracking-wider text-gray-400 mb-3">Technologies Used</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedProject.tech.map((tech) => (
                  <span
                    key={tech}
                      className="px-4 py-2 text-sm border border-gray-200 text-gray-700"
                  >
                    {tech}
                  </span>
                ))}
                </div>
              </div>

              {/* Action Buttons */}
              {selectedProject.live && (
                <div className="flex gap-4">
                  <a
                    href={selectedProject.live}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-black text-white font-medium hover:bg-gray-800 transition-all duration-300"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                    Live Demo
                  </a>
                </div>
                )}
              </div>
            </div>
        </div>
      )}

      {/* All Projects Modal */}
      {showAllProjects && (
        <div 
          className="fixed inset-0 z-50 bg-white overflow-y-auto"
        >
          {/* Header */}
          <div className="sticky top-0 bg-white border-b border-gray-200 z-10">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-black">All Projects</h2>
              <button
                onClick={() => setShowAllProjects(false)}
                className="flex items-center gap-2 px-4 py-2 border border-black text-black font-medium hover:bg-black hover:text-white transition-all duration-300"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
                Close
              </button>
            </div>
          </div>

          {/* Projects Grid */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {allProjects.map((project) => (
                <div
                  key={project.id}
                  onClick={() => {
                    setShowAllProjects(false)
                    setSelectedProject(project)
                  }}
                  className="group cursor-pointer border border-gray-200 bg-white p-6 hover:border-black transition-all duration-300"
                >
                  {/* Project Image */}
                  <div className="aspect-video bg-gray-50 border border-gray-100 mb-4 flex items-center justify-center overflow-hidden group-hover:border-black transition-all duration-300">
                    {project.imageUrl ? (
                      <img src={project.imageUrl} alt={project.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                        <span className="text-4xl text-gray-400">{project.title?.charAt(0) || '?'}</span>
                      </div>
                    )}
                  </div>

                  {/* Category & Year */}
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs uppercase tracking-wider text-gray-400">{project.category}</span>
                    <span className="text-xs text-gray-400">{project.year}</span>
                  </div>

                  {/* Project Title */}
                  <h3 className="text-xl font-semibold text-black mb-2 group-hover:text-gray-600 transition-colors">
                    {project.title}
                  </h3>

                  {/* Description */}
                  <p className="text-gray-500 text-sm mb-4 line-clamp-2">
                    {project.description}
                  </p>

                  {/* Tech Stack */}
                  <div className="flex flex-wrap gap-2">
                    {project.tech.slice(0, 3).map((tech) => (
                      <span
                        key={tech}
                        className="px-3 py-1 text-xs border border-gray-200 text-gray-600"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default Projects
