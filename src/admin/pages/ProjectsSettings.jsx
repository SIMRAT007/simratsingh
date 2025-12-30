import { useState, useEffect } from 'react'
import { collection, doc, getDocs, setDoc, deleteDoc, addDoc } from 'firebase/firestore'
import { db } from '../../firebase/config'
import Toast from '../../components/Toast'

const ProjectsSettings = () => {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [projects, setProjects] = useState([])
  const [editingProject, setEditingProject] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [toast, setToast] = useState({ message: '', type: 'success', isVisible: false })
  
  // Section header settings
  const [sectionSettings, setSectionSettings] = useState({
    sectionSubtitle: 'Featured Work',
    sectionTitle: 'My',
    sectionTitleHighlight: 'Projects'
  })

  const emptyProject = {
    title: '',
    description: '',
    tech: '',
    category: 'Web App',
    imageUrl: '',
    github: '',
    live: '',
    year: new Date().getFullYear().toString(),
    order: 0
  }

  const categories = [
    'Web App',
    'Mobile App',
    'Desktop App',
    'API',
    'Library',
    'E-Commerce',
    'Dashboard',
    'Landing Page',
    'SaaS',
    'Plugin',
    'Chrome Extension',
    'CLI Tool',
    'AI/ML',
    'Blockchain',
    'Game',
    'IoT',
    'Open Source',
    'Other'
  ]

  useEffect(() => {
    fetchProjects()
  }, [])

  const fetchProjects = async () => {
    try {
      // Fetch section settings
      const settingsDoc = await getDocs(collection(db, 'settings'))
      settingsDoc.forEach(doc => {
        if (doc.id === 'projects') {
          setSectionSettings(prev => ({ ...prev, ...doc.data() }))
        }
      })

      // Fetch projects
      const querySnapshot = await getDocs(collection(db, 'projects'))
      const projectsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      // Sort by order
      projectsData.sort((a, b) => (a.order || 0) - (b.order || 0))
      setProjects(projectsData)
    } catch (error) {
    }
    setLoading(false)
  }

  const handleSaveSectionSettings = async () => {
    setSaving(true)
    try {
      await setDoc(doc(db, 'settings', 'projects'), sectionSettings, { merge: true })
      setToast({ message: 'Section settings saved successfully!', type: 'success', isVisible: true })
    } catch (error) {
      setToast({ message: 'Failed to save settings. Please try again.', type: 'error', isVisible: true })
    }
    setSaving(false)
  }

  const handleSaveProject = async (project) => {
    setSaving(true)
    try {
      const projectData = {
        ...project,
        tech: typeof project.tech === 'string' 
          ? project.tech.split(',').map(t => t.trim()).filter(Boolean)
          : project.tech,
        order: parseInt(project.order) || 0,
        updatedAt: new Date().toISOString()
      }

      if (project.id) {
        // Update existing project
        await setDoc(doc(db, 'projects', project.id), projectData, { merge: true })
      } else {
        // Add new project
        await addDoc(collection(db, 'projects'), {
          ...projectData,
          createdAt: new Date().toISOString()
        })
      }
      
      await fetchProjects()
      setEditingProject(null)
      setShowForm(false)
      setToast({ message: project.id ? 'Project updated successfully!' : 'Project added successfully!', type: 'success', isVisible: true })
    } catch (error) {
      setToast({ message: 'Failed to save project. Please try again.', type: 'error', isVisible: true })
    }
    setSaving(false)
  }

  const handleDeleteProject = async (projectId) => {
    if (!confirm('Are you sure you want to delete this project?')) return
    
    try {
      await deleteDoc(doc(db, 'projects', projectId))
      await fetchProjects()
    } catch (error) {
      alert('Failed to delete project.')
    }
  }

  const getEmptyProject = () => {
    const maxOrder = projects.length > 0 
      ? Math.max(...projects.map(p => p.order || 0))
      : -1
    return { ...emptyProject, order: maxOrder + 1 }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Projects</h1>
          <p className="text-gray-500">Manage your portfolio projects.</p>
        </div>
        <button
          onClick={() => {
            setEditingProject(getEmptyProject())
            setShowForm(true)
          }}
          className="px-6 py-3 rounded-xl font-medium bg-white text-black hover:bg-gray-200 transition-all flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Project
        </button>
      </div>

      {/* Section Header Settings */}
      <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-6 mb-6">
        <h2 className="text-lg font-semibold text-white mb-4">Section Header</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-gray-400 text-sm font-medium mb-2">Subtitle</label>
            <input
              type="text"
              value={sectionSettings.sectionSubtitle}
              onChange={(e) => setSectionSettings(prev => ({ ...prev, sectionSubtitle: e.target.value }))}
              placeholder="Featured Work"
              className="w-full px-4 py-3 bg-gray-900 border border-gray-800 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-gray-600"
            />
          </div>
          <div>
            <label className="block text-gray-400 text-sm font-medium mb-2">Title</label>
            <input
              type="text"
              value={sectionSettings.sectionTitle}
              onChange={(e) => setSectionSettings(prev => ({ ...prev, sectionTitle: e.target.value }))}
              placeholder="My"
              className="w-full px-4 py-3 bg-gray-900 border border-gray-800 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-gray-600"
            />
          </div>
          <div>
            <label className="block text-gray-400 text-sm font-medium mb-2">Title Highlight</label>
            <input
              type="text"
              value={sectionSettings.sectionTitleHighlight}
              onChange={(e) => setSectionSettings(prev => ({ ...prev, sectionTitleHighlight: e.target.value }))}
              placeholder="Projects"
              className="w-full px-4 py-3 bg-gray-900 border border-gray-800 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-gray-600"
            />
          </div>
        </div>
        <div className="mt-4 flex justify-end">
          <button
            onClick={handleSaveSectionSettings}
            disabled={saving}
            className="px-4 py-2 rounded-lg font-medium bg-gray-800 text-white hover:bg-gray-700 transition-all disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Header'}
          </button>
        </div>
      </div>

      {/* Projects List */}
      <div className="space-y-4">
        {projects.length === 0 ? (
          <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-12 text-center">
            <div className="w-16 h-16 rounded-2xl bg-gray-800 flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">📁</span>
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">No Projects Yet</h3>
            <p className="text-gray-500 mb-4">Add your first project to showcase your work.</p>
            <button
              onClick={() => {
                setEditingProject(getEmptyProject())
                setShowForm(true)
              }}
              className="px-6 py-3 rounded-xl font-medium bg-white text-black hover:bg-gray-200 transition-all"
            >
              Add Your First Project
            </button>
          </div>
        ) : (
          projects.map((project, index) => (
            <div
              key={project.id}
              className="bg-gray-900/50 border border-gray-800 rounded-2xl p-6 flex items-start gap-6"
            >
              {/* Project Image */}
              <div className="w-16 h-16 rounded-xl bg-gray-800 flex items-center justify-center overflow-hidden flex-shrink-0">
                {project.imageUrl ? (
                  <img src={project.imageUrl} alt={project.title} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-3xl">{project.image || '📁'}</span>
                )}
              </div>
              
              {/* Project Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-lg font-semibold text-white">{project.title}</h3>
                  <span className="px-2 py-1 text-xs bg-gray-800 text-gray-400 rounded">{project.category}</span>
                  <span className="text-xs text-gray-600">{project.year}</span>
                </div>
                <p className="text-gray-500 text-sm mb-3 line-clamp-2">{project.description}</p>
                <div className="flex flex-wrap gap-2">
                  {(Array.isArray(project.tech) ? project.tech : []).slice(0, 4).map((tech, i) => (
                    <span key={i} className="px-2 py-1 text-xs bg-gray-800 text-gray-400 rounded">
                      {tech}
                    </span>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  onClick={() => {
                    setEditingProject({
                      ...project,
                      tech: Array.isArray(project.tech) ? project.tech.join(', ') : project.tech
                    })
                    setShowForm(true)
                  }}
                  className="p-2 rounded-lg bg-gray-800 text-gray-400 hover:text-white transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
                <button
                  onClick={() => handleDeleteProject(project.id)}
                  className="p-2 rounded-lg bg-gray-800 text-gray-400 hover:text-red-500 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Project Form Modal */}
      {showForm && editingProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setShowForm(false)} />
          <div className="relative bg-gray-950 border border-gray-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-xl font-semibold text-white mb-6">
                {editingProject.id ? 'Edit Project' : 'Add New Project'}
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-gray-400 text-sm font-medium mb-2">Title *</label>
                  <input
                    type="text"
                    value={editingProject.title}
                    onChange={(e) => setEditingProject(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Project Title"
                    className="w-full px-4 py-3 bg-gray-900 border border-gray-800 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-gray-600"
                  />
                </div>

                <div>
                  <label className="block text-gray-400 text-sm font-medium mb-2">Image URL</label>
                  <input
                    type="text"
                    value={editingProject.imageUrl}
                    onChange={(e) => setEditingProject(prev => ({ ...prev, imageUrl: e.target.value }))}
                    placeholder="https://example.com/project-image.png"
                    className="w-full px-4 py-3 bg-gray-900 border border-gray-800 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-gray-600"
                  />
                  <p className="text-gray-600 text-xs mt-1">Use a direct image URL (PNG, JPG, WebP)</p>
                </div>

                <div>
                  <label className="block text-gray-400 text-sm font-medium mb-2">Description *</label>
                  <textarea
                    value={editingProject.description}
                    onChange={(e) => setEditingProject(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Describe your project..."
                    rows={4}
                    className="w-full px-4 py-3 bg-gray-900 border border-gray-800 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-gray-600 resize-none"
                  />
                </div>

                <div>
                  <label className="block text-gray-400 text-sm font-medium mb-2">Technologies (comma-separated)</label>
                  <input
                    type="text"
                    value={editingProject.tech}
                    onChange={(e) => setEditingProject(prev => ({ ...prev, tech: e.target.value }))}
                    placeholder="React, Node.js, MongoDB..."
                    className="w-full px-4 py-3 bg-gray-900 border border-gray-800 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-gray-600"
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-gray-400 text-sm font-medium mb-2">Category</label>
                    <select
                      value={editingProject.category}
                      onChange={(e) => setEditingProject(prev => ({ ...prev, category: e.target.value }))}
                      className="w-full px-4 py-3 bg-gray-900 border border-gray-800 rounded-xl text-white focus:outline-none focus:border-gray-600"
                    >
                      {categories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-gray-400 text-sm font-medium mb-2">Year</label>
                    <input
                      type="text"
                      value={editingProject.year}
                      onChange={(e) => setEditingProject(prev => ({ ...prev, year: e.target.value }))}
                      placeholder="2024"
                      className="w-full px-4 py-3 bg-gray-900 border border-gray-800 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-gray-600"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-400 text-sm font-medium mb-2">Order</label>
                    <input
                      type="number"
                      value={editingProject.order}
                      onChange={(e) => setEditingProject(prev => ({ ...prev, order: e.target.value }))}
                      placeholder="0"
                      className="w-full px-4 py-3 bg-gray-900 border border-gray-800 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-gray-600"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-400 text-sm font-medium mb-2">GitHub URL</label>
                    <input
                      type="text"
                      value={editingProject.github}
                      onChange={(e) => setEditingProject(prev => ({ ...prev, github: e.target.value }))}
                      placeholder="https://github.com/..."
                      className="w-full px-4 py-3 bg-gray-900 border border-gray-800 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-gray-600"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-400 text-sm font-medium mb-2">Live Demo URL</label>
                    <input
                      type="text"
                      value={editingProject.live}
                      onChange={(e) => setEditingProject(prev => ({ ...prev, live: e.target.value }))}
                      placeholder="https://example.com"
                      className="w-full px-4 py-3 bg-gray-900 border border-gray-800 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-gray-600"
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-4 mt-8">
                <button
                  onClick={() => setShowForm(false)}
                  className="flex-1 px-6 py-3 rounded-xl font-medium border border-gray-700 text-gray-400 hover:text-white hover:border-gray-500 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleSaveProject(editingProject)}
                  disabled={saving || !editingProject.title || !editingProject.description}
                  className="flex-1 px-6 py-3 rounded-xl font-medium bg-white text-black hover:bg-gray-200 transition-all disabled:opacity-50"
                >
                  {saving ? 'Saving...' : editingProject.id ? 'Update Project' : 'Add Project'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Toast Notification */}
      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.isVisible}
        onClose={() => setToast({ ...toast, isVisible: false })}
      />
    </div>
  )
}

export default ProjectsSettings

