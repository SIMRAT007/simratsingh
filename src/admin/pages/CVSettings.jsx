import { useEffect, useState } from 'react'
import { doc, getDoc, setDoc, collection, onSnapshot } from 'firebase/firestore'
import { db } from '../../firebase/config'
import CVPreview from '../../components/CVPreview'
import { defaultCvData, normalizeCvData } from '../../data/defaultCvData'

const InputField = ({ label, value, onChange, placeholder, type = 'text' }) => (
  <label className="block">
    <span className="block text-gray-400 text-sm font-medium mb-2">{label}</span>
    <input
      type={type}
      value={value || ''}
      onChange={(event) => onChange(event.target.value)}
      placeholder={placeholder}
      autoComplete="off"
      className="w-full px-4 py-3 bg-gray-900 border border-gray-800 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-gray-600 transition-all"
    />
  </label>
)

const TextareaField = ({ label, value, onChange, placeholder, rows = 4 }) => (
  <label className="block">
    <span className="block text-gray-400 text-sm font-medium mb-2">{label}</span>
    <textarea
      value={value || ''}
      onChange={(event) => onChange(event.target.value)}
      placeholder={placeholder}
      rows={rows}
      autoComplete="off"
      className="w-full px-4 py-3 bg-gray-900 border border-gray-800 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-gray-600 transition-all resize-none"
    />
  </label>
)

const Card = ({ title, children, onRemove }) => (
  <div className="bg-gray-950/70 border border-gray-800 rounded-2xl p-5 space-y-4">
    <div className="flex items-center justify-between gap-4">
      <h3 className="text-white font-semibold">{title}</h3>
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          className="px-3 py-1.5 text-sm rounded-lg bg-red-500/10 text-red-300 hover:bg-red-500/20 transition-all"
        >
          Remove
        </button>
      )}
    </div>
    {children}
  </div>
)

const linesToArray = (value) => value.split('\n').map((item) => item.trim()).filter(Boolean)
const arrayToLines = (value = []) => value.join('\n')

const CVSettings = () => {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [activeTab, setActiveTab] = useState('identity')
  const [cvData, setCvData] = useState(defaultCvData)
  const [projectsData, setProjectsData] = useState([])
  const [experienceData, setExperienceData] = useState([])

  useEffect(() => {
    const fetchData = async () => {
      try {
        let cvLoaded = false
        let projectsLoaded = false
        let experienceLoaded = false

        const checkLoading = () => {
          if (cvLoaded && projectsLoaded && experienceLoaded) {
            setLoading(false)
          }
        }

        // Fetch CV settings
        const docRef = doc(db, 'settings', 'cv')
        const docSnap = await getDoc(docRef)
        if (docSnap.exists()) {
          setCvData(normalizeCvData(docSnap.data(), projectsData, experienceData))
        }
        cvLoaded = true
        checkLoading()

        // Fetch projects collection
        const projectsUnsubscribe = onSnapshot(
          collection(db, 'projects'),
          (snapshot) => {
            const projects = snapshot.docs.map(doc => ({
              id: doc.id,
              ...doc.data()
            }))
            setProjectsData(projects)
            // Re-normalize CV data with updated projects
            const cvDocRef = doc(db, 'settings', 'cv')
            getDoc(cvDocRef).then(cvSnap => {
              if (cvSnap.exists()) {
                setCvData(normalizeCvData(cvSnap.data(), projects, experienceData))
              }
            })
            projectsLoaded = true
            checkLoading()
          },
          () => {
            projectsLoaded = true
            checkLoading()
          }
        )

        // Fetch experience collection
        const experienceUnsubscribe = onSnapshot(
          collection(db, 'experience'),
          (snapshot) => {
            const experience = snapshot.docs.map(doc => ({
              id: doc.id,
              ...doc.data()
            }))
            setExperienceData(experience)
            // Re-normalize CV data with updated experience
            const cvDocRef = doc(db, 'settings', 'cv')
            getDoc(cvDocRef).then(cvSnap => {
              if (cvSnap.exists()) {
                setCvData(normalizeCvData(cvSnap.data(), projectsData, experience))
              }
            })
            experienceLoaded = true
            checkLoading()
          },
          () => {
            experienceLoaded = true
            checkLoading()
          }
        )

        return () => {
          projectsUnsubscribe()
          experienceUnsubscribe()
        }
      } catch {
        setCvData(defaultCvData)
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const handleChange = (field, value) => {
    setCvData((prev) => ({ ...prev, [field]: value }))
    setSaved(false)
  }

  const updateArrayItem = (section, index, field, value) => {
    setCvData((prev) => ({
      ...prev,
      [section]: prev[section].map((item, itemIndex) => (
        itemIndex === index ? { ...item, [field]: value } : item
      ))
    }))
    setSaved(false)
  }

  const addArrayItem = (section, item) => {
    setCvData((prev) => ({ ...prev, [section]: [...prev[section], item] }))
    setSaved(false)
  }

  const removeArrayItem = (section, index) => {
    setCvData((prev) => ({
      ...prev,
      [section]: prev[section].filter((_, itemIndex) => itemIndex !== index)
    }))
    setSaved(false)
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const docRef = doc(db, 'settings', 'cv')
      await setDoc(docRef, normalizeCvData(cvData), { merge: true })
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch {
      alert('Failed to save CV settings. Please try again.')
    }
    setSaving(false)
  }

  const tabs = [
    { id: 'identity', label: 'Identity' },
    { id: 'sidebar', label: 'Sidebar' },
    { id: 'experience', label: 'Experience' },
    { id: 'projects', label: 'Projects' },
    { id: 'preview', label: 'Preview' }
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">CV Template</h1>
          <p className="text-gray-500">Edit the CV content used by the website preview and download.</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className={`px-6 py-3 rounded-xl font-medium transition-all flex items-center justify-center gap-2 ${
            saved ? 'bg-green-500 text-white' : 'bg-white text-black hover:bg-gray-200'
          } disabled:opacity-50`}
        >
          {saving ? 'Saving...' : saved ? 'Saved!' : 'Save Changes'}
        </button>
      </div>

      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
              activeTab === tab.id
                ? 'bg-white text-black'
                : 'bg-gray-900 text-gray-400 hover:text-white border border-gray-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab !== 'preview' && (
        <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-6 space-y-6">
          {activeTab === 'identity' && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <InputField label="File Name" value={cvData.fileName} onChange={(value) => handleChange('fileName', value)} placeholder="Simrat_Singh_CV" />
                <InputField label="Name" value={cvData.name} onChange={(value) => handleChange('name', value)} placeholder="Simrat Singh" />
                <InputField label="Title" value={cvData.title} onChange={(value) => handleChange('title', value)} placeholder="Software Developer" />
              </div>
              <TextareaField label="Career Objective" value={cvData.objective} onChange={(value) => handleChange('objective', value)} rows={7} />
            </>
          )}

          {activeTab === 'sidebar' && (
            <div className="space-y-8">
              <section className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-white">Contact</h2>
                  <button type="button" onClick={() => addArrayItem('contacts', { label: '', value: '', href: '', icon: 'link' })} className="px-4 py-2 rounded-xl bg-white text-black text-sm font-medium hover:bg-gray-200">Add Contact</button>
                </div>
                {cvData.contacts.map((contact, index) => (
                  <Card key={index} title={`Contact ${index + 1}`} onRemove={() => removeArrayItem('contacts', index)}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <InputField label="Label" value={contact.label} onChange={(value) => updateArrayItem('contacts', index, 'label', value)} />
                      <InputField label="Value" value={contact.value} onChange={(value) => updateArrayItem('contacts', index, 'value', value)} />
                      <InputField label="Hyperlink" value={contact.href} onChange={(value) => updateArrayItem('contacts', index, 'href', value)} placeholder="mailto:, tel:, https://..." />
                      <InputField label="Icon" value={contact.icon} onChange={(value) => updateArrayItem('contacts', index, 'icon', value)} placeholder="email, phone, location, linkedin, link" />
                    </div>
                  </Card>
                ))}
              </section>

              <section className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-white">Education</h2>
                  <button type="button" onClick={() => addArrayItem('education', { degree: '', institution: '', location: '', score: '', period: '' })} className="px-4 py-2 rounded-xl bg-white text-black text-sm font-medium hover:bg-gray-200">Add Education</button>
                </div>
                {cvData.education.map((item, index) => (
                  <Card key={index} title={item.degree || `Education ${index + 1}`} onRemove={() => removeArrayItem('education', index)}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <InputField label="Degree" value={item.degree} onChange={(value) => updateArrayItem('education', index, 'degree', value)} />
                      <InputField label="Score" value={item.score} onChange={(value) => updateArrayItem('education', index, 'score', value)} />
                      <InputField label="Institution" value={item.institution} onChange={(value) => updateArrayItem('education', index, 'institution', value)} />
                      <InputField label="Period" value={item.period} onChange={(value) => updateArrayItem('education', index, 'period', value)} />
                      <InputField label="Location" value={item.location} onChange={(value) => updateArrayItem('education', index, 'location', value)} />
                    </div>
                  </Card>
                ))}
              </section>

              <section className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-white">Skills</h2>
                  <button type="button" onClick={() => addArrayItem('skills', { category: '', items: '' })} className="px-4 py-2 rounded-xl bg-white text-black text-sm font-medium hover:bg-gray-200">Add Skill</button>
                </div>
                {cvData.skills.map((skill, index) => (
                  <Card key={index} title={skill.category || `Skill ${index + 1}`} onRemove={() => removeArrayItem('skills', index)}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <InputField label="Category" value={skill.category} onChange={(value) => updateArrayItem('skills', index, 'category', value)} />
                      <InputField label="Items" value={skill.items} onChange={(value) => updateArrayItem('skills', index, 'items', value)} />
                    </div>
                  </Card>
                ))}
              </section>

              <section className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-white">Certifications</h2>
                  <button type="button" onClick={() => addArrayItem('certifications', { name: '', issuer: '' })} className="px-4 py-2 rounded-xl bg-white text-black text-sm font-medium hover:bg-gray-200">Add Certification</button>
                </div>
                {cvData.certifications.map((cert, index) => (
                  <Card key={index} title={cert.name || `Certification ${index + 1}`} onRemove={() => removeArrayItem('certifications', index)}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <InputField label="Name" value={cert.name} onChange={(value) => updateArrayItem('certifications', index, 'name', value)} />
                      <InputField label="Issuer" value={cert.issuer} onChange={(value) => updateArrayItem('certifications', index, 'issuer', value)} />
                    </div>
                  </Card>
                ))}
              </section>

              <TextareaField label="Languages" value={arrayToLines(cvData.languages)} onChange={(value) => handleChange('languages', linesToArray(value))} rows={5} placeholder="One language per line" />
            </div>
          )}

          {activeTab === 'experience' && (
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-white">Experience</h2>
                <button type="button" onClick={() => addArrayItem('experience', { company: '', role: '', period: '', location: '', linkLabel: '', linkUrl: '', summary: '', highlights: [] })} className="px-4 py-2 rounded-xl bg-white text-black text-sm font-medium hover:bg-gray-200">Add Experience</button>
              </div>
              {cvData.experience.map((item, index) => (
                <Card key={index} title={item.company || `Experience ${index + 1}`} onRemove={() => removeArrayItem('experience', index)}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <InputField label="Company" value={item.company} onChange={(value) => updateArrayItem('experience', index, 'company', value)} />
                    <InputField label="Role" value={item.role} onChange={(value) => updateArrayItem('experience', index, 'role', value)} />
                    <InputField label="Period" value={item.period} onChange={(value) => updateArrayItem('experience', index, 'period', value)} />
                    <InputField label="Location" value={item.location} onChange={(value) => updateArrayItem('experience', index, 'location', value)} />
                    <InputField label="Link Label" value={item.linkLabel} onChange={(value) => updateArrayItem('experience', index, 'linkLabel', value)} />
                    <InputField label="Link URL" value={item.linkUrl} onChange={(value) => updateArrayItem('experience', index, 'linkUrl', value)} />
                  </div>
                  <TextareaField label="Summary" value={item.summary} onChange={(value) => updateArrayItem('experience', index, 'summary', value)} rows={3} />
                  <TextareaField label="Highlights" value={arrayToLines(item.highlights)} onChange={(value) => updateArrayItem('experience', index, 'highlights', linesToArray(value))} rows={7} placeholder="One bullet per line" />
                </Card>
              ))}
            </section>
          )}

          {activeTab === 'projects' && (
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-white">Projects</h2>
                <button type="button" onClick={() => addArrayItem('projects', { name: '', linkLabel: 'Live Link', linkUrl: '', highlights: [] })} className="px-4 py-2 rounded-xl bg-white text-black text-sm font-medium hover:bg-gray-200">Add Project</button>
              </div>
              {cvData.projects.map((project, index) => (
                <Card key={index} title={project.name || `Project ${index + 1}`} onRemove={() => removeArrayItem('projects', index)}>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <InputField label="Project Name" value={project.name} onChange={(value) => updateArrayItem('projects', index, 'name', value)} />
                    <InputField label="Link Label" value={project.linkLabel} onChange={(value) => updateArrayItem('projects', index, 'linkLabel', value)} />
                    <InputField label="Link URL" value={project.linkUrl} onChange={(value) => updateArrayItem('projects', index, 'linkUrl', value)} />
                  </div>
                  <TextareaField label="Highlights" value={arrayToLines(project.highlights)} onChange={(value) => updateArrayItem('projects', index, 'highlights', linesToArray(value))} rows={5} placeholder="One bullet per line" />
                </Card>
              ))}
            </section>
          )}
        </div>
      )}

      {activeTab === 'preview' && (
        <div className="bg-gray-100 rounded-2xl p-4 md:p-8 overflow-x-auto">
          <CVPreview data={cvData} />
        </div>
      )}
    </div>
  )
}

export default CVSettings
