import { useState, useEffect } from 'react'
import { collection, getDocs } from 'firebase/firestore'
import { db } from '../../firebase/config'
import { Link } from 'react-router-dom'

const Dashboard = () => {
  const [stats, setStats] = useState({
    projects: 0,
    blogs: 0,
    testimonials: 0,
    skills: 0,
    experience: 0,
    achievements: 0,
    certifications: 0,
    education: 0,
    hobbies: 0,
    services: 0,
    quotes: 0,
    music: 0,
    youtube: 0,
    linkedin: 0,
    instagram: 0,
    contactSubmissions: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Fetch counts from all Firestore collections
        const collections = [
          'projects',
          'blogs',
          'testimonials',
          'skills',
          'experience',
          'achievements',
          'certifications',
          'education',
          'hobbies',
          'services',
          'quotes',
          'music',
          'socialMedia_youtube',
          'socialMedia_linkedin',
          'socialMedia_instagram',
          'contact_submissions'
        ]
        
        const counts = {}
        
        for (const col of collections) {
          try {
            const snapshot = await getDocs(collection(db, col))
            // Map collection names to stat keys
            const key = col === 'socialMedia_youtube' ? 'youtube' :
                       col === 'socialMedia_linkedin' ? 'linkedin' :
                       col === 'socialMedia_instagram' ? 'instagram' :
                       col === 'contact_submissions' ? 'contactSubmissions' : col
            counts[key] = snapshot.size
          } catch (error) {
            const key = col === 'socialMedia_youtube' ? 'youtube' :
                       col === 'socialMedia_linkedin' ? 'linkedin' :
                       col === 'socialMedia_instagram' ? 'instagram' :
                       col === 'contact_submissions' ? 'contactSubmissions' : col
            counts[key] = 0
          }
        }
        
        setStats(counts)
      } catch (error) {
      }
      setLoading(false)
    }

    fetchStats()
  }, [])

  const statCards = [
    { 
      label: 'Projects', 
      value: stats.projects, 
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      ), 
      color: 'from-blue-500/20 via-blue-600/10 to-blue-700/5', 
      borderColor: 'border-blue-500/30',
      path: '/admin/projects' 
    },
    { 
      label: 'Blogs', 
      value: stats.blogs, 
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
        </svg>
      ), 
      color: 'from-green-500/20 via-green-600/10 to-green-700/5', 
      borderColor: 'border-green-500/30',
      path: '/admin/blogs' 
    },
    { 
      label: 'Testimonials', 
      value: stats.testimonials, 
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      ), 
      color: 'from-purple-500/20 via-purple-600/10 to-purple-700/5', 
      borderColor: 'border-purple-500/30',
      path: '/admin/testimonials' 
    },
    { 
      label: 'Experience', 
      value: stats.experience, 
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      ), 
      color: 'from-indigo-500/20 via-indigo-600/10 to-indigo-700/5', 
      borderColor: 'border-indigo-500/30',
      path: '/admin/experience' 
    },
    { 
      label: 'Achievements', 
      value: stats.achievements, 
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
        </svg>
      ), 
      color: 'from-yellow-500/20 via-yellow-600/10 to-yellow-700/5', 
      borderColor: 'border-yellow-500/30',
      path: '/admin/achievements' 
    },
    { 
      label: 'Certifications', 
      value: stats.certifications, 
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
        </svg>
      ), 
      color: 'from-pink-500/20 via-pink-600/10 to-pink-700/5', 
      borderColor: 'border-pink-500/30',
      path: '/admin/achievements' 
    },
    { 
      label: 'Education', 
      value: stats.education, 
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      ), 
      color: 'from-teal-500/20 via-teal-600/10 to-teal-700/5', 
      borderColor: 'border-teal-500/30',
      path: '/admin/education' 
    },
    { 
      label: 'Hobbies', 
      value: stats.hobbies, 
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      ), 
      color: 'from-red-500/20 via-red-600/10 to-red-700/5', 
      borderColor: 'border-red-500/30',
      path: '/admin/hobbies' 
    },
    { 
      label: 'Services', 
      value: stats.services, 
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      ), 
      color: 'from-cyan-500/20 via-cyan-600/10 to-cyan-700/5', 
      borderColor: 'border-cyan-500/30',
      path: '/admin/services' 
    },
    { 
      label: 'Quotes', 
      value: stats.quotes, 
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
        </svg>
      ), 
      color: 'from-violet-500/20 via-violet-600/10 to-violet-700/5', 
      borderColor: 'border-violet-500/30',
      path: '/admin/quotes' 
    }
  ]

  const quickActions = [
    { 
      label: 'Site Settings', 
      path: '/admin/site-settings', 
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
      description: 'Configure general settings'
    },
    { 
      label: 'Hero Section', 
      path: '/admin/hero', 
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      description: 'Update hero content'
    },
    { 
      label: 'About Section', 
      path: '/admin/about', 
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      description: 'Edit about information'
    },
    { 
      label: 'View Portfolio', 
      path: '/', 
      external: true, 
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
        </svg>
      ),
      description: 'Preview live site'
    }
  ]

  // Calculate totals
  const totalContent = stats.projects + stats.blogs + stats.testimonials + 
                       stats.experience + stats.achievements + stats.certifications + 
                       stats.education + stats.hobbies + stats.services + stats.quotes

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Welcome Header */}
      <div className="mb-10">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Dashboard</h1>
            <p className="text-gray-400 text-lg">Welcome back! Here's an overview of your portfolio.</p>
          </div>
          <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-gray-900/50 border border-gray-800 rounded-xl">
            <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-gray-400 text-sm">{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
          </div>
        </div>
      </div>

      {/* Summary Card */}
      <div className="mb-10">
        <div className="relative overflow-hidden bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-pink-500/10 border border-gray-800/50 rounded-2xl p-8 backdrop-blur-sm">
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-500/5 to-purple-500/5 rounded-full blur-3xl -mr-32 -mt-32"></div>
          <div className="relative flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm font-medium mb-2">Total Content Items</p>
              {loading ? (
                <div className="w-16 h-10 bg-gray-800/50 rounded-lg animate-pulse" />
              ) : (
                <h2 className="text-5xl font-bold text-white mb-1">{totalContent}</h2>
              )}
              <p className="text-gray-500 text-sm">Across {statCards.length} sections</p>
            </div>
            <div className="hidden md:block">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-gray-800/50 flex items-center justify-center">
                <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content Overview */}
      <div className="mb-10">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">Content Overview</h2>
          <span className="text-gray-500 text-sm">{statCards.length} sections</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {statCards.map((stat) => (
            <Link
              key={stat.label}
              to={stat.path}
              className={`group relative overflow-hidden bg-gradient-to-br ${stat.color} border ${stat.borderColor} rounded-xl p-5 hover:border-opacity-60 hover:scale-[1.02] hover:shadow-lg hover:shadow-gray-900/50 transition-all duration-300 cursor-pointer`}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative">
                <div className="flex items-center justify-between mb-3">
                  <div className="p-2 bg-white/5 rounded-lg border border-white/10 group-hover:bg-white/10 transition-colors">
                    <div className="text-white">{stat.icon}</div>
                  </div>
                </div>
                {loading ? (
                  <div className="w-12 h-8 bg-gray-800/50 rounded-lg animate-pulse mb-2" />
                ) : (
                  <h3 className="text-3xl font-bold text-white mb-1">{stat.value}</h3>
                )}
                <p className="text-gray-400 text-xs font-medium">{stat.label}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mb-10">
        <h2 className="text-2xl font-bold text-white mb-6">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action) => (
            action.external ? (
              <a
                key={action.label}
                href={action.path}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative overflow-hidden bg-gray-900/50 border border-gray-800 rounded-xl p-6 hover:bg-gray-900 hover:border-gray-700 hover:shadow-xl hover:shadow-gray-900/50 transition-all duration-300"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                    <div className="text-white">{action.icon}</div>
                  </div>
                  <h3 className="text-white font-semibold mb-1 group-hover:text-gray-200 transition-colors">{action.label}</h3>
                  <p className="text-gray-500 text-sm">{action.description}</p>
                </div>
              </a>
            ) : (
              <Link
                key={action.label}
                to={action.path}
                className="group relative overflow-hidden bg-gray-900/50 border border-gray-800 rounded-xl p-6 hover:bg-gray-900 hover:border-gray-700 hover:shadow-xl hover:shadow-gray-900/50 transition-all duration-300"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                    <div className="text-white">{action.icon}</div>
                  </div>
                  <h3 className="text-white font-semibold mb-1 group-hover:text-gray-200 transition-colors">{action.label}</h3>
                  <p className="text-gray-500 text-sm">{action.description}</p>
                </div>
              </Link>
            )
          ))}
        </div>
      </div>

      {/* Portfolio Info */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Portfolio Status */}
        <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-6 backdrop-blur-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-gray-800 flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-white">Portfolio Status</h2>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-4 bg-gray-800/30 border border-gray-800/50 rounded-xl hover:bg-gray-800/40 transition-colors">
              <div className="flex items-center gap-3">
                <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
                <span className="text-gray-400 text-sm">Portfolio URL</span>
              </div>
              <span className="text-white text-sm font-mono">{window.location.origin}</span>
            </div>
            <div className="flex items-center justify-between p-4 bg-gray-800/30 border border-gray-800/50 rounded-xl hover:bg-gray-800/40 transition-colors">
              <div className="flex items-center gap-3">
                <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-gray-400 text-sm">Last Updated</span>
              </div>
              <span className="text-white text-sm">{new Date().toLocaleDateString()}</span>
            </div>
            <div className="flex items-center justify-between p-4 bg-gray-800/30 border border-gray-800/50 rounded-xl hover:bg-gray-800/40 transition-colors">
              <div className="flex items-center gap-3">
                <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
                <span className="text-gray-400 text-sm">Total Sections</span>
              </div>
              <span className="text-white text-sm font-bold">{statCards.length}</span>
            </div>
          </div>
        </div>

        {/* Quick Links */}
        <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-6 backdrop-blur-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500/20 to-teal-500/20 border border-gray-800 flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-white">Quick Links</h2>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {['Projects', 'Blogs', 'Experience', 'Skills', 'Social Media', 'Music'].map((link) => (
              <Link
                key={link}
                to={`/admin/${link.toLowerCase().replace(' ', '-')}`}
                className="p-4 bg-gray-800/30 border border-gray-800/50 rounded-xl hover:bg-gray-800/50 hover:border-gray-700 transition-all text-center group"
              >
                <span className="text-white text-sm font-medium group-hover:text-gray-200 transition-colors">{link}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard

