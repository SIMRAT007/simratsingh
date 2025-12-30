import { useState, useEffect } from 'react'
import { doc, onSnapshot, collection } from 'firebase/firestore'
import { db, isFirebaseConfigured } from '../firebase/config'

// Default settings when Firebase is not configured or data not available
const defaultSettings = {
  // Sections (all enabled by default)
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
  
  // Copyright
  copyrightYear: new Date().getFullYear().toString(),
  copyrightText: 'All rights reserved.',
  
  // Branding
  brandName: 'Simrat Singh',
  tagline: 'think. build. grow.',
  logoUrl: 'https://i.ibb.co/6RGHCJxZ/logo.jpg',
  faviconUrl: 'https://i.ibb.co/7x5KkHQP/logo-Photoroom-1.png',
  
  // SEO - Basic
  siteTitle: 'Simrat Singh | Full Stack Developer',
  siteDescription: 'Passionate full-stack developer crafting digital experiences.',
  keywords: 'Full Stack Developer, Web Developer, React',
  author: 'Simrat Singh',
  siteUrl: '',
  language: 'en',
  robots: 'index, follow',
  themeColor: '#000000',
  
  // SEO - Open Graph
  ogTitle: '',
  ogDescription: '',
  ogImage: '',
  ogType: 'website',
  
  // SEO - Twitter
  twitterHandle: '',
  twitterCardType: 'summary_large_image',
  twitterImage: '',
  
  // SEO - Advanced
  googleAnalyticsId: '',
  googleSiteVerification: '',
  
  // Tip of the Day
  tipOfDayEnabled: true,
  tips: [
    { id: 1, text: 'Centering a div both horizontally and vertically used to require complex hacks, but modern CSS makes it straightforward with display: grid and place-items: center.', icon: '💡' },
    { id: 2, text: 'Implement Smooth Scrolling: Add the scroll-behavior: smooth; property to the :root selector in your CSS to enable smooth transitions when navigating to anchor links on the same page, all without needing JavaScript.', icon: '🎮' },
    { id: 3, text: 'A simple and modern way to filter out duplicates from an array is by utilizing the built-in Set data structure, which only allows unique values.  const numbersWithDuplicates = [5, 10, 5, 20, 10, 30];  // Convert the array to a Set to remove duplicates,  // then convert it back to an array using the spread syntax const uniqueNumbers = [...new Set(numbersWithDuplicates)];  console.log(uniqueNumbers);  // Output: [5, 10, 20, 30] ', icon: '📧' }
  ],
  
  // Notifications
  notificationsEnabled: true,
  notifications: [
    { id: 1, title: 'Welcome!', message: 'Thanks for visiting my portfolio.', icon: '👋', type: 'info', link: '' }
  ],
  
  // Contact Info
  email: 'simratsinghmehra01@gmail.com',
  whatsapp: '',
  currentLocation: 'Navi Mumbai, Maharashtra',
  hometown: 'Ludhiana, Punjab.',
  showGoogleMaps: true,
  googleMapsEmbed: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d17670.101656471787!2d73.01230545000001!3d19.1242455!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3be7c0beddab5c77%3A0xd2f7874862ef69dd!2sReliance%20Corporate%20Park%2C%20MIDC%20Industrial%20Area%2C%20Ghansoli%2C%20Navi%20Mumbai%2C%20Maharashtra!5e1!3m2!1sen!2sin!4v1766641488484!5m2!1sen!2sin',
  googleMapsLink: 'https://maps.app.goo.gl/NaypiJxi9EvR5tAM8',
  
  // Social Links
  linkedin: 'https://www.linkedin.com/in/simratsingh007/',
  github: 'https://github.com/SIMRAT007',
  twitter: '',
  instagram: '',
  youtube: '',
  facebook: '',
  dribbble: '',
  behance: ''
}

// Default about settings
const defaultAboutSettings = {
  title: 'Passionate developer crafting {` `}',
  subtitle: 'digital experiences',
  description: 'My self Simrat Singh, I am a passionate, self-proclaimed designer who specializes in full stack development (React.js & Node.js). I am very enthusiastic about bringing the technical and visual aspects of digital products to life. User experience, pixel perfect design, and writing clear, readable, highly performant code matters to me. I began my journey as a web developer in 2017 from back in school, and since then, I\'ve continued to grow and evolve as a developer, taking on new challenges and learning the latest technologies along the way. I\'m building cutting-edge web applications using modern technologies such as Next.js, TypeScript, Nestjs, Tailwindcss, Firebase and much more.',
  aboutImage: '',
  highlights: 'When I am not in full-on developer mode, you can find me exploring new technologies, contributing to open-source projects, or sharing knowledge through technical blogs and community events or enjoying free time by singing, painting or travelling.',
  
  // Stats Section Header
  statsSubtitle: 'Numbers speak',
  statsTitle: 'My',
  statsTitleHighlight: 'Stats',
  
  // Stats Values
  yearsExperience: '3+',
  projectsCompleted: '20+',
  happyClients: '30+',
  technologies: '20+'
}

// Default hero settings
const defaultHeroSettings = {
  greeting: "Hello! I'm",
  name: 'Simrat',
  nameSuffix: 'Singh.',
  headline: 'Building scalable software solutions with emphasis on',
  headlineHighlight: 'clean code',
  description: 'A full-stack software engineer passionate about creating efficient, maintainable code and delivering exceptional digital experiences.',
  heroImage: '',
  ctaText: "Let's Connect"
}

// Default skills settings
const defaultSkillsSettings = {
  sectionTitle: 'Skills &',
  sectionTitleHighlight: 'Expertise',
  sectionSubtitle: 'What I know',
  ctaText: 'Always learning, always growing. Currently exploring AI/ML integration.',
  
  frontendTitle: 'Frontend',
  frontendSkills: 'React.js, Next.js, TypeScript, JavaScript, Tailwind CSS, HTML/CSS, Redux, Framer Motion',
  
  backendTitle: 'Backend',
  backendSkills: 'Node.js, Express.js, NestJS, REST APIs, GraphQL, MongoDB, PostgreSQL, Firebase',
  
  othersTitle: 'Others',
  othersSkills: 'React Native, Expo, iOS, Android, Push Notifications, App Store Deployment',
  
  toolsTitle: 'Tools & DevOps',
  toolsSkills: 'Git, GitHub, Docker, AWS, Vercel, CI/CD, Figma, VS Code'
}

export const useSiteSettings = () => {
  const [settings, setSettings] = useState(defaultSettings)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isFirebaseConfigured || !db) {
      setLoading(false)
      return
    }

    const docRef = doc(db, 'settings', 'site')
    
    const unsubscribe = onSnapshot(
      docRef,
      (docSnap) => {
        if (docSnap.exists()) {
          setSettings(prev => ({ ...prev, ...docSnap.data() }))
        }
        setLoading(false)
      },
      (error) => {
        setLoading(false)
      }
    )

    return () => unsubscribe()
  }, [])

  return { settings, loading, isFirebaseConfigured }
}

export const useAboutSettings = () => {
  const [settings, setSettings] = useState(defaultAboutSettings)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isFirebaseConfigured || !db) {
      setLoading(false)
      return
    }

    const docRef = doc(db, 'settings', 'about')
    
    const unsubscribe = onSnapshot(
      docRef,
      (docSnap) => {
        if (docSnap.exists()) {
          setSettings(prev => ({ ...prev, ...docSnap.data() }))
        }
        setLoading(false)
      },
      (error) => {
        setLoading(false)
      }
    )

    return () => unsubscribe()
  }, [])

  return { settings, loading }
}

export const useHeroSettings = () => {
  const [settings, setSettings] = useState(defaultHeroSettings)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isFirebaseConfigured || !db) {
      setLoading(false)
      return
    }

    const docRef = doc(db, 'settings', 'hero')
    
    const unsubscribe = onSnapshot(
      docRef,
      (docSnap) => {
        if (docSnap.exists()) {
          setSettings(prev => ({ ...prev, ...docSnap.data() }))
        }
        setLoading(false)
      },
      (error) => {
        setLoading(false)
      }
    )

    return () => unsubscribe()
  }, [])

  return { settings, loading }
}

export const useSkillsSettings = () => {
  const [settings, setSettings] = useState(defaultSkillsSettings)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isFirebaseConfigured || !db) {
      setLoading(false)
      return
    }

    const docRef = doc(db, 'settings', 'skills')
    
    const unsubscribe = onSnapshot(
      docRef,
      (docSnap) => {
        if (docSnap.exists()) {
          setSettings(prev => ({ ...prev, ...docSnap.data() }))
        }
        setLoading(false)
      },
      (error) => {
        setLoading(false)
      }
    )

    return () => unsubscribe()
  }, [])

  return { settings, loading }
}

// Default testimonials settings
const defaultTestimonialsSettings = {
  sectionSubtitle: 'What People Say',
  sectionTitle: 'Client',
  sectionTitleHighlight: 'Testimonials',
  bottomNote: 'Building lasting relationships through quality work'
}

export const useTestimonialsSettings = () => {
  const [settings, setSettings] = useState(defaultTestimonialsSettings)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isFirebaseConfigured || !db) {
      setLoading(false)
      return
    }

    const docRef = doc(db, 'settings', 'testimonials')
    
    const unsubscribe = onSnapshot(
      docRef,
      (docSnap) => {
        if (docSnap.exists()) {
          setSettings(prev => ({ ...prev, ...docSnap.data() }))
        }
        setLoading(false)
      },
      (error) => {
        setLoading(false)
      }
    )

    return () => unsubscribe()
  }, [])

  return { settings, loading }
}

// Default blogs settings
const defaultBlogsSettings = {
  sectionSubtitle: 'Latest Articles',
  sectionTitle: 'My',
  sectionTitleHighlight: 'Blogs',
  sectionDescription: 'Sharing my knowledge and experiences through articles on development, design, and technology.',
  bottomNote: 'New articles are published regularly'
}

export const useBlogsSettings = () => {
  const [settings, setSettings] = useState(defaultBlogsSettings)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isFirebaseConfigured || !db) {
      setLoading(false)
      return
    }

    const docRef = doc(db, 'settings', 'blogs')
    
    const unsubscribe = onSnapshot(
      docRef,
      (docSnap) => {
        if (docSnap.exists()) {
          setSettings(prev => ({ ...prev, ...docSnap.data() }))
        }
        setLoading(false)
      },
      (error) => {
        setLoading(false)
      }
    )

    return () => unsubscribe()
  }, [])

  return { settings, loading }
}

// Default social media settings
const defaultSocialMediaSettings = {
  sectionSubtitle: 'Stay Connected',
  sectionTitle: 'Social',
  sectionTitleHighlight: 'Media',
  sectionDescription: 'Follow my journey across platforms for tips, tutorials, and behind-the-scenes content',
  bottomNote: 'Follow me for daily tips and updates',
  youtubeEnabled: true,
  linkedinEnabled: true,
  instagramEnabled: true,
  youtubeHandle: '@simratsingh',
  youtubeProfileUrl: 'https://youtube.com/@simratsingh',
  linkedinHandle: 'simratsingh',
  linkedinProfileUrl: 'https://linkedin.com/in/simratsingh',
  instagramHandle: '@simrat.dev',
  instagramProfileUrl: 'https://instagram.com/simrat.dev'
}

export const useSocialMediaSettings = () => {
  const [settings, setSettings] = useState(defaultSocialMediaSettings)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isFirebaseConfigured || !db) {
      setLoading(false)
      return
    }

    const docRef = doc(db, 'settings', 'socialMedia')
    
    const unsubscribe = onSnapshot(
      docRef,
      (docSnap) => {
        if (docSnap.exists()) {
          setSettings(prev => ({ ...prev, ...docSnap.data() }))
        }
        setLoading(false)
      },
      (error) => {
        setLoading(false)
      }
    )

    return () => unsubscribe()
  }, [])

  return { settings, loading }
}

// Default services settings
const defaultServicesSettings = {
  sectionSubtitle: 'What I Offer',
  sectionTitle: 'Freelance',
  sectionTitleHighlight: 'Services',
  sectionDescription: 'Transforming ideas into digital reality. Quality work delivered on time, every time.',
  processTitle: 'My',
  processTitleHighlight: 'Process',
  ctaText: 'Have a project in mind? Let\'s discuss how I can help bring your vision to life.',
  ctaButton1: 'Start a Project',
  ctaButton2: 'Schedule a Call'
}

export const useServicesSettings = () => {
  const [settings, setSettings] = useState(defaultServicesSettings)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isFirebaseConfigured || !db) {
      setLoading(false)
      return
    }

    const docRef = doc(db, 'settings', 'services')
    
    const unsubscribe = onSnapshot(
      docRef,
      (docSnap) => {
        if (docSnap.exists()) {
          setSettings(prev => ({ ...prev, ...docSnap.data() }))
        }
        setLoading(false)
      },
      (error) => {
        setLoading(false)
      }
    )

    return () => unsubscribe()
  }, [])

  return { settings, loading }
}

// Default quotes settings
const defaultQuotesSettings = {
  bottomNote: 'Refresh the page for a new quote of wisdom'
}

// Default music settings
const defaultMusicSettings = {
  sectionSubtitle: "What I'm Listening To",
  sectionTitle: 'Music',
  sectionTitleHighlight: 'of the Day',
  bottomNote: '🎧 Vibes that keep me coding • Click play to listen'
}

export const useMusicSettings = () => {
  const [settings, setSettings] = useState(defaultMusicSettings)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isFirebaseConfigured || !db) {
      setLoading(false)
      return
    }

    const docRef = doc(db, 'settings', 'music')
    
    const unsubscribe = onSnapshot(
      docRef,
      (docSnap) => {
        if (docSnap.exists()) {
          setSettings(prev => ({ ...prev, ...docSnap.data() }))
        }
        setLoading(false)
      },
      (error) => {
        setLoading(false)
      }
    )

    return () => unsubscribe()
  }, [])

  return { settings, loading }
}

export const useQuotesSettings = () => {
  const [settings, setSettings] = useState(defaultQuotesSettings)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isFirebaseConfigured || !db) {
      setLoading(false)
      return
    }

    const docRef = doc(db, 'settings', 'quotes')
    
    const unsubscribe = onSnapshot(
      docRef,
      (docSnap) => {
        if (docSnap.exists()) {
          setSettings(prev => ({ ...prev, ...docSnap.data() }))
        }
        setLoading(false)
      },
      (error) => {
        setLoading(false)
      }
    )

    return () => unsubscribe()
  }, [])

  return { settings, loading }
}

// Default contributions settings
const defaultContributionsSettings = {
  sectionSubtitle: 'My Work',
  sectionTitle: 'Contributions &',
  sectionTitleHighlight: 'Publications',
  sectionDescription: 'Explore my published packages, code marketplace items, and open source contributions',
  npmEnabled: true,
  sellingEnabled: true,
  opensourceEnabled: true
}

export const useContributionsSettings = () => {
  const [settings, setSettings] = useState(defaultContributionsSettings)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isFirebaseConfigured || !db) {
      setLoading(false)
      return
    }

    const docRef = doc(db, 'settings', 'contributions')
    
    const unsubscribe = onSnapshot(
      docRef,
      (docSnap) => {
        if (docSnap.exists()) {
          setSettings(prev => ({ ...prev, ...docSnap.data() }))
        }
        setLoading(false)
      },
      (error) => {
        setLoading(false)
      }
    )

    return () => unsubscribe()
  }, [])

  return { settings, loading }
}

// Default languages settings
const defaultLanguagesSettings = {
  sectionSubtitle: 'Communication',
  sectionTitle: 'Languages I',
  sectionTitleHighlight: 'Speak',
  sectionDescription: 'Languages I am proficient in'
}

export const useLanguagesSettings = () => {
  const [settings, setSettings] = useState(defaultLanguagesSettings)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isFirebaseConfigured || !db) {
      setLoading(false)
      return
    }

    const docRef = doc(db, 'settings', 'languages')
    
    const unsubscribe = onSnapshot(
      docRef,
      (docSnap) => {
        if (docSnap.exists()) {
          setSettings(prev => ({ ...prev, ...docSnap.data() }))
        }
        setLoading(false)
      },
      (error) => {
        setLoading(false)
      }
    )

    return () => unsubscribe()
  }, [])

  return { settings, loading }
}

// Default organizations settings
const defaultOrganizationsSettings = {
  sectionSubtitle: 'Affiliations',
  sectionTitle: 'Organizations &',
  sectionTitleHighlight: 'Associations',
  sectionDescription: 'Organizations I am associated with'
}

export const useOrganizationsSettings = () => {
  const [settings, setSettings] = useState(defaultOrganizationsSettings)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isFirebaseConfigured || !db) {
      setLoading(false)
      return
    }

    const docRef = doc(db, 'settings', 'organizations')
    
    const unsubscribe = onSnapshot(
      docRef,
      (docSnap) => {
        if (docSnap.exists()) {
          setSettings(prev => ({ ...prev, ...docSnap.data() }))
        }
        setLoading(false)
      },
      (error) => {
        setLoading(false)
      }
    )

    return () => unsubscribe()
  }, [])

  return { settings, loading }
}

// Generic hook for fetching collection data
export const useFirestoreCollection = (collectionName, defaultData = []) => {
  const [data, setData] = useState(defaultData)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isFirebaseConfigured || !db) {
      setLoading(false)
      return
    }

    const colRef = collection(db, collectionName)
    
    const unsubscribe = onSnapshot(
      colRef,
      (snapshot) => {
        const items = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
        setData(items)
        setLoading(false)
      },
      (error) => {
        setLoading(false)
      }
    )

    return () => unsubscribe()
  }, [collectionName])

  return { data, loading }
}

export default useSiteSettings
