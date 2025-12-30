import { useState, useEffect } from 'react'
import { collection, doc, getDocs, setDoc, deleteDoc, addDoc } from 'firebase/firestore'
import { db } from '../../firebase/config'
import Toast from '../../components/Toast'
import { useToast } from '../../hooks/useToast'

const LanguagesSettings = () => {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const { toast, showToast, hideToast } = useToast()

  // Section settings
  const [sectionSettings, setSectionSettings] = useState({
    sectionSubtitle: 'Communication',
    sectionTitle: 'Languages I',
    sectionTitleHighlight: 'Speak',
    sectionDescription: 'Languages I am proficient in'
  })

  // Languages list
  const [languages, setLanguages] = useState([])

  // Form states
  const [editingItem, setEditingItem] = useState(null)
  const [showForm, setShowForm] = useState(false)

  const emptyLanguage = {
    name: '',
    character: '',
    proficiency: '',
    order: 0
  }

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      // Fetch section settings
      const settingsDoc = await getDocs(collection(db, 'settings'))
      const settingsData = settingsDoc.docs.find(d => d.id === 'languages')
      if (settingsData) {
        setSectionSettings(prev => ({ ...prev, ...settingsData.data() }))
      }

      // Fetch languages
      const languagesSnapshot = await getDocs(collection(db, 'languages'))
      setLanguages(languagesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })))

      setLoading(false)
    } catch (error) {
      setLoading(false)
    }
  }

  const handleSaveSectionSettings = async () => {
    setSaving(true)
    try {
      await setDoc(doc(db, 'settings', 'languages'), sectionSettings, { merge: true })
      showToast('Section settings saved successfully!', 'success')
    } catch (error) {
      showToast('Failed to save settings. Please try again.', 'error')
    }
    setSaving(false)
  }

  const handleSaveItem = async (item) => {
    setSaving(true)
    try {
      const itemData = {
        ...item,
        order: parseInt(item.order) || 0,
        updatedAt: new Date().toISOString()
      }

      if (item.id) {
        await setDoc(doc(db, 'languages', item.id), itemData, { merge: true })
      } else {
        await addDoc(collection(db, 'languages'), {
          ...itemData,
          createdAt: new Date().toISOString()
        })
      }

      await fetchData()
      setEditingItem(null)
      setShowForm(false)
      showToast(item.id ? 'Language updated successfully!' : 'Language added successfully!', 'success')
    } catch (error) {
      showToast('Failed to save language. Please try again.', 'error')
    }
    setSaving(false)
  }

  const handleDeleteItem = async (itemId) => {
    if (!confirm('Are you sure you want to delete this language?')) return

    try {
      await deleteDoc(doc(db, 'languages', itemId))
      await fetchData()
      showToast('Language deleted successfully!', 'success')
    } catch (error) {
      showToast('Failed to delete language. Please try again.', 'error')
    }
  }

  const getEmptyLanguage = () => {
    const maxOrder = languages.length > 0 
      ? Math.max(...languages.map(l => l.order || 0))
      : -1
    return { ...emptyLanguage, order: maxOrder + 1 }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Section Settings */}
      <div className="bg-gray-900 rounded-2xl p-6 mb-6">
        <h2 className="text-xl font-semibold text-white mb-4">Section Header Settings</h2>
        <div className="grid md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-gray-400 text-sm font-medium mb-2">Subtitle</label>
            <input
              type="text"
              value={sectionSettings.sectionSubtitle}
              onChange={(e) => setSectionSettings(prev => ({ ...prev, sectionSubtitle: e.target.value }))}
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-gray-600"
            />
          </div>
          <div>
            <label className="block text-gray-400 text-sm font-medium mb-2">Title</label>
            <input
              type="text"
              value={sectionSettings.sectionTitle}
              onChange={(e) => setSectionSettings(prev => ({ ...prev, sectionTitle: e.target.value }))}
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-gray-600"
            />
          </div>
          <div>
            <label className="block text-gray-400 text-sm font-medium mb-2">Title Highlight</label>
            <input
              type="text"
              value={sectionSettings.sectionTitleHighlight}
              onChange={(e) => setSectionSettings(prev => ({ ...prev, sectionTitleHighlight: e.target.value }))}
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-gray-600"
            />
          </div>
          <div>
            <label className="block text-gray-400 text-sm font-medium mb-2">Description</label>
            <input
              type="text"
              value={sectionSettings.sectionDescription}
              onChange={(e) => setSectionSettings(prev => ({ ...prev, sectionDescription: e.target.value }))}
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-gray-600"
            />
          </div>
        </div>
        <button
          onClick={handleSaveSectionSettings}
          disabled={saving}
          className="px-6 py-3 rounded-xl font-medium bg-white text-black hover:bg-gray-200 transition-all disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Save Settings'}
        </button>
      </div>

      {/* Languages List */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {languages
          .sort((a, b) => (a.order || 0) - (b.order || 0))
          .map((language) => (
            <div
              key={language.id}
              className="bg-gray-900 rounded-xl p-4 border border-gray-800 hover:border-gray-700 transition-all"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div className="text-3xl font-bold">{language.character || language.name?.charAt(0)?.toUpperCase() || '?'}</div>
                  <div>
                    <h4 className="font-semibold text-white text-sm">{language.name}</h4>
                    {language.proficiency && (
                      <p className="text-gray-500 text-xs">{language.proficiency}</p>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setEditingItem(language)
                      setShowForm(true)
                    }}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => handleDeleteItem(language.id)}
                    className="text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))}
      </div>

      {/* Add Button */}
      <button
        onClick={() => {
          setEditingItem(getEmptyLanguage())
          setShowForm(true)
        }}
        className="w-full py-4 border-2 border-dashed border-gray-700 rounded-xl text-gray-400 hover:text-white hover:border-gray-600 transition-all flex items-center justify-center gap-2"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
        Add Language
      </button>

      {/* Form Modal */}
      {showForm && editingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-gray-900 rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-white">
                {editingItem.id ? 'Edit' : 'Add'} Language
              </h3>
              <button
                onClick={() => {
                  setShowForm(false)
                  setEditingItem(null)
                }}
                className="text-gray-400 hover:text-white"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-gray-400 text-sm font-medium mb-2">Language Name *</label>
                <input
                  type="text"
                  value={editingItem.name || ''}
                  onChange={(e) => setEditingItem(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-gray-600"
                  placeholder="English"
                />
              </div>

              <div>
                <label className="block text-gray-400 text-sm font-medium mb-2">Character *</label>
                <input
                  type="text"
                  value={editingItem.character || ''}
                  onChange={(e) => setEditingItem(prev => ({ ...prev, character: e.target.value }))}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-gray-600 text-2xl"
                  placeholder="A"
                />
                <p className="text-gray-600 text-xs mt-1">Character to display (e.g., A for English, क for Hindi, ਕ for Punjabi)</p>
              </div>

              <div>
                <label className="block text-gray-400 text-sm font-medium mb-2">Proficiency Level (Optional)</label>
                <select
                  value={editingItem.proficiency || ''}
                  onChange={(e) => setEditingItem(prev => ({ ...prev, proficiency: e.target.value }))}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white focus:outline-none focus:border-gray-600"
                >
                  <option value="">Select proficiency level</option>
                  <option value="Native">Native</option>
                  <option value="Fluent">Fluent</option>
                  <option value="Advanced">Advanced</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Basic">Basic</option>
                  <option value="Beginner">Beginner</option>
                </select>
              </div>

              <div>
                <label className="block text-gray-400 text-sm font-medium mb-2">Order</label>
                <input
                  type="number"
                  value={editingItem.order || 0}
                  onChange={(e) => setEditingItem(prev => ({ ...prev, order: parseInt(e.target.value) || 0 }))}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-gray-600"
                  placeholder="0"
                />
              </div>

              <div className="flex gap-4 mt-8">
                <button
                  onClick={() => {
                    setShowForm(false)
                    setEditingItem(null)
                  }}
                  className="flex-1 px-6 py-3 rounded-xl font-medium border border-gray-700 text-gray-400 hover:text-white hover:border-gray-500 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleSaveItem(editingItem)}
                  disabled={saving || !editingItem.name || !editingItem.character}
                  className="flex-1 px-6 py-3 rounded-xl font-medium bg-white text-black hover:bg-gray-200 transition-all disabled:opacity-50"
                >
                  {saving ? 'Saving...' : editingItem.id ? 'Update' : 'Add'}
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
        onClose={hideToast}
      />
    </div>
  )
}

export default LanguagesSettings

