import { useState, useCallback, useEffect, useRef } from 'react'
import { Copy, Trash2, Check } from 'lucide-react'

const SIZES = [
  { label: 'Small', value: 128 },
  { label: 'Medium', value: 256 },
  { label: 'Large', value: 512 },
]

export default function QrGenerator({ state, onStateChange }) {
  const { input, size } = state
  const [canvasDataUrl, setCanvasDataUrl] = useState('')
  const [error, setError] = useState(null)
  const [copied, setCopied] = useState(false)
  const canvasRef = useRef(null)

  // Load QRCode library from CDN once
  useEffect(() => {
    if (window.QRCode) return
    const script = document.createElement('script')
    script.src = 'https://cdn.jsdelivr.net/npm/qrcode/build/qrcode.min.js'
    script.async = true
    document.head.appendChild(script)
  }, [])

  const generate = useCallback(() => {
    if (!input.trim()) {
      setCanvasDataUrl('')
      setError(null)
      return
    }
    try {
      const canvas = document.createElement('canvas')
      QRCode.toCanvas(canvas, input, {
        width: size,
        margin: 2,
        color: {
          dark: '#1c1917',
          light: '#ffffff',
        },
      })
      setCanvasDataUrl(canvas.toDataURL())
      setError(null)
    } catch (e) {
      setError(e.message)
      setCanvasDataUrl('')
    }
  }, [input, size])

  useEffect(() => {
    generate()
  }, [generate])

  const handleInputChange = useCallback((e) => {
    const val = e.target.value
    onStateChange({ input: val, size })
  }, [size, onStateChange])

  const handleSizeChange = useCallback((newSize) => {
    onStateChange({ input, size: newSize })
  }, [input, onStateChange])

  const copyPng = useCallback(() => {
    if (!canvasRef.current) return
    canvasRef.current.toBlob((blob) => {
      if (!blob) return
      navigator.clipboard.write([
        new ClipboardItem({ 'image/png': blob }),
      ])
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    })
  }, [])

  const clear = useCallback(() => {
    onStateChange({ input: '', size: 256 })
  }, [onStateChange])

  return (
    <div className="mt-4 flex flex-col lg:flex-row gap-4 min-h-[calc(100svh-200px)]">
      {/* Left: input */}
      <div className="flex-1 flex flex-col gap-3">
        <textarea
          value={input}
          onChange={handleInputChange}
          placeholder="Enter text or URL..."
          rows={4}
          className="w-full px-4 py-3 rounded-xl border-2 border-stone-200 font-mono text-sm text-stone-800 placeholder-stone-300 focus:outline-none focus:border-orange-400 transition-colors resize-none"
          style={{ backgroundColor: '#fafaf9' }}
        />

        {/* Size selector */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-stone-400 uppercase tracking-wide">Size:</span>
          <div className="flex gap-2">
            {SIZES.map(({ label, value }) => (
              <button
                key={value}
                onClick={() => handleSizeChange(value)}
                className="px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors"
                style={{
                  backgroundColor: size === value ? '#F97316' : 'white',
                  color: size === value ? 'white' : '#78716c',
                  borderColor: size === value ? '#F97316' : '#e7e5e4',
                }}
              >
                {label} ({value}px)
              </button>
            ))}
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="px-4 py-3 rounded-xl text-sm text-red-500" style={{ backgroundColor: '#fef2f2' }}>
            {error}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2">
          <button
            onClick={copyPng}
            disabled={!canvasDataUrl}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors disabled:opacity-40"
            style={{ backgroundColor: canvasDataUrl ? '#F97316' : '#f5f5f4', color: canvasDataUrl ? 'white' : '#a8a29e' }}
          >
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            {copied ? 'Copied!' : 'Copy PNG'}
          </button>
          <button
            onClick={clear}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium bg-white text-stone-600 border border-stone-200 hover:bg-stone-50 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            Clear
          </button>
        </div>
      </div>

      {/* Right: preview */}
      <div className="lg:w-72 flex flex-col gap-2">
        <h3 className="text-sm font-medium text-stone-500 uppercase tracking-wide">Preview</h3>
        <div className="flex-1 rounded-xl border border-stone-200 overflow-hidden flex items-center justify-center p-4" style={{ backgroundColor: '#fafaf9' }}>
          {canvasDataUrl ? (
            <img src={canvasDataUrl} alt="QR Code" className="max-w-full max-h-full" />
          ) : (
            <div className="text-sm text-stone-400 text-center">
              Enter text or URL to generate QR code
            </div>
          )}
        </div>
        <canvas ref={canvasRef} style={{ display: canvasDataUrl ? 'block' : 'none' }} />
      </div>
    </div>
  )
}
