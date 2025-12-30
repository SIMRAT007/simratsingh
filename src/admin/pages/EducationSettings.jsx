import { useState, useEffect } from 'react'
import { collection, doc, getDocs, setDoc, deleteDoc, addDoc } from 'firebase/firestore'
import { db } from '../../firebase/config'

const EducationSettings = () => {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [educationList, setEducationList] = useState([])
  const [editingItem, setEditingItem] = useState(null)
  const [showForm, setShowForm] = useState(false)
  
  // Section header settings
  const [sectionSettings, setSectionSettings] = useState({
    sectionSubtitle: 'Academic Background',
    sectionTitle: 'My',
    sectionTitleHighlight: 'Education',
    bottomNote: 'Continuous learner committed to staying updated with the latest technologies'
  })

  const emptyEducation = {
    degree: '',
    field: '',
    institution: '',
    institutionLogo: '',
    location: '',
    duration: '',
    description: '',
    highlights: '',
    order: 0
  }

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      // Fetch section settings
      const settingsDoc = await getDocs(collection(db, 'settings'))
      settingsDoc.forEach(doc => {
        if (doc.id === 'education') {
          setSectionSettings(prev => ({ ...prev, ...doc.data() }))
        }
      })

      // Fetch education entries
      const snapshot = await getDocs(collection(db, 'education'))
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
      data.sort((a, b) => (a.order || 0) - (b.order || 0))
      setEducationList(data)
    } catch (error) {
    }
    setLoading(false)
  }

  const handleSaveSectionSettings = async () => {
    setSaving(true)
    try {
      await setDoc(doc(db, 'settings', 'education'), sectionSettings, { merge: true })
      alert('Section settings saved!')
    } catch (error) {
      alert('Failed to save settings.')
    }
    setSaving(false)
  }

  const handleSaveItem = async (item) => {
    setSaving(true)
    try {
      const itemData = {
        ...item,
        highlights: typeof item.highlights === 'string' 
          ? item.highlights.split(',').map(h => h.trim()).filter(Boolean)
          : item.highlights,
        order: parseInt(item.order) || 0,
        updatedAt: new Date().toISOString()
      }

      if (item.id) {
        await setDoc(doc(db, 'education', item.id), itemData, { merge: true })
      } else {
        await addDoc(collection(db, 'education'), {
          ...itemData,
          createdAt: new Date().toISOString()
        })
      }
      
      await fetchData()
      setEditingItem(null)
      setShowForm(false)
    } catch (error) {
      alert('Failed to save.')
    }
    setSaving(false)
  }

  const handleDeleteItem = async (item) => {
    if (!confirm(`Are you sure you want to delete "${item.degree}"?`)) return
    
    try {
      await deleteDoc(doc(db, 'education', item.id))
      await fetchData()
    } catch (error) {
      alert('Failed to delete.')
    }
  }

  const getEmptyItem = () => {
    // Auto-increment order from existing items
    const maxOrder = educationList.length > 0 
      ? Math.max(...educationList.map(e => e.order || 0))
      : -1
    return { ...emptyEducation, order: maxOrder + 1 }
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
          <h1 className="text-3xl font-bold text-white mb-2">Education</h1>
          <p className="text-gray-500">Manage your educational background.</p>
        </div>
        <button
          onClick={() => {
            setEditingItem(getEmptyItem())
            setShowForm(true)
          }}
          className="px-6 py-3 rounded-xl font-medium bg-white text-black hover:bg-gray-200 transition-all flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Education
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
              placeholder="Academic Background"
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
              placeholder="Education"
              className="w-full px-4 py-3 bg-gray-900 border border-gray-800 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-gray-600"
            />
          </div>
        </div>
        <div>
          <label className="block text-gray-400 text-sm font-medium mb-2">Bottom Note</label>
          <input
            type="text"
            value={sectionSettings.bottomNote}
            onChange={(e) => setSectionSettings(prev => ({ ...prev, bottomNote: e.target.value }))}
            placeholder="Continuous learner..."
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

      {/* Education List */}
      <div className="space-y-4">
        {educationList.length === 0 ? (
          <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-12 text-center">
            <div className="w-16 h-16 rounded-2xl bg-gray-800 flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">🎓</span>
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">No Education Added</h3>
            <p className="text-gray-500 mb-4">Add your educational background.</p>
            <button
              onClick={() => {
                setEditingItem(getEmptyItem())
                setShowForm(true)
              }}
              className="px-6 py-3 rounded-xl font-medium bg-white text-black hover:bg-gray-200 transition-all"
            >
              Add First Education
            </button>
          </div>
        ) : (
          educationList.map((item) => (
            <div
              key={item.id}
              className="bg-gray-900/50 border border-gray-800 rounded-2xl p-6 flex items-start gap-6"
            >
              {/* Logo */}
              <div className="w-14 h-14 rounded-xl bg-gray-800 flex items-center justify-center overflow-hidden flex-shrink-0">
                {item.institutionLogo ? (
                  <img src={item.institutionLogo} alt={item.institution} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-2xl">🎓</span>
                )}
              </div>
              
              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-1">
                  <h3 className="text-lg font-semibold text-white">{item.degree}</h3>
                  <span className="text-xs text-gray-500">{item.duration}</span>
                </div>
                <p className="text-gray-400 text-sm mb-1">{item.field}</p>
                <p className="text-gray-500 text-sm mb-2">{item.institution} • {item.location}</p>
                <div className="flex flex-wrap gap-2">
                  {(Array.isArray(item.highlights) ? item.highlights : []).slice(0, 4).map((h, i) => (
                    <span key={i} className="px-2 py-1 text-xs bg-gray-800 text-gray-400 rounded">
                      {h}
                    </span>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  onClick={() => {
                    setEditingItem({
                      ...item,
                      highlights: Array.isArray(item.highlights) ? item.highlights.join(', ') : item.highlights
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
                  onClick={() => handleDeleteItem(item)}
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

      {/* Form Modal */}
      {showForm && editingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setShowForm(false)} />
          <div className="relative bg-gray-950 border border-gray-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-xl font-semibold text-white mb-6">
                {editingItem.id ? 'Edit Education' : 'Add New Education'}
              </h2>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-400 text-sm font-medium mb-2">Degree / Level *</label>
                    <input
                      type="text"
                      value={editingItem.degree}
                      onChange={(e) => setEditingItem(prev => ({ ...prev, degree: e.target.value }))}
                      placeholder="Bachelor of Technology"
                      className="w-full px-4 py-3 bg-gray-900 border border-gray-800 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-gray-600"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-400 text-sm font-medium mb-2">Field of Study *</label>
                    <input
                      type="text"
                      value={editingItem.field}
                      onChange={(e) => setEditingItem(prev => ({ ...prev, field: e.target.value }))}
                      placeholder="Computer Science"
                      className="w-full px-4 py-3 bg-gray-900 border border-gray-800 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-gray-600"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-400 text-sm font-medium mb-2">Institution *</label>
                    <input
                      type="text"
                      value={editingItem.institution}
                      onChange={(e) => setEditingItem(prev => ({ ...prev, institution: e.target.value }))}
                      placeholder="University Name"
                      className="w-full px-4 py-3 bg-gray-900 border border-gray-800 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-gray-600"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-400 text-sm font-medium mb-2">Duration *</label>
                    <input
                      type="text"
                      value={editingItem.duration}
                      onChange={(e) => setEditingItem(prev => ({ ...prev, duration: e.target.value }))}
                      placeholder="2016 - 2020"
                      className="w-full px-4 py-3 bg-gray-900 border border-gray-800 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-gray-600"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-400 text-sm font-medium mb-2">Location</label>
                    <input
                      type="text"
                      value={editingItem.location}
                      onChange={(e) => setEditingItem(prev => ({ ...prev, location: e.target.value }))}
                      placeholder="City, Country"
                      className="w-full px-4 py-3 bg-gray-900 border border-gray-800 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-gray-600"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-400 text-sm font-medium mb-2">Institution Logo URL</label>
                    <input
                      type="text"
                      value={editingItem.institutionLogo}
                      onChange={(e) => setEditingItem(prev => ({ ...prev, institutionLogo: e.target.value }))}
                      placeholder="https://example.com/logo.png"
                      className="w-full px-4 py-3 bg-gray-900 border border-gray-800 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-gray-600"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-gray-400 text-sm font-medium mb-2">Description</label>
                  <textarea
                    value={editingItem.description}
                    onChange={(e) => setEditingItem(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Describe your studies, achievements..."
                    rows={3}
                    className="w-full px-4 py-3 bg-gray-900 border border-gray-800 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-gray-600 resize-none"
                  />
                </div>

                <div>
                  <label className="block text-gray-400 text-sm font-medium mb-2">Highlights (comma-separated)</label>
                  <input
                    type="text"
                    value={editingItem.highlights}
                    onChange={(e) => setEditingItem(prev => ({ ...prev, highlights: e.target.value }))}
                    placeholder="Data Structures, Algorithms, Web Development..."
                    className="w-full px-4 py-3 bg-gray-900 border border-gray-800 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-gray-600"
                  />
                </div>

                <div>
                  <label className="block text-gray-400 text-sm font-medium mb-2">Order</label>
                  <input
                    type="number"
                    value={editingItem.order}
                    onChange={(e) => setEditingItem(prev => ({ ...prev, order: e.target.value }))}
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
                  onClick={() => handleSaveItem(editingItem)}
                  disabled={saving || !editingItem.degree || !editingItem.institution}
                  className="flex-1 px-6 py-3 rounded-xl font-medium bg-white text-black hover:bg-gray-200 transition-all disabled:opacity-50"
                >
                  {saving ? 'Saving...' : editingItem.id ? 'Update' : 'Add Education'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default EducationSettings

