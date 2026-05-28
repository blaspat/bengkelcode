import { useState, useCallback } from 'react'
import { Copy, Trash2, Check, Lock, Unlock } from 'lucide-react'
import AdPlaceholder from './AdPlaceholder'

const CIPHERS = [
  { id: 'base64', label: 'Base64', reversible: true },
  { id: 'sha1', label: 'SHA-1', reversible: false },
  { id: 'sha256', label: 'SHA-256', reversible: false },
  { id: 'sha512', label: 'SHA-512', reversible: false },
  { id: 'md5', label: 'MD5', reversible: false },
  { id: 'url', label: 'URL Encode', reversible: true },
  { id: 'html', label: 'HTML Encode', reversible: true },
]

async function md5(message) {
  const msgUint8 = new TextEncoder().encode(message)
  // Use RSA's md5 simulation via forge or just do it manually
  // crypto.subtle doesn't support MD5, so we use a pure-JS implementation
  function md5cycle(x, k) {
    let a = x[0], b = x[1], c = x[2], d = x[3]
    a = ff(a, b, c, d, k[0], 7, -680876936)
    d = ff(d, a, b, c, k[1], 12, -389564586)
    c = ff(c, d, a, b, k[2], 17, 606105819)
    b = ff(b, c, d, a, k[3], 22, -1044525330)
    a = ff(a, b, c, d, k[4], 7, -176418897)
    d = ff(d, a, b, c, k[5], 12, 1200080426)
    c = ff(c, d, a, b, k[6], 17, -1473231341)
    b = ff(b, c, d, a, k[7], 22, -45705983)
    a = ff(a, b, c, d, k[8], 7, 1770035416)
    d = ff(d, a, b, c, k[9], 12, -1958414417)
    c = ff(c, d, a, b, k[10], 17, -42063)
    b = ff(b, c, d, a, k[11], 22, -1990404162)
    a = ff(a, b, c, d, k[12], 7, 1804603682)
    d = ff(d, a, b, c, k[13], 12, -40341101)
    c = ff(c, d, a, b, k[14], 17, -1502002290)
    b = ff(b, c, d, a, k[15], 22, 1236535329)
    a = gg(a, b, c, d, k[1], 5, -165796510)
    d = gg(d, a, b, c, k[6], 9, -1069501632)
    c = gg(c, d, a, b, k[11], 14, 643717713)
    b = gg(b, c, d, a, k[0], 20, -373897302)
    a = gg(a, b, c, d, k[5], 5, -701558691)
    d = gg(d, a, b, c, k[10], 9, 38016083)
    c = gg(c, d, a, b, k[15], 14, -660478335)
    b = gg(b, c, d, a, k[4], 20, -405537848)
    a = gg(a, b, c, d, k[9], 5, 568446438)
    d = gg(d, a, b, c, k[14], 9, -1019803690)
    c = gg(c, d, a, b, k[3], 14, -187363961)
    b = gg(b, c, d, a, k[8], 20, 1163531501)
    a = gg(a, b, c, d, k[13], 5, -1444681467)
    d = gg(d, a, b, c, k[2], 9, -51403784)
    c = gg(c, d, a, b, k[7], 14, 1735328473)
    b = gg(b, c, d, a, k[12], 20, -1926607734)
    a = hh(a, b, c, d, k[5], 4, -378558)
    d = hh(d, a, b, c, k[8], 11, -2022574463)
    c = hh(c, d, a, b, k[11], 16, 1839030562)
    b = hh(b, c, d, a, k[14], 23, -35309556)
    a = hh(a, b, c, d, k[1], 4, -1530992060)
    d = hh(d, a, b, c, k[4], 11, 1272893353)
    c = hh(c, d, a, b, k[7], 16, -155497632)
    b = hh(b, c, d, a, k[10], 23, -1094730640)
    a = hh(a, b, c, d, k[13], 4, 681279174)
    d = hh(d, a, b, c, k[0], 11, -358537222)
    c = hh(c, d, a, b, k[3], 16, -722521979)
    b = hh(b, c, d, a, k[6], 23, 76029189)
    a = hh(a, b, c, d, k[9], 4, -640364487)
    d = hh(d, a, b, c, k[12], 11, -421815835)
    c = hh(c, d, a, b, k[15], 16, 530742520)
    b = hh(b, c, d, a, k[2], 23, -995338651)
    a = ii(a, b, c, d, k[0], 6, -198630844)
    d = ii(d, a, b, c, k[7], 10, 1126891415)
    c = ii(c, d, a, b, k[14], 15, -1416354905)
    b = ii(b, c, d, a, k[5], 21, -57434055)
    a = ii(a, b, c, d, k[12], 6, 1700485571)
    d = ii(d, a, b, c, k[3], 10, -1894986606)
    c = ii(c, d, a, b, k[10], 15, -1051523)
    b = ii(b, c, d, a, k[1], 21, -2054922799)
    a = ii(a, b, c, d, k[8], 6, 1873313359)
    d = ii(d, a, b, c, k[15], 10, -30611744)
    c = ii(c, d, a, b, k[6], 15, -1560198380)
    b = ii(b, c, d, a, k[13], 21, 1309151649)
    a = ii(a, b, c, d, k[4], 6, -145523070)
    d = ii(d, a, b, c, k[11], 10, -1120210379)
    c = ii(c, d, a, b, k[2], 15, 718787259)
    b = ii(b, c, d, a, k[9], 21, -343485551)
    x[0] = add32(a, x[0])
    x[1] = add32(b, x[1])
    x[2] = add32(c, x[2])
    x[3] = add32(d, x[3])
  }
  function cmn(q, a, b, x, s, t) {
    a = add32(add32(a, q), add32(x, t))
    return add32((a << s) | (a >>> (32 - s)), b)
  }
  function ff(a, b, c, d, x, s, t) { return cmn((b & c) | ((~b) & d), a, b, x, s, t) }
  function gg(a, b, c, d, x, s, t) { return cmn((b & d) | (c & (~d)), a, b, x, s, t) }
  function hh(a, b, c, d, x, s, t) { return cmn(b ^ c ^ d, a, b, x, s, t) }
  function ii(a, b, c, d, x, s, t) { return cmn(c ^ (b | (~d)), a, b, x, s, t) }
  function md51(s) {
    const n = s.length
    const state = [1732584193, -271733879, -1732584194, 271733878]
    let i
    for (i = 64; i <= n; i += 64) {
      md5cycle(state, md5blk(s.substring(i - 64, i)))
    }
    s = s.substring(i - 64)
    const tail = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]
    for (i = 0; i < s.length; i++) tail[i >> 2] |= s.charCodeAt(i) << ((i % 4) << 3)
    tail[i >> 2] |= 0x80 << ((i % 4) << 3)
    if (i > 55) { md5cycle(state, tail); for (i = 0; i < 16; i++) tail[i] = 0 }
    tail[14] = n * 8
    md5cycle(state, tail)
    return state
  }
  function md5blk(s) {
    const md5blks = []
    for (let i = 0; i < 64; i += 4) {
      md5blks[i >> 2] = s.charCodeAt(i) + (s.charCodeAt(i + 1) << 8) + (s.charCodeAt(i + 2) << 16) + (s.charCodeAt(i + 3) << 24)
    }
    return md5blks
  }
  const hex_chr = '0123456789abcdef'.split('')
  function rhex(n) {
    let s = ''
    for (let j = 0; j < 4; j++) s += hex_chr[(n >> (j * 8 + 4)) & 0x0F] + hex_chr[(n >> (j * 8)) & 0x0F]
    return s
  }
  function hex(x) { for (let i = 0; i < x.length; i++) x[i] = rhex(x[i]); return x.join('') }
  function add32(a, b) { return (a + b) & 0xFFFFFFFF }
  return hex(md51(msgUint8))
}

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
    case 'md5': return md5(text)
    default: return text
  }
}

function decode(crypto, text) {
  switch (crypto.id) {
    case 'base64': return atob(text)
    case 'url': return decodeURIComponent(text)
    case 'html': return text.replace(/&(amp|lt|gt|quot|#39);/g, (_, m) => ({ 'amp': '&', 'lt': '<', 'gt': '>', 'quot': '"', '#39': "'" }[m]))
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

      {/* Ad placeholder */}
      <div className="mt-4">
        <AdPlaceholder />
      </div>
    </div>
  )
}