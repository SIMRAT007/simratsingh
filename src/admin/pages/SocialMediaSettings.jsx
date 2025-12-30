import { useState, useEffect } from 'react'
import { collection, doc, getDocs, setDoc, deleteDoc, addDoc } from 'firebase/firestore'
import { db } from '../../firebase/config'

const SocialMediaSettings = () => {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState('youtube')
  
  // Section settings
  const [sectionSettings, setSectionSettings] = useState({
    sectionSubtitle: 'Stay Connected',
    sectionTitle: 'Social',
    sectionTitleHighlight: 'Media',
    sectionDescription: 'Follow my journey across platforms for tips, tutorials, and behind-the-scenes content',
    bottomNote: 'Follow me for daily tips and updates',
    
    // Platform enable/disable
    youtubeEnabled: true,
    linkedinEnabled: true,
    instagramEnabled: true,
    
    // Platform settings
    youtubeHandle: '@simratsingh',
    youtubeProfileUrl: 'https://youtube.com/@simratsingh',
    linkedinHandle: 'simratsingh',
    linkedinProfileUrl: 'https://linkedin.com/in/simratsingh',
    instagramHandle: '@simrat.dev',
    instagramProfileUrl: 'https://instagram.com/simrat.dev'
  })

  // Content lists
  const [youtubeVideos, setYoutubeVideos] = useState([])
  const [linkedinPosts, setLinkedinPosts] = useState([])
  const [instagramPosts, setInstagramPosts] = useState([])
  
  // Form states
  const [editingItem, setEditingItem] = useState(null)
  const [showForm, setShowForm] = useState(false)

  const emptyYoutubeVideo = { title: '', thumbnail: '', views: '', duration: '', url: '', order: 0 }
  const emptyLinkedinPost = { content: '', likes: 0, comments: 0, date: '', url: '', order: 0 }
  const emptyInstagramPost = { image: '', caption: '', likes: 0, date: '', url: '', order: 0 }

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      // Fetch section settings
      const settingsDoc = await getDocs(collection(db, 'settings'))
      settingsDoc.forEach(doc => {
        if (doc.id === 'socialMedia') {
          setSectionSettings(prev => ({ ...prev, ...doc.data() }))
        }
      })

      // Fetch YouTube videos
      const ytSnapshot = await getDocs(collection(db, 'socialMedia_youtube'))
      const ytData = ytSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
      ytData.sort((a, b) => (a.order || 0) - (b.order || 0))
      setYoutubeVideos(ytData)

      // Fetch LinkedIn posts
      const liSnapshot = await getDocs(collection(db, 'socialMedia_linkedin'))
      const liData = liSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
      liData.sort((a, b) => (a.order || 0) - (b.order || 0))
      setLinkedinPosts(liData)

      // Fetch Instagram posts
      const igSnapshot = await getDocs(collection(db, 'socialMedia_instagram'))
      const igData = igSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
      igData.sort((a, b) => (a.order || 0) - (b.order || 0))
      setInstagramPosts(igData)
    } catch (error) {
    }
    setLoading(false)
  }

  const handleSaveSectionSettings = async () => {
    setSaving(true)
    try {
      await setDoc(doc(db, 'settings', 'socialMedia'), sectionSettings, { merge: true })
      alert('Settings saved!')
    } catch (error) {
      alert('Failed to save.')
    }
    setSaving(false)
  }

  const getCollectionName = () => {
    switch (activeTab) {
      case 'youtube': return 'socialMedia_youtube'
      case 'linkedin': return 'socialMedia_linkedin'
      case 'instagram': return 'socialMedia_instagram'
      default: return 'socialMedia_youtube'
    }
  }

  const handleSaveItem = async (item) => {
    setSaving(true)
    try {
      const collectionName = getCollectionName()
      const itemData = {
        ...item,
        order: parseInt(item.order) || 0,
        likes: parseInt(item.likes) || 0,
        comments: parseInt(item.comments) || 0,
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
    } catch (error) {
      alert('Failed to save.')
    }
    setSaving(false)
  }

  const handleDeleteItem = async (item) => {
    if (!confirm('Are you sure you want to delete this item?')) return
    
    try {
      const collectionName = getCollectionName()
      await deleteDoc(doc(db, collectionName, item.id))
      await fetchData()
    } catch (error) {
      alert('Failed to delete.')
    }
  }

  const getCurrentItems = () => {
    switch (activeTab) {
      case 'youtube': return youtubeVideos
      case 'linkedin': return linkedinPosts
      case 'instagram': return instagramPosts
      default: return []
    }
  }

  const getEmptyItem = () => {
    let currentItems = []
    let emptyItem = {}
    
    switch (activeTab) {
      case 'youtube':
        currentItems = youtubeVideos
        emptyItem = emptyYoutubeVideo
        break
      case 'linkedin':
        currentItems = linkedinPosts
        emptyItem = emptyLinkedinPost
        break
      case 'instagram':
        currentItems = instagramPosts
        emptyItem = emptyInstagramPost
        break
      default:
        return {}
    }
    
    const maxOrder = currentItems.length > 0 
      ? Math.max(...currentItems.map(item => item.order || 0))
      : -1
    return { ...emptyItem, order: maxOrder + 1 }
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
          <h1 className="text-3xl font-bold text-white mb-2">Social Media</h1>
          <p className="text-gray-500">Manage your social media content and links.</p>
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

        <div className="mb-4">
          <label className="block text-gray-400 text-sm font-medium mb-2">Bottom Note</label>
          <input
            type="text"
            value={sectionSettings.bottomNote}
            onChange={(e) => setSectionSettings(prev => ({ ...prev, bottomNote: e.target.value }))}
            className="w-full px-4 py-3 bg-gray-900 border border-gray-800 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-gray-600"
          />
        </div>

        {/* Platform Enable/Disable */}
        <h3 className="text-md font-medium text-white mb-3 mt-6">Enable/Disable Platforms</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="flex items-center justify-between p-4 bg-gray-900 border border-gray-800 rounded-xl">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-red-600 rounded flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814z"/>
                </svg>
              </div>
              <span className="text-white font-medium">YouTube</span>
            </div>
            <button
              type="button"
              onClick={() => setSectionSettings(prev => ({ ...prev, youtubeEnabled: !prev.youtubeEnabled }))}
              className={`relative w-12 h-6 rounded-full transition-colors ${
                sectionSettings.youtubeEnabled ? 'bg-green-500' : 'bg-gray-700'
              }`}
            >
              <span className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                sectionSettings.youtubeEnabled ? 'left-7' : 'left-1'
              }`} />
            </button>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-900 border border-gray-800 rounded-xl">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-700 rounded flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
              </div>
              <span className="text-white font-medium">LinkedIn</span>
            </div>
            <button
              type="button"
              onClick={() => setSectionSettings(prev => ({ ...prev, linkedinEnabled: !prev.linkedinEnabled }))}
              className={`relative w-12 h-6 rounded-full transition-colors ${
                sectionSettings.linkedinEnabled ? 'bg-green-500' : 'bg-gray-700'
              }`}
            >
              <span className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                sectionSettings.linkedinEnabled ? 'left-7' : 'left-1'
              }`} />
            </button>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-900 border border-gray-800 rounded-xl">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 rounded flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073z"/>
                </svg>
              </div>
              <span className="text-white font-medium">Instagram</span>
            </div>
            <button
              type="button"
              onClick={() => setSectionSettings(prev => ({ ...prev, instagramEnabled: !prev.instagramEnabled }))}
              className={`relative w-12 h-6 rounded-full transition-colors ${
                sectionSettings.instagramEnabled ? 'bg-green-500' : 'bg-gray-700'
              }`}
            >
              <span className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                sectionSettings.instagramEnabled ? 'left-7' : 'left-1'
              }`} />
            </button>
          </div>
        </div>

        {/* Platform URLs */}
        <h3 className="text-md font-medium text-white mb-3">Platform Links</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-gray-400 text-sm font-medium mb-2">YouTube Handle</label>
            <input
              type="text"
              value={sectionSettings.youtubeHandle}
              onChange={(e) => setSectionSettings(prev => ({ ...prev, youtubeHandle: e.target.value }))}
              placeholder="@username"
              className="w-full px-4 py-3 bg-gray-900 border border-gray-800 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-gray-600"
            />
          </div>
          <div>
            <label className="block text-gray-400 text-sm font-medium mb-2">YouTube Profile URL</label>
            <input
              type="text"
              value={sectionSettings.youtubeProfileUrl}
              onChange={(e) => setSectionSettings(prev => ({ ...prev, youtubeProfileUrl: e.target.value }))}
              className="w-full px-4 py-3 bg-gray-900 border border-gray-800 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-gray-600"
            />
          </div>
          <div>
            <label className="block text-gray-400 text-sm font-medium mb-2">LinkedIn Handle</label>
            <input
              type="text"
              value={sectionSettings.linkedinHandle}
              onChange={(e) => setSectionSettings(prev => ({ ...prev, linkedinHandle: e.target.value }))}
              className="w-full px-4 py-3 bg-gray-900 border border-gray-800 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-gray-600"
            />
          </div>
          <div>
            <label className="block text-gray-400 text-sm font-medium mb-2">LinkedIn Profile URL</label>
            <input
              type="text"
              value={sectionSettings.linkedinProfileUrl}
              onChange={(e) => setSectionSettings(prev => ({ ...prev, linkedinProfileUrl: e.target.value }))}
              className="w-full px-4 py-3 bg-gray-900 border border-gray-800 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-gray-600"
            />
          </div>
          <div>
            <label className="block text-gray-400 text-sm font-medium mb-2">Instagram Handle</label>
            <input
              type="text"
              value={sectionSettings.instagramHandle}
              onChange={(e) => setSectionSettings(prev => ({ ...prev, instagramHandle: e.target.value }))}
              placeholder="@username"
              className="w-full px-4 py-3 bg-gray-900 border border-gray-800 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-gray-600"
            />
          </div>
          <div>
            <label className="block text-gray-400 text-sm font-medium mb-2">Instagram Profile URL</label>
            <input
              type="text"
              value={sectionSettings.instagramProfileUrl}
              onChange={(e) => setSectionSettings(prev => ({ ...prev, instagramProfileUrl: e.target.value }))}
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

      {/* Platform Tabs */}
      <div className="flex gap-2 mb-6">
        {['youtube', 'linkedin', 'instagram'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-lg font-medium capitalize transition-all ${
              activeTab === tab 
                ? 'bg-white text-black' 
                : 'bg-gray-900 text-gray-400 hover:text-white border border-gray-800'
            }`}
          >
            {tab}
          </button>
        ))}
        <button
          onClick={() => {
            setEditingItem({ ...getEmptyItem() })
            setShowForm(true)
          }}
          className="ml-auto px-4 py-2 rounded-lg font-medium bg-white text-black hover:bg-gray-200 transition-all flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add {activeTab === 'youtube' ? 'Video' : 'Post'}
        </button>
      </div>

      {/* Content List */}
      <div className="space-y-4">
        {getCurrentItems().length === 0 ? (
          <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-12 text-center">
            <div className="w-16 h-16 rounded-2xl bg-gray-800 flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">
                {activeTab === 'youtube' ? '🎬' : activeTab === 'linkedin' ? '💼' : '📸'}
              </span>
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">No {activeTab} content yet</h3>
            <p className="text-gray-500 mb-4">Add your {activeTab === 'youtube' ? 'videos' : 'posts'} to display.</p>
          </div>
        ) : (
          getCurrentItems().map((item) => (
            <div
              key={item.id}
              className="bg-gray-900/50 border border-gray-800 rounded-2xl p-4 flex items-center gap-4"
            >
              {/* Thumbnail/Image */}
              <div className="w-20 h-20 rounded-lg bg-gray-800 flex-shrink-0 overflow-hidden">
                {(item.thumbnail || item.image) ? (
                  <img 
                    src={item.thumbnail || item.image} 
                    alt="" 
                    className="w-full h-full object-cover" 
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-2xl">
                    {activeTab === 'youtube' ? '🎬' : activeTab === 'linkedin' ? '💼' : '📸'}
                  </div>
                )}
              </div>
              
              {/* Info */}
              <div className="flex-1 min-w-0">
                <h3 className="text-white font-medium truncate">
                  {item.title || item.content || item.caption || 'Untitled'}
                </h3>
                <div className="flex items-center gap-4 text-gray-500 text-sm mt-1">
                  {item.views && <span>{item.views} views</span>}
                  {item.duration && <span>{item.duration}</span>}
                  {item.likes !== undefined && <span>❤️ {item.likes}</span>}
                  {item.comments !== undefined && <span>💬 {item.comments}</span>}
                  {item.date && <span>{item.date}</span>}
                </div>
              </div>

              {/* Actions */}
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
        )}
      </div>

      {/* Form Modal */}
      {showForm && editingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setShowForm(false)} />
          <div className="relative bg-gray-950 border border-gray-800 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-xl font-semibold text-white mb-6">
                {editingItem.id ? 'Edit' : 'Add'} {activeTab === 'youtube' ? 'Video' : 'Post'}
              </h2>

              <div className="space-y-4">
                {/* YouTube Fields */}
                {activeTab === 'youtube' && (
                  <>
                    <div>
                      <label className="block text-gray-400 text-sm font-medium mb-2">Title *</label>
                      <input
                        type="text"
                        value={editingItem.title || ''}
                        onChange={(e) => setEditingItem(prev => ({ ...prev, title: e.target.value }))}
                        className="w-full px-4 py-3 bg-gray-900 border border-gray-800 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-gray-600"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-400 text-sm font-medium mb-2">Thumbnail URL *</label>
                      <input
                        type="text"
                        value={editingItem.thumbnail || ''}
                        onChange={(e) => setEditingItem(prev => ({ ...prev, thumbnail: e.target.value }))}
                        className="w-full px-4 py-3 bg-gray-900 border border-gray-800 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-gray-600"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-gray-400 text-sm font-medium mb-2">Views</label>
                        <input
                          type="text"
                          value={editingItem.views || ''}
                          onChange={(e) => setEditingItem(prev => ({ ...prev, views: e.target.value }))}
                          placeholder="12K"
                          className="w-full px-4 py-3 bg-gray-900 border border-gray-800 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-gray-600"
                        />
                      </div>
                      <div>
                        <label className="block text-gray-400 text-sm font-medium mb-2">Duration</label>
                        <input
                          type="text"
                          value={editingItem.duration || ''}
                          onChange={(e) => setEditingItem(prev => ({ ...prev, duration: e.target.value }))}
                          placeholder="15:32"
                          className="w-full px-4 py-3 bg-gray-900 border border-gray-800 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-gray-600"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-gray-400 text-sm font-medium mb-2">Video URL *</label>
                      <input
                        type="text"
                        value={editingItem.url || ''}
                        onChange={(e) => setEditingItem(prev => ({ ...prev, url: e.target.value }))}
                        className="w-full px-4 py-3 bg-gray-900 border border-gray-800 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-gray-600"
                      />
                    </div>
                  </>
                )}

                {/* LinkedIn Fields */}
                {activeTab === 'linkedin' && (
                  <>
                    <div>
                      <label className="block text-gray-400 text-sm font-medium mb-2">Content *</label>
                      <textarea
                        value={editingItem.content || ''}
                        onChange={(e) => setEditingItem(prev => ({ ...prev, content: e.target.value }))}
                        rows={4}
                        className="w-full px-4 py-3 bg-gray-900 border border-gray-800 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-gray-600 resize-none"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-gray-400 text-sm font-medium mb-2">Likes</label>
                        <input
                          type="number"
                          value={editingItem.likes || 0}
                          onChange={(e) => setEditingItem(prev => ({ ...prev, likes: e.target.value }))}
                          className="w-full px-4 py-3 bg-gray-900 border border-gray-800 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-gray-600"
                        />
                      </div>
                      <div>
                        <label className="block text-gray-400 text-sm font-medium mb-2">Comments</label>
                        <input
                          type="number"
                          value={editingItem.comments || 0}
                          onChange={(e) => setEditingItem(prev => ({ ...prev, comments: e.target.value }))}
                          className="w-full px-4 py-3 bg-gray-900 border border-gray-800 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-gray-600"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-gray-400 text-sm font-medium mb-2">Date</label>
                        <input
                          type="text"
                          value={editingItem.date || ''}
                          onChange={(e) => setEditingItem(prev => ({ ...prev, date: e.target.value }))}
                          placeholder="2 days ago"
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
                      <label className="block text-gray-400 text-sm font-medium mb-2">Post URL</label>
                      <input
                        type="text"
                        value={editingItem.url || ''}
                        onChange={(e) => setEditingItem(prev => ({ ...prev, url: e.target.value }))}
                        className="w-full px-4 py-3 bg-gray-900 border border-gray-800 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-gray-600"
                      />
                    </div>
                  </>
                )}

                {/* Instagram Fields */}
                {activeTab === 'instagram' && (
                  <>
                    <div>
                      <label className="block text-gray-400 text-sm font-medium mb-2">Image URL *</label>
                      <input
                        type="text"
                        value={editingItem.image || ''}
                        onChange={(e) => setEditingItem(prev => ({ ...prev, image: e.target.value }))}
                        className="w-full px-4 py-3 bg-gray-900 border border-gray-800 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-gray-600"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-400 text-sm font-medium mb-2">Caption</label>
                      <textarea
                        value={editingItem.caption || ''}
                        onChange={(e) => setEditingItem(prev => ({ ...prev, caption: e.target.value }))}
                        rows={2}
                        className="w-full px-4 py-3 bg-gray-900 border border-gray-800 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-gray-600 resize-none"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-gray-400 text-sm font-medium mb-2">Likes</label>
                        <input
                          type="number"
                          value={editingItem.likes || 0}
                          onChange={(e) => setEditingItem(prev => ({ ...prev, likes: e.target.value }))}
                          className="w-full px-4 py-3 bg-gray-900 border border-gray-800 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-gray-600"
                        />
                      </div>
                      <div>
                        <label className="block text-gray-400 text-sm font-medium mb-2">Date</label>
                        <input
                          type="text"
                          value={editingItem.date || ''}
                          onChange={(e) => setEditingItem(prev => ({ ...prev, date: e.target.value }))}
                          placeholder="3 days ago"
                          className="w-full px-4 py-3 bg-gray-900 border border-gray-800 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-gray-600"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-gray-400 text-sm font-medium mb-2">Post URL</label>
                        <input
                          type="text"
                          value={editingItem.url || ''}
                          onChange={(e) => setEditingItem(prev => ({ ...prev, url: e.target.value }))}
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
                  </>
                )}

                {/* Order field for YouTube */}
                {activeTab === 'youtube' && (
                  <div>
                    <label className="block text-gray-400 text-sm font-medium mb-2">Order</label>
                    <input
                      type="number"
                      value={editingItem.order || 0}
                      onChange={(e) => setEditingItem(prev => ({ ...prev, order: e.target.value }))}
                      className="w-full px-4 py-3 bg-gray-900 border border-gray-800 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-gray-600"
                    />
                  </div>
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
                  disabled={saving}
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

export default SocialMediaSettings
