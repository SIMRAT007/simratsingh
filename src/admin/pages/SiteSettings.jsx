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

const TextareaField = ({ label, value, onChange, placeholder, rows = 3, id }) => (
  <div>
    <label className="block text-gray-400 text-sm font-medium mb-2">{label}</label>
    <textarea
      id={id}
      value={value || ''}
      onChange={onChange}
      placeholder={placeholder}
      rows={rows}
      autoComplete="off"
      className="w-full px-4 py-3 bg-gray-900 border border-gray-800 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-gray-600 transition-all resize-none"
    />
  </div>
)

const Toggle = ({ label, checked, onChange, description }) => (
  <label className="flex items-center justify-between p-4 bg-gray-800/50 rounded-xl cursor-pointer hover:bg-gray-800 transition-all">
    <div>
      <span className="text-white font-medium">{label}</span>
      {description && <p className="text-gray-500 text-sm mt-1">{description}</p>}
    </div>
    <div className={`relative w-12 h-6 rounded-full transition-colors ${checked ? 'bg-green-500' : 'bg-gray-700'}`}>
      <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${checked ? 'translate-x-7' : 'translate-x-1'}`} />
      <input type="checkbox" checked={checked} onChange={onChange} className="sr-only" />
    </div>
  </label>
)

const SiteSettings = () => {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [activeTab, setActiveTab] = useState('seo')
  
  const [settings, setSettings] = useState({
    // SEO & Meta
    siteTitle: '',
    siteDescription: '',
    keywords: '',
    ogImage: '',
    
    // Branding
    logoUrl: '',
    faviconUrl: '',
    brandName: '',
    tagline: '',
    copyrightYear: new Date().getFullYear().toString(),
    copyrightText: 'All rights reserved.',
    
    // Sections Toggle
    sections: {
      hero: true,
      about: true,
      stats: true,
      skills: true,
      projects: true,
      experience: true,
      achievements: true,
      education: true,
      hobbies: true,
      testimonials: true,
      blogs: true,
      socialMedia: true,
      services: true,
      quotes: true,
      contributions: true,
      languages: true,
      organizations: true,
      games: true,
      music: true,
      weather: true,
      contact: true
    },
    
    // Tip of the Day
    tipOfDayEnabled: true,
    tips: [
      { id: 1, text: 'Explore my projects section to see my latest work!', icon: '💡' },
      { id: 2, text: 'Check out the Games section for some fun!', icon: '🎮' },
      { id: 3, text: 'Listen to Music of the Day while browsing!', icon: '🎵' }
    ],
    
    // Notifications
    notificationsEnabled: true,
    notifications: [
      { id: 1, title: 'Welcome!', message: 'Thanks for visiting my portfolio.', details: 'I appreciate you taking the time to explore my work. Feel free to browse through my projects and get in touch if you have any questions.', icon: '👋', link: '' },
      { id: 2, title: 'New Project', message: 'Check out my latest project.', details: 'I have recently completed a new project that showcases my skills in web development. Click below to see the details.', icon: '🚀', link: '#projects' }
    ]
  })

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const docRef = doc(db, 'settings', 'site')
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

  const handleNestedChange = (parent, field, value) => {
    setSettings(prev => ({
      ...prev,
      [parent]: { ...prev[parent], [field]: value }
    }))
    setSaved(false)
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const docRef = doc(db, 'settings', 'site')
      await setDoc(docRef, settings, { merge: true })
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (error) {
      alert('Failed to save settings. Please try again.')
    }
    setSaving(false)
  }

  // Tips Management
  const addTip = () => {
    const newTip = { id: Date.now(), text: '', icon: '💡' }
    setSettings(prev => ({ ...prev, tips: [...prev.tips, newTip] }))
    setSaved(false)
  }

  const updateTip = (id, field, value) => {
    setSettings(prev => ({
      ...prev,
      tips: prev.tips.map(tip => tip.id === id ? { ...tip, [field]: value } : tip)
    }))
    setSaved(false)
  }

  const removeTip = (id) => {
    setSettings(prev => ({ ...prev, tips: prev.tips.filter(tip => tip.id !== id) }))
    setSaved(false)
  }

  // Notifications Management
  const addNotification = () => {
    const newNotif = { id: Date.now(), title: '', message: '', details: '', icon: '🔔', link: '' }
    setSettings(prev => ({ ...prev, notifications: [...prev.notifications, newNotif] }))
    setSaved(false)
  }

  const updateNotification = (id, field, value) => {
    setSettings(prev => ({
      ...prev,
      notifications: prev.notifications.map(notif => 
        notif.id === id ? { ...notif, [field]: value } : notif
      )
    }))
    setSaved(false)
  }

  const removeNotification = (id) => {
    setSettings(prev => ({ 
      ...prev, 
      notifications: prev.notifications.filter(n => n.id !== id) 
    }))
    setSaved(false)
  }

  const tabs = [
    { id: 'seo', label: 'SEO & Meta', icon: '🔍' },
    { id: 'branding', label: 'Branding', icon: '🎨' },
    { id: 'sections', label: 'Sections', icon: '📑' },
    { id: 'tips', label: 'Tip of Day', icon: '💡' },
    { id: 'notifications', label: 'Notifications', icon: '🔔' }
  ]

  const sectionsList = [
    { key: 'hero', label: 'Hero Section' },
    { key: 'about', label: 'About' },
    { key: 'stats', label: 'Stats' },
    { key: 'skills', label: 'Skills & Expertise' },
    { key: 'projects', label: 'Projects' },
    { key: 'experience', label: 'Experience' },
    { key: 'achievements', label: 'Achievements' },
    { key: 'education', label: 'Education' },
    { key: 'hobbies', label: 'Hobbies' },
    { key: 'testimonials', label: 'Testimonials' },
    { key: 'blogs', label: 'Blogs' },
    { key: 'socialMedia', label: 'Social Media' },
    { key: 'services', label: 'Services' },
    { key: 'quotes', label: 'Quotes' },
    { key: 'contributions', label: 'Contributions' },
    { key: 'languages', label: 'Languages' },
    { key: 'organizations', label: 'Organizations' },
    { key: 'games', label: 'Games' },
    { key: 'music', label: 'Music of the Day' },
    { key: 'weather', label: 'Weather' },
    { key: 'contact', label: 'Contact Form' }
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
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Site Settings</h1>
          <p className="text-gray-500">Manage SEO, branding, sections, and features.</p>
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

      {/* Tab Content */}
      <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-6">
        {activeTab === 'seo' && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-white mb-4">SEO & Meta Tags</h2>
            
            {/* Basic SEO */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InputField id="siteTitle" label="Site Title" value={settings.siteTitle} onChange={(e) => handleChange('siteTitle', e.target.value)} placeholder="Your Name - Portfolio" />
              <InputField id="author" label="Author Name" value={settings.author} onChange={(e) => handleChange('author', e.target.value)} placeholder="Your Full Name" />
            </div>
            
            <TextareaField id="siteDescription" label="Site Description" value={settings.siteDescription} onChange={(e) => handleChange('siteDescription', e.target.value)} placeholder="A brief description of your portfolio and what you do..." rows={3} />
            
            <InputField id="keywords" label="Keywords" value={settings.keywords} onChange={(e) => handleChange('keywords', e.target.value)} placeholder="developer, designer, portfolio, web development" hint="Comma-separated keywords for search engines" />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InputField id="siteUrl" label="Site URL" value={settings.siteUrl} onChange={(e) => handleChange('siteUrl', e.target.value)} placeholder="https://yoursite.com" hint="Your website's canonical URL" />
              <InputField id="language" label="Language" value={settings.language} onChange={(e) => handleChange('language', e.target.value)} placeholder="en" hint="ISO language code (e.g., en, hi, es)" />
            </div>

            {/* Open Graph */}
            <h3 className="text-lg font-semibold text-white pt-4 border-t border-gray-800">Open Graph (Social Sharing)</h3>
            <p className="text-gray-500 text-sm -mt-2">Controls how your site appears when shared on Facebook, LinkedIn, etc.</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InputField id="ogTitle" label="OG Title" value={settings.ogTitle} onChange={(e) => handleChange('ogTitle', e.target.value)} placeholder="Your Name - Portfolio" hint="Leave empty to use Site Title" />
              <InputField id="ogType" label="OG Type" value={settings.ogType} onChange={(e) => handleChange('ogType', e.target.value)} placeholder="website" hint="Usually 'website' or 'profile'" />
            </div>
            
            <InputField id="ogImage" label="OG Image URL" value={settings.ogImage} onChange={(e) => handleChange('ogImage', e.target.value)} placeholder="https://yoursite.com/og-image.jpg" hint="1200x630px recommended for best display" />
            
            <TextareaField id="ogDescription" label="OG Description" value={settings.ogDescription} onChange={(e) => handleChange('ogDescription', e.target.value)} placeholder="Description for social media shares..." rows={2} />

            {/* Twitter Cards */}
            <h3 className="text-lg font-semibold text-white pt-4 border-t border-gray-800">Twitter Cards</h3>
            <p className="text-gray-500 text-sm -mt-2">Controls how your site appears when shared on Twitter/X.</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InputField id="twitterHandle" label="Twitter Handle" value={settings.twitterHandle} onChange={(e) => handleChange('twitterHandle', e.target.value)} placeholder="@yourusername" hint="Include the @ symbol" />
              <div>
                <label className="block text-gray-400 text-sm font-medium mb-2">Twitter Card Type</label>
                <select
                  id="twitterCardType"
                  value={settings.twitterCardType || 'summary_large_image'}
                  onChange={(e) => handleChange('twitterCardType', e.target.value)}
                  className="w-full px-4 py-3 bg-gray-900 border border-gray-800 rounded-xl text-white focus:outline-none focus:border-gray-600 transition-all"
                >
                  <option value="summary">Summary</option>
                  <option value="summary_large_image">Summary Large Image</option>
                </select>
              </div>
            </div>
            
            <InputField id="twitterImage" label="Twitter Image URL" value={settings.twitterImage} onChange={(e) => handleChange('twitterImage', e.target.value)} placeholder="https://yoursite.com/twitter-image.jpg" hint="Leave empty to use OG Image" />

            {/* Advanced */}
            <h3 className="text-lg font-semibold text-white pt-4 border-t border-gray-800">Advanced Settings</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InputField id="themeColor" label="Theme Color" value={settings.themeColor} onChange={(e) => handleChange('themeColor', e.target.value)} placeholder="#000000" hint="Browser theme color (hex code)" />
              <div>
                <label className="block text-gray-400 text-sm font-medium mb-2">Robots</label>
                <select
                  id="robots"
                  value={settings.robots || 'index, follow'}
                  onChange={(e) => handleChange('robots', e.target.value)}
                  className="w-full px-4 py-3 bg-gray-900 border border-gray-800 rounded-xl text-white focus:outline-none focus:border-gray-600 transition-all"
                >
                  <option value="index, follow">Index, Follow (Recommended)</option>
                  <option value="index, nofollow">Index, No Follow</option>
                  <option value="noindex, follow">No Index, Follow</option>
                  <option value="noindex, nofollow">No Index, No Follow</option>
                </select>
                <p className="text-gray-600 text-xs mt-1">Controls search engine crawling</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InputField id="googleAnalyticsId" label="Google Analytics ID" value={settings.googleAnalyticsId} onChange={(e) => handleChange('googleAnalyticsId', e.target.value)} placeholder="G-XXXXXXXXXX" hint="Your GA4 Measurement ID" />
              <InputField id="googleSiteVerification" label="Google Site Verification" value={settings.googleSiteVerification} onChange={(e) => handleChange('googleSiteVerification', e.target.value)} placeholder="verification_token" hint="For Google Search Console" />
            </div>
          </div>
        )}

        {activeTab === 'branding' && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-white mb-4">Branding</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InputField id="brandName" label="Brand Name" value={settings.brandName} onChange={(e) => handleChange('brandName', e.target.value)} placeholder="Your Name" />
              <InputField id="tagline" label="Tagline" value={settings.tagline} onChange={(e) => handleChange('tagline', e.target.value)} placeholder="think. build. grow." />
              <InputField id="logoUrl" label="Logo URL" value={settings.logoUrl} onChange={(e) => handleChange('logoUrl', e.target.value)} placeholder="https://yoursite.com/logo.png" />
              <InputField id="faviconUrl" label="Favicon URL" value={settings.faviconUrl} onChange={(e) => handleChange('faviconUrl', e.target.value)} placeholder="https://yoursite.com/favicon.ico" />
            </div>
            <h3 className="text-lg font-semibold text-white pt-4">Copyright</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InputField id="copyrightYear" label="Copyright Year" value={settings.copyrightYear} onChange={(e) => handleChange('copyrightYear', e.target.value)} placeholder="2024" hint="Leave empty for current year" />
              <InputField id="copyrightText" label="Copyright Text" value={settings.copyrightText} onChange={(e) => handleChange('copyrightText', e.target.value)} placeholder="All rights reserved." />
            </div>
          </div>
        )}

        {activeTab === 'sections' && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-white mb-4">Enable/Disable Sections</h2>
            <p className="text-gray-500 text-sm mb-6">Toggle sections on or off to show/hide them on your portfolio.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {sectionsList.map((section) => (
                <Toggle
                  key={section.key}
                  label={section.label}
                  checked={settings.sections?.[section.key] ?? true}
                  onChange={(e) => handleNestedChange('sections', section.key, e.target.checked)}
                />
              ))}
            </div>
          </div>
        )}

        {activeTab === 'tips' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-white">Tip of the Day</h2>
              <Toggle
                label="Enable"
                checked={settings.tipOfDayEnabled}
                onChange={(e) => handleChange('tipOfDayEnabled', e.target.checked)}
              />
            </div>
            
            <p className="text-gray-500 text-sm">Add tips that will be shown randomly to visitors.</p>
            
            <div className="space-y-4">
              {settings.tips?.map((tip) => (
                <div key={`tip-${tip.id}`} className="flex gap-3 items-start p-4 bg-gray-800/50 rounded-xl">
                  <input
                    type="text"
                    id={`tip-icon-${tip.id}`}
                    value={tip.icon || ''}
                    onChange={(e) => updateTip(tip.id, 'icon', e.target.value)}
                    className="w-12 px-2 py-2 bg-gray-900 border border-gray-700 rounded-lg text-center text-xl"
                    placeholder="💡"
                    autoComplete="off"
                  />
                  <input
                    type="text"
                    id={`tip-text-${tip.id}`}
                    value={tip.text || ''}
                    onChange={(e) => updateTip(tip.id, 'text', e.target.value)}
                    className="flex-1 px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-600"
                    placeholder="Enter tip text..."
                    autoComplete="off"
                  />
                  <button
                    type="button"
                    onClick={() => removeTip(tip.id)}
                    className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-all"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
            
            <button
              onClick={addTip}
              className="w-full py-3 border-2 border-dashed border-gray-700 rounded-xl text-gray-400 hover:text-white hover:border-gray-600 transition-all flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Tip
            </button>
          </div>
        )}

        {activeTab === 'notifications' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-white">Notifications</h2>
              <Toggle
                label="Enable"
                checked={settings.notificationsEnabled}
                onChange={(e) => handleChange('notificationsEnabled', e.target.checked)}
              />
            </div>
            
            <p className="text-gray-500 text-sm">Manage notification alerts shown to visitors.</p>
            
            <div className="space-y-4">
              {settings.notifications?.map((notif, index) => (
                <div key={`notif-${notif.id}`} className="p-4 bg-gray-800/50 rounded-xl space-y-3">
                  <div className="flex gap-3 items-center">
                    <input
                      type="text"
                      id={`notif-icon-${notif.id}`}
                      value={notif.icon || ''}
                      onChange={(e) => updateNotification(notif.id, 'icon', e.target.value)}
                      className="w-14 px-2 py-2 bg-gray-900 border border-gray-700 rounded-lg text-center text-2xl"
                      placeholder="🔔"
                      title="Enter any emoji"
                      autoComplete="off"
                    />
                    <input
                      type="text"
                      id={`notif-title-${notif.id}`}
                      value={notif.title || ''}
                      onChange={(e) => updateNotification(notif.id, 'title', e.target.value)}
                      className="flex-1 px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-600"
                      placeholder="Notification title"
                      autoComplete="off"
                    />
                    <button
                      type="button"
                      onClick={() => removeNotification(notif.id)}
                      className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-all"
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                  <input
                    type="text"
                    id={`notif-message-${notif.id}`}
                    value={notif.message || ''}
                    onChange={(e) => updateNotification(notif.id, 'message', e.target.value)}
                    className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-600"
                    placeholder="Short message (shown in list)"
                    autoComplete="off"
                  />
                  <textarea
                    id={`notif-details-${notif.id}`}
                    value={notif.details || ''}
                    onChange={(e) => updateNotification(notif.id, 'details', e.target.value)}
                    rows={3}
                    className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-600 resize-none"
                    placeholder="Detailed description (shown when expanded)"
                    autoComplete="off"
                  />
                  <input
                    type="text"
                    id={`notif-link-${notif.id}`}
                    value={notif.link || ''}
                    onChange={(e) => updateNotification(notif.id, 'link', e.target.value)}
                    className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-600"
                    placeholder="Link (optional) - e.g., #projects or https://..."
                    autoComplete="off"
                  />
                </div>
              ))}
            </div>
            
            <button
              onClick={addNotification}
              className="w-full py-3 border-2 border-dashed border-gray-700 rounded-xl text-gray-400 hover:text-white hover:border-gray-600 transition-all flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Notification
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default SiteSettings
