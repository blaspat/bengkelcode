import { useState, useCallback } from 'react'
import { Key, AlertTriangle, Check, X } from 'lucide-react'

function base64UrlDecode(str) {
  str = str.replace(/-/g, '+').replace(/_/g, '/')
  while (str.length % 4) str += '='
  return atob(str)
}

function parseJWT(token) {
  const parts = token.split('.')
  if (parts.length !== 3) return null
  try {
    const header = JSON.parse(base64UrlDecode(parts[0]))
    const payload = JSON.parse(base64UrlDecode(parts[1]))
    return { header, payload, signature: parts[2] }
  } catch {
    return null
  }
}

function formatJSON(obj) {
  return JSON.stringify(obj, null, 2)
}

function isExpired(exp) {
  if (!exp) return false
  return Date.now() > exp * 1000
}

export default function JwtDecoder({ state, onStateChange }) {
  const { token, output, error } = state
  const [copied, setCopied] = useState(false)

  const decode = useCallback(() => {
    if (!token.trim()) return
    const parsed = parseJWT(token)
    if (!parsed) {
      onStateChange(s => ({ ...s, output: null, error: 'Invalid JWT format. Expected: header.payload.signature' }))
      return
    }
    onStateChange(s => ({ ...s, output: parsed, error: null }))
  }, [token, onStateChange])

  const copy = useCallback(() => {
    if (!output) return
    const text = formatJSON(output.payload)
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }, [output])

  const clear = useCallback(() => {
    onStateChange({ token: '', output: null, error: null })
  }, [onStateChange])

  const expired = output?.payload?.exp && isExpired(output.payload.exp)

  return (
    <div className="mt-4 flex flex-col gap-4 min-h-[calc(100svh-200px)]">
      {/* Input */}
      <div className="flex-1 flex flex-col min-h-40">
        <textarea
          value={token}
          onChange={e => onStateChange(s => ({ ...s, token: e.target.value }))}
          placeholder="Paste your JWT here..."
          className="flex-1 p-4 rounded-2xl border font-mono text-sm placeholder-stone-300 resize-none focus:outline-none focus:border-orange-400 transition-colors"
          style={{ backgroundColor: 'var(--bg-subtle)', borderColor: 'var(--border)', color: 'var(--text)' }}
        />
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <button
          onClick={decode}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-white text-sm font-medium"
          style={{ backgroundColor: '#F97316' }}
        >
          <Key className="w-4 h-4" />
          Decode
        </button>
        <div className="flex-1" />
        <button
          onClick={copy}
          disabled={!output}
          className="w-10 h-10 rounded-xl flex items-center justify-center transition-colors disabled:opacity-50"
          style={{ backgroundColor: 'var(--fab-bg)', color: 'var(--fab-text)', border: '1px solid var(--border)' }}
        >
          {copied ? <Check className="w-4 h-4" /> : <Key className="w-4 h-4" />}
        </button>
        <button
          onClick={clear}
          className="w-10 h-10 rounded-xl flex items-center justify-center transition-colors"
          style={{ backgroundColor: 'var(--fab-bg)', color: 'var(--fab-text)', border: '1px solid var(--border)' }}
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="px-4 py-2 rounded-xl text-sm text-red-500 flex items-center gap-2" style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca' }}>
          <AlertTriangle className="w-4 h-4" />
          {error}
        </div>
      )}

      {/* Output */}
      {output && (
        <div className="flex-1 flex flex-col gap-4 min-h-0 overflow-auto">
          {/* Expiry warning */}
          {expired && (
            <div className="px-4 py-2 rounded-xl text-sm text-red-600 flex items-center gap-2" style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca' }}>
              <AlertTriangle className="w-4 h-4" />
              Token expired {new Date(output.payload.exp * 1000).toLocaleString()}
            </div>
          )}

          {/* Header */}
          <div className="rounded-xl border overflow-hidden" style={{ borderColor: 'var(--border)' }}>
            <div className="px-4 py-2 text-xs uppercase border-b flex items-center justify-between" style={{ color: 'var(--text-muted)', borderBottom: '1px solid var(--border)', backgroundColor: 'var(--nav-hover-bg)' }}>
              <span>Header</span>
              {output.payload.exp && (
                <span className={`text-xs px-2 py-0.5 rounded-full ${expired ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                  {expired ? 'Expired' : 'Valid'}
                </span>
              )}
            </div>
            <pre className="p-4 font-mono text-sm whitespace-pre-wrap" style={{ color: 'var(--text)' }}>{formatJSON(output.header)}</pre>
          </div>

          {/* Payload */}
          <div className="rounded-xl border overflow-hidden" style={{ borderColor: 'var(--border)' }}>
            <div className="px-4 py-2 text-xs uppercase border-b" style={{ color: 'var(--text-muted)', borderBottom: '1px solid var(--border)', backgroundColor: 'var(--nav-hover-bg)' }}>
              <span>Payload</span>
              {output.payload.exp && (
                <span className={`text-xs px-2 py-0.5 rounded-full ${expired ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                  {expired ? 'Expired' : 'Valid'}
                </span>
              )}
            </div>
            <pre className="p-4 font-mono text-sm whitespace-pre-wrap" style={{ color: 'var(--text)' }}>{formatJSON(output.payload)}</pre>
          </div>
        </div>
      )}

    </div>
  )
}