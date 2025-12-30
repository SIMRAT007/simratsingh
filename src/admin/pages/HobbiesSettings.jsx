import { useState, useEffect } from 'react'
import { collection, doc, getDocs, setDoc, deleteDoc, addDoc } from 'firebase/firestore'
import { db } from '../../firebase/config'

const HobbiesSettings = () => {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [hobbies, setHobbies] = useState([])
  const [editingItem, setEditingItem] = useState(null)
  const [showForm, setShowForm] = useState(false)
  
  // Section header settings
  const [sectionSettings, setSectionSettings] = useState({
    sectionSubtitle: 'Beyond Coding',
    sectionTitle: 'My',
    sectionTitleHighlight: 'Hobbies',
    bottomQuote: '"All work and no play makes Jack a dull boy" — finding balance in life'
  })

  const emptyHobby = {
    name: '',
    description: '',
    icon: '🎯',
    order: 0
  }

  // Predefined icons for quick selection
  const predefinedIcons = [
    { emoji: '🎤', label: 'Singing' },
    { emoji: '🎨', label: 'Painting' },
    { emoji: '✈️', label: 'Travelling' },
    { emoji: '📚', label: 'Reading' },
    { emoji: '🎮', label: 'Gaming' },
    { emoji: '📷', label: 'Photography' },
    { emoji: '🎸', label: 'Music' },
    { emoji: '⚽', label: 'Sports' },
    { emoji: '🏃', label: 'Running' },
    { emoji: '🧘', label: 'Yoga' },
    { emoji: '🎬', label: 'Movies' },
    { emoji: '🍳', label: 'Cooking' },
    { emoji: '🌱', label: 'Gardening' },
    { emoji: '✍️', label: 'Writing' },
    { emoji: '🎯', label: 'Target' },
    { emoji: '🏊', label: 'Swimming' },
    { emoji: '🚴', label: 'Cycling' },
    { emoji: '🎹', label: 'Piano' },
    { emoji: '💪', label: 'Fitness' },
    { emoji: '🧩', label: 'Puzzles' },
  ]

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      // Fetch section settings
      const settingsDoc = await getDocs(collection(db, 'settings'))
      settingsDoc.forEach(doc => {
        if (doc.id === 'hobbies') {
          setSectionSettings(prev => ({ ...prev, ...doc.data() }))
        }
      })

      // Fetch hobbies
      const snapshot = await getDocs(collection(db, 'hobbies'))
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
      data.sort((a, b) => (a.order || 0) - (b.order || 0))
      setHobbies(data)
    } catch (error) {
    }
    setLoading(false)
  }

  const handleSaveSectionSettings = async () => {
    setSaving(true)
    try {
      await setDoc(doc(db, 'settings', 'hobbies'), sectionSettings, { merge: true })
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
        order: parseInt(item.order) || 0,
        updatedAt: new Date().toISOString()
      }

      if (item.id) {
        await setDoc(doc(db, 'hobbies', item.id), itemData, { merge: true })
      } else {
        await addDoc(collection(db, 'hobbies'), {
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
    if (!confirm(`Are you sure you want to delete "${item.name}"?`)) return
    
    try {
      await deleteDoc(doc(db, 'hobbies', item.id))
      await fetchData()
    } catch (error) {
      alert('Failed to delete.')
    }
  }

  const getEmptyHobby = () => {
    const maxOrder = hobbies.length > 0 
      ? Math.max(...hobbies.map(h => h.order || 0))
      : -1
    return { ...emptyHobby, order: maxOrder + 1 }
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
          <h1 className="text-3xl font-bold text-white mb-2">Hobbies</h1>
          <p className="text-gray-500">Manage your hobbies and interests.</p>
        </div>
        <button
          onClick={() => {
            setEditingItem(getEmptyHobby())
            setShowForm(true)
          }}
          className="px-6 py-3 rounded-xl font-medium bg-white text-black hover:bg-gray-200 transition-all flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Hobby
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
              placeholder="Beyond Coding"
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
              placeholder="Hobbies"
              className="w-full px-4 py-3 bg-gray-900 border border-gray-800 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-gray-600"
            />
          </div>
        </div>
        <div>
          <label className="block text-gray-400 text-sm font-medium mb-2">Bottom Quote</label>
          <input
            type="text"
            value={sectionSettings.bottomQuote}
            onChange={(e) => setSectionSettings(prev => ({ ...prev, bottomQuote: e.target.value }))}
            placeholder="Finding balance in life..."
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

      {/* Hobbies Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {hobbies.length === 0 ? (
          <div className="col-span-full bg-gray-900/50 border border-gray-800 rounded-2xl p-12 text-center">
            <div className="w-16 h-16 rounded-2xl bg-gray-800 flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">🎯</span>
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">No Hobbies Added</h3>
            <p className="text-gray-500 mb-4">Add your hobbies and interests.</p>
            <button
              onClick={() => {
                setEditingItem(getEmptyHobby())
                setShowForm(true)
              }}
              className="px-6 py-3 rounded-xl font-medium bg-white text-black hover:bg-gray-200 transition-all"
            >
              Add First Hobby
            </button>
          </div>
        ) : (
          hobbies.map((hobby) => (
            <div
              key={hobby.id}
              className="bg-gray-900/50 border border-gray-800 rounded-2xl p-6 text-center relative group"
            >
              {/* Icon */}
              <div className="w-14 h-14 mx-auto mb-3 bg-gray-800 rounded-full flex items-center justify-center text-3xl">
                {hobby.icon || '🎯'}
              </div>
              
              {/* Name */}
              <h3 className="text-white font-semibold mb-1">{hobby.name}</h3>
              
              {/* Description */}
              <p className="text-gray-500 text-xs line-clamp-2">{hobby.description}</p>

              {/* Actions Overlay */}
              <div className="absolute inset-0 bg-black/80 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <button
                  onClick={() => {
                    setEditingItem({ ...hobby })
                    setShowForm(true)
                  }}
                  className="p-2 rounded-lg bg-white text-black hover:bg-gray-200 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
                <button
                  onClick={() => handleDeleteItem(hobby)}
                  className="p-2 rounded-lg bg-red-500 text-white hover:bg-red-600 transition-colors"
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
          <div className="relative bg-gray-950 border border-gray-800 rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-xl font-semibold text-white mb-6">
                {editingItem.id ? 'Edit Hobby' : 'Add New Hobby'}
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-gray-400 text-sm font-medium mb-2">Hobby Name *</label>
                  <input
                    type="text"
                    value={editingItem.name}
                    onChange={(e) => setEditingItem(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g., Singing, Painting..."
                    className="w-full px-4 py-3 bg-gray-900 border border-gray-800 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-gray-600"
                  />
                </div>

                <div>
                  <label className="block text-gray-400 text-sm font-medium mb-2">Description</label>
                  <textarea
                    value={editingItem.description}
                    onChange={(e) => setEditingItem(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Brief description of this hobby..."
                    rows={2}
                    className="w-full px-4 py-3 bg-gray-900 border border-gray-800 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-gray-600 resize-none"
                  />
                </div>

                <div>
                  <label className="block text-gray-400 text-sm font-medium mb-2">Icon (Emoji)</label>
                  <input
                    type="text"
                    value={editingItem.icon}
                    onChange={(e) => setEditingItem(prev => ({ ...prev, icon: e.target.value }))}
                    placeholder="🎯"
                    className="w-full px-4 py-3 bg-gray-900 border border-gray-800 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-gray-600 text-2xl text-center"
                  />
                  {/* Quick Icon Picker */}
                  <div className="mt-3 flex flex-wrap gap-2">
                    {predefinedIcons.map((icon) => (
                      <button
                        key={icon.emoji}
                        type="button"
                        onClick={() => setEditingItem(prev => ({ ...prev, icon: icon.emoji }))}
                        className={`w-10 h-10 rounded-lg flex items-center justify-center text-xl transition-all ${
                          editingItem.icon === icon.emoji 
                            ? 'bg-white text-black' 
                            : 'bg-gray-800 hover:bg-gray-700'
                        }`}
                        title={icon.label}
                      >
                        {icon.emoji}
                      </button>
                    ))}
                  </div>
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
                  disabled={saving || !editingItem.name}
                  className="flex-1 px-6 py-3 rounded-xl font-medium bg-white text-black hover:bg-gray-200 transition-all disabled:opacity-50"
                >
                  {saving ? 'Saving...' : editingItem.id ? 'Update' : 'Add Hobby'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default HobbiesSettings

