import { useState, useEffect } from 'react'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import { db } from '../../firebase/config'

// Moved outside to prevent re-creation on each render
const InputField = ({ label, value, onChange, type = 'text', placeholder, hint, id }) => (
  <div>
    <label className="block text-gray-400 text-sm font-medium mb-2">{label}</label>
    <input
      type={type}
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

const AboutSettings = () => {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [activeTab, setActiveTab] = useState('about')
  
  const [settings, setSettings] = useState({
    // About Section
    title: '',
    subtitle: '',
    description: '',
    aboutImage: '',
    highlights: '',
    
    // Stats Section Header
    statsSubtitle: '',
    statsTitle: '',
    statsTitleHighlight: '',
    
    // Stats Values
    yearsExperience: '',
    projectsCompleted: '',
    happyClients: '',
    technologies: '',
    
    // Contact Info
    email: '',
    whatsapp: '',
    currentLocation: '',
    hometown: '',
    showGoogleMaps: true,
    googleMapsEmbed: '',
    googleMapsLink: '',
    
    // Social Links
    linkedin: '',
    github: '',
    twitter: '',
    instagram: '',
    youtube: '',
    facebook: '',
    dribbble: '',
    behance: ''
  })

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        // Fetch from both 'about' and 'site' documents
        const aboutRef = doc(db, 'settings', 'about')
        const siteRef = doc(db, 'settings', 'site')
        
        const [aboutSnap, siteSnap] = await Promise.all([
          getDoc(aboutRef),
          getDoc(siteRef)
        ])
        
        let mergedSettings = { ...settings }
        
        if (aboutSnap.exists()) {
          mergedSettings = { ...mergedSettings, ...aboutSnap.data() }
        }
        
        // Get contact and social info from site settings
        if (siteSnap.exists()) {
          const siteData = siteSnap.data()
          mergedSettings = {
            ...mergedSettings,
            email: siteData.email || '',
            whatsapp: siteData.whatsapp || '',
            currentLocation: siteData.currentLocation || '',
            hometown: siteData.hometown || '',
            showGoogleMaps: siteData.showGoogleMaps !== false,
            googleMapsEmbed: siteData.googleMapsEmbed || '',
            googleMapsLink: siteData.googleMapsLink || '',
            linkedin: siteData.linkedin || '',
            github: siteData.github || '',
            twitter: siteData.twitter || '',
            instagram: siteData.instagram || '',
            youtube: siteData.youtube || '',
            facebook: siteData.facebook || '',
            dribbble: siteData.dribbble || '',
            behance: siteData.behance || ''
          }
        }
        
        setSettings(mergedSettings)
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
      // Save about-specific settings
      const aboutRef = doc(db, 'settings', 'about')
      const aboutData = {
        title: settings.title,
        subtitle: settings.subtitle,
        description: settings.description,
        aboutImage: settings.aboutImage,
        yearsExperience: settings.yearsExperience,
        projectsCompleted: settings.projectsCompleted,
        happyClients: settings.happyClients,
        technologies: settings.technologies,
        highlights: settings.highlights
      }
      await setDoc(aboutRef, aboutData, { merge: true })
      
      // Save contact & social settings to site document
      const siteRef = doc(db, 'settings', 'site')
      const siteData = {
        email: settings.email,
        whatsapp: settings.whatsapp,
        currentLocation: settings.currentLocation,
        hometown: settings.hometown,
        showGoogleMaps: settings.showGoogleMaps,
        googleMapsEmbed: settings.googleMapsEmbed,
        googleMapsLink: settings.googleMapsLink,
        linkedin: settings.linkedin,
        github: settings.github,
        twitter: settings.twitter,
        instagram: settings.instagram,
        youtube: settings.youtube,
        facebook: settings.facebook,
        dribbble: settings.dribbble,
        behance: settings.behance
      }
      await setDoc(siteRef, siteData, { merge: true })
      
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (error) {
      alert('Failed to save settings.')
    }
    setSaving(false)
  }

  const tabs = [
    { id: 'about', label: 'About Me', icon: '👤' },
    { id: 'contact', label: 'Contact Info', icon: '📧' },
    { id: 'social', label: 'Social Links', icon: '🔗' }
  ]


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
          <h1 className="text-3xl font-bold text-white mb-2">About & Contact</h1>
          <p className="text-gray-500">Manage your personal info, contact details, and social links.</p>
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

      {/* Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all flex items-center gap-2 ${
              activeTab === tab.id
                ? 'bg-white text-black'
                : 'bg-gray-900 text-gray-400 hover:text-white border border-gray-800'
            }`}
          >
            <span>{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-6">
        {activeTab === 'about' && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-white mb-4">About Section</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InputField id="title" label="Section Title" value={settings.title} onChange={(e) => handleChange('title', e.target.value)} placeholder="About Me" />
              <InputField id="subtitle" label="Subtitle" value={settings.subtitle} onChange={(e) => handleChange('subtitle', e.target.value)} placeholder="Get to know me" />
            </div>

            <div>
              <label className="block text-gray-400 text-sm font-medium mb-2">Description</label>
              <textarea
                id="description"
                value={settings.description}
                onChange={(e) => handleChange('description', e.target.value)}
                placeholder="Tell your story, background, passion..."
                rows={6}
                autoComplete="off"
                className="w-full px-4 py-3 bg-gray-900 border border-gray-800 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-gray-600 resize-none"
              />
            </div>

            <InputField 
              id="aboutImage"
              label="About Image URL" 
              value={settings.aboutImage}
              onChange={(e) => handleChange('aboutImage', e.target.value)}
              placeholder="https://yoursite.com/about-image.jpg" 
            />

            <div>
              <label className="block text-gray-400 text-sm font-medium mb-2">Highlights</label>
              <textarea
                id="highlights"
                value={settings.highlights}
                onChange={(e) => handleChange('highlights', e.target.value)}
                placeholder="Key points about you, one per line"
                rows={4}
                autoComplete="off"
                className="w-full px-4 py-3 bg-gray-900 border border-gray-800 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-gray-600 resize-none"
              />
              <p className="text-gray-600 text-xs mt-1">One highlight per line</p>
            </div>

            <h3 className="text-lg font-semibold text-white pt-4">Statistics Section</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
              <InputField id="statsSubtitle" label="Section Subtitle" value={settings.statsSubtitle} onChange={(e) => handleChange('statsSubtitle', e.target.value)} placeholder="Numbers speak" />
              <div className="grid grid-cols-2 gap-4">
                <InputField id="statsTitle" label="Title" value={settings.statsTitle} onChange={(e) => handleChange('statsTitle', e.target.value)} placeholder="My" />
                <InputField id="statsTitleHighlight" label="Title Highlight" value={settings.statsTitleHighlight} onChange={(e) => handleChange('statsTitleHighlight', e.target.value)} placeholder="Stats" hint="Gray text" />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InputField id="yearsExperience" label="Years of Experience" value={settings.yearsExperience} onChange={(e) => handleChange('yearsExperience', e.target.value)} placeholder="3+" />
              <InputField id="projectsCompleted" label="Projects Completed" value={settings.projectsCompleted} onChange={(e) => handleChange('projectsCompleted', e.target.value)} placeholder="50+" />
              <InputField id="happyClients" label="Happy Clients" value={settings.happyClients} onChange={(e) => handleChange('happyClients', e.target.value)} placeholder="30+" />
              <InputField id="technologies" label="Technologies" value={settings.technologies} onChange={(e) => handleChange('technologies', e.target.value)} placeholder="10+" />
            </div>
          </div>
        )}

        {activeTab === 'contact' && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-white mb-4">Contact Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InputField id="email" label="Email Address" value={settings.email} onChange={(e) => handleChange('email', e.target.value)} type="email" placeholder="your@email.com" />
              <InputField id="whatsapp" label="WhatsApp Group Link" value={settings.whatsapp} onChange={(e) => handleChange('whatsapp', e.target.value)} placeholder="https://chat.whatsapp.com/..." hint="WhatsApp group invite link" />
            </div>
            
            <h3 className="text-lg font-semibold text-white pt-4 border-t border-gray-800">Location</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InputField id="currentLocation" label="Current Location" value={settings.currentLocation} onChange={(e) => handleChange('currentLocation', e.target.value)} placeholder="Mumbai, India" hint="Where you currently live/work" />
              <InputField id="hometown" label="Hometown" value={settings.hometown} onChange={(e) => handleChange('hometown', e.target.value)} placeholder="Delhi, India" hint="Your hometown/origin" />
            </div>

            <h3 className="text-lg font-semibold text-white pt-4 border-t border-gray-800">Google Maps</h3>
            
            {/* Toggle for showing/hiding map */}
            <label className="flex items-center justify-between p-4 bg-gray-800/50 rounded-xl cursor-pointer hover:bg-gray-800 transition-all">
              <div>
                <span className="text-white font-medium">Show Google Maps</span>
                <p className="text-gray-500 text-sm mt-1">Display map section on contact page</p>
              </div>
              <div className={`relative w-12 h-6 rounded-full transition-colors ${settings.showGoogleMaps !== false ? 'bg-green-500' : 'bg-gray-700'}`}>
                <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${settings.showGoogleMaps !== false ? 'translate-x-7' : 'translate-x-1'}`} />
                <input 
                  type="checkbox" 
                  checked={settings.showGoogleMaps !== false} 
                  onChange={(e) => handleChange('showGoogleMaps', e.target.checked)} 
                  className="sr-only" 
                />
              </div>
            </label>

            {settings.showGoogleMaps !== false && (
              <>
                <div>
                  <label className="block text-gray-400 text-sm font-medium mb-2">Google Maps Embed URL</label>
                  <input
                    id="googleMapsEmbed"
                    type="text"
                    value={settings.googleMapsEmbed || ''}
                    onChange={(e) => handleChange('googleMapsEmbed', e.target.value)}
                    placeholder="https://www.google.com/maps/embed?pb=..."
                    autoComplete="off"
                    className="w-full px-4 py-3 bg-gray-900 border border-gray-800 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-gray-600 transition-all"
                  />
                  <p className="text-gray-600 text-xs mt-1">Go to Google Maps → Share → Embed a map → Copy the src URL from iframe</p>
                </div>
                <InputField id="googleMapsLink" label="Google Maps Link" value={settings.googleMapsLink} onChange={(e) => handleChange('googleMapsLink', e.target.value)} placeholder="https://maps.google.com/?q=..." hint="Direct link to open in Google Maps" />
              </>
            )}
          </div>
        )}

        {activeTab === 'social' && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-white mb-4">Social Media Links</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InputField id="linkedin" label="LinkedIn" value={settings.linkedin} onChange={(e) => handleChange('linkedin', e.target.value)} placeholder="https://linkedin.com/in/username" />
              <InputField id="github" label="GitHub" value={settings.github} onChange={(e) => handleChange('github', e.target.value)} placeholder="https://github.com/username" />
              <InputField id="twitter" label="Twitter / X" value={settings.twitter} onChange={(e) => handleChange('twitter', e.target.value)} placeholder="https://twitter.com/username" />
              <InputField id="instagram" label="Instagram" value={settings.instagram} onChange={(e) => handleChange('instagram', e.target.value)} placeholder="https://instagram.com/username" />
              <InputField id="youtube" label="YouTube" value={settings.youtube} onChange={(e) => handleChange('youtube', e.target.value)} placeholder="https://youtube.com/@channel" />
              <InputField id="facebook" label="Facebook" value={settings.facebook} onChange={(e) => handleChange('facebook', e.target.value)} placeholder="https://facebook.com/username" />
              <InputField id="dribbble" label="Dribbble" value={settings.dribbble} onChange={(e) => handleChange('dribbble', e.target.value)} placeholder="https://dribbble.com/username" />
              <InputField id="behance" label="Behance" value={settings.behance} onChange={(e) => handleChange('behance', e.target.value)} placeholder="https://behance.net/username" />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default AboutSettings
