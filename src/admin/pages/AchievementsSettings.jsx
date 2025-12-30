import { useState, useEffect } from 'react'
import { collection, doc, getDocs, setDoc, deleteDoc, addDoc } from 'firebase/firestore'
import { db } from '../../firebase/config'

const AchievementsSettings = () => {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState('achievements')
  const [achievements, setAchievements] = useState([])
  const [certifications, setCertifications] = useState([])
  const [editingItem, setEditingItem] = useState(null)
  const [showForm, setShowForm] = useState(false)
  
  // Section header settings
  const [sectionSettings, setSectionSettings] = useState({
    sectionSubtitle: 'Recognition',
    sectionTitle: 'Achievements &',
    sectionTitleHighlight: 'Certifications'
  })

  const emptyAchievement = {
    type: 'achievement',
    title: '',
    organization: '',
    year: new Date().getFullYear().toString(),
    description: '',
    icon: '🏆',
    certificateImage: '',
    verifyLink: '',
    tags: [],
    order: 0
  }

  const emptyCertification = {
    type: 'certification',
    title: '',
    issuer: '',
    year: new Date().getFullYear().toString(),
    credentialId: '',
    description: '',
    icon: '📜',
    certificateImage: '',
    verifyLink: '',
    tags: [],
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
        if (doc.id === 'achievements') {
          setSectionSettings(prev => ({ ...prev, ...doc.data() }))
        }
      })

      // Fetch achievements
      const achSnapshot = await getDocs(collection(db, 'achievements'))
      const achData = achSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
      achData.sort((a, b) => (a.order || 0) - (b.order || 0))
      setAchievements(achData)

      // Fetch certifications
      const certSnapshot = await getDocs(collection(db, 'certifications'))
      const certData = certSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
      certData.sort((a, b) => (a.order || 0) - (b.order || 0))
      setCertifications(certData)
    } catch (error) {
    }
    setLoading(false)
  }

  const handleSaveSectionSettings = async () => {
    setSaving(true)
    try {
      await setDoc(doc(db, 'settings', 'achievements'), sectionSettings, { merge: true })
      alert('Section settings saved!')
    } catch (error) {
      alert('Failed to save settings.')
    }
    setSaving(false)
  }

  const handleSaveItem = async (item) => {
    setSaving(true)
    try {
      const collectionName = item.type === 'achievement' ? 'achievements' : 'certifications'
      
      // Convert tagsString to tags array if it exists, otherwise use existing tags
      let tagsArray = item.tags || []
      if (item.tagsString !== undefined) {
        tagsArray = item.tagsString.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0)
      }
      
      const itemData = {
        ...item,
        tags: tagsArray,
        order: parseInt(item.order) || 0,
        updatedAt: new Date().toISOString()
      }
      
      // Remove tagsString from the data before saving (it's just for UI)
      delete itemData.tagsString

      if (item.id) {
        await setDoc(doc(db, collectionName, item.id), itemData, { merge: true })
      } else {
        await addDoc(collection(db, collectionName), {
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
    if (!confirm(`Are you sure you want to delete "${item.title}"?`)) return
    
    try {
      const collectionName = item.type === 'achievement' ? 'achievements' : 'certifications'
      await deleteDoc(doc(db, collectionName, item.id))
      await fetchData()
    } catch (error) {
      alert('Failed to delete.')
    }
  }

  const getEmptyItem = () => {
    const currentItems = activeTab === 'achievements' ? achievements : certifications
    const maxOrder = currentItems.length > 0 
      ? Math.max(...currentItems.map(item => item.order || 0))
      : -1
    const emptyItem = activeTab === 'achievements' ? { ...emptyAchievement } : { ...emptyCertification }
    return { ...emptyItem, order: maxOrder + 1, tagsString: '' }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin" />
      </div>
    )
  }

  const currentItems = activeTab === 'achievements' ? achievements : certifications

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Achievements & Certifications</h1>
          <p className="text-gray-500">Manage your achievements and certifications.</p>
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
          Add {activeTab === 'achievements' ? 'Achievement' : 'Certification'}
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
              placeholder="Recognition"
              className="w-full px-4 py-3 bg-gray-900 border border-gray-800 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-gray-600"
            />
          </div>
          <div>
            <label className="block text-gray-400 text-sm font-medium mb-2">Title</label>
            <input
              type="text"
              value={sectionSettings.sectionTitle}
              onChange={(e) => setSectionSettings(prev => ({ ...prev, sectionTitle: e.target.value }))}
              placeholder="Achievements &"
              className="w-full px-4 py-3 bg-gray-900 border border-gray-800 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-gray-600"
            />
          </div>
          <div>
            <label className="block text-gray-400 text-sm font-medium mb-2">Title Highlight</label>
            <input
              type="text"
              value={sectionSettings.sectionTitleHighlight}
              onChange={(e) => setSectionSettings(prev => ({ ...prev, sectionTitleHighlight: e.target.value }))}
              placeholder="Certifications"
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

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setActiveTab('achievements')}
          className={`px-6 py-3 rounded-xl font-medium transition-all flex items-center gap-2 ${
            activeTab === 'achievements'
              ? 'bg-white text-black'
              : 'bg-gray-900 text-gray-400 hover:text-white border border-gray-800'
          }`}
        >
          🏆 Achievements ({achievements.length})
        </button>
        <button
          onClick={() => setActiveTab('certifications')}
          className={`px-6 py-3 rounded-xl font-medium transition-all flex items-center gap-2 ${
            activeTab === 'certifications'
              ? 'bg-white text-black'
              : 'bg-gray-900 text-gray-400 hover:text-white border border-gray-800'
          }`}
        >
          📜 Certifications ({certifications.length})
        </button>
      </div>

      {/* Items List */}
      <div className="space-y-4">
        {currentItems.length === 0 ? (
          <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-12 text-center">
            <div className="w-16 h-16 rounded-2xl bg-gray-800 flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">{activeTab === 'achievements' ? '🏆' : '📜'}</span>
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">
              No {activeTab === 'achievements' ? 'Achievements' : 'Certifications'} Yet
            </h3>
            <p className="text-gray-500 mb-4">Add your first {activeTab === 'achievements' ? 'achievement' : 'certification'}.</p>
            <button
              onClick={() => {
                setEditingItem(getEmptyItem())
                setShowForm(true)
              }}
              className="px-6 py-3 rounded-xl font-medium bg-white text-black hover:bg-gray-200 transition-all"
            >
              Add First {activeTab === 'achievements' ? 'Achievement' : 'Certification'}
            </button>
          </div>
        ) : (
          currentItems.map((item) => (
            <div
              key={item.id}
              className="bg-gray-900/50 border border-gray-800 rounded-2xl p-6 flex items-start gap-6"
            >
              {/* Icon */}
              <div className="w-14 h-14 rounded-xl bg-gray-800 flex items-center justify-center text-2xl flex-shrink-0">
                {item.icon}
              </div>
              
              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-1">
                  <h3 className="text-lg font-semibold text-white">{item.title}</h3>
                  <span className="text-xs text-gray-500">{item.year}</span>
                </div>
                <p className="text-gray-400 text-sm mb-2">
                  {item.organization || item.issuer}
                  {item.credentialId && <span className="text-gray-600 ml-2">• {item.credentialId}</span>}
                </p>
                <p className="text-gray-500 text-sm line-clamp-2">{item.description}</p>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  onClick={() => {
                    const itemWithTagsString = {
                      ...item,
                      tagsString: Array.isArray(item.tags) ? item.tags.join(', ') : ''
                    }
                    setEditingItem(itemWithTagsString)
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
                {editingItem.id ? 'Edit' : 'Add'} {editingItem.type === 'achievement' ? 'Achievement' : 'Certification'}
              </h2>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-400 text-sm font-medium mb-2">Title *</label>
                    <input
                      type="text"
                      value={editingItem.title}
                      onChange={(e) => setEditingItem(prev => ({ ...prev, title: e.target.value }))}
                      placeholder={editingItem.type === 'achievement' ? 'Best Developer Award' : 'AWS Certified Developer'}
                      className="w-full px-4 py-3 bg-gray-900 border border-gray-800 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-gray-600"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-400 text-sm font-medium mb-2">Icon (Emoji)</label>
                    <input
                      type="text"
                      value={editingItem.icon}
                      onChange={(e) => setEditingItem(prev => ({ ...prev, icon: e.target.value }))}
                      placeholder="🏆"
                      className="w-full px-4 py-3 bg-gray-900 border border-gray-800 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-gray-600"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-400 text-sm font-medium mb-2">
                      {editingItem.type === 'achievement' ? 'Organization *' : 'Issuer *'}
                    </label>
                    <input
                      type="text"
                      value={editingItem.type === 'achievement' ? editingItem.organization : editingItem.issuer}
                      onChange={(e) => setEditingItem(prev => ({ 
                        ...prev, 
                        [editingItem.type === 'achievement' ? 'organization' : 'issuer']: e.target.value 
                      }))}
                      placeholder={editingItem.type === 'achievement' ? 'Company/Event Name' : 'Certifying Authority'}
                      className="w-full px-4 py-3 bg-gray-900 border border-gray-800 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-gray-600"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-400 text-sm font-medium mb-2">Year *</label>
                    <input
                      type="text"
                      value={editingItem.year}
                      onChange={(e) => setEditingItem(prev => ({ ...prev, year: e.target.value }))}
                      placeholder="2024"
                      className="w-full px-4 py-3 bg-gray-900 border border-gray-800 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-gray-600"
                    />
                  </div>
                </div>

                {editingItem.type === 'certification' && (
                  <div>
                    <label className="block text-gray-400 text-sm font-medium mb-2">Credential ID</label>
                    <input
                      type="text"
                      value={editingItem.credentialId}
                      onChange={(e) => setEditingItem(prev => ({ ...prev, credentialId: e.target.value }))}
                      placeholder="AWS-DEV-2024"
                      className="w-full px-4 py-3 bg-gray-900 border border-gray-800 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-gray-600"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-gray-400 text-sm font-medium mb-2">Description *</label>
                  <textarea
                    value={editingItem.description}
                    onChange={(e) => setEditingItem(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Describe this achievement or certification..."
                    rows={4}
                    className="w-full px-4 py-3 bg-gray-900 border border-gray-800 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-gray-600 resize-none"
                  />
                </div>

                <div>
                  <label className="block text-gray-400 text-sm font-medium mb-2">Tags (comma-separated)</label>
                  <input
                    type="text"
                    value={editingItem.tagsString !== undefined ? editingItem.tagsString : (Array.isArray(editingItem.tags) ? editingItem.tags.join(', ') : '')}
                    onChange={(e) => {
                      setEditingItem(prev => ({ ...prev, tagsString: e.target.value }))
                    }}
                    placeholder="React, JavaScript, AWS, etc."
                    className="w-full px-4 py-3 bg-gray-900 border border-gray-800 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-gray-600"
                  />
                  <p className="text-gray-600 text-xs mt-1">Separate tags with commas</p>
                </div>

                <div>
                  <label className="block text-gray-400 text-sm font-medium mb-2">Certificate Image URL</label>
                  <input
                    type="text"
                    value={editingItem.certificateImage}
                    onChange={(e) => setEditingItem(prev => ({ ...prev, certificateImage: e.target.value }))}
                    placeholder="https://example.com/certificate.jpg"
                    className="w-full px-4 py-3 bg-gray-900 border border-gray-800 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-gray-600"
                  />
                </div>

                <div>
                  <label className="block text-gray-400 text-sm font-medium mb-2">Verification Link</label>
                  <input
                    type="text"
                    value={editingItem.verifyLink}
                    onChange={(e) => setEditingItem(prev => ({ ...prev, verifyLink: e.target.value }))}
                    placeholder="https://verify.example.com/..."
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
                  <p className="text-gray-600 text-xs mt-1">Lower number = shows first</p>
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
                  disabled={saving || !editingItem.title || !editingItem.description}
                  className="flex-1 px-6 py-3 rounded-xl font-medium bg-white text-black hover:bg-gray-200 transition-all disabled:opacity-50"
                >
                  {saving ? 'Saving...' : editingItem.id ? 'Update' : 'Add'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AchievementsSettings

