import { useParams } from 'react-router-dom'

// Generic placeholder for sections that need more complex management
const GenericSettings = () => {
  const { section } = useParams()
  
  const sectionNames = {
    skills: 'Skills',
    projects: 'Projects',
    experience: 'Experience',
    blogs: 'Blogs',
    testimonials: 'Testimonials',
    quotes: 'Quotes'
  }

  const sectionName = sectionNames[section] || section

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">{sectionName}</h1>
        <p className="text-gray-500">Manage your {sectionName?.toLowerCase()} section.</p>
      </div>

      <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-8 text-center">
        <div className="w-16 h-16 rounded-2xl bg-gray-800 flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
        </div>
        <h2 className="text-xl font-semibold text-white mb-2">Coming Soon</h2>
        <p className="text-gray-500 max-w-md mx-auto">
          Full CRUD management for {sectionName?.toLowerCase()} will be available soon. 
          For now, you can manage this section directly in the code.
        </p>

        <div className="mt-8 p-4 bg-gray-800/50 rounded-xl text-left">
          <p className="text-gray-400 text-sm mb-2">💡 Tip:</p>
          <p className="text-gray-500 text-sm">
            To add full management for this section, create a Firestore collection 
            named "{section}" and implement add/edit/delete functionality.
          </p>
        </div>
      </div>
    </div>
  )
}

export default GenericSettings

