import { useState, useCallback } from 'react'
import { Play, Copy, Trash2, Check, Lock } from 'lucide-react'
import TextareaWithGutter from './TextareaWithGutter'

const MODES = [
  { id: 'html-encode', label: 'HTML Encode' },
  { id: 'html-decode', label: 'HTML Decode' },
  { id: 'url-encode', label: 'URL Encode' },
  { id: 'url-decode', label: 'URL Decode' },
]

function htmlEncode(text) {
  return text.replace(/[&<>"']/g, c => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  }[c]))
}

function htmlDecode(text) {
  return text.replace(/&(amp|lt|gt|quot|#39);/g, m => ({
    '&amp;': '&',
    '&lt;': '<',
    '&gt;': '>',
    '&quot;': '"',
    '&#39;': "'",
  }[m]))
}

function urlEncode(text) {
  return encodeURIComponent(text)
}

function urlDecode(text) {
  return decodeURIComponent(text)
}

export default function HtmlUrlEncoder({ state, onStateChange, onClear }) {
  const { mode, input, output, error } = state
  const [copied, setCopied] = useState(false)
  const selectedMode = MODES.find(m => m.id === mode) || MODES[0]

  const transform = useCallback(() => {
    if (!input.trim()) return
    try {
      let result
      switch (selectedMode.id) {
        case 'html-encode': result = htmlEncode(input); break
        case 'html-decode': result = htmlDecode(input); break
        case 'url-encode': result = urlEncode(input); break
        case 'url-decode': result = urlDecode(input); break
        default: result = input
      }
      onStateChange(s => ({ ...s, output: result, error: null }))
    } catch (e) {
      onStateChange(s => ({ ...s, output: '', error: e.message }))
    }
  }, [input, selectedMode, onStateChange])

  const copy = useCallback(() => {
    if (!output) return
    navigator.clipboard.writeText(output)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }, [output])

  const clear = useCallback(() => {
    onStateChange(s => ({ ...s, input: '', output: null, error: null }))
  }, [onStateChange])

  const handleModeChange = (id) => {
    onStateChange(s => ({ ...s, mode: id, output: '', error: null }))
  }

  return (
    <div className="mt-4 flex flex-col lg:flex-row gap-4 h-[calc(100svh-200px)] lg:h-[calc(100svh-180px)]">
      {/* Left panel */}
      <div className="flex-1 flex flex-col min-h-48 lg:min-h-0">
        {/* Mode selector */}
        <div className="flex items-center gap-2 mb-2 flex-wrap">
          {MODES.map(({ id, label }) => (
            <button
              key={id}
              onClick={() => handleModeChange(id)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
              style={
                mode === id
                  ? { backgroundColor: '#F97316', color: '#fff' }
                  : { backgroundColor: 'var(--fab-bg)', color: 'var(--fab-text)', border: '1px solid var(--border)' }
              }
            >
              {label}
            </button>
          ))}
        </div>

        <TextareaWithGutter
          value={input}
          onChange={e => onStateChange(s => ({ ...s, input: e.target.value }))}
          placeholder="Enter text to encode/decode..."
        />
      </div>

      {/* Output */}
      <div className="flex-1 flex flex-col min-h-48 lg:min-h-0">
        {error && (
          <div className="mb-2 px-4 py-2 rounded-xl text-sm" style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca', color: '#991b1b' }}>
            {error}
          </div>
        )}
        <div
          className="flex-1 rounded-2xl border overflow-auto p-4"
          style={{ backgroundColor: 'var(--bg-subtle)', borderColor: 'var(--border)' }}
        >
          {output ? (
            <pre className="font-mono text-sm whitespace-pre-wrap break-all" style={{ color: 'var(--text)' }}>
              {output}
            </pre>
          ) : (
            <span className="text-sm" style={{ color: 'var(--text-muted)' }}>Output will appear here...</span>
          )}
        </div>
      </div>

      {/* FABs */}
      <div className="fixed bottom-6 right-6 flex flex-col gap-2">
        {[
          { icon: Play, label: 'Transform', onClick: transform, primary: true },
          { icon: Copy, label: 'Copy', onClick: copy, show: output },
          { icon: Trash2, label: 'Clear', onClick: clear },
        ].map(({ icon: Icon, label, onClick, primary, show }) =>
          show !== false && (
            <button
              key={label}
              onClick={onClick}
              title={label}
              className={`w-12 h-12 rounded-full flex items-center justify-center shadow-lg transition-all hover:scale-105 ${
                primary
                  ? 'text-white'
                  : 'bg-white text-stone-600 border border-stone-200'
              }`}
              style={primary ? { backgroundColor: '#F97316' } : {}}
            >
              {label === 'Copy' && copied ? (
                <Check className="w-5 h-5" />
              ) : (
                <Icon className="w-5 h-5" />
              )}
            </button>
          )
        )}
      </div>
    </div>
  )
}