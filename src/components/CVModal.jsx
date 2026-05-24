import { useState, useEffect, useRef } from 'react'
import html2canvas from 'html2canvas'
import { jsPDF } from 'jspdf'
import CVPreview from './CVPreview'
import { useCVSettings } from '../hooks/useSiteSettings'

const CVModal = ({ isOpen, onClose }) => {
  const [showShareMenu, setShowShareMenu] = useState(false)
  const [linkCopied, setLinkCopied] = useState(false)
  const [activeTab, setActiveTab] = useState('preview')
  const [exporting, setExporting] = useState('')
  const previewRef = useRef(null)
  const exportRef = useRef(null)
  const { settings: cvData } = useCVSettings()

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  const getCanvas = async () => {
    const target = exportRef.current || previewRef.current
    if (!target) return null

    return html2canvas(target, {
      backgroundColor: '#ffffff',
      scale: 2,
      useCORS: true,
      logging: false
    })
  }

  const downloadUrl = (url, filename) => {
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  }

  const handleDownloadPng = async () => {
    setExporting('png')
    try {
      const canvas = await getCanvas()
      if (!canvas) return
      downloadUrl(canvas.toDataURL('image/png'), `${cvData.fileName || 'Simrat_Singh_CV'}.png`)
    } finally {
      setExporting('')
    }
  }

  const handleDownloadPdf = async () => {
    setExporting('pdf')
    try {
      const canvas = await getCanvas()
      if (!canvas) return
      const imageData = canvas.toDataURL('image/png')
      const target = exportRef.current || previewRef.current
      const targetRect = target.getBoundingClientRect()
      const scale = canvas.width / targetRect.width
      const pdf = new jsPDF({
        orientation: canvas.width >= canvas.height ? 'landscape' : 'portrait',
        unit: 'px',
        format: [canvas.width, canvas.height]
      })

      pdf.addImage(imageData, 'PNG', 0, 0, canvas.width, canvas.height)
      target.querySelectorAll('a[href]').forEach((link) => {
        const rect = link.getBoundingClientRect()
        pdf.link(
          (rect.left - targetRect.left) * scale,
          (rect.top - targetRect.top) * scale,
          rect.width * scale,
          rect.height * scale,
          { url: link.href }
        )
      })
      pdf.save(`${cvData.fileName || 'Simrat_Singh_CV'}.pdf`)
    } finally {
      setExporting('')
    }
  }

  const handleCopyLink = () => {
    const cvLink = `${window.location.origin}${window.location.pathname}?cv=open`
    navigator.clipboard.writeText(cvLink)
    setLinkCopied(true)
    setTimeout(() => setLinkCopied(false), 2000)
  }

  const handleShare = (platform) => {
    const cvLink = `${window.location.origin}${window.location.pathname}?cv=open`
    const url = encodeURIComponent(cvLink)
    const text = encodeURIComponent(`Check out ${cvData.name}'s CV - ${cvData.title}`)
    
    const shareUrls = {
      twitter: `https://twitter.com/intent/tweet?text=${text}&url=${url}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${url}`,
      whatsapp: `https://wa.me/?text=${text}%20${url}`,
      email: `mailto:?subject=${encodeURIComponent(`${cvData.name}'s CV`)}&body=${text}%20${url}`
    }

    if (shareUrls[platform]) {
      window.open(shareUrls[platform], '_blank', 'width=600,height=400')
    }
    setShowShareMenu(false)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed left-[-10000px] top-0 w-[1024px] pointer-events-none" aria-hidden="true">
        <CVPreview ref={exportRef} data={cvData} />
      </div>

      <div className="relative bg-white w-full max-w-4xl max-h-[90vh] shadow-2xl flex flex-col animate-scaleIn">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-black text-white">
          <div className="flex items-center gap-3">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h2 className="text-lg font-semibold">Curriculum Vitae</h2>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            {/* Download Button */}
            <button
              onClick={handleDownloadPdf}
              disabled={Boolean(exporting)}
              className="flex items-center gap-2 px-3 py-2 bg-white text-black text-sm font-medium hover:bg-gray-200 transition-all duration-200"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              <span className="hidden sm:inline">{exporting === 'pdf' ? 'Exporting...' : 'PDF'}</span>
            </button>
            <button
              onClick={handleDownloadPng}
              disabled={Boolean(exporting)}
              className="flex items-center gap-2 px-3 py-2 bg-white text-black text-sm font-medium hover:bg-gray-200 transition-all duration-200"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 16l4-4a3 3 0 014 0l5 5m-2-2l1-1a3 3 0 014 0l2 2M5 21h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v14a2 2 0 002 2zM14 8h.01" />
              </svg>
              <span className="hidden sm:inline">{exporting === 'png' ? 'Exporting...' : 'PNG'}</span>
            </button>

            {/* Share Button */}
            <div className="relative">
              <button
                onClick={() => setShowShareMenu(!showShareMenu)}
                className="flex items-center gap-2 px-3 py-2 bg-white text-black text-sm font-medium hover:bg-gray-200 transition-all duration-200"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                </svg>
                <span className="hidden sm:inline">Share</span>
              </button>

              {/* Share Menu */}
              {showShareMenu && (
                <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-gray-200 shadow-xl z-10">
                  <div className="p-2">
                    <button
                      onClick={handleCopyLink}
                      className="w-full flex items-center gap-3 px-3 py-2 text-left text-gray-700 hover:bg-gray-100 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                      </svg>
                      {linkCopied ? 'Link Copied!' : 'Copy Link'}
                    </button>
                    <button
                      onClick={() => handleShare('whatsapp')}
                      className="w-full flex items-center gap-3 px-3 py-2 text-left text-gray-700 hover:bg-gray-100 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                      </svg>
                      WhatsApp
                    </button>
                    <button
                      onClick={() => handleShare('linkedin')}
                      className="w-full flex items-center gap-3 px-3 py-2 text-left text-gray-700 hover:bg-gray-100 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                      </svg>
                      LinkedIn
                    </button>
                    <button
                      onClick={() => handleShare('twitter')}
                      className="w-full flex items-center gap-3 px-3 py-2 text-left text-gray-700 hover:bg-gray-100 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                      </svg>
                      Twitter / X
                    </button>
                    <button
                      onClick={() => handleShare('email')}
                      className="w-full flex items-center gap-3 px-3 py-2 text-left text-gray-700 hover:bg-gray-100 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      Email
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab('preview')}
            className={`flex-1 py-3 text-sm font-medium transition-colors ${
              activeTab === 'preview' 
                ? 'text-black border-b-2 border-black' 
                : 'text-gray-500 hover:text-black'
            }`}
          >
            Preview
          </button>
          <button
            onClick={() => setActiveTab('details')}
            className={`flex-1 py-3 text-sm font-medium transition-colors ${
              activeTab === 'details' 
                ? 'text-black border-b-2 border-black' 
                : 'text-gray-500 hover:text-black'
            }`}
          >
            Details
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {activeTab === 'preview' ? (
            /* CV Preview */
            <div className="p-4 md:p-8 bg-gray-100">
              <CVPreview ref={previewRef} data={cvData} compact />
            </div>
          ) : (
            /* Details Tab */
            <div className="p-6 md:p-8">
              <div className="max-w-2xl mx-auto space-y-6">
                <div className="bg-gray-50 p-6 border border-gray-200">
                  <h3 className="font-semibold text-black mb-4 flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Document Information
                  </h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">File Name</span>
                      <span className="text-black font-medium">{cvData.fileName || 'Simrat_Singh_CV'}.pdf / .png</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Last Updated</span>
                      <span className="text-black font-medium">{new Date().toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Format</span>
                      <span className="text-black font-medium">PDF / TXT</span>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 p-6 border border-gray-200">
                  <h3 className="font-semibold text-black mb-4 flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                    </svg>
                    Share Link
                  </h3>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={`${window.location.origin}${window.location.pathname}?cv=open`}
                      readOnly
                      className="flex-1 px-3 py-2 bg-white border border-gray-300 text-sm text-gray-600"
                    />
                    <button
                      onClick={handleCopyLink}
                      className="px-4 py-2 bg-black text-white text-sm font-medium hover:bg-gray-800 transition-colors"
                    >
                      {linkCopied ? 'Copied!' : 'Copy'}
                    </button>
                  </div>
                </div>

                <div className="bg-gray-50 p-6 border border-gray-200">
                  <h3 className="font-semibold text-black mb-4 flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    Download Options
                  </h3>
                  <div className="space-y-2">
                    <button
                      onClick={handleDownloadPdf}
                      disabled={Boolean(exporting)}
                      className="w-full flex items-center justify-between px-4 py-3 bg-white border border-gray-300 hover:border-black transition-colors"
                    >
                      <span className="flex items-center gap-3">
                        <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <span className="text-sm font-medium">{exporting === 'pdf' ? 'Exporting PDF...' : 'Download as PDF'}</span>
                      </span>
                      <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                    <button
                      onClick={handleDownloadPng}
                      disabled={Boolean(exporting)}
                      className="w-full flex items-center justify-between px-4 py-3 bg-white border border-gray-300 hover:border-black transition-colors"
                    >
                      <span className="flex items-center gap-3">
                        <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 16l4-4a3 3 0 014 0l5 5m-2-2l1-1a3 3 0 014 0l2 2M5 21h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v14a2 2 0 002 2zM14 8h.01" />
                        </svg>
                        <span className="text-sm font-medium">{exporting === 'png' ? 'Exporting PNG...' : 'Download as PNG'}</span>
                      </span>
                      <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Styles */}
      <style>{`
        @keyframes scaleIn {
          from { 
            opacity: 0; 
            transform: scale(0.95); 
          }
          to { 
            opacity: 1; 
            transform: scale(1); 
          }
        }
        .animate-scaleIn {
          animation: scaleIn 0.2s ease-out;
        }
      `}</style>
    </div>
  )
}

export default CVModal
