import { useState, useEffect } from 'react'
import { collection, doc, getDocs, setDoc, deleteDoc, addDoc } from 'firebase/firestore'
import { db } from '../../firebase/config'
import Toast from '../../components/Toast'
import { useToast } from '../../hooks/useToast'

const OrganizationsSettings = () => {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const { toast, showToast, hideToast } = useToast()

  // Section settings
  const [sectionSettings, setSectionSettings] = useState({
    sectionSubtitle: 'Affiliations',
    sectionTitle: 'Organizations &',
    sectionTitleHighlight: 'Associations',
    sectionDescription: 'Organizations I am associated with'
  })

  // Organizations list
  const [organizations, setOrganizations] = useState([])

  // Form states
  const [editingItem, setEditingItem] = useState(null)
  const [showForm, setShowForm] = useState(false)

  const emptyOrganization = {
    name: '',
    logoUrl: '',
    role: '',
    duration: '',
    website: '',
    order: 0
  }

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      // Fetch section settings
      const settingsDoc = await getDocs(collection(db, 'settings'))
      const settingsData = settingsDoc.docs.find(d => d.id === 'organizations')
      if (settingsData) {
        setSectionSettings(prev => ({ ...prev, ...settingsData.data() }))
      }

      // Fetch organizations
      const organizationsSnapshot = await getDocs(collection(db, 'organizations'))
      setOrganizations(organizationsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })))

      setLoading(false)
    } catch (error) {
      setLoading(false)
    }
  }

  const handleSaveSectionSettings = async () => {
    setSaving(true)
    try {
      await setDoc(doc(db, 'settings', 'organizations'), sectionSettings, { merge: true })
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
        await setDoc(doc(db, 'organizations', item.id), itemData, { merge: true })
      } else {
        await addDoc(collection(db, 'organizations'), {
          ...itemData,
          createdAt: new Date().toISOString()
        })
      }

      await fetchData()
      setEditingItem(null)
      setShowForm(false)
      showToast(item.id ? 'Organization updated successfully!' : 'Organization added successfully!', 'success')
    } catch (error) {
      showToast('Failed to save organization. Please try again.', 'error')
    }
    setSaving(false)
  }

  const handleDeleteItem = async (itemId) => {
    if (!confirm('Are you sure you want to delete this organization?')) return

    try {
      await deleteDoc(doc(db, 'organizations', itemId))
      await fetchData()
      showToast('Organization deleted successfully!', 'success')
    } catch (error) {
      showToast('Failed to delete organization. Please try again.', 'error')
    }
  }

  const getEmptyOrganization = () => {
    const maxOrder = organizations.length > 0 
      ? Math.max(...organizations.map(o => o.order || 0))
      : -1
    return { ...emptyOrganization, order: maxOrder + 1 }
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

      {/* Organizations List */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {organizations
          .sort((a, b) => (a.order || 0) - (b.order || 0))
          .map((org) => (
            <div
              key={org.id}
              className="bg-gray-900 rounded-xl p-4 border border-gray-800 hover:border-gray-700 transition-all"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  {org.logoUrl ? (
                    <img src={org.logoUrl} alt={org.name} className="w-10 h-10 object-contain" />
                  ) : (
                    <div className="w-10 h-10 border border-gray-700 bg-gray-800 flex items-center justify-center font-bold text-sm">
                      {org.name?.charAt(0)?.toUpperCase() || '?'}
                    </div>
                  )}
                  <div>
                    <h4 className="font-semibold text-white text-sm">{org.name}</h4>
                    {org.role && (
                      <p className="text-gray-500 text-xs">{org.role}</p>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setEditingItem(org)
                      setShowForm(true)
                    }}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => handleDeleteItem(org.id)}
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
          setEditingItem(getEmptyOrganization())
          setShowForm(true)
        }}
        className="w-full py-4 border-2 border-dashed border-gray-700 rounded-xl text-gray-400 hover:text-white hover:border-gray-600 transition-all flex items-center justify-center gap-2"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
        Add Organization
      </button>

      {/* Form Modal */}
      {showForm && editingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-gray-900 rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-white">
                {editingItem.id ? 'Edit' : 'Add'} Organization
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
                <label className="block text-gray-400 text-sm font-medium mb-2">Organization Name *</label>
                <input
                  type="text"
                  value={editingItem.name || ''}
                  onChange={(e) => setEditingItem(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-gray-600"
                  placeholder="Organization Name"
                />
              </div>

              <div>
                <label className="block text-gray-400 text-sm font-medium mb-2">Logo URL</label>
                <input
                  type="url"
                  value={editingItem.logoUrl || ''}
                  onChange={(e) => setEditingItem(prev => ({ ...prev, logoUrl: e.target.value }))}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-gray-600"
                  placeholder="https://example.com/logo.png"
                />
                <p className="text-gray-600 text-xs mt-1">Leave empty to show initial letter</p>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-400 text-sm font-medium mb-2">Role/Position (Optional)</label>
                  <input
                    type="text"
                    value={editingItem.role || ''}
                    onChange={(e) => setEditingItem(prev => ({ ...prev, role: e.target.value }))}
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-gray-600"
                    placeholder="Member, Volunteer, etc."
                  />
                </div>
                <div>
                  <label className="block text-gray-400 text-sm font-medium mb-2">Duration (Optional)</label>
                  <input
                    type="text"
                    value={editingItem.duration || ''}
                    onChange={(e) => setEditingItem(prev => ({ ...prev, duration: e.target.value }))}
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-gray-600"
                    placeholder="2020 - Present"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-400 text-sm font-medium mb-2">Website URL (Optional)</label>
                <input
                  type="url"
                  value={editingItem.website || ''}
                  onChange={(e) => setEditingItem(prev => ({ ...prev, website: e.target.value }))}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-gray-600"
                  placeholder="https://example.com"
                />
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
                  disabled={saving || !editingItem.name}
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

export default OrganizationsSettings

