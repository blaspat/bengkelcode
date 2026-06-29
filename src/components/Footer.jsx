import { useState, useEffect } from 'react'
import { Link2, MessageCircle, X, Info, Shield } from 'lucide-react'

function AboutModal({ onClose }) {
  useEffect(() => {
    const handleKey = (e) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [onClose])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative rounded-2xl shadow-2xl max-w-sm w-full p-6" style={{ backgroundColor: 'var(--bg-card)' }}>
        <button
          onClick={onClose}
          className="absolute top-4 right-4 transition-colors"
          style={{ color: 'var(--text-muted)' }}
          onMouseEnter={e => e.currentTarget.style.color = 'var(--text)'}
          onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
        >
          <X className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#F97316' }}>
            <Info className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-semibold" style={{ color: 'var(--text)' }}>bengkelcode</h2>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>workshop for developers</p>
          </div>
        </div>
        <p className="text-sm leading-relaxed" style={{ color: 'var(--text)' }}>
          A collection of browser-based developer tools — JSON/XML linters, cron expression maker, 
          regex generator, encryption utilities, JWT decoder, epoch converter, SQL formatter, 
          Markdown preview, and QR generator. All running locally in your browser, no data sent anywhere.
        </p>
        <p className="text-xs mt-4" style={{ color: 'var(--text-muted)' }}>Built with Vite + React + Tailwind CSS</p>
      </div>
    </div>
  )
}

function FooterLink({ icon: Icon, label, href, onClick }) {
  const base = "flex items-center gap-1.5 text-xs font-medium transition-colors"
  const hoverStyle = { color: 'var(--nav-hover)' }
  const defaultStyle = { color: 'var(--text-muted)' }
  if (href) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={base} style={defaultStyle}
        onMouseEnter={e => e.currentTarget.style.color = hoverStyle.color}
        onMouseLeave={e => e.currentTarget.style.color = defaultStyle.color}
      >
        <Icon className="w-3.5 h-3.5" />
        <span>{label}</span>
      </a>
    )
  }
  return (
    <button onClick={onClick} className={base} style={defaultStyle}
      onMouseEnter={e => e.currentTarget.style.color = hoverStyle.color}
      onMouseLeave={e => e.currentTarget.style.color = defaultStyle.color}
    >
      <Icon className="w-3.5 h-3.5" />
      <span>{label}</span>
    </button>
  )
}

function PrivacyModal({ onClose }) {
  useEffect(() => {
    const handleKey = (e) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [onClose])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative rounded-2xl shadow-2xl max-w-sm w-full p-6" style={{ backgroundColor: 'var(--bg-card)' }}>
        <button
          onClick={onClose}
          className="absolute top-4 right-4 transition-colors"
          style={{ color: 'var(--text-muted)' }}
          onMouseEnter={e => e.currentTarget.style.color = 'var(--text)'}
          onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
        >
          <X className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#F97316' }}>
            <Shield className="w-5 h-5 text-white" />
          </div>
          <h2 className="text-lg font-semibold" style={{ color: 'var(--text)' }}>Privacy Policy</h2>
        </div>
        <p className="text-sm leading-relaxed" style={{ color: 'var(--text)' }}>
          All tools in bengkelcode run entirely in your browser. No data is sent to any server. 
          We do not collect, store, or share any information you enter. Your input stays on your device.
        </p>
      </div>
    </div>
  )
}

export default function Footer() {
  const [showAbout, setShowAbout] = useState(false)
  const [showPrivacy, setShowPrivacy] = useState(false)
  const [copied, setCopied] = useState(false)

  const commitHash = typeof __GIT_COMMIT__ !== 'undefined' ? __GIT_COMMIT__ : null
  const shortHash = commitHash ? commitHash.slice(0, 7) : null

  const handleShare = () => {
    try {
      navigator.clipboard.writeText(window.location.href)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch { /* clipboard API not available */ }
  }

  return (
    <>
      <footer className="border-t px-6 py-4" style={{ borderTop: '1px solid var(--border)', backgroundColor: 'var(--bg-subtle)' }}>
        <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6">
          {shortHash && (
            <span className="text-xs font-mono" style={{ color: 'var(--text-muted)' }}>
              {shortHash}
            </span>
          )}
          <FooterLink icon={Info} label="About" onClick={() => setShowAbout(true)} />
          <FooterLink icon={Link2} label={copied ? 'Copied!' : 'Share Link'} onClick={handleShare} />
          <FooterLink icon={Shield} label="Privacy Policy" onClick={() => setShowPrivacy(true)} />
          <FooterLink icon={MessageCircle} label="Discussions" href="https://github.com/blaspat/bengkelcode/discussions" />
          <FooterLink icon={Link2} label="Contribute" href="https://github.com/blaspat/bengkelcode" />
        </div>
      </footer>
      {showAbout && <AboutModal onClose={() => setShowAbout(false)} />}
      {showPrivacy && <PrivacyModal onClose={() => setShowPrivacy(false)} />}
    </>
  )
}