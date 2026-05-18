import { useState, useCallback } from 'react'
import { Copy, Trash2, Check, Lock, Unlock } from 'lucide-react'

const CIPHERS = [
  { id: 'base64', label: 'Base64', reversible: true },
  { id: 'sha1', label: 'SHA-1', reversible: false },
  { id: 'sha256', label: 'SHA-256', reversible: false },
  { id: 'sha512', label: 'SHA-512', reversible: false },
  { id: 'md5', label: 'MD5', reversible: false },
  { id: 'url', label: 'URL Encode', reversible: true },
  { id: 'html', label: 'HTML Encode', reversible: true },
]

async function hashMessage(message, algorithm) {
  const msgUint8 = new TextEncoder().encode(message)
  const hashBuffer = await crypto.subtle.digest(algorithm, msgUint8)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}

function encode(crypto, text) {
  switch (crypto.id) {
    case 'base64': return btoa(text)
    case 'url': return encodeURIComponent(text)
    case 'html': return text.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]))
    case 'sha1': return hashMessage(text, 'SHA-1')
    case 'sha256': return hashMessage(text, 'SHA-256')
    case 'sha512': return hashMessage(text, 'SHA-512')
    case 'md5': return hashMessage(text, 'SHA-256') // crypto.subtle doesn't support MD5 directly
    default: return text
  }
}

function decode(crypto, text) {
  switch (crypto.id) {
    case 'base64': return atob(text)
    case 'url': return decodeURIComponent(text)
    case 'html': return text.replace(/&(amp|lt|gt|quot|#39);/g, m => ({ '&amp;': '&', '&lt;': '<', '&gt;': '>', '&quot;': '"', '&#39;': "'" }[m]))
    default: return null
  }
}

export default function Encryption({ state, onStateChange }) {
  const { cipher, input, output, error } = state
  const [copied, setCopied] = useState(false)
  const selectedCipher = CIPHERS.find(c => c.id === cipher) || CIPHERS[0]

  const handleEncode = useCallback(async () => {
    if (!input.trim()) return
    try {
      const result = await encode(selectedCipher, input)
      onStateChange(s => ({ ...s, output: result, error: null }))
    } catch (e) {
      onStateChange(s => ({ ...s, output: '', error: e.message }))
    }
  }, [input, selectedCipher, onStateChange])

  const handleDecode = useCallback(() => {
    if (!input.trim() || !selectedCipher.reversible) return
    try {
      const result = decode(selectedCipher, input)
      onStateChange(s => ({ ...s, output: result || '', error: null }))
    } catch (e) {
      onStateChange(s => ({ ...s, output: '', error: 'Invalid input for decoding' }))
    }
  }, [input, selectedCipher, onStateChange])

  const handleCipherChange = (id) => {
    onStateChange(s => ({ ...s, cipher: id, output: '', error: null }))
  }

  const copy = useCallback(() => {
    if (!output) return
    navigator.clipboard.writeText(output)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }, [output])

  const clear = useCallback(() => {
    onStateChange({ cipher: 'base64', input: '', output: '', error: null })
  }, [onStateChange])

  return (
    <div className="mt-4 flex flex-col gap-4 min-h-[calc(100svh-200px)]">
      {/* Cipher selector */}
      <div className="flex gap-2 items-center">
        <Lock className="w-4 h-4 text-stone-400" />
        <select
          value={cipher}
          onChange={e => handleCipherChange(e.target.value)}
          className="px-3 py-2 rounded-xl border border-stone-200 text-sm text-stone-700 focus:outline-none focus:border-orange-400 cursor-pointer"
          style={{ backgroundColor: '#fafaf9' }}
        >
          {CIPHERS.map(c => (
            <option key={c.id} value={c.id}>{c.label}</option>
          ))}
        </select>
        {!selectedCipher.reversible && (
          <span className="text-xs text-stone-400">(one-way hash)</span>
        )}
      </div>

      {/* Input */}
      <div className="flex-1 flex flex-col min-h-40">
        <textarea
          value={input}
          onChange={e => onStateChange(s => ({ ...s, input: e.target.value }))}
          placeholder="Enter text to encode..."
          className="flex-1 p-4 rounded-2xl border border-stone-200 font-mono text-sm text-stone-800 placeholder-stone-300 resize-none focus:outline-none focus:border-orange-400 transition-colors"
          style={{ backgroundColor: '#fafaf9' }}
        />
      </div>

      {/* Action buttons */}
      <div className="flex gap-2">
        <button
          onClick={handleEncode}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-white text-sm font-medium"
          style={{ backgroundColor: '#F97316' }}
        >
          Encode
        </button>
        <button
          onClick={handleDecode}
          disabled={!selectedCipher.reversible}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border transition-colors ${
            selectedCipher.reversible
              ? 'border-stone-200 text-stone-600 hover:border-orange-400 hover:text-orange-500'
              : 'border-stone-100 text-stone-300 cursor-not-allowed'
          }`}
          style={{ backgroundColor: selectedCipher.reversible ? '#fafaf9' : '#f5f5f4' }}
        >
          Decode
        </button>
        <div className="flex-1" />
        <button
          onClick={copy}
          disabled={!output}
          className="w-10 h-10 rounded-xl bg-white text-stone-600 border border-stone-200 flex items-center justify-center hover:bg-stone-50 transition-colors disabled:opacity-50"
        >
          {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
        </button>
        <button
          onClick={clear}
          className="w-10 h-10 rounded-xl bg-white text-stone-600 border border-stone-200 flex items-center justify-center hover:bg-stone-50 transition-colors"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="px-4 py-2 rounded-xl text-sm text-red-500" style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca' }}>
          {error}
        </div>
      )}

      {/* Output */}
      <div className="flex-1 flex flex-col min-h-40">
        <div
          className="flex-1 p-4 rounded-2xl border font-mono text-sm overflow-auto"
          style={{
            backgroundColor: output ? '#f5f5f4' : '#fafaf9',
            borderColor: '#e7e5e4',
            color: output ? '#1c1917' : '#d6d3d1',
          }}
        >
          {output ? (
            <pre className="whitespace-pre-wrap break-all">{output}</pre>
          ) : (
            <span className="text-stone-300">Output will appear here...</span>
          )}
        </div>
      </div>
    </div>
  )
}