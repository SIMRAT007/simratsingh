import { useState, useEffect } from 'react'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import { db } from '../../firebase/config'

const SkillsSettings = () => {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  
  const [settings, setSettings] = useState({
    sectionTitle: 'Skills &',
    sectionTitleHighlight: 'Expertise',
    sectionSubtitle: 'What I know',
    ctaText: 'Always learning, always growing. Currently exploring AI/ML integration.',
    
    // Skill Categories
    frontendTitle: 'Frontend',
    frontendSkills: 'React.js, Next.js, TypeScript, JavaScript, Tailwind CSS, HTML/CSS, Redux, Framer Motion',
    
    backendTitle: 'Backend',
    backendSkills: 'Node.js, Express.js, NestJS, REST APIs, GraphQL, MongoDB, PostgreSQL, Firebase',
    
    othersTitle: 'Others',
    othersSkills: 'React Native, Expo, iOS, Android, Push Notifications, App Store Deployment',
    
    toolsTitle: 'Tools & DevOps',
    toolsSkills: 'Git, GitHub, Docker, AWS, Vercel, CI/CD, Figma, VS Code'
  })

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const docRef = doc(db, 'settings', 'skills')
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
      const docRef = doc(db, 'settings', 'skills')
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
          <h1 className="text-3xl font-bold text-white mb-2">Skills Section</h1>
          <p className="text-gray-500">Manage your skills and expertise.</p>
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

      <div className="space-y-6">
        {/* Section Header */}
        <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Section Header</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-gray-400 text-sm font-medium mb-2">Section Title</label>
              <input
                type="text"
                value={settings.sectionTitle}
                onChange={(e) => handleChange('sectionTitle', e.target.value)}
                placeholder="Skills &"
                className="w-full px-4 py-3 bg-gray-900 border border-gray-800 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-gray-600"
              />
            </div>
            <div>
              <label className="block text-gray-400 text-sm font-medium mb-2">Title Highlight</label>
              <input
                type="text"
                value={settings.sectionTitleHighlight}
                onChange={(e) => handleChange('sectionTitleHighlight', e.target.value)}
                placeholder="Expertise"
                className="w-full px-4 py-3 bg-gray-900 border border-gray-800 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-gray-600"
              />
              <p className="text-gray-600 text-xs mt-1">Displayed in gray color</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
            <div>
              <label className="block text-gray-400 text-sm font-medium mb-2">Subtitle</label>
              <input
                type="text"
                value={settings.sectionSubtitle}
                onChange={(e) => handleChange('sectionSubtitle', e.target.value)}
                placeholder="What I know"
                className="w-full px-4 py-3 bg-gray-900 border border-gray-800 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-gray-600"
              />
            </div>
            <div>
              <label className="block text-gray-400 text-sm font-medium mb-2">CTA Text</label>
              <input
                type="text"
                value={settings.ctaText}
                onChange={(e) => handleChange('ctaText', e.target.value)}
                placeholder="Always learning..."
                className="w-full px-4 py-3 bg-gray-900 border border-gray-800 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-gray-600"
              />
            </div>
          </div>
        </div>

        {/* Frontend Skills */}
        <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
              <span className="text-xl">💻</span>
            </div>
            <div>
              <label className="block text-gray-400 text-sm font-medium">Category Title</label>
              <input
                type="text"
                value={settings.frontendTitle}
                onChange={(e) => handleChange('frontendTitle', e.target.value)}
                placeholder="Frontend"
                className="bg-transparent text-white text-lg font-semibold focus:outline-none"
              />
            </div>
          </div>
          <div>
            <label className="block text-gray-400 text-sm font-medium mb-2">Skills (comma-separated)</label>
            <textarea
              value={settings.frontendSkills}
              onChange={(e) => handleChange('frontendSkills', e.target.value)}
              placeholder="React.js, Next.js, TypeScript..."
              rows={2}
              className="w-full px-4 py-3 bg-gray-900 border border-gray-800 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-gray-600 resize-none"
            />
          </div>
        </div>

        {/* Backend Skills */}
        <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
              <span className="text-xl">⚙️</span>
            </div>
            <div>
              <label className="block text-gray-400 text-sm font-medium">Category Title</label>
              <input
                type="text"
                value={settings.backendTitle}
                onChange={(e) => handleChange('backendTitle', e.target.value)}
                placeholder="Backend"
                className="bg-transparent text-white text-lg font-semibold focus:outline-none"
              />
            </div>
          </div>
          <div>
            <label className="block text-gray-400 text-sm font-medium mb-2">Skills (comma-separated)</label>
            <textarea
              value={settings.backendSkills}
              onChange={(e) => handleChange('backendSkills', e.target.value)}
              placeholder="Node.js, Express.js, MongoDB..."
              rows={2}
              className="w-full px-4 py-3 bg-gray-900 border border-gray-800 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-gray-600 resize-none"
            />
          </div>
        </div>

        {/* Others Skills */}
        <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
              <span className="text-xl">✨</span>
            </div>
            <div>
              <label className="block text-gray-400 text-sm font-medium">Category Title</label>
              <input
                type="text"
                value={settings.othersTitle}
                onChange={(e) => handleChange('othersTitle', e.target.value)}
                placeholder="Others"
                className="bg-transparent text-white text-lg font-semibold focus:outline-none"
              />
            </div>
          </div>
          <div>
            <label className="block text-gray-400 text-sm font-medium mb-2">Skills (comma-separated)</label>
            <textarea
              value={settings.othersSkills}
              onChange={(e) => handleChange('othersSkills', e.target.value)}
              placeholder="Other skills..."
              rows={2}
              className="w-full px-4 py-3 bg-gray-900 border border-gray-800 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-gray-600 resize-none"
            />
          </div>
        </div>

        {/* Tools & DevOps */}
        <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-orange-500/20 flex items-center justify-center">
              <span className="text-xl">🛠️</span>
            </div>
            <div>
              <label className="block text-gray-400 text-sm font-medium">Category Title</label>
              <input
                type="text"
                value={settings.toolsTitle}
                onChange={(e) => handleChange('toolsTitle', e.target.value)}
                placeholder="Tools & DevOps"
                className="bg-transparent text-white text-lg font-semibold focus:outline-none"
              />
            </div>
          </div>
          <div>
            <label className="block text-gray-400 text-sm font-medium mb-2">Skills (comma-separated)</label>
            <textarea
              value={settings.toolsSkills}
              onChange={(e) => handleChange('toolsSkills', e.target.value)}
              placeholder="Git, Docker, AWS..."
              rows={2}
              className="w-full px-4 py-3 bg-gray-900 border border-gray-800 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-gray-600 resize-none"
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default SkillsSettings

