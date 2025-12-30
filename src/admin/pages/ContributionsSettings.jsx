import { useState, useEffect } from 'react'
import { collection, doc, getDocs, setDoc, deleteDoc, addDoc } from 'firebase/firestore'
import { db } from '../../firebase/config'
import Toast from '../../components/Toast'
import { useToast } from '../../hooks/useToast'

const ContributionsSettings = () => {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState('npm')
  const { toast, showToast, hideToast } = useToast()

  // Section settings
  const [sectionSettings, setSectionSettings] = useState({
    sectionSubtitle: 'My Work',
    sectionTitle: 'Contributions &',
    sectionTitleHighlight: 'Publications',
    sectionDescription: 'Explore my published packages, code marketplace items, and open source contributions',
    npmEnabled: true,
    sellingEnabled: true,
    opensourceEnabled: true
  })

  // Data lists
  const [npmPackages, setNpmPackages] = useState([])
  const [sellingItems, setSellingItems] = useState([])
  const [opensourceContribs, setOpensourceContribs] = useState([])

  // Form states
  const [editingItem, setEditingItem] = useState(null)
  const [showForm, setShowForm] = useState(false)

  const emptyNpm = {
    name: '',
    description: '',
    version: '1.0.0',
    url: '',
    downloads: '',
    order: 0
  }

  const emptySelling = {
    title: '',
    description: '',
    price: '',
    platform: '',
    imageUrl: '',
    url: '',
    order: 0
  }

  const emptyOpensource = {
    repository: '',
    contribution: '',
    description: '',
    type: '',
    url: '',
    stars: '',
    order: 0
  }

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      // Fetch section settings
      const settingsDoc = await getDocs(collection(db, 'settings'))
      const settingsData = settingsDoc.docs.find(d => d.id === 'contributions')
      if (settingsData) {
        setSectionSettings(prev => ({ ...prev, ...settingsData.data() }))
      }

      // Fetch NPM packages
      const npmSnapshot = await getDocs(collection(db, 'contributions_npm'))
      setNpmPackages(npmSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })))

      // Fetch selling items
      const sellingSnapshot = await getDocs(collection(db, 'contributions_selling'))
      setSellingItems(sellingSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })))

      // Fetch open source contributions
      const opensourceSnapshot = await getDocs(collection(db, 'contributions_opensource'))
      setOpensourceContribs(opensourceSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })))

      setLoading(false)
    } catch (error) {
      setLoading(false)
    }
  }

  const handleSaveSectionSettings = async () => {
    setSaving(true)
    try {
      await setDoc(doc(db, 'settings', 'contributions'), sectionSettings, { merge: true })
      showToast('Section settings saved successfully!', 'success')
    } catch (error) {
      showToast('Failed to save settings. Please try again.', 'error')
    }
    setSaving(false)
  }

  const handleSaveItem = async (item, collectionName) => {
    setSaving(true)
    try {
      const itemData = {
        ...item,
        order: parseInt(item.order) || 0,
        updatedAt: new Date().toISOString()
      }

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
      showToast(item.id ? 'Item updated successfully!' : 'Item added successfully!', 'success')
    } catch (error) {
      showToast('Failed to save item. Please try again.', 'error')
    }
    setSaving(false)
  }

  const handleDeleteItem = async (itemId, collectionName) => {
    if (!confirm('Are you sure you want to delete this item?')) return

    try {
      await deleteDoc(doc(db, collectionName, itemId))
      await fetchData()
      showToast('Item deleted successfully!', 'success')
    } catch (error) {
      showToast('Failed to delete item. Please try again.', 'error')
    }
  }

  const getEmptyItem = () => {
    const currentItems = activeTab === 'npm' ? npmPackages : activeTab === 'selling' ? sellingItems : opensourceContribs
    const maxOrder = currentItems.length > 0 
      ? Math.max(...currentItems.map(item => item.order || 0))
      : -1
    const emptyItem = activeTab === 'npm' ? { ...emptyNpm } : activeTab === 'selling' ? { ...emptySelling } : { ...emptyOpensource }
    return { ...emptyItem, order: maxOrder + 1 }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin" />
      </div>
    )
  }

  const tabs = [
    { id: 'npm', label: 'NPM Packages', icon: '📦' },
    { id: 'selling', label: 'Code Marketplace', icon: '💰' },
    { id: 'opensource', label: 'Open Source', icon: '🌐' }
  ]

  const currentCollection = activeTab === 'npm' ? 'contributions_npm' : activeTab === 'selling' ? 'contributions_selling' : 'contributions_opensource'
  const currentItems = activeTab === 'npm' ? npmPackages : activeTab === 'selling' ? sellingItems : opensourceContribs
  const emptyItem = activeTab === 'npm' ? emptyNpm : activeTab === 'selling' ? emptySelling : emptyOpensource

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

        {/* Enable/Disable Subsections */}
        <h3 className="text-md font-medium text-white mb-3 mt-6">Enable/Disable Subsections</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={sectionSettings.npmEnabled}
              onChange={(e) => setSectionSettings(prev => ({ ...prev, npmEnabled: e.target.checked }))}
              className="w-5 h-5 rounded border-gray-700 bg-gray-800 text-white focus:ring-2 focus:ring-white"
            />
            <span className="text-white">NPM Packages</span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={sectionSettings.sellingEnabled}
              onChange={(e) => setSectionSettings(prev => ({ ...prev, sellingEnabled: e.target.checked }))}
              className="w-5 h-5 rounded border-gray-700 bg-gray-800 text-white focus:ring-2 focus:ring-white"
            />
            <span className="text-white">Code Marketplace</span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={sectionSettings.opensourceEnabled}
              onChange={(e) => setSectionSettings(prev => ({ ...prev, opensourceEnabled: e.target.checked }))}
              className="w-5 h-5 rounded border-gray-700 bg-gray-800 text-white focus:ring-2 focus:ring-white"
            />
            <span className="text-white">Open Source</span>
          </label>
        </div>

        <button
          onClick={handleSaveSectionSettings}
          disabled={saving}
          className="px-6 py-3 rounded-xl font-medium bg-white text-black hover:bg-gray-200 transition-all disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Save Settings'}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-gray-800">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
              setActiveTab(tab.id)
              setShowForm(false)
              setEditingItem(null)
            }}
            className={`px-6 py-3 font-medium transition-all border-b-2 ${
              activeTab === tab.id
                ? 'border-white text-white'
                : 'border-transparent text-gray-500 hover:text-gray-300'
            }`}
          >
            <span className="mr-2">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Items List */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {currentItems
          .sort((a, b) => (a.order || 0) - (b.order || 0))
          .map((item) => (
            <div
              key={item.id}
              className="bg-gray-900 rounded-xl p-4 border border-gray-800 hover:border-gray-700 transition-all"
            >
              <div className="flex items-start justify-between mb-2">
                <h4 className="font-semibold text-white text-sm">
                  {activeTab === 'npm' ? item.name : activeTab === 'selling' ? item.title : item.repository}
                </h4>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setEditingItem(item)
                      setShowForm(true)
                    }}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => handleDeleteItem(item.id, currentCollection)}
                    className="text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
              <p className="text-gray-400 text-xs line-clamp-2">
                {activeTab === 'npm' ? item.description : activeTab === 'selling' ? item.description : item.contribution}
              </p>
            </div>
          ))}
      </div>

      {/* Add Button */}
      <button
        onClick={() => {
          setEditingItem(getEmptyItem())
          setShowForm(true)
        }}
        className="w-full py-4 border-2 border-dashed border-gray-700 rounded-xl text-gray-400 hover:text-white hover:border-gray-600 transition-all flex items-center justify-center gap-2"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
        Add {activeTab === 'npm' ? 'NPM Package' : activeTab === 'selling' ? 'Selling Item' : 'Open Source Contribution'}
      </button>

      {/* Form Modal */}
      {showForm && editingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-gray-900 rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-white">
                {editingItem.id ? 'Edit' : 'Add'} {activeTab === 'npm' ? 'NPM Package' : activeTab === 'selling' ? 'Selling Item' : 'Open Source Contribution'}
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
              {activeTab === 'npm' && (
                <>
                  <div>
                    <label className="block text-gray-400 text-sm font-medium mb-2">Package Name *</label>
                    <input
                      type="text"
                      value={editingItem.name || ''}
                      onChange={(e) => setEditingItem(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-gray-600"
                      placeholder="package-name"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-400 text-sm font-medium mb-2">Description *</label>
                    <textarea
                      value={editingItem.description || ''}
                      onChange={(e) => setEditingItem(prev => ({ ...prev, description: e.target.value }))}
                      className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-gray-600"
                      rows="3"
                      placeholder="Package description"
                    />
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-gray-400 text-sm font-medium mb-2">Version</label>
                      <input
                        type="text"
                        value={editingItem.version || ''}
                        onChange={(e) => setEditingItem(prev => ({ ...prev, version: e.target.value }))}
                        className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-gray-600"
                        placeholder="1.0.0"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-400 text-sm font-medium mb-2">Downloads</label>
                      <input
                        type="text"
                        value={editingItem.downloads || ''}
                        onChange={(e) => setEditingItem(prev => ({ ...prev, downloads: e.target.value }))}
                        className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-gray-600"
                        placeholder="1k/week"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-gray-400 text-sm font-medium mb-2">NPM URL</label>
                    <input
                      type="url"
                      value={editingItem.url || ''}
                      onChange={(e) => setEditingItem(prev => ({ ...prev, url: e.target.value }))}
                      className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-gray-600"
                      placeholder="https://www.npmjs.com/package/package-name"
                    />
                  </div>
                </>
              )}

              {activeTab === 'selling' && (
                <>
                  <div>
                    <label className="block text-gray-400 text-sm font-medium mb-2">Title *</label>
                    <input
                      type="text"
                      value={editingItem.title || ''}
                      onChange={(e) => setEditingItem(prev => ({ ...prev, title: e.target.value }))}
                      className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-gray-600"
                      placeholder="Item title"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-400 text-sm font-medium mb-2">Description *</label>
                    <textarea
                      value={editingItem.description || ''}
                      onChange={(e) => setEditingItem(prev => ({ ...prev, description: e.target.value }))}
                      className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-gray-600"
                      rows="3"
                      placeholder="Item description"
                    />
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-gray-400 text-sm font-medium mb-2">Price</label>
                      <input
                        type="text"
                        value={editingItem.price || ''}
                        onChange={(e) => setEditingItem(prev => ({ ...prev, price: e.target.value }))}
                        className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-gray-600"
                        placeholder="29.99"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-400 text-sm font-medium mb-2">Platform</label>
                      <input
                        type="text"
                        value={editingItem.platform || ''}
                        onChange={(e) => setEditingItem(prev => ({ ...prev, platform: e.target.value }))}
                        className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-gray-600"
                        placeholder="CodeCanyon, Gumroad, etc."
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-gray-400 text-sm font-medium mb-2">Image URL</label>
                    <input
                      type="url"
                      value={editingItem.imageUrl || ''}
                      onChange={(e) => setEditingItem(prev => ({ ...prev, imageUrl: e.target.value }))}
                      className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-gray-600"
                      placeholder="https://example.com/image.jpg"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-400 text-sm font-medium mb-2">Marketplace URL *</label>
                    <input
                      type="url"
                      value={editingItem.url || ''}
                      onChange={(e) => setEditingItem(prev => ({ ...prev, url: e.target.value }))}
                      className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-gray-600"
                      placeholder="https://codecanyon.net/item/..."
                    />
                  </div>
                </>
              )}

              {activeTab === 'opensource' && (
                <>
                  <div>
                    <label className="block text-gray-400 text-sm font-medium mb-2">Repository Name *</label>
                    <input
                      type="text"
                      value={editingItem.repository || ''}
                      onChange={(e) => setEditingItem(prev => ({ ...prev, repository: e.target.value }))}
                      className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-gray-600"
                      placeholder="owner/repository"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-400 text-sm font-medium mb-2">Contribution Type *</label>
                    <input
                      type="text"
                      value={editingItem.contribution || ''}
                      onChange={(e) => setEditingItem(prev => ({ ...prev, contribution: e.target.value }))}
                      className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-gray-600"
                      placeholder="Bug fix, Feature, Documentation, etc."
                    />
                  </div>
                  <div>
                    <label className="block text-gray-400 text-sm font-medium mb-2">Description</label>
                    <textarea
                      value={editingItem.description || ''}
                      onChange={(e) => setEditingItem(prev => ({ ...prev, description: e.target.value }))}
                      className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-gray-600"
                      rows="3"
                      placeholder="Contribution description"
                    />
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-gray-400 text-sm font-medium mb-2">Type</label>
                      <input
                        type="text"
                        value={editingItem.type || ''}
                        onChange={(e) => setEditingItem(prev => ({ ...prev, type: e.target.value }))}
                        className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-gray-600"
                        placeholder="PR, Issue, etc."
                      />
                    </div>
                    <div>
                      <label className="block text-gray-400 text-sm font-medium mb-2">Stars</label>
                      <input
                        type="text"
                        value={editingItem.stars || ''}
                        onChange={(e) => setEditingItem(prev => ({ ...prev, stars: e.target.value }))}
                        className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-gray-600"
                        placeholder="1.2k"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-gray-400 text-sm font-medium mb-2">Repository URL *</label>
                    <input
                      type="url"
                      value={editingItem.url || ''}
                      onChange={(e) => setEditingItem(prev => ({ ...prev, url: e.target.value }))}
                      className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-gray-600"
                      placeholder="https://github.com/owner/repo"
                    />
                  </div>
                </>
              )}

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
                  onClick={() => handleSaveItem(editingItem, currentCollection)}
                  disabled={saving || (activeTab === 'npm' && !editingItem.name) || (activeTab === 'selling' && !editingItem.title) || (activeTab === 'opensource' && !editingItem.repository)}
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

export default ContributionsSettings

