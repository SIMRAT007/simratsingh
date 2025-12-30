import { useState, useEffect } from 'react'
import { collection, doc, getDocs, setDoc, deleteDoc, addDoc } from 'firebase/firestore'
import { db } from '../../firebase/config'

const TestimonialsSettings = () => {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [testimonials, setTestimonials] = useState([])
  const [editingItem, setEditingItem] = useState(null)
  const [showForm, setShowForm] = useState(false)
  
  // Section header settings
  const [sectionSettings, setSectionSettings] = useState({
    sectionSubtitle: 'What People Say',
    sectionTitle: 'Client',
    sectionTitleHighlight: 'Testimonials',
    bottomNote: 'Building lasting relationships through quality work'
  })

  const emptyTestimonial = {
    name: '',
    role: '',
    company: '',
    image: '',
    testimonial: '',
    rating: 5,
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
        if (doc.id === 'testimonials') {
          setSectionSettings(prev => ({ ...prev, ...doc.data() }))
        }
      })

      // Fetch testimonials
      const snapshot = await getDocs(collection(db, 'testimonials'))
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
      data.sort((a, b) => (a.order || 0) - (b.order || 0))
      setTestimonials(data)
    } catch (error) {
    }
    setLoading(false)
  }

  const handleSaveSectionSettings = async () => {
    setSaving(true)
    try {
      await setDoc(doc(db, 'settings', 'testimonials'), sectionSettings, { merge: true })
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
        rating: parseInt(item.rating) || 5,
        order: parseInt(item.order) || 0,
        updatedAt: new Date().toISOString()
      }

      if (item.id) {
        await setDoc(doc(db, 'testimonials', item.id), itemData, { merge: true })
      } else {
        await addDoc(collection(db, 'testimonials'), {
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
    if (!confirm(`Are you sure you want to delete testimonial from "${item.name}"?`)) return
    
    try {
      await deleteDoc(doc(db, 'testimonials', item.id))
      await fetchData()
    } catch (error) {
      alert('Failed to delete.')
    }
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
          <h1 className="text-3xl font-bold text-white mb-2">Testimonials</h1>
          <p className="text-gray-500">Manage client testimonials and reviews.</p>
        </div>
        <button
          onClick={() => {
            // Auto-increment order from last item
            const maxOrder = testimonials.length > 0 
              ? Math.max(...testimonials.map(t => t.order || 0))
              : -1
            setEditingItem({ ...emptyTestimonial, order: maxOrder + 1 })
            setShowForm(true)
          }}
          className="px-6 py-3 rounded-xl font-medium bg-white text-black hover:bg-gray-200 transition-all flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Testimonial
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
              placeholder="What People Say"
              className="w-full px-4 py-3 bg-gray-900 border border-gray-800 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-gray-600"
            />
          </div>
          <div>
            <label className="block text-gray-400 text-sm font-medium mb-2">Title</label>
            <input
              type="text"
              value={sectionSettings.sectionTitle}
              onChange={(e) => setSectionSettings(prev => ({ ...prev, sectionTitle: e.target.value }))}
              placeholder="Client"
              className="w-full px-4 py-3 bg-gray-900 border border-gray-800 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-gray-600"
            />
          </div>
          <div>
            <label className="block text-gray-400 text-sm font-medium mb-2">Title Highlight</label>
            <input
              type="text"
              value={sectionSettings.sectionTitleHighlight}
              onChange={(e) => setSectionSettings(prev => ({ ...prev, sectionTitleHighlight: e.target.value }))}
              placeholder="Testimonials"
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
            placeholder="Building lasting relationships..."
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

      {/* Testimonials List */}
      <div className="space-y-4">
        {testimonials.length === 0 ? (
          <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-12 text-center">
            <div className="w-16 h-16 rounded-2xl bg-gray-800 flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">💬</span>
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">No Testimonials Yet</h3>
            <p className="text-gray-500 mb-4">Add client testimonials to showcase your work.</p>
            <button
              onClick={() => {
                // Auto-increment order from last item
                const maxOrder = testimonials.length > 0 
                  ? Math.max(...testimonials.map(t => t.order || 0))
                  : -1
                setEditingItem({ ...emptyTestimonial, order: maxOrder + 1 })
                setShowForm(true)
              }}
              className="px-6 py-3 rounded-xl font-medium bg-white text-black hover:bg-gray-200 transition-all"
            >
              Add First Testimonial
            </button>
          </div>
        ) : (
          testimonials.map((item) => (
            <div
              key={item.id}
              className="bg-gray-900/50 border border-gray-800 rounded-2xl p-6 flex items-start gap-6"
            >
              {/* Avatar */}
              <div className="w-14 h-14 rounded-xl bg-gray-800 flex items-center justify-center overflow-hidden flex-shrink-0">
                {item.image ? (
                  item.image.startsWith('http') ? (
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-lg font-bold text-gray-400">{item.image}</span>
                  )
                ) : (
                  <span className="text-lg font-bold text-gray-400">
                    {item.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                  </span>
                )}
              </div>
              
              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-1">
                  <h3 className="text-lg font-semibold text-white">{item.name}</h3>
                  <div className="flex gap-0.5">
                    {[...Array(item.rating || 5)].map((_, i) => (
                      <span key={i} className="text-yellow-500 text-sm">★</span>
                    ))}
                  </div>
                </div>
                <p className="text-gray-400 text-sm mb-2">{item.role} at {item.company}</p>
                <p className="text-gray-500 text-sm line-clamp-2">"{item.testimonial}"</p>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 flex-shrink-0">
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
                {editingItem.id ? 'Edit Testimonial' : 'Add New Testimonial'}
              </h2>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-400 text-sm font-medium mb-2">Client Name *</label>
                    <input
                      type="text"
                      value={editingItem.name}
                      onChange={(e) => setEditingItem(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="John Doe"
                      className="w-full px-4 py-3 bg-gray-900 border border-gray-800 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-gray-600"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-400 text-sm font-medium mb-2">Role *</label>
                    <input
                      type="text"
                      value={editingItem.role}
                      onChange={(e) => setEditingItem(prev => ({ ...prev, role: e.target.value }))}
                      placeholder="CEO"
                      className="w-full px-4 py-3 bg-gray-900 border border-gray-800 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-gray-600"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-gray-400 text-sm font-medium mb-2">Company *</label>
                  <input
                    type="text"
                    value={editingItem.company}
                    onChange={(e) => setEditingItem(prev => ({ ...prev, company: e.target.value }))}
                    placeholder="Company Name"
                    className="w-full px-4 py-3 bg-gray-900 border border-gray-800 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-gray-600"
                  />
                </div>

                <div>
                  <label className="block text-gray-400 text-sm font-medium mb-2">Image (URL or Initials)</label>
                  <input
                    type="text"
                    value={editingItem.image}
                    onChange={(e) => setEditingItem(prev => ({ ...prev, image: e.target.value }))}
                    placeholder="https://... or JD"
                    className="w-full px-4 py-3 bg-gray-900 border border-gray-800 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-gray-600"
                  />
                  <p className="text-gray-600 text-xs mt-1">Leave empty to auto-generate initials from name</p>
                </div>

                <div>
                  <label className="block text-gray-400 text-sm font-medium mb-2">Testimonial *</label>
                  <textarea
                    value={editingItem.testimonial}
                    onChange={(e) => setEditingItem(prev => ({ ...prev, testimonial: e.target.value }))}
                    placeholder="What did the client say about your work..."
                    rows={4}
                    className="w-full px-4 py-3 bg-gray-900 border border-gray-800 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-gray-600 resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-400 text-sm font-medium mb-2">Rating (1-5)</label>
                    <select
                      value={editingItem.rating}
                      onChange={(e) => setEditingItem(prev => ({ ...prev, rating: parseInt(e.target.value) }))}
                      className="w-full px-4 py-3 bg-gray-900 border border-gray-800 rounded-xl text-white focus:outline-none focus:border-gray-600"
                    >
                      <option value={5}>⭐⭐⭐⭐⭐ (5)</option>
                      <option value={4}>⭐⭐⭐⭐ (4)</option>
                      <option value={3}>⭐⭐⭐ (3)</option>
                      <option value={2}>⭐⭐ (2)</option>
                      <option value={1}>⭐ (1)</option>
                    </select>
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
                  disabled={saving || !editingItem.name || !editingItem.testimonial}
                  className="flex-1 px-6 py-3 rounded-xl font-medium bg-white text-black hover:bg-gray-200 transition-all disabled:opacity-50"
                >
                  {saving ? 'Saving...' : editingItem.id ? 'Update' : 'Add Testimonial'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default TestimonialsSettings

