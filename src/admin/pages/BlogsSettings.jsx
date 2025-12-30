import { useState, useEffect } from 'react'
import { collection, doc, getDocs, setDoc, deleteDoc, addDoc } from 'firebase/firestore'
import { db } from '../../firebase/config'
import Toast from '../../components/Toast'
import { useToast } from '../../hooks/useToast'

const BlogsSettings = () => {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [blogs, setBlogs] = useState([])
  const [editingItem, setEditingItem] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const { toast, showToast, hideToast } = useToast()
  
  // Section header settings
  const [sectionSettings, setSectionSettings] = useState({
    sectionSubtitle: 'Latest Articles',
    sectionTitle: 'My',
    sectionTitleHighlight: 'Blogs',
    sectionDescription: 'Sharing my knowledge and experiences through articles on development, design, and technology.',
    bottomNote: 'New articles are published regularly'
  })

  const emptyBlog = {
    title: '',
    excerpt: '',
    content: '',
    category: '',
    date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    readTime: '5 min read',
    imageUrl: '',
    author: 'Simrat Singh',
    tags: '',
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
        if (doc.id === 'blogs') {
          setSectionSettings(prev => ({ ...prev, ...doc.data() }))
        }
      })

      // Fetch blogs
      const snapshot = await getDocs(collection(db, 'blogs'))
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
      data.sort((a, b) => (a.order || 0) - (b.order || 0))
      setBlogs(data)
    } catch (error) {
    }
    setLoading(false)
  }

  const handleSaveSectionSettings = async () => {
    setSaving(true)
    try {
      await setDoc(doc(db, 'settings', 'blogs'), sectionSettings, { merge: true })
      showToast('Section settings saved successfully!', 'success')
    } catch (error) {
      showToast('Failed to save settings. Please try again.', 'error')
    }
    setSaving(false)
  }

  const handleSaveItem = async (item) => {
    setSaving(true)
    try {
      // Convert tags string to array
      const tagsArray = typeof item.tags === 'string' 
        ? item.tags.split(',').map(t => t.trim()).filter(t => t)
        : (item.tags || [])

      const itemData = {
        ...item,
        tags: tagsArray,
        order: parseInt(item.order) || 0,
        updatedAt: new Date().toISOString()
      }

      if (item.id) {
        await setDoc(doc(db, 'blogs', item.id), itemData, { merge: true })
      } else {
        await addDoc(collection(db, 'blogs'), {
          ...itemData,
          createdAt: new Date().toISOString()
        })
      }
      
      await fetchData()
      setEditingItem(null)
      setShowForm(false)
      showToast(item.id ? 'Blog updated successfully!' : 'Blog added successfully!', 'success')
    } catch (error) {
      showToast('Failed to save blog. Please try again.', 'error')
    }
    setSaving(false)
  }

  const handleDeleteItem = async (item) => {
    if (!confirm(`Are you sure you want to delete "${item.title}"?`)) return
    
    try {
      await deleteDoc(doc(db, 'blogs', item.id))
      await fetchData()
    } catch (error) {
      alert('Failed to delete.')
    }
  }

  const getEmptyBlog = () => {
    const maxOrder = blogs.length > 0 
      ? Math.max(...blogs.map(b => b.order || 0))
      : -1
    return { ...emptyBlog, order: maxOrder + 1 }
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
          <h1 className="text-3xl font-bold text-white mb-2">Blogs</h1>
          <p className="text-gray-500">Manage your blog articles and content.</p>
        </div>
        <button
          onClick={() => {
            setEditingItem(getEmptyBlog())
            setShowForm(true)
          }}
          className="px-6 py-3 rounded-xl font-medium bg-white text-black hover:bg-gray-200 transition-all flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Blog
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
              placeholder="Latest Articles"
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
              placeholder="Blogs"
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
            placeholder="Sharing my knowledge..."
            className="w-full px-4 py-3 bg-gray-900 border border-gray-800 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-gray-600"
          />
        </div>
        <div>
          <label className="block text-gray-400 text-sm font-medium mb-2">Bottom Note</label>
          <input
            type="text"
            value={sectionSettings.bottomNote}
            onChange={(e) => setSectionSettings(prev => ({ ...prev, bottomNote: e.target.value }))}
            placeholder="New articles are published regularly"
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

      {/* Blogs List */}
      <div className="space-y-4">
        {blogs.length === 0 ? (
          <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-12 text-center">
            <div className="w-16 h-16 rounded-2xl bg-gray-800 flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">📝</span>
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">No Blogs Yet</h3>
            <p className="text-gray-500 mb-4">Start writing and sharing your knowledge.</p>
            <button
              onClick={() => {
                setEditingItem(getEmptyBlog())
                setShowForm(true)
              }}
              className="px-6 py-3 rounded-xl font-medium bg-white text-black hover:bg-gray-200 transition-all"
            >
              Write First Blog
            </button>
          </div>
        ) : (
          blogs.map((item) => (
            <div
              key={item.id}
              className="bg-gray-900/50 border border-gray-800 rounded-2xl p-6 flex items-start gap-6"
            >
              {/* Image */}
              <div className="w-14 h-14 rounded-xl bg-gray-800 flex items-center justify-center overflow-hidden flex-shrink-0">
                {item.imageUrl ? (
                  <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-2xl">📝</span>
                )}
              </div>
              
              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-1">
                  <h3 className="text-lg font-semibold text-white truncate">{item.title}</h3>
                  <span className="px-2 py-0.5 bg-gray-800 text-gray-400 text-xs rounded">{item.category}</span>
                </div>
                <p className="text-gray-400 text-sm mb-2">{item.date} • {item.readTime}</p>
                <p className="text-gray-500 text-sm line-clamp-2">{item.excerpt}</p>
                {item.tags && item.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {item.tags.map((tag, i) => (
                      <span key={i} className="px-2 py-0.5 bg-gray-800 text-gray-500 text-xs">{tag}</span>
                    ))}
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  onClick={() => {
                    // Convert tags array to string for editing
                    const tagsString = Array.isArray(item.tags) ? item.tags.join(', ') : (item.tags || '')
                    setEditingItem({ ...item, tags: tagsString })
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
                {editingItem.id ? 'Edit Blog' : 'Add New Blog'}
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-gray-400 text-sm font-medium mb-2">Title *</label>
                  <input
                    type="text"
                    value={editingItem.title}
                    onChange={(e) => setEditingItem(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Blog title..."
                    className="w-full px-4 py-3 bg-gray-900 border border-gray-800 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-gray-600"
                  />
                </div>

                <div>
                  <label className="block text-gray-400 text-sm font-medium mb-2">Category *</label>
                  <input
                    type="text"
                    value={editingItem.category}
                    onChange={(e) => setEditingItem(prev => ({ ...prev, category: e.target.value }))}
                    placeholder="React, TypeScript, etc."
                    className="w-full px-4 py-3 bg-gray-900 border border-gray-800 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-gray-600"
                  />
                </div>

                <div>
                  <label className="block text-gray-400 text-sm font-medium mb-2">Image URL</label>
                  <input
                    type="text"
                    value={editingItem.imageUrl}
                    onChange={(e) => setEditingItem(prev => ({ ...prev, imageUrl: e.target.value }))}
                    placeholder="https://example.com/image.jpg"
                    className="w-full px-4 py-3 bg-gray-900 border border-gray-800 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-gray-600"
                  />
                  {editingItem.imageUrl && (
                    <div className="mt-2 w-20 h-20 rounded-lg overflow-hidden bg-gray-800">
                      <img src={editingItem.imageUrl} alt="Preview" className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-gray-400 text-sm font-medium mb-2">Date</label>
                    <input
                      type="text"
                      value={editingItem.date}
                      onChange={(e) => setEditingItem(prev => ({ ...prev, date: e.target.value }))}
                      placeholder="Dec 26, 2024"
                      className="w-full px-4 py-3 bg-gray-900 border border-gray-800 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-gray-600"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-400 text-sm font-medium mb-2">Read Time</label>
                    <input
                      type="text"
                      value={editingItem.readTime}
                      onChange={(e) => setEditingItem(prev => ({ ...prev, readTime: e.target.value }))}
                      placeholder="5 min read"
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
                  </div>
                </div>

                <div>
                  <label className="block text-gray-400 text-sm font-medium mb-2">Author</label>
                  <input
                    type="text"
                    value={editingItem.author}
                    onChange={(e) => setEditingItem(prev => ({ ...prev, author: e.target.value }))}
                    placeholder="Simrat Singh"
                    className="w-full px-4 py-3 bg-gray-900 border border-gray-800 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-gray-600"
                  />
                </div>

                <div>
                  <label className="block text-gray-400 text-sm font-medium mb-2">Tags (comma-separated)</label>
                  <input
                    type="text"
                    value={editingItem.tags}
                    onChange={(e) => setEditingItem(prev => ({ ...prev, tags: e.target.value }))}
                    placeholder="React, Hooks, Architecture"
                    className="w-full px-4 py-3 bg-gray-900 border border-gray-800 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-gray-600"
                  />
                </div>

                <div>
                  <label className="block text-gray-400 text-sm font-medium mb-2">Excerpt *</label>
                  <textarea
                    value={editingItem.excerpt}
                    onChange={(e) => setEditingItem(prev => ({ ...prev, excerpt: e.target.value }))}
                    placeholder="A brief description of the blog..."
                    rows={2}
                    className="w-full px-4 py-3 bg-gray-900 border border-gray-800 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-gray-600 resize-none"
                  />
                </div>

                <div>
                  <label className="block text-gray-400 text-sm font-medium mb-2">Content * (Markdown supported)</label>
                  <textarea
                    value={editingItem.content}
                    onChange={(e) => setEditingItem(prev => ({ ...prev, content: e.target.value }))}
                    placeholder="Write your blog content here... Supports Markdown formatting."
                    rows={10}
                    className="w-full px-4 py-3 bg-gray-900 border border-gray-800 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-gray-600 resize-none font-mono text-sm"
                  />
                  <p className="text-gray-600 text-xs mt-1">Supports Markdown: ## Headings, **bold**, *italic*, `code`, ```code blocks```, lists, tables</p>
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
                  disabled={saving || !editingItem.title || !editingItem.excerpt || !editingItem.content}
                  className="flex-1 px-6 py-3 rounded-xl font-medium bg-white text-black hover:bg-gray-200 transition-all disabled:opacity-50"
                >
                  {saving ? 'Saving...' : editingItem.id ? 'Update' : 'Publish Blog'}
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

export default BlogsSettings

