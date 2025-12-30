import { useState, useEffect } from 'react'
import { collection, doc, getDocs, setDoc, deleteDoc, addDoc } from 'firebase/firestore'
import { db } from '../../firebase/config'
import Toast from '../../components/Toast'

const ExperienceSettings = () => {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [experiences, setExperiences] = useState([])
  const [editingExp, setEditingExp] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [toast, setToast] = useState({ message: '', type: 'success', isVisible: false })
  
  // Section header settings
  const [sectionSettings, setSectionSettings] = useState({
    sectionSubtitle: 'Career Path',
    sectionTitle: 'Work',
    sectionTitleHighlight: 'Experience',
    ctaText: 'Open to new opportunities and exciting challenges'
  })

  const emptyExperience = {
    role: '',
    company: '',
    companyLogo: '',
    duration: '',
    location: '',
    description: '',
    technologies: '',
    order: 0
  }

  useEffect(() => {
    fetchExperiences()
  }, [])

  const fetchExperiences = async () => {
    try {
      // Fetch section settings
      const settingsDoc = await getDocs(collection(db, 'settings'))
      settingsDoc.forEach(doc => {
        if (doc.id === 'experience') {
          setSectionSettings(prev => ({ ...prev, ...doc.data() }))
        }
      })

      // Fetch experiences
      const querySnapshot = await getDocs(collection(db, 'experience'))
      const expData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      // Sort by order
      expData.sort((a, b) => (a.order || 0) - (b.order || 0))
      setExperiences(expData)
    } catch (error) {
    }
    setLoading(false)
  }

  const handleSaveSectionSettings = async () => {
    setSaving(true)
    try {
      await setDoc(doc(db, 'settings', 'experience'), sectionSettings, { merge: true })
      setToast({ message: 'Section settings saved successfully!', type: 'success', isVisible: true })
    } catch (error) {
      setToast({ message: 'Failed to save settings. Please try again.', type: 'error', isVisible: true })
    }
    setSaving(false)
  }

  const handleSaveExperience = async (experience) => {
    setSaving(true)
    try {
      const expData = {
        ...experience,
        technologies: typeof experience.technologies === 'string' 
          ? experience.technologies.split(',').map(t => t.trim()).filter(Boolean)
          : experience.technologies,
        order: parseInt(experience.order) || 0,
        updatedAt: new Date().toISOString()
      }

      if (experience.id) {
        await setDoc(doc(db, 'experience', experience.id), expData, { merge: true })
      } else {
        await addDoc(collection(db, 'experience'), {
          ...expData,
          createdAt: new Date().toISOString()
        })
      }
      
      await fetchExperiences()
      setEditingExp(null)
      setShowForm(false)
      setToast({ message: experience.id ? 'Experience updated successfully!' : 'Experience added successfully!', type: 'success', isVisible: true })
    } catch (error) {
      setToast({ message: 'Failed to save experience. Please try again.', type: 'error', isVisible: true })
    }
    setSaving(false)
  }

  const handleDeleteExperience = async (expId) => {
    if (!confirm('Are you sure you want to delete this experience?')) return
    
    try {
      await deleteDoc(doc(db, 'experience', expId))
      await fetchExperiences()
    } catch (error) {
      alert('Failed to delete experience.')
    }
  }

  const getEmptyExperience = () => {
    const maxOrder = experiences.length > 0 
      ? Math.max(...experiences.map(e => e.order || 0))
      : -1
    return { ...emptyExperience, order: maxOrder + 1 }
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
          <h1 className="text-3xl font-bold text-white mb-2">Work Experience</h1>
          <p className="text-gray-500">Manage your career history.</p>
        </div>
        <button
          onClick={() => {
            setEditingExp(getEmptyExperience())
            setShowForm(true)
          }}
          className="px-6 py-3 rounded-xl font-medium bg-white text-black hover:bg-gray-200 transition-all flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Experience
        </button>
      </div>

      {/* Section Header Settings */}
      <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-6 mb-6">
        <h2 className="text-lg font-semibold text-white mb-4">Section Header</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-gray-400 text-sm font-medium mb-2">Subtitle</label>
            <input
              type="text"
              value={sectionSettings.sectionSubtitle}
              onChange={(e) => setSectionSettings(prev => ({ ...prev, sectionSubtitle: e.target.value }))}
              placeholder="Career Path"
              className="w-full px-4 py-3 bg-gray-900 border border-gray-800 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-gray-600"
            />
          </div>
          <div>
            <label className="block text-gray-400 text-sm font-medium mb-2">Title</label>
            <input
              type="text"
              value={sectionSettings.sectionTitle}
              onChange={(e) => setSectionSettings(prev => ({ ...prev, sectionTitle: e.target.value }))}
              placeholder="Work"
              className="w-full px-4 py-3 bg-gray-900 border border-gray-800 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-gray-600"
            />
          </div>
          <div>
            <label className="block text-gray-400 text-sm font-medium mb-2">Title Highlight</label>
            <input
              type="text"
              value={sectionSettings.sectionTitleHighlight}
              onChange={(e) => setSectionSettings(prev => ({ ...prev, sectionTitleHighlight: e.target.value }))}
              placeholder="Experience"
              className="w-full px-4 py-3 bg-gray-900 border border-gray-800 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-gray-600"
            />
          </div>
        </div>
        <div>
          <label className="block text-gray-400 text-sm font-medium mb-2">CTA Text</label>
          <input
            type="text"
            value={sectionSettings.ctaText}
            onChange={(e) => setSectionSettings(prev => ({ ...prev, ctaText: e.target.value }))}
            placeholder="Open to new opportunities..."
            className="w-full px-4 py-3 bg-gray-900 border border-gray-800 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-gray-600"
          />
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

      {/* Experience List */}
      <div className="space-y-4">
        {experiences.length === 0 ? (
          <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-12 text-center">
            <div className="w-16 h-16 rounded-2xl bg-gray-800 flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">💼</span>
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">No Experience Added</h3>
            <p className="text-gray-500 mb-4">Add your work experience to showcase your career journey.</p>
            <button
              onClick={() => {
                setEditingExp(getEmptyExperience())
                setShowForm(true)
              }}
              className="px-6 py-3 rounded-xl font-medium bg-white text-black hover:bg-gray-200 transition-all"
            >
              Add Your First Experience
            </button>
          </div>
        ) : (
          experiences.map((exp) => (
            <div
              key={exp.id}
              className="bg-gray-900/50 border border-gray-800 rounded-2xl p-6 flex items-start gap-6"
            >
              {/* Company Logo */}
              <div className="w-14 h-14 rounded-xl bg-gray-800 flex items-center justify-center overflow-hidden flex-shrink-0">
                {exp.companyLogo ? (
                  <img src={exp.companyLogo} alt={exp.company} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-lg font-bold text-gray-400">
                    {exp.company?.substring(0, 2).toUpperCase() || '??'}
                  </span>
                )}
              </div>
              
              {/* Experience Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-1">
                  <h3 className="text-lg font-semibold text-white">{exp.role}</h3>
                  <span className="text-xs text-gray-500">{exp.duration}</span>
                </div>
                <p className="text-gray-400 text-sm mb-2">{exp.company} • {exp.location}</p>
                <p className="text-gray-500 text-sm mb-3 line-clamp-2">{exp.description}</p>
                <div className="flex flex-wrap gap-2">
                  {(Array.isArray(exp.technologies) ? exp.technologies : []).slice(0, 5).map((tech, i) => (
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
                    setEditingExp({
                      ...exp,
                      technologies: Array.isArray(exp.technologies) ? exp.technologies.join(', ') : exp.technologies
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
                  onClick={() => handleDeleteExperience(exp.id)}
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

      {/* Experience Form Modal */}
      {showForm && editingExp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setShowForm(false)} />
          <div className="relative bg-gray-950 border border-gray-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-xl font-semibold text-white mb-6">
                {editingExp.id ? 'Edit Experience' : 'Add New Experience'}
              </h2>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-400 text-sm font-medium mb-2">Job Title / Role *</label>
                    <input
                      type="text"
                      value={editingExp.role}
                      onChange={(e) => setEditingExp(prev => ({ ...prev, role: e.target.value }))}
                      placeholder="Senior Developer"
                      className="w-full px-4 py-3 bg-gray-900 border border-gray-800 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-gray-600"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-400 text-sm font-medium mb-2">Company *</label>
                    <input
                      type="text"
                      value={editingExp.company}
                      onChange={(e) => setEditingExp(prev => ({ ...prev, company: e.target.value }))}
                      placeholder="Company Name"
                      className="w-full px-4 py-3 bg-gray-900 border border-gray-800 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-gray-600"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-gray-400 text-sm font-medium mb-2">Company Logo URL</label>
                  <input
                    type="text"
                    value={editingExp.companyLogo}
                    onChange={(e) => setEditingExp(prev => ({ ...prev, companyLogo: e.target.value }))}
                    placeholder="https://example.com/logo.png"
                    className="w-full px-4 py-3 bg-gray-900 border border-gray-800 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-gray-600"
                  />
                  <p className="text-gray-600 text-xs mt-1">Leave empty to show company initials</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-400 text-sm font-medium mb-2">Duration *</label>
                    <input
                      type="text"
                      value={editingExp.duration}
                      onChange={(e) => setEditingExp(prev => ({ ...prev, duration: e.target.value }))}
                      placeholder="2023 - Present"
                      className="w-full px-4 py-3 bg-gray-900 border border-gray-800 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-gray-600"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-400 text-sm font-medium mb-2">Location</label>
                    <input
                      type="text"
                      value={editingExp.location}
                      onChange={(e) => setEditingExp(prev => ({ ...prev, location: e.target.value }))}
                      placeholder="Remote / City, Country"
                      className="w-full px-4 py-3 bg-gray-900 border border-gray-800 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-gray-600"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-gray-400 text-sm font-medium mb-2">Description *</label>
                  <textarea
                    value={editingExp.description}
                    onChange={(e) => setEditingExp(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Describe your role and achievements..."
                    rows={4}
                    className="w-full px-4 py-3 bg-gray-900 border border-gray-800 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-gray-600 resize-none"
                  />
                </div>

                <div>
                  <label className="block text-gray-400 text-sm font-medium mb-2">Technologies (comma-separated)</label>
                  <input
                    type="text"
                    value={editingExp.technologies}
                    onChange={(e) => setEditingExp(prev => ({ ...prev, technologies: e.target.value }))}
                    placeholder="React, Node.js, MongoDB..."
                    className="w-full px-4 py-3 bg-gray-900 border border-gray-800 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-gray-600"
                  />
                </div>

                <div>
                  <label className="block text-gray-400 text-sm font-medium mb-2">Order</label>
                  <input
                    type="number"
                    value={editingExp.order}
                    onChange={(e) => setEditingExp(prev => ({ ...prev, order: e.target.value }))}
                    placeholder="0"
                    className="w-full px-4 py-3 bg-gray-900 border border-gray-800 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-gray-600"
                  />
                  <p className="text-gray-600 text-xs mt-1">Lower number = shows first (0 = most recent)</p>
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
                  onClick={() => handleSaveExperience(editingExp)}
                  disabled={saving || !editingExp.role || !editingExp.company || !editingExp.duration}
                  className="flex-1 px-6 py-3 rounded-xl font-medium bg-white text-black hover:bg-gray-200 transition-all disabled:opacity-50"
                >
                  {saving ? 'Saving...' : editingExp.id ? 'Update' : 'Add Experience'}
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

export default ExperienceSettings

