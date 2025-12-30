import { useState, useEffect } from 'react'
import { doc, setDoc, collection, addDoc, deleteDoc, onSnapshot } from 'firebase/firestore'
import { db } from '../../firebase/config'

const MusicSettings = () => {
  const [settings, setSettings] = useState({
    sectionSubtitle: "What I'm Listening To",
    sectionTitle: 'Music',
    sectionTitleHighlight: 'of the Day',
    bottomNote: '🎧 Vibes that keep me coding • Click play to listen'
  })
  const [tracks, setTracks] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState('tracks')
  
  // Form state for adding/editing tracks
  const [trackForm, setTrackForm] = useState({
    title: '',
    artist: '',
    audioUrl: '',
    coverUrl: '',
    genre: '',
    releaseDate: ''
  })
  const [editingId, setEditingId] = useState(null)

  // Fetch settings
  useEffect(() => {
    const docRef = doc(db, 'settings', 'music')
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        setSettings(prev => ({ ...prev, ...docSnap.data() }))
      }
      setLoading(false)
    })
    return () => unsubscribe()
  }, [])

  // Fetch tracks
  useEffect(() => {
    const colRef = collection(db, 'music')
    const unsubscribe = onSnapshot(colRef, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
      data.sort((a, b) => (a.order || 0) - (b.order || 0))
      setTracks(data)
    })
    return () => unsubscribe()
  }, [])

  const saveSettings = async () => {
    setSaving(true)
    try {
      await setDoc(doc(db, 'settings', 'music'), settings)
      alert('Settings saved successfully!')
    } catch (error) {
      alert('Failed to save settings')
    }
    setSaving(false)
  }

  const handleAddTrack = async () => {
    if (!trackForm.title || !trackForm.artist || !trackForm.audioUrl) {
      alert('Please fill in title, artist, and audio URL fields')
      return
    }

    try {
      if (editingId) {
        await setDoc(doc(db, 'music', editingId), {
          ...trackForm,
          order: tracks.find(t => t.id === editingId)?.order || 0
        })
      } else {
        const maxOrder = tracks.length > 0 
          ? Math.max(...tracks.map(t => t.order || 0))
          : -1
        await addDoc(collection(db, 'music'), {
          ...trackForm,
          order: maxOrder + 1
        })
      }
      setTrackForm({ title: '', artist: '', audioUrl: '', coverUrl: '', genre: '', releaseDate: '' })
      setEditingId(null)
      alert('Track saved successfully!')
    } catch (error) {
      alert('Failed to save track')
    }
  }

  const handleEditTrack = (track) => {
    setTrackForm({
      title: track.title || '',
      artist: track.artist || '',
      audioUrl: track.audioUrl || '',
      coverUrl: track.coverUrl || '',
      genre: track.genre || '',
      releaseDate: track.releaseDate || ''
    })
    setEditingId(track.id)
    setActiveTab('tracks')
  }

  const handleDeleteTrack = async (id) => {
    if (window.confirm('Are you sure you want to delete this track?')) {
      try {
        await deleteDoc(doc(db, 'music', id))
      } catch (error) {
        alert('Failed to delete track')
      }
    }
  }

  const cancelEdit = () => {
    setTrackForm({ title: '', artist: '', audioUrl: '', coverUrl: '', genre: '', releaseDate: '' })
    setEditingId(null)
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
          <h1 className="text-2xl font-bold text-white mb-2">Music Settings</h1>
          <p className="text-gray-400">Manage your "Music of the Day" playlist</p>
        </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setActiveTab('tracks')}
          className={`px-4 py-2 rounded-lg font-medium transition-all ${
            activeTab === 'tracks'
              ? 'bg-white text-black'
              : 'bg-gray-800 text-gray-400 hover:text-white'
          }`}
        >
          Tracks ({tracks.length})
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

      {activeTab === 'tracks' && (
        <div className="space-y-6">
          {/* Add/Edit Track Form */}
          <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
            <h2 className="text-lg font-semibold text-white mb-4">
              {editingId ? 'Edit Track' : 'Add New Track'}
            </h2>
            
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Song Title *
                  </label>
                  <input
                    type="text"
                    value={trackForm.title}
                    onChange={(e) => setTrackForm(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white focus:outline-none focus:border-white"
                    placeholder="e.g. Midnight Coding"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Artist *
                  </label>
                  <input
                    type="text"
                    value={trackForm.artist}
                    onChange={(e) => setTrackForm(prev => ({ ...prev, artist: e.target.value }))}
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white focus:outline-none focus:border-white"
                    placeholder="e.g. Lo-Fi Beats"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Audio URL (MP3 Link) *
                </label>
                <input
                  type="text"
                  value={trackForm.audioUrl}
                  onChange={(e) => setTrackForm(prev => ({ ...prev, audioUrl: e.target.value }))}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white focus:outline-none focus:border-white"
                  placeholder="https://example.com/song.mp3"
                />
                <p className="text-gray-500 text-sm mt-1">
                  Direct link to MP3 file OR SoundCloud track URL (e.g., https://soundcloud.com/user/track-name). 
                  <br />
                  <span className="text-gray-600 text-xs">SoundCloud links are automatically detected and embedded.</span>
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Cover Image URL (optional)
                </label>
                <input
                  type="text"
                  value={trackForm.coverUrl}
                  onChange={(e) => setTrackForm(prev => ({ ...prev, coverUrl: e.target.value }))}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white focus:outline-none focus:border-white"
                  placeholder="https://example.com/cover.jpg"
                />
                {trackForm.coverUrl && (
                  <div className="mt-3">
                    <img 
                      src={trackForm.coverUrl} 
                      alt="Cover Preview" 
                      className="w-20 h-20 object-cover rounded-lg border border-gray-700"
                      onError={(e) => e.target.style.display = 'none'}
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Genre (optional)
                </label>
                <input
                  type="text"
                  value={trackForm.genre}
                  onChange={(e) => setTrackForm(prev => ({ ...prev, genre: e.target.value }))}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white focus:outline-none focus:border-white"
                  placeholder="e.g. Rock, Pop, Electronic, Hip-Hop"
                />
                <p className="text-gray-500 text-sm mt-1">
                  Genre will be displayed in the genres section on the right side of the player
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Release Date (optional)
                </label>
                <input
                  type="text"
                  value={trackForm.releaseDate}
                  onChange={(e) => setTrackForm(prev => ({ ...prev, releaseDate: e.target.value }))}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white focus:outline-none focus:border-white"
                  placeholder="e.g. 2024, January 2024, 2024-01-15"
                />
                <p className="text-gray-500 text-sm mt-1">
                  Release date will be displayed below the genres
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleAddTrack}
                  className="px-6 py-2.5 bg-white text-black rounded-xl font-medium hover:bg-gray-200 transition-colors"
                >
                  {editingId ? 'Update Track' : 'Add Track'}
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

          {/* Tracks List */}
          <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
            <h2 className="text-lg font-semibold text-white mb-4">All Tracks</h2>
            
            {tracks.length === 0 ? (
              <p className="text-gray-500 text-center py-8">
                No tracks added yet. Add your first track above!
              </p>
            ) : (
              <div className="space-y-4">
                {tracks.map((track) => (
                  <div
                    key={track.id}
                    className="bg-gray-800 rounded-xl p-4 border border-gray-700"
                  >
                    <div className="flex gap-4">
                      {/* Cover */}
                      <div className="flex-shrink-0 w-16 h-16 bg-gray-900 rounded-lg overflow-hidden">
                        {track.coverUrl ? (
                          <img 
                            src={track.coverUrl} 
                            alt={track.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <svg className="w-8 h-8 text-gray-600" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
                            </svg>
                          </div>
                        )}
                      </div>

                      {/* Track Info */}
                      <div className="flex-1 min-w-0">
                        <h3 className="text-white font-medium truncate">{track.title}</h3>
                        <p className="text-gray-500 text-sm truncate">{track.artist}</p>
                        <p className="text-gray-600 text-xs mt-1 truncate">{track.audioUrl}</p>
                      </div>

                      {/* Actions */}
                      <div className="flex items-start gap-2">
                        <button
                          onClick={() => handleEditTrack(track)}
                          className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDeleteTrack(track.id)}
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
                Section Subtitle
              </label>
              <input
                type="text"
                value={settings.sectionSubtitle}
                onChange={(e) => setSettings(prev => ({ ...prev, sectionSubtitle: e.target.value }))}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white focus:outline-none focus:border-white"
                placeholder="e.g. What I'm Listening To"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Section Title
                </label>
                <input
                  type="text"
                  value={settings.sectionTitle}
                  onChange={(e) => setSettings(prev => ({ ...prev, sectionTitle: e.target.value }))}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white focus:outline-none focus:border-white"
                  placeholder="e.g. Music"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Title Highlight
                </label>
                <input
                  type="text"
                  value={settings.sectionTitleHighlight}
                  onChange={(e) => setSettings(prev => ({ ...prev, sectionTitleHighlight: e.target.value }))}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white focus:outline-none focus:border-white"
                  placeholder="e.g. of the Day"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Bottom Note
              </label>
              <input
                type="text"
                value={settings.bottomNote}
                onChange={(e) => setSettings(prev => ({ ...prev, bottomNote: e.target.value }))}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white focus:outline-none focus:border-white"
                placeholder="e.g. 🎧 Vibes that keep me coding"
              />
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

export default MusicSettings

