import { useState, useEffect } from 'react'
import { doc, setDoc, collection, addDoc, deleteDoc, onSnapshot } from 'firebase/firestore'
import { db } from '../../firebase/config'

const QuotesSettings = () => {
  const [settings, setSettings] = useState({
    bottomNote: 'Refresh the page for a new quote of wisdom'
  })
  const [quotes, setQuotes] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState('quotes')
  
  // Form state for adding/editing quotes
  const [quoteForm, setQuoteForm] = useState({
    quote: '',
    author: '',
    role: '',
    imageUrl: ''
  })
  const [editingId, setEditingId] = useState(null)

  // Fetch settings
  useEffect(() => {
    const docRef = doc(db, 'settings', 'quotes')
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        setSettings(prev => ({ ...prev, ...docSnap.data() }))
      }
      setLoading(false)
    })
    return () => unsubscribe()
  }, [])

  // Fetch quotes
  useEffect(() => {
    const colRef = collection(db, 'quotes')
    const unsubscribe = onSnapshot(colRef, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
      data.sort((a, b) => (a.order || 0) - (b.order || 0))
      setQuotes(data)
    })
    return () => unsubscribe()
  }, [])

  const saveSettings = async () => {
    setSaving(true)
    try {
      await setDoc(doc(db, 'settings', 'quotes'), settings)
      alert('Settings saved successfully!')
    } catch (error) {
      alert('Failed to save settings')
    }
    setSaving(false)
  }

  const handleAddQuote = async () => {
    if (!quoteForm.quote || !quoteForm.author) {
      alert('Please fill in quote and author fields')
      return
    }

    try {
      if (editingId) {
        await setDoc(doc(db, 'quotes', editingId), {
          ...quoteForm,
          order: quotes.find(q => q.id === editingId)?.order || 0
        })
      } else {
        const maxOrder = quotes.length > 0 
          ? Math.max(...quotes.map(q => q.order || 0))
          : -1
        await addDoc(collection(db, 'quotes'), {
          ...quoteForm,
          order: maxOrder + 1
        })
      }
      setQuoteForm({ quote: '', author: '', role: '', imageUrl: '' })
      setEditingId(null)
    } catch (error) {
      alert('Failed to save quote')
    }
  }

  const handleEditQuote = (quote) => {
    setQuoteForm({
      quote: quote.quote,
      author: quote.author,
      role: quote.role || '',
      imageUrl: quote.imageUrl || ''
    })
    setEditingId(quote.id)
    setActiveTab('quotes')
  }

  const handleDeleteQuote = async (id) => {
    if (window.confirm('Are you sure you want to delete this quote?')) {
      try {
        await deleteDoc(doc(db, 'quotes', id))
      } catch (error) {
        alert('Failed to delete quote')
      }
    }
  }

  const cancelEdit = () => {
    setQuoteForm({ quote: '', author: '', role: '', imageUrl: '' })
    setEditingId(null)
  }

  // Generate initials from author name
  const getInitials = (author) => {
    if (!author) return '?'
    return author
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-8rem)]">
      <div className="max-w-4xl w-full">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white mb-2">Quotes Settings</h1>
          <p className="text-gray-400">Manage inspirational quotes displayed on your portfolio</p>
        </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setActiveTab('quotes')}
          className={`px-4 py-2 rounded-lg font-medium transition-all ${
            activeTab === 'quotes'
              ? 'bg-white text-black'
              : 'bg-gray-800 text-gray-400 hover:text-white'
          }`}
        >
          Quotes ({quotes.length})
        </button>
        <button
          onClick={() => setActiveTab('settings')}
          className={`px-4 py-2 rounded-lg font-medium transition-all ${
            activeTab === 'settings'
              ? 'bg-white text-black'
              : 'bg-gray-800 text-gray-400 hover:text-white'
          }`}
        >
          Section Settings
        </button>
      </div>

      {activeTab === 'quotes' && (
        <div className="space-y-6">
          {/* Add/Edit Quote Form */}
          <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
            <h2 className="text-lg font-semibold text-white mb-4">
              {editingId ? 'Edit Quote' : 'Add New Quote'}
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Quote Text *
                </label>
                <textarea
                  value={quoteForm.quote}
                  onChange={(e) => setQuoteForm(prev => ({ ...prev, quote: e.target.value }))}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white focus:outline-none focus:border-white resize-none"
                  rows={3}
                  placeholder="Enter the quote text..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Author *
                  </label>
                  <input
                    type="text"
                    value={quoteForm.author}
                    onChange={(e) => setQuoteForm(prev => ({ ...prev, author: e.target.value }))}
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white focus:outline-none focus:border-white"
                    placeholder="e.g. Steve Jobs"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Role/Title
                  </label>
                  <input
                    type="text"
                    value={quoteForm.role}
                    onChange={(e) => setQuoteForm(prev => ({ ...prev, role: e.target.value }))}
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white focus:outline-none focus:border-white"
                    placeholder="e.g. Co-founder of Apple"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Author Image URL (optional)
                </label>
                <input
                  type="text"
                  value={quoteForm.imageUrl}
                  onChange={(e) => setQuoteForm(prev => ({ ...prev, imageUrl: e.target.value }))}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white focus:outline-none focus:border-white"
                  placeholder="https://example.com/author-image.jpg"
                />
                <p className="text-gray-500 text-sm mt-1">
                  If left empty, initials from author name will be shown
                </p>
                {quoteForm.imageUrl && (
                  <div className="mt-3">
                    <img 
                      src={quoteForm.imageUrl} 
                      alt="Preview" 
                      className="w-16 h-16 object-cover rounded-lg border border-gray-700"
                      onError={(e) => e.target.style.display = 'none'}
                    />
                  </div>
                )}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleAddQuote}
                  className="px-6 py-2.5 bg-white text-black rounded-xl font-medium hover:bg-gray-200 transition-colors"
                >
                  {editingId ? 'Update Quote' : 'Add Quote'}
                </button>
                {editingId && (
                  <button
                    onClick={cancelEdit}
                    className="px-6 py-2.5 bg-gray-700 text-white rounded-xl font-medium hover:bg-gray-600 transition-colors"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Quotes List */}
          <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
            <h2 className="text-lg font-semibold text-white mb-4">All Quotes</h2>
            
            {quotes.length === 0 ? (
              <p className="text-gray-500 text-center py-8">
                No quotes added yet. Add your first quote above!
              </p>
            ) : (
              <div className="space-y-4">
                {quotes.map((quote, index) => (
                  <div
                    key={quote.id}
                    className="bg-gray-800 rounded-xl p-4 border border-gray-700"
                  >
                    <div className="flex gap-4">
                      {/* Avatar */}
                      <div className="flex-shrink-0 w-12 h-12 bg-black rounded-lg flex items-center justify-center overflow-hidden">
                        {quote.imageUrl ? (
                          <img 
                            src={quote.imageUrl} 
                            alt={quote.author}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-white font-bold text-sm">
                            {getInitials(quote.author)}
                          </span>
                        )}
                      </div>

                      {/* Quote Content */}
                      <div className="flex-1 min-w-0">
                        <p className="text-white mb-2 italic">"{quote.quote}"</p>
                        <div className="flex items-center gap-2 text-sm">
                          <span className="text-gray-300 font-medium">{quote.author}</span>
                          {quote.role && (
                            <>
                              <span className="text-gray-500">•</span>
                              <span className="text-gray-500">{quote.role}</span>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-start gap-2">
                        <button
                          onClick={() => handleEditQuote(quote)}
                          className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDeleteQuote(quote.id)}
                          className="p-2 text-gray-400 hover:text-red-400 hover:bg-gray-700 rounded-lg transition-colors"
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
            )}
          </div>
        </div>
      )}

      {activeTab === 'settings' && (
        <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
          <h2 className="text-lg font-semibold text-white mb-4">Section Settings</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Bottom Note
              </label>
              <input
                type="text"
                value={settings.bottomNote}
                onChange={(e) => setSettings(prev => ({ ...prev, bottomNote: e.target.value }))}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white focus:outline-none focus:border-white"
                placeholder="e.g. Refresh the page for a new quote of wisdom"
              />
              <p className="text-gray-500 text-sm mt-1">
                Displayed below the quote section
              </p>
            </div>

            <button
              onClick={saveSettings}
              disabled={saving}
              className="px-6 py-2.5 bg-white text-black rounded-xl font-medium hover:bg-gray-200 transition-colors disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save Settings'}
            </button>
          </div>
        </div>
      )}
      </div>
    </div>
  )
}

export default QuotesSettings

