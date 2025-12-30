import { useEffect } from 'react'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import About from './components/About'
import Stats from './components/Stats'
import Skills from './components/Skills'
import Services from './components/Services'
import Projects from './components/Projects'
import Experience from './components/Experience'
import Achievements from './components/Achievements'
import Education from './components/Education'
import Hobbies from './components/Hobbies'
import Quotes from './components/Quotes'
import Games from './components/Games'
import MusicOfTheDay from './components/MusicOfTheDay'
import Weather from './components/Weather'
import Testimonials from './components/Testimonials'
import Blogs from './components/Blogs'
import SocialMedia from './components/SocialMedia'
import Contributions from './components/Contributions'
import Languages from './components/Languages'
import Organizations from './components/Organizations'
import Contact from './components/Contact'
import Footer from './components/Footer'
import ScrollToTop from './components/ScrollToTop'
import TipOfTheDay from './components/TipOfTheDay'
import { useSiteSettings } from './hooks/useSiteSettings'

function App() {
  const { settings } = useSiteSettings()
  const sections = settings.sections || {}

  // Update document title, favicon, and all meta tags from Firebase settings
  useEffect(() => {
    // Helper function to update or create meta tag
    const updateMeta = (selector, attribute, value) => {
      if (!value) return
      let meta = document.querySelector(selector)
      if (meta) {
        meta.setAttribute(attribute === 'content' ? 'content' : attribute, value)
      } else {
        meta = document.createElement('meta')
        if (selector.includes('property=')) {
          const prop = selector.match(/property='([^']+)'/)?.[1]
          if (prop) meta.setAttribute('property', prop)
        } else if (selector.includes('name=')) {
          const name = selector.match(/name='([^']+)'/)?.[1]
          if (name) meta.setAttribute('name', name)
        }
        meta.setAttribute('content', value)
        document.head.appendChild(meta)
      }
    }

    // Update title
    if (settings.siteTitle) {
      document.title = settings.siteTitle
    }
    
    // Update favicon
    if (settings.faviconUrl) {
      const existingFavicon = document.querySelector("link[rel*='icon']")
      if (existingFavicon) {
        existingFavicon.href = settings.faviconUrl
      } else {
        const newFavicon = document.createElement('link')
        newFavicon.rel = 'icon'
        newFavicon.href = settings.faviconUrl
        document.head.appendChild(newFavicon)
      }
    }

    // Update theme color
    if (settings.themeColor) {
      updateMeta("meta[name='theme-color']", 'content', settings.themeColor)
    }

    // Basic SEO meta tags
    updateMeta("meta[name='description']", 'content', settings.siteDescription)
    updateMeta("meta[name='keywords']", 'content', settings.keywords)
    updateMeta("meta[name='author']", 'content', settings.author)
    updateMeta("meta[name='robots']", 'content', settings.robots || 'index, follow')

    // Language
    if (settings.language) {
      document.documentElement.lang = settings.language
    }

    // Canonical URL
    if (settings.siteUrl) {
      let canonical = document.querySelector("link[rel='canonical']")
      if (canonical) {
        canonical.href = settings.siteUrl
      } else {
        canonical = document.createElement('link')
        canonical.rel = 'canonical'
        canonical.href = settings.siteUrl
        document.head.appendChild(canonical)
      }
    }

    // Open Graph meta tags
    updateMeta("meta[property='og:title']", 'content', settings.ogTitle || settings.siteTitle)
    updateMeta("meta[property='og:description']", 'content', settings.ogDescription || settings.siteDescription)
    updateMeta("meta[property='og:image']", 'content', settings.ogImage)
    updateMeta("meta[property='og:type']", 'content', settings.ogType || 'website')
    updateMeta("meta[property='og:url']", 'content', settings.siteUrl)
    updateMeta("meta[property='og:site_name']", 'content', settings.brandName || settings.siteTitle)

    // Twitter Card meta tags
    updateMeta("meta[name='twitter:card']", 'content', settings.twitterCardType || 'summary_large_image')
    updateMeta("meta[name='twitter:site']", 'content', settings.twitterHandle)
    updateMeta("meta[name='twitter:creator']", 'content', settings.twitterHandle)
    updateMeta("meta[name='twitter:title']", 'content', settings.ogTitle || settings.siteTitle)
    updateMeta("meta[name='twitter:description']", 'content', settings.ogDescription || settings.siteDescription)
    updateMeta("meta[name='twitter:image']", 'content', settings.twitterImage || settings.ogImage)

    // Google Site Verification
    if (settings.googleSiteVerification) {
      updateMeta("meta[name='google-site-verification']", 'content', settings.googleSiteVerification)
    }

    // Google Analytics
    if (settings.googleAnalyticsId && !document.querySelector(`script[src*="${settings.googleAnalyticsId}"]`)) {
      // Add GA4 script
      const gaScript = document.createElement('script')
      gaScript.async = true
      gaScript.src = `https://www.googletagmanager.com/gtag/js?id=${settings.googleAnalyticsId}`
      document.head.appendChild(gaScript)

      // Add GA4 config
      const gaConfig = document.createElement('script')
      gaConfig.textContent = `
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('config', '${settings.googleAnalyticsId}');
      `
      document.head.appendChild(gaConfig)
    }
  }, [settings])

  useEffect(() => {
    // Disable right-click context menu
    const handleContextMenu = (e) => {
      e.preventDefault()
    }

    // Disable keyboard shortcuts for inspect/dev tools
    const handleKeyDown = (e) => {
      // F12
      if (e.key === 'F12') {
        e.preventDefault()
      }
      // Ctrl+Shift+I (Inspect)
      if (e.ctrlKey && e.shiftKey && e.key === 'I') {
        e.preventDefault()
      }
      // Ctrl+Shift+J (Console)
      if (e.ctrlKey && e.shiftKey && e.key === 'J') {
        e.preventDefault()
      }
      // Ctrl+Shift+C (Element picker)
      if (e.ctrlKey && e.shiftKey && e.key === 'C') {
        e.preventDefault()
      }
      // Ctrl+U (View source)
      if (e.ctrlKey && e.key === 'u') {
        e.preventDefault()
      }
      // Cmd+Option+I (Mac Inspect)
      if (e.metaKey && e.altKey && e.key === 'i') {
        e.preventDefault()
      }
      // Cmd+Option+J (Mac Console)
      if (e.metaKey && e.altKey && e.key === 'j') {
        e.preventDefault()
      }
      // Cmd+Option+C (Mac Element picker)
      if (e.metaKey && e.altKey && e.key === 'c') {
        e.preventDefault()
      }
      // Cmd+Option+U (Mac View source)
      if (e.metaKey && e.altKey && e.key === 'u') {
        e.preventDefault()
      }
    }

    document.addEventListener('contextmenu', handleContextMenu)
    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('contextmenu', handleContextMenu)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [])

  // Helper to check if section is enabled (default true if not set)
  const isEnabled = (key) => sections[key] !== false

  return (
    <div className="min-h-screen">
      <Navbar />
      {isEnabled('hero') && <Hero />}
      {isEnabled('about') && <About />}
      {isEnabled('stats') && <Stats />}
      {isEnabled('skills') && <Skills />}
      {isEnabled('experience') && <Experience />}
      {isEnabled('projects') && <Projects />}
      {isEnabled('education') && <Education />}
      {isEnabled('achievements') && <Achievements />}
      {isEnabled('languages') && <Languages />}
      {isEnabled('contributions') && <Contributions />}
      {isEnabled('testimonials') && <Testimonials />}
      {isEnabled('organizations') && <Organizations />}
      {isEnabled('blogs') && <Blogs />}
      {isEnabled('hobbies') && <Hobbies />}
      {isEnabled('socialMedia') && <SocialMedia />}
      {isEnabled('services') && <Services />}
      {isEnabled('quotes') && <Quotes />}
      {isEnabled('games') && <Games />}
      {isEnabled('music') && <MusicOfTheDay />}
      {isEnabled('weather') && <Weather />}
      {isEnabled('contact') && <Contact />}
      <Footer />
      <ScrollToTop />
      <TipOfTheDay />
    </div>
  )
}

export default App
