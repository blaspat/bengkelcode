import { useState, useEffect } from 'react'
import { Link2, Mail, X, Info } from 'lucide-react'

function AboutModal({ onClose }) {
  useEffect(() => {
    const handleKey = (e) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [onClose])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-stone-400 hover:text-stone-600 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#F97316' }}>
            <Info className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-stone-900">bengkelcode</h2>
            <p className="text-xs text-stone-400">workshop for developers</p>
          </div>
        </div>
        <p className="text-sm text-stone-600 leading-relaxed">
          A collection of browser-based developer tools — JSON/XML linters, cron expression maker, 
          regex generator, encryption utilities, JWT decoder, epoch converter, SQL formatter, 
          Markdown preview, and QR generator. All running locally in your browser, no data sent anywhere.
        </p>
        <p className="text-xs text-stone-400 mt-4">Built with Vite + React + Tailwind CSS</p>
      </div>
    </div>
  )
}

function FooterLink({ icon: Icon, label, href, onClick, children }) {
  const base = "flex items-center gap-1.5 text-xs font-medium text-stone-400 hover:text-stone-600 transition-colors"
  if (href) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={base}>
        <Icon className="w-3.5 h-3.5" />
        <span>{label}</span>
      </a>
    )
  }
  return (
    <button onClick={onClick} className={base}>
      <Icon className="w-3.5 h-3.5" />
      <span>{label}</span>
    </button>
  )
}

export default function Footer() {
  const [showAbout, setShowAbout] = useState(false)
  const [copied, setCopied] = useState(false)

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {}
  }

  return (
    <>
      <footer className="border-t border-stone-200 bg-stone-50 px-6 py-4">
        <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6">
          <FooterLink icon={Info} label="About" onClick={() => setShowAbout(true)} />
          <FooterLink icon={Link2} label={copied ? 'Copied!' : 'Share Link'} onClick={handleShare} />
          <FooterLink icon={Mail} label="Contact" href="mailto:contact@bengkelcode.com" />
        </div>
      </footer>
      {showAbout && <AboutModal onClose={() => setShowAbout(false)} />}
    </>
  )
}