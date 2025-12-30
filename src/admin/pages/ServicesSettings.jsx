import { useState, useEffect } from 'react'
import { collection, doc, getDocs, setDoc, deleteDoc, addDoc } from 'firebase/firestore'
import { db } from '../../firebase/config'

const ServicesSettings = () => {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState('services')
  const [services, setServices] = useState([])
  const [processSteps, setProcessSteps] = useState([])
  const [editingItem, setEditingItem] = useState(null)
  const [showForm, setShowForm] = useState(false)
  
  // Section settings
  const [sectionSettings, setSectionSettings] = useState({
    sectionSubtitle: 'What I Offer',
    sectionTitle: 'Freelance',
    sectionTitleHighlight: 'Services',
    sectionDescription: 'Transforming ideas into digital reality. Quality work delivered on time, every time.',
    processTitle: 'My',
    processTitleHighlight: 'Process',
    ctaText: 'Have a project in mind? Let\'s discuss how I can help bring your vision to life.',
    ctaButton1: 'Start a Project',
    ctaButton2: 'Schedule a Call'
  })

  const emptyService = {
    title: '',
    description: '',
    features: '',
    icon: '💻',
    price: '',
    order: 0
  }

  const emptyProcess = {
    step: '',
    title: '',
    description: '',
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
        if (doc.id === 'services') {
          setSectionSettings(prev => ({ ...prev, ...doc.data() }))
        }
      })

      // Fetch services
      const servicesSnapshot = await getDocs(collection(db, 'services'))
      const servicesData = servicesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
      servicesData.sort((a, b) => (a.order || 0) - (b.order || 0))
      setServices(servicesData)

      // Fetch process steps
      const processSnapshot = await getDocs(collection(db, 'services_process'))
      const processData = processSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
      processData.sort((a, b) => (a.order || 0) - (b.order || 0))
      setProcessSteps(processData)
    } catch (error) {
    }
    setLoading(false)
  }

  const handleSaveSectionSettings = async () => {
    setSaving(true)
    try {
      await setDoc(doc(db, 'settings', 'services'), sectionSettings, { merge: true })
      alert('Settings saved!')
    } catch (error) {
      alert('Failed to save.')
    }
    setSaving(false)
  }

  const handleSaveItem = async (item) => {
    setSaving(true)
    try {
      const collectionName = activeTab === 'services' ? 'services' : 'services_process'
      
      // Convert features string to array for services
      let itemData = { ...item }
      if (activeTab === 'services' && typeof item.features === 'string') {
        itemData.features = item.features.split(',').map(f => f.trim()).filter(f => f)
      }
      
      itemData.order = parseInt(item.order) || 0
      itemData.updatedAt = new Date().toISOString()

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
    if (!confirm('Are you sure you want to delete this item?')) return
    
    try {
      const collectionName = activeTab === 'services' ? 'services' : 'services_process'
      await deleteDoc(doc(db, collectionName, item.id))
      await fetchData()
    } catch (error) {
      alert('Failed to delete.')
    }
  }

  const getEmptyItem = () => {
    const currentItems = activeTab === 'services' ? services : processSteps
    const maxOrder = currentItems.length > 0 
      ? Math.max(...currentItems.map(item => item.order || 0))
      : -1
    const emptyItem = activeTab === 'services' ? { ...emptyService } : { ...emptyProcess }
    return { ...emptyItem, order: maxOrder + 1 }
  }

  // Icon options for services
  const iconOptions = ['💻', '📱', '🎨', '⚙️', '🛒', '💬', '🚀', '🔧', '📊', '🔒', '☁️', '🌐']

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
          <h1 className="text-3xl font-bold text-white mb-2">Services</h1>
          <p className="text-gray-500">Manage your freelance services and process.</p>
        </div>
      </div>

      {/* Section Settings */}
      <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-6 mb-6">
        <h2 className="text-lg font-semibold text-white mb-4">Section Settings</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-gray-400 text-sm font-medium mb-2">Subtitle</label>
            <input
              type="text"
              value={sectionSettings.sectionSubtitle}
              onChange={(e) => setSectionSettings(prev => ({ ...prev, sectionSubtitle: e.target.value }))}
              className="w-full px-4 py-3 bg-gray-900 border border-gray-800 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-gray-600"
            />
          </div>
          <div>
            <label className="block text-gray-400 text-sm font-medium mb-2">Title</label>
            <input
              type="text"
              value={sectionSettings.sectionTitle}
              onChange={(e) => setSectionSettings(prev => ({ ...prev, sectionTitle: e.target.value }))}
              className="w-full px-4 py-3 bg-gray-900 border border-gray-800 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-gray-600"
            />
          </div>
          <div>
            <label className="block text-gray-400 text-sm font-medium mb-2">Title Highlight</label>
            <input
              type="text"
              value={sectionSettings.sectionTitleHighlight}
              onChange={(e) => setSectionSettings(prev => ({ ...prev, sectionTitleHighlight: e.target.value }))}
              className="w-full px-4 py-3 bg-gray-900 border border-gray-800 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-gray-600"
            />
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-gray-400 text-sm font-medium mb-2">Description</label>
          <input
            type="text"
            value={sectionSettings.sectionDescription}
            onChange={(e) => setSectionSettings(prev => ({ ...prev, sectionDescription: e.target.value }))}
            className="w-full px-4 py-3 bg-gray-900 border border-gray-800 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-gray-600"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-gray-400 text-sm font-medium mb-2">Process Title</label>
            <input
              type="text"
              value={sectionSettings.processTitle}
              onChange={(e) => setSectionSettings(prev => ({ ...prev, processTitle: e.target.value }))}
              className="w-full px-4 py-3 bg-gray-900 border border-gray-800 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-gray-600"
            />
          </div>
          <div>
            <label className="block text-gray-400 text-sm font-medium mb-2">Process Title Highlight</label>
            <input
              type="text"
              value={sectionSettings.processTitleHighlight}
              onChange={(e) => setSectionSettings(prev => ({ ...prev, processTitleHighlight: e.target.value }))}
              className="w-full px-4 py-3 bg-gray-900 border border-gray-800 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-gray-600"
            />
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-gray-400 text-sm font-medium mb-2">CTA Text</label>
          <input
            type="text"
            value={sectionSettings.ctaText}
            onChange={(e) => setSectionSettings(prev => ({ ...prev, ctaText: e.target.value }))}
            className="w-full px-4 py-3 bg-gray-900 border border-gray-800 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-gray-600"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-gray-400 text-sm font-medium mb-2">CTA Button 1</label>
            <input
              type="text"
              value={sectionSettings.ctaButton1}
              onChange={(e) => setSectionSettings(prev => ({ ...prev, ctaButton1: e.target.value }))}
              className="w-full px-4 py-3 bg-gray-900 border border-gray-800 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-gray-600"
            />
          </div>
          <div>
            <label className="block text-gray-400 text-sm font-medium mb-2">CTA Button 2</label>
            <input
              type="text"
              value={sectionSettings.ctaButton2}
              onChange={(e) => setSectionSettings(prev => ({ ...prev, ctaButton2: e.target.value }))}
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
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setActiveTab('services')}
          className={`px-4 py-2 rounded-lg font-medium transition-all ${
            activeTab === 'services' 
              ? 'bg-white text-black' 
              : 'bg-gray-900 text-gray-400 hover:text-white border border-gray-800'
          }`}
        >
          Services ({services.length})
        </button>
        <button
          onClick={() => setActiveTab('process')}
          className={`px-4 py-2 rounded-lg font-medium transition-all ${
            activeTab === 'process' 
              ? 'bg-white text-black' 
              : 'bg-gray-900 text-gray-400 hover:text-white border border-gray-800'
          }`}
        >
          Process Steps ({processSteps.length})
        </button>
        <button
          onClick={() => {
            setEditingItem(getEmptyItem())
            setShowForm(true)
          }}
          className="ml-auto px-4 py-2 rounded-lg font-medium bg-white text-black hover:bg-gray-200 transition-all flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add {activeTab === 'services' ? 'Service' : 'Step'}
        </button>
      </div>

      {/* Content List */}
      <div className="space-y-4">
        {activeTab === 'services' && (
          services.length === 0 ? (
            <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-12 text-center">
              <div className="w-16 h-16 rounded-2xl bg-gray-800 flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">💼</span>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">No Services Yet</h3>
              <p className="text-gray-500 mb-4">Add your freelance services to display.</p>
            </div>
          ) : (
            services.map((item) => (
              <div
                key={item.id}
                className="bg-gray-900/50 border border-gray-800 rounded-2xl p-4 flex items-center gap-4"
              >
                <div className="w-14 h-14 rounded-xl bg-gray-800 flex items-center justify-center text-2xl flex-shrink-0">
                  {item.icon || '💻'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="text-lg font-semibold text-white">{item.title}</h3>
                    <span className="px-2 py-0.5 bg-gray-800 text-gray-400 text-xs rounded">{item.price}</span>
                  </div>
                  <p className="text-gray-500 text-sm line-clamp-1">{item.description}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      const featuresString = Array.isArray(item.features) ? item.features.join(', ') : (item.features || '')
                      setEditingItem({ ...item, features: featuresString })
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
          )
        )}

        {activeTab === 'process' && (
          processSteps.length === 0 ? (
            <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-12 text-center">
              <div className="w-16 h-16 rounded-2xl bg-gray-800 flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">📋</span>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">No Process Steps Yet</h3>
              <p className="text-gray-500 mb-4">Add your work process steps to display.</p>
            </div>
          ) : (
            processSteps.map((item) => (
              <div
                key={item.id}
                className="bg-gray-900/50 border border-gray-800 rounded-2xl p-4 flex items-center gap-4"
              >
                <div className="w-14 h-14 rounded-xl bg-gray-800 flex items-center justify-center text-xl font-bold text-gray-500 flex-shrink-0">
                  {item.step}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-semibold text-white mb-1">{item.title}</h3>
                  <p className="text-gray-500 text-sm line-clamp-1">{item.description}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setEditingItem({ ...item })
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
          )
        )}
      </div>

      {/* Form Modal */}
      {showForm && editingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setShowForm(false)} />
          <div className="relative bg-gray-950 border border-gray-800 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-xl font-semibold text-white mb-6">
                {editingItem.id ? 'Edit' : 'Add'} {activeTab === 'services' ? 'Service' : 'Process Step'}
              </h2>

              <div className="space-y-4">
                {activeTab === 'services' ? (
                  <>
                    <div>
                      <label className="block text-gray-400 text-sm font-medium mb-2">Title *</label>
                      <input
                        type="text"
                        value={editingItem.title || ''}
                        onChange={(e) => setEditingItem(prev => ({ ...prev, title: e.target.value }))}
                        placeholder="Web Development"
                        className="w-full px-4 py-3 bg-gray-900 border border-gray-800 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-gray-600"
                      />
                    </div>

                    <div>
                      <label className="block text-gray-400 text-sm font-medium mb-2">Icon</label>
                      <div className="flex flex-wrap gap-2 mb-2">
                        {iconOptions.map((icon) => (
                          <button
                            key={icon}
                            type="button"
                            onClick={() => setEditingItem(prev => ({ ...prev, icon }))}
                            className={`w-10 h-10 rounded-lg text-xl flex items-center justify-center transition-all ${
                              editingItem.icon === icon 
                                ? 'bg-white text-black' 
                                : 'bg-gray-800 hover:bg-gray-700'
                            }`}
                          >
                            {icon}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-gray-400 text-sm font-medium mb-2">Price *</label>
                      <input
                        type="text"
                        value={editingItem.price || ''}
                        onChange={(e) => setEditingItem(prev => ({ ...prev, price: e.target.value }))}
                        placeholder="From $500"
                        className="w-full px-4 py-3 bg-gray-900 border border-gray-800 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-gray-600"
                      />
                    </div>

                    <div>
                      <label className="block text-gray-400 text-sm font-medium mb-2">Description *</label>
                      <textarea
                        value={editingItem.description || ''}
                        onChange={(e) => setEditingItem(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="Describe your service..."
                        rows={3}
                        className="w-full px-4 py-3 bg-gray-900 border border-gray-800 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-gray-600 resize-none"
                      />
                    </div>

                    <div>
                      <label className="block text-gray-400 text-sm font-medium mb-2">Features (comma-separated)</label>
                      <input
                        type="text"
                        value={editingItem.features || ''}
                        onChange={(e) => setEditingItem(prev => ({ ...prev, features: e.target.value }))}
                        placeholder="React, Next.js, Responsive Design"
                        className="w-full px-4 py-3 bg-gray-900 border border-gray-800 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-gray-600"
                      />
                    </div>

                    <div>
                      <label className="block text-gray-400 text-sm font-medium mb-2">Order</label>
                      <input
                        type="number"
                        value={editingItem.order || 0}
                        onChange={(e) => setEditingItem(prev => ({ ...prev, order: e.target.value }))}
                        className="w-full px-4 py-3 bg-gray-900 border border-gray-800 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-gray-600"
                      />
                    </div>
                  </>
                ) : (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-gray-400 text-sm font-medium mb-2">Step Number *</label>
                        <input
                          type="text"
                          value={editingItem.step || ''}
                          onChange={(e) => setEditingItem(prev => ({ ...prev, step: e.target.value }))}
                          placeholder="01"
                          className="w-full px-4 py-3 bg-gray-900 border border-gray-800 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-gray-600"
                        />
                      </div>
                      <div>
                        <label className="block text-gray-400 text-sm font-medium mb-2">Order</label>
                        <input
                          type="number"
                          value={editingItem.order || 0}
                          onChange={(e) => setEditingItem(prev => ({ ...prev, order: e.target.value }))}
                          className="w-full px-4 py-3 bg-gray-900 border border-gray-800 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-gray-600"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-gray-400 text-sm font-medium mb-2">Title *</label>
                      <input
                        type="text"
                        value={editingItem.title || ''}
                        onChange={(e) => setEditingItem(prev => ({ ...prev, title: e.target.value }))}
                        placeholder="Discovery"
                        className="w-full px-4 py-3 bg-gray-900 border border-gray-800 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-gray-600"
                      />
                    </div>

                    <div>
                      <label className="block text-gray-400 text-sm font-medium mb-2">Description *</label>
                      <textarea
                        value={editingItem.description || ''}
                        onChange={(e) => setEditingItem(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="Describe this step..."
                        rows={3}
                        className="w-full px-4 py-3 bg-gray-900 border border-gray-800 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-gray-600 resize-none"
                      />
                    </div>
                  </>
                )}
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
                  disabled={saving || !editingItem.title}
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

export default ServicesSettings

