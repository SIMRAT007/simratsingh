import { useState, useEffect } from 'react'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import { db } from '../../firebase/config'

// Input component moved outside to prevent focus loss
const InputField = ({ label, value, onChange, placeholder, hint, id }) => (
  <div>
    <label className="block text-gray-400 text-sm font-medium mb-2">{label}</label>
    <input
      type="text"
      id={id}
      value={value || ''}
      onChange={onChange}
      placeholder={placeholder}
      autoComplete="off"
      className="w-full px-4 py-3 bg-gray-900 border border-gray-800 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-gray-600 transition-all"
    />
    {hint && <p className="text-gray-600 text-xs mt-1">{hint}</p>}
  </div>
)

const HeroSettings = () => {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  
  const [settings, setSettings] = useState({
    greeting: '',
    name: '',
    nameSuffix: '',
    headline: '',
    headlineHighlight: '',
    description: '',
    heroImage: '',
    ctaText: ''
  })

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const docRef = doc(db, 'settings', 'hero')
        const docSnap = await getDoc(docRef)
        if (docSnap.exists()) {
          setSettings(prev => ({ ...prev, ...docSnap.data() }))
        }
      } catch (error) {
      }
      setLoading(false)
    }
    fetchSettings()
  }, [])

  const handleChange = (field, value) => {
    setSettings(prev => ({ ...prev, [field]: value }))
    setSaved(false)
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const docRef = doc(db, 'settings', 'hero')
      await setDoc(docRef, settings, { merge: true })
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (error) {
      alert('Failed to save settings.')
    }
    setSaving(false)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Hero Section</h1>
          <p className="text-gray-500">Customize your hero section content.</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className={`px-6 py-3 rounded-xl font-medium transition-all flex items-center gap-2 ${
            saved ? 'bg-green-500 text-white' : 'bg-white text-black hover:bg-gray-200'
          } disabled:opacity-50`}
        >
          {saving ? 'Saving...' : saved ? '✓ Saved!' : 'Save Changes'}
        </button>
      </div>

      <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-6 space-y-6">
        {/* Greeting Section */}
        <h2 className="text-lg font-semibold text-white">Greeting</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <InputField 
            id="greeting"
            label="Greeting Text" 
            value={settings.greeting} 
            onChange={(e) => handleChange('greeting', e.target.value)} 
            placeholder="Hello! I'm"
            hint="Text before your name"
          />
          <InputField 
            id="name"
            label="First Name" 
            value={settings.name} 
            onChange={(e) => handleChange('name', e.target.value)} 
            placeholder="Simrat"
          />
          <InputField 
            id="nameSuffix"
            label="Name Suffix" 
            value={settings.nameSuffix} 
            onChange={(e) => handleChange('nameSuffix', e.target.value)} 
            placeholder="Singh."
            hint="Displayed in gray"
          />
        </div>

        {/* Headline Section */}
        <h2 className="text-lg font-semibold text-white pt-4 border-t border-gray-800">Main Headline</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <InputField 
            id="headline"
            label="Headline" 
            value={settings.headline} 
            onChange={(e) => handleChange('headline', e.target.value)} 
            placeholder="Building scalable software solutions with emphasis on"
          />
          <InputField 
            id="headlineHighlight"
            label="Highlighted Text" 
            value={settings.headlineHighlight} 
            onChange={(e) => handleChange('headlineHighlight', e.target.value)} 
            placeholder="clean code"
            hint="Displayed in gray color"
          />
        </div>

        {/* Description */}
        <h2 className="text-lg font-semibold text-white pt-4 border-t border-gray-800">Description</h2>
        <div>
          <label className="block text-gray-400 text-sm font-medium mb-2">Short Bio</label>
          <textarea
            id="description"
            value={settings.description}
            onChange={(e) => handleChange('description', e.target.value)}
            placeholder="A brief introduction about yourself..."
            rows={4}
            autoComplete="off"
            className="w-full px-4 py-3 bg-gray-900 border border-gray-800 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-gray-600 resize-none transition-all"
          />
          <p className="text-gray-600 text-xs mt-1">Appears below the CTA button</p>
        </div>

        {/* Image & CTA */}
        <h2 className="text-lg font-semibold text-white pt-4 border-t border-gray-800">Image & Call-to-Action</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <InputField 
            id="heroImage"
            label="Hero Image URL" 
            value={settings.heroImage} 
            onChange={(e) => handleChange('heroImage', e.target.value)} 
            placeholder="https://yoursite.com/hero-image.png"
            hint="Leave empty to use default image"
          />
          <InputField 
            id="ctaText"
            label="CTA Button Text" 
            value={settings.ctaText} 
            onChange={(e) => handleChange('ctaText', e.target.value)} 
            placeholder="Let's Connect"
          />
        </div>

        {/* Preview */}
        <div className="pt-4 border-t border-gray-800">
          <h2 className="text-lg font-semibold text-white mb-4">Preview</h2>
          <div className="bg-white rounded-xl p-6 text-black">
            <p className="text-sm mb-2">
              {settings.greeting || "Hello! I'm"} <span className="border px-2 py-1 rounded-[0px_15px_0px_15px]">{settings.name || 'Simrat'} <span className="text-gray-500">{settings.nameSuffix || 'Singh.'}</span></span>
            </p>
            <h1 className="text-2xl font-bold mb-3">
              {settings.headline || 'Building scalable software solutions with emphasis on'}{' '}
              <span className="text-gray-400">{settings.headlineHighlight || 'clean code'}</span>
            </h1>
            <p className="text-gray-500 text-sm mb-4">
              {settings.description || 'A full-stack software engineer passionate about creating efficient, maintainable code and delivering exceptional digital experiences.'}
            </p>
            <button className="px-4 py-2 bg-black text-white rounded-full text-sm">
              {settings.ctaText || "Let's Connect"} →
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default HeroSettings
