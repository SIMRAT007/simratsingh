export const defaultCvData = {
  fileName: 'Simrat_Singh_CV',
  name: 'Simrat Singh',
  title: 'Software Developer',
  objective:
    'To leverage my expertise in software development, particularly in building scalable and user-friendly applications, while contributing to innovative projects in AI/ML and cutting-edge technologies. I am eager to work in a collaborative environment where I can grow and make an impactful contribution to organizational goals.',
  contacts: [
    { label: 'Email', value: 'simratsinghmehra01@gmail.com', href: 'mailto:simratsinghmehra01@gmail.com', icon: 'email' },
    { label: 'Phone', value: '8850819188, 7209803944', href: 'tel:8850819188', icon: 'phone' },
    { label: 'Location', value: 'Ludhiana, Punjab, India', href: 'https://www.google.com/maps/search/?api=1&query=Ludhiana%2C%20Punjab%2C%20India', icon: 'location' },
    { label: 'LinkedIn', value: 'linkedin.com/in/simratsingh007', href: 'https://linkedin.com/in/simratsingh007', icon: 'linkedin' },
    { label: 'Website', value: 'simratsingh.vercel.app', href: 'https://simratsingh.vercel.app', icon: 'link' }
  ],
  education: [
    {
      degree: 'Bachelor Of Technology',
      institution: 'Lovely Professional University',
      location: 'Jalandhar, Punjab, India.',
      score: 'CGPA : 8',
      period: '2019 - 23'
    },
    {
      degree: 'Intermediate',
      institution: 'Tata D.A.V. School',
      location: 'Bhelatand, Jharkhand, India.',
      score: 'CGPA : 8',
      period: '2018 - 19'
    },
    {
      degree: 'Matriculation',
      institution: 'Tata D.A.V. School',
      location: 'Bhelatand, Jharkhand, India.',
      score: 'CGPA : 9',
      period: '2016 - 17'
    }
  ],
  skills: [
    { category: 'Programming Languages', items: 'JavaScript & C++' },
    { category: 'Frameworks & Libraries', items: 'ReactJS, React Native, Node.js, & Next.js' },
    { category: 'Tools & Platforms:', items: 'Git, VS Code, Figma, Android Studio, etc' },
    { category: 'Others', items: 'HTML, CSS, UI/UX, Designing etc' }
  ],
  certifications: [
    { name: 'Full Stack Web Development with React Specialization.', issuer: 'Hong Kong University' },
    { name: 'Foundations of UX/UI Design', issuer: 'Google' }
  ],
  languages: [
    'English (Proficient)',
    'Hindi (Proficient)',
    'Punjabi (Native)'
  ],
  experience: [
    {
      company: 'Reliance - Jio Platform ltd.',
      role: 'Software Development Engineer - I',
      period: 'Dec/2023 - Present',
      location: 'Navi Mumbai, India',
      linkLabel: 'AppStore',
      linkUrl: '',
      summary:
        'As part of the HelloJio team, I worked on developing a mic-integrated voice assistant within the MyJio app using React Native.',
      highlights: [
        'Contributing to the project, a next-generation AI/ML voice assistant similar to ChatGPT integrated in MyJIO App, leveraging LLM technologies.',
        'Played a pivotal role in migrating the project from Kotlin Native to React Native for better scalability and cross-platform support.',
        'Worked extensively on DAG flows, UI enhancements, API integrations, and bug resolution.',
        'Improved user experience by developing and optimizing frontend components using React and React Native.',
        'Ensured robust backend communication through efficient API design and implementation.'
      ]
    }
  ],
  projects: [
    {
      name: 'Destiny Jobs',
      linkLabel: 'Live Link',
      linkUrl: '',
      highlights: [
        'Vite web, users can easily browse and post job opportunities through an intuitive interface, leveraging Supabase for real-time data syncing and Clerk for seamless user authentication.'
      ]
    },
    {
      name: 'The Fitness Solutions',
      linkLabel: 'Live Link',
      linkUrl: '',
      highlights: [
        'Designed and developed a responsive Gym Website with cool Ui/Ux. User can calculate BMI and choose plan accordingly.'
      ]
    },
    {
      name: 'Personal Portfolio Website',
      linkLabel: 'Live Link',
      linkUrl: '',
      highlights: [
        'Designed and developed a responsive portfolio website using Vite and React Js, showcasing clean and modern UI/UX principles. All other projects are listed here.'
      ]
    }
  ]
}

const ensureArray = (value, fallback = []) => (Array.isArray(value) ? value : fallback)

export const normalizeCvData = (data = {}, projectsData = [], experienceData = []) => {
  const liveProjects = ensureArray(projectsData).map(project => ({
    name: project.title || project.name,
    linkLabel: project.live ? 'Live Demo' : project.github ? 'GitHub' : '',
    linkUrl: project.live || project.github || '',
    highlights: [
      project.description,
      project.tech?.length ? `Technologies: ${project.tech.join(', ')}` : '',
      project.category ? `Category: ${project.category}` : '',
      project.year ? `Year: ${project.year}` : ''
    ].filter(Boolean)
  })).filter(project => project.name)

  const liveExperience = ensureArray(experienceData).map(exp => ({
    company: exp.company,
    role: exp.role,
    period: exp.period || exp.duration,
    location: exp.location,
    linkLabel: exp.linkLabel || (exp.companyWebsite ? 'Company Website' : ''),
    linkUrl: exp.linkUrl || exp.companyWebsite || '',
    summary: exp.summary || exp.description || '',
    highlights: ensureArray(exp.highlights, exp.technologies?.length ? [`Technologies: ${exp.technologies.join(', ')}`] : [])
  })).filter(exp => exp.company || exp.role)

  // Merge projects with links from main projects collection
  const sourceProjects = data.projects
    ? ensureArray(data.projects, defaultCvData.projects)
    : liveProjects.length
      ? liveProjects
      : defaultCvData.projects

  const mergedProjects = sourceProjects.map(cvProject => {
    const matchingProject = projectsData.find(p => p.title === cvProject.name)
    if (matchingProject) {
      return {
        ...cvProject,
        linkUrl: cvProject.linkUrl || matchingProject.live || matchingProject.github,
        linkLabel: cvProject.linkLabel || (matchingProject.live ? 'Live Demo' : matchingProject.github ? 'GitHub' : '')
      }
    }
    return cvProject
  })

  // Merge experience with links from main experience collection
  const sourceExperience = data.experience
    ? ensureArray(data.experience, defaultCvData.experience)
    : liveExperience.length
      ? liveExperience
      : defaultCvData.experience

  const mergedExperience = sourceExperience.map(cvExp => {
    const matchingExp = experienceData.find(e => e.company === cvExp.company && e.role === cvExp.role)
    if (matchingExp && (matchingExp.linkUrl || matchingExp.companyWebsite)) {
      return {
        ...cvExp,
        linkUrl: cvExp.linkUrl || matchingExp.linkUrl || matchingExp.companyWebsite,
        linkLabel: cvExp.linkLabel || matchingExp.linkLabel || 'Company Website'
      }
    }
    return cvExp
  })

  return {
    ...defaultCvData,
    ...data,
    contacts: ensureArray(data.contacts, defaultCvData.contacts),
    education: ensureArray(data.education, defaultCvData.education),
    skills: ensureArray(data.skills, defaultCvData.skills),
    certifications: ensureArray(data.certifications, defaultCvData.certifications),
    languages: ensureArray(data.languages, defaultCvData.languages),
    experience: mergedExperience,
    projects: mergedProjects
  }
}
