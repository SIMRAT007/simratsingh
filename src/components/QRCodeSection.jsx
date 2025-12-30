import { useState, useEffect, useRef } from 'react'
import { useSiteSettings } from '../hooks/useSiteSettings'

const QRCodeSection = () => {
  const { settings } = useSiteSettings()
  const [isVisible, setIsVisible] = useState(false)
  const [linkCopied, setLinkCopied] = useState(false)
  const sectionRef = useRef(null)

  // Get portfolio URL from settings or use current URL
  const portfolioUrl = settings.siteUrl || window.location.origin + window.location.pathname
  
  // Generate QR code URL using API
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(portfolioUrl)}`

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
        }
      },
      { threshold: 0.1 }
    )

    if (sectionRef.current) {
      observer.observe(sectionRef.current)
    }

    return () => observer.disconnect()
  }, [])

  const handleCopyLink = () => {
    navigator.clipboard.writeText(portfolioUrl)
    setLinkCopied(true)
    setTimeout(() => setLinkCopied(false), 2000)
  }

  return (
    <section 
      ref={sectionRef}
      className="py-8 md:py-12 lg:py-16 bg-black"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className={`transition-all duration-1000 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}>
          <div className="bg-black border-2 border-white shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] p-6 md:p-8">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
              
              {/* Left Side - Text Content */}
              <div className="flex-1 text-center md:text-left">
                <h3 className="text-2xl md:text-3xl font-bold text-white mb-4">
                  Share My Portfolio
                </h3>
                <p className="text-gray-400 mb-6 text-sm md:text-base">
                  Scan the QR code with your phone to quickly access my portfolio, or copy the link to share it with others.
                </p>
                
                {/* Share Link Section */}
                <div className="space-y-3">
                  <div className="flex flex-col sm:flex-row gap-2">
                    <input
                      type="text"
                      value={portfolioUrl}
                      readOnly
                      className="flex-1 px-4 py-2.5 border-2 border-white bg-black text-white text-sm font-mono focus:outline-none"
                    />
                    <button
                      onClick={handleCopyLink}
                      className="px-6 py-2.5 border-2 border-white bg-white text-black font-bold uppercase tracking-wider text-xs hover:bg-black hover:text-white transition-all duration-200 whitespace-nowrap"
                    >
                      {linkCopied ? '✓ COPIED' : 'COPY LINK'}
                    </button>
                  </div>
                  
                  <p className="text-xs text-gray-500">
                    Click the button above to copy the portfolio link to your clipboard
                  </p>
                </div>
              </div>

              {/* Right Side - QR Code */}
              <div className="flex-shrink-0">
                <div className="bg-white border-2 border-white p-4 shadow-[2px_2px_0px_0px_rgba(255,255,255,1)]">
                  <img
                    src={qrCodeUrl}
                    alt="QR Code - Scan to visit portfolio"
                    className="w-48 h-48 md:w-56 md:h-56"
                  />
                </div>
                <p className="text-center text-xs text-gray-400 mt-3 font-medium">
                  Scan to visit portfolio
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default QRCodeSection

