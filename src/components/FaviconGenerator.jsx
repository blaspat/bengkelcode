import { useState, useCallback, useRef, useEffect } from 'react'
import { Copy, Trash2, Check, Upload, Image, Download } from 'lucide-react'

const SIZES = [16, 32, 48]
const DEFAULT_BG = '#F97316'
const DEFAULT_SHAPE = 'rounded'

function renderToCanvas(text, inputType, imageData, size, bgColor, shape) {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas')
    canvas.width = size
    canvas.height = size
    const ctx = canvas.getContext('2d')

    // Background
    if (shape === 'circle') {
      ctx.fillStyle = bgColor
      ctx.beginPath()
      ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2)
      ctx.fill()
    } else if (shape === 'square') {
      ctx.fillStyle = bgColor
      ctx.fillRect(0, 0, size, size)
    } else {
      // rounded
      ctx.fillStyle = bgColor
      const r = size * 0.22
      ctx.beginPath()
      ctx.moveTo(r, 0)
      ctx.lineTo(size - r, 0)
      ctx.quadraticCurveTo(size, 0, size, r)
      ctx.lineTo(size, size - r)
      ctx.quadraticCurveTo(size, size, size - r, size)
      ctx.lineTo(r, size)
      ctx.quadraticCurveTo(0, size, 0, size - r)
      ctx.lineTo(0, r)
      ctx.quadraticCurveTo(0, 0, r, 0)
      ctx.closePath()
      ctx.fill()
    }

    // Content
    if (inputType === 'emoji' && text) {
      ctx.fillStyle = '#ffffff'
      ctx.font = `${Math.floor(size * 0.65)}px serif`
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(text, size / 2, size / 2 + size * 0.03)
    } else if (inputType === 'image' && imageData) {
      const img = new Image()
      img.onload = () => {
        const pad = Math.floor(size * 0.1)
        const imgSize = size - pad * 2
        ctx.drawImage(img, pad, pad, imgSize, imgSize)
        resolve(canvas)
      }
      img.onerror = () => resolve(canvas)
      img.src = imageData
      return
    }
    resolve(canvas)
  })
}

function makeSvgDataUrl(text, inputType, imageData, size, bgColor, shape) {
  if (inputType === 'image' && imageData) {
    const escaped = imageData.replace(/"/g, '%22')
    const pad = Math.floor(size * 0.1)
    const imgSize = size - pad * 2
    let content
    if (shape === 'circle') {
      content = `<circle cx="${size / 2}" cy="${size / 2}" r="${size / 2}" fill="${bgColor}"/><image x="${pad}" y="${pad}" width="${imgSize}" height="${imgSize}" href="${escaped}"/>`
    } else if (shape === 'square') {
      content = `<rect width="${size}" height="${size}" fill="${bgColor}"/><image x="${pad}" y="${pad}" width="${imgSize}" height="${imgSize}" href="${escaped}"/>`
    } else {
      const r = size * 0.22
      content = `<rect width="${size}" height="${size}" rx="${r}" ry="${r}" fill="${bgColor}"/><image x="${pad}" y="${pad}" width="${imgSize}" height="${imgSize}" href="${escaped}"/>`
    }
    return `data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}">${content}</svg>`
  }

  const r = size * 0.22
  let bg
  if (shape === 'circle') {
    bg = `<circle cx="${size / 2}" cy="${size / 2}" r="${size / 2}" fill="${bgColor}"/>`
  } else if (shape === 'square') {
    bg = `<rect width="${size}" height="${size}" fill="${bgColor}"/>`
  } else {
    bg = `<rect width="${size}" height="${size}" rx="${r}" ry="${r}" fill="${bgColor}"/>`
  }

  let content
  if (inputType === 'emoji' && text) {
    // embed emoji as text — approximate
    const emojiEncoded = encodeURIComponent(text)
    content = `<text x="50%" y="54%" dominant-baseline="middle" text-anchor="middle" font-size="${Math.floor(size * 0.65)}" font-family="serif">${emojiEncoded}</text>`
  }

  return `data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}">${bg}${content || ''}</svg>`
}

export default function FaviconGenerator({ state, onStateChange, onClear }) {
  const { inputType, emoji, imageData, bgColor, shape } = state
  const [previewDataUrl, setPreviewDataUrl] = useState('')
  const [svgDataUrl, setSvgDataUrl] = useState('')
  const [pngDataUrls, setPngDataUrls] = useState({})
  const [linkTag, setLinkTag] = useState('')
  const [copied, setCopied] = useState(false)
  const [copiedTag, setCopiedTag] = useState(false)
  const [error, setError] = useState('')
  const canvasRef = useRef({})
  const fileInputRef = useRef(null)

  const generate = useCallback(async () => {
    const size = 32
    setError('')

    // Generate SVG data URL
    const svgUrl = makeSvgDataUrl(emoji, inputType, imageData, size, bgColor, shape)
    setSvgDataUrl(svgUrl)

    // Generate preview (32px canvas)
    const canvas = await renderToCanvas(emoji, inputType, imageData, size, bgColor, shape)
    const dataUrl = canvas.toDataURL('image/png')
    setPreviewDataUrl(dataUrl)

    // Generate PNGs at standard favicon sizes
    const pngs = {}
    for (const s of SIZES) {
      const c = await renderToCanvas(emoji, inputType, imageData, s, bgColor, shape)
      pngs[s] = c.toDataURL('image/png')
    }
    setPngDataUrls(pngs)

    // Make link tag
    const tag = `<link rel="icon" type="image/svg+xml" href="${svgUrl}">`
    setLinkTag(tag)
  }, [emoji, inputType, imageData, bgColor, shape])

  useEffect(() => {
    generate()
  }, [generate])

  const handleEmojiChange = useCallback((val) => {
    onStateChange(s => ({ ...s, emoji: val, inputType: 'emoji', imageData: '' }))
  }, [onStateChange])

  const handleImageUpload = useCallback((e) => {
    const file = e.target.files[0]
    if (!file) return
    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file')
      return
    }
    const reader = new FileReader()
    reader.onload = (ev) => {
      onStateChange(s => ({ ...s, imageData: ev.target.result, inputType: 'image', emoji: '' }))
    }
    reader.onerror = () => setError('Failed to read file')
    reader.readAsDataURL(file)
  }, [onStateChange])

  const handleBgColorChange = useCallback((val) => {
    onStateChange(s => ({ ...s, bgColor: val }))
  }, [onStateChange])

  const handleShapeChange = useCallback((val) => {
    onStateChange(s => ({ ...s, shape: val }))
  }, [onStateChange])

  const copyLinkTag = useCallback(() => {
    navigator.clipboard.writeText(linkTag)
    setCopiedTag(true)
    setTimeout(() => setCopiedTag(false), 1500)
  }, [linkTag])

  const copyPng = useCallback((size) => {
    const dataUrl = pngDataUrls[size]
    if (!dataUrl) return
    fetch(dataUrl)
      .then(r => r.blob())
      .then(blob => {
        navigator.clipboard.write([
          new ClipboardItem({ 'image/png': blob })
        ])
        setCopied(true)
        setTimeout(() => setCopied(false), 1500)
      })
  }, [pngDataUrls])

  const downloadSvg = useCallback(() => {
    const a = document.createElement('a')
    a.href = svgDataUrl
    a.download = 'favicon.svg'
    a.click()
  }, [svgDataUrl])

  const downloadPng = useCallback((size) => {
    const dataUrl = pngDataUrls[size]
    if (!dataUrl) return
    const a = document.createElement('a')
    a.href = dataUrl
    a.download = `favicon-${size}x${size}.png`
    a.click()
  }, [pngDataUrls])

  const clear = useCallback(() => {
    onStateChange({ inputType: 'emoji', emoji: '', imageData: '', bgColor: DEFAULT_BG, shape: DEFAULT_SHAPE })
  }, [onStateChange])

  return (
    <div className="mt-4 flex flex-col lg:flex-row gap-4 min-h-[calc(100svh-200px)]">
      {/* Left: controls */}
      <div className="flex-1 flex flex-col gap-3">
        <div className="flex flex-col gap-2">
          <span className="text-xs uppercase font-medium" style={{ color: 'var(--text-muted)' }}>Input</span>

          {/* Input type tabs */}
          <div className="flex gap-2">
            {['emoji', 'image'].map(type => (
              <button
                key={type}
                onClick={() => onStateChange(s => ({ ...s, inputType: type, emoji: type === 'emoji' ? s.emoji : '', imageData: type === 'image' ? s.imageData : '' }))}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
                style={inputType === type
                  ? { backgroundColor: '#F97316', color: '#fff' }
                  : { backgroundColor: 'var(--fab-bg)', color: 'var(--fab-text)', border: '1px solid var(--border)' }
                }
              >
                {type === 'emoji' ? '🔤 Emoji' : <><Image className="w-3.5 h-3.5" /> Image</>}
              </button>
            ))}
          </div>

          {/* Emoji input */}
          {inputType === 'emoji' && (
            <input
              type="text"
              value={emoji}
              onChange={e => handleEmojiChange(e.target.value)}
              placeholder="Type an emoji… ⭐ 💻 🚀"
              maxLength={10}
              className="w-full px-4 py-3 rounded-xl border-2 border-stone-200 font-mono text-2xl text-stone-800 placeholder-stone-300 focus:outline-none focus:border-orange-400 transition-colors"
              style={{ backgroundColor: '#fafaf9' }}
            />
          )}

          {/* Image upload */}
          {inputType === 'image' && (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="w-full px-4 py-6 rounded-xl border-2 border-dashed border-stone-300 flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-orange-400 transition-colors"
              style={{ backgroundColor: '#fafaf9' }}
            >
              <Upload className="w-6 h-6 text-stone-400" />
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
              {imageData ? (
                <div className="flex flex-col items-center gap-2">
                  <img src={imageData} alt="Uploaded" className="w-12 h-12 object-cover rounded-lg" />
                  <span className="text-xs text-stone-500">Click to change image</span>
                </div>
              ) : (
                <span className="text-sm text-stone-500">Click or drag an image here</span>
              )}
            </div>
          )}
        </div>

        {/* BG color */}
        <div className="flex flex-col gap-2">
          <span className="text-xs uppercase font-medium" style={{ color: 'var(--text-muted)' }}>Background</span>
          <div className="flex gap-2">
            {['#F97316', '#1c1917', '#3b82f6', '#22c55e', '#ef4444', '#a855f7', '#ffffff', '#f59e0b'].map(color => (
              <button
                key={color}
                onClick={() => handleBgColorChange(color)}
                className="w-8 h-8 rounded-lg border-2 transition-transform hover:scale-110"
                style={{
                  backgroundColor: color,
                  borderColor: bgColor === color ? '#F97316' : 'transparent',
                  boxShadow: bgColor === color ? '0 0 0 2px #F97316' : 'none',
                }}
              />
            ))}
            <input
              type="color"
              value={bgColor}
              onChange={e => handleBgColorChange(e.target.value)}
              className="w-8 h-8 rounded-lg border-0 cursor-pointer p-0"
              title="Custom color"
            />
          </div>
        </div>

        {/* Shape */}
        <div className="flex flex-col gap-2">
          <span className="text-xs uppercase font-medium" style={{ color: 'var(--text-muted)' }}>Shape</span>
          <div className="flex gap-2">
            {[
              { id: 'rounded', label: 'Rounded' },
              { id: 'square', label: 'Square' },
              { id: 'circle', label: 'Circle' },
            ].map(({ id, label }) => (
              <button
                key={id}
                onClick={() => handleShapeChange(id)}
                className="px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
                style={shape === id
                  ? { backgroundColor: '#F97316', color: '#fff' }
                  : { backgroundColor: 'var(--fab-bg)', color: 'var(--fab-text)', border: '1px solid var(--border)' }
                }
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="px-4 py-2 rounded-xl text-sm" style={{ backgroundColor: '#fef2f2', color: '#991b1b' }}>
            {error}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={copyLinkTag}
            disabled={!linkTag}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors disabled:opacity-40"
            style={{ backgroundColor: '#F97316', color: 'white' }}
          >
            {copiedTag ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            {copiedTag ? 'Copied!' : 'Copy link tag'}
          </button>
          <button
            onClick={downloadSvg}
            disabled={!svgDataUrl}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors disabled:opacity-40"
            style={{ backgroundColor: svgDataUrl ? 'var(--fab-bg)' : '#f5f5f4', color: svgDataUrl ? 'var(--text)' : '#a8a29e', border: '1px solid var(--border)' }}
          >
            <Download className="w-4 h-4" />
            SVG
          </button>
          <button
            onClick={clear}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium"
            style={{ backgroundColor: 'var(--fab-bg)', color: 'var(--fab-text)', border: '1px solid var(--border)' }}
          >
            <Trash2 className="w-4 h-4" />
            Clear
          </button>
        </div>
      </div>

      {/* Right: preview */}
      <div className="lg:w-72 flex flex-col gap-3">
        <span className="text-xs uppercase font-medium" style={{ color: 'var(--text-muted)' }}>Preview</span>
        <div className="flex-1 rounded-xl border border-stone-200 overflow-hidden flex items-center justify-center p-4" style={{ backgroundColor: '#fafaf9' }}>
          {previewDataUrl ? (
            <img src={previewDataUrl} alt="Favicon preview" className="w-24 h-24 object-contain" />
          ) : (
            <div className="text-sm text-stone-400 text-center">Preview will appear here</div>
          )}
        </div>

        {/* PNG downloads */}
        {Object.keys(pngDataUrls).length > 0 && (
          <div className="flex flex-col gap-2">
            <span className="text-xs uppercase font-medium" style={{ color: 'var(--text-muted)' }}>Download PNG</span>
            <div className="flex gap-2 flex-wrap">
              {SIZES.map(size => (
                <button
                  key={size}
                  onClick={() => downloadPng(size)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium"
                  style={{ backgroundColor: 'var(--fab-bg)', color: 'var(--text)', border: '1px solid var(--border)' }}
                >
                  <Download className="w-3.5 h-3.5" />
                  {size}×{size}
                </button>
              ))}
            </div>
            {/* Hidden canvases for clipboard copy */}
            <div className="hidden">
              {SIZES.map(size => (
                <canvas
                  key={size}
                  ref={el => {
                    if (el && pngDataUrls[size]) {
                      const c = document.createElement('canvas')
                      c.width = size
                      c.height = size
                      const ctx = c.getContext('2d')
                      const img = new Image()
                      img.src = pngDataUrls[size]
                      img.onload = () => ctx.drawImage(img, 0, 0, size, size)
                      // store for copy
                    }
                  }}
                />
              ))}
            </div>
          </div>
        )}

        {/* Link tag display */}
        {linkTag && (
          <div className="flex flex-col gap-1">
            <span className="text-xs uppercase font-medium" style={{ color: 'var(--text-muted)' }}>Link tag</span>
            <code className="text-xs px-3 py-2 rounded-lg font-mono break-all" style={{ backgroundColor: 'var(--bg-subtle)', border: '1px solid var(--border)', color: 'var(--text)' }}>
              {linkTag.length > 60 ? linkTag.substring(0, 60) + '…' : linkTag}
            </code>
          </div>
        )}
      </div>
    </div>
  )
}
