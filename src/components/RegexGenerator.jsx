import { useState, useCallback, useMemo } from 'react'
import { Copy, Trash2, Check } from 'lucide-react'

const FLAG_INFO = {
  g: { label: 'global', desc: 'Find all matches, not just the first one' },
  i: { label: 'case-insensitive', desc: 'Match letters regardless of upper/lowercase' },
  m: { label: 'multiline', desc: '^ and $ match start/end of each line' },
  s: { label: 'dotall', desc: '. matches newline characters too' },
}

const CHEATSHEET = [
  { pattern: '.', desc: 'Any single character (except newline)' },
  { pattern: '\\w', desc: 'Word character [a-zA-Z0-9_]' },
  { pattern: '\\W', desc: 'Non-word character' },
  { pattern: '\\d', desc: 'Digit [0-9]' },
  { pattern: '\\D', desc: 'Non-digit' },
  { pattern: '\\s', desc: 'Whitespace (space, tab, newline)' },
  { pattern: '\\S', desc: 'Non-whitespace' },
  { pattern: '\\b', desc: 'Word boundary' },
  { pattern: '^', desc: 'Start of string/line' },
  { pattern: '$', desc: 'End of string/line' },
  { pattern: '*', desc: '0 or more of previous' },
  { pattern: '+', desc: '1 or more of previous' },
  { pattern: '?', desc: '0 or 1 of previous (optional)' },
  { pattern: '{n}', desc: 'Exactly n times' },
  { pattern: '{n,m}', desc: 'Between n and m times' },
  { pattern: '[abc]', desc: 'Any character in set: a, b, or c' },
  { pattern: '[^abc]', desc: 'Any character NOT in set' },
  { pattern: '(abc)', desc: 'Capture group' },
  { pattern: 'a|b', desc: 'Alternation: a OR b' },
]

function Tooltip({ text }) {
  const [show, setShow] = useState(false)
  return (
    <span className="relative inline-block cursor-help" onMouseEnter={() => setShow(true)} onMouseLeave={() => setShow(false)}>
      <span className="text-stone-400 border-b border-dashed border-stone-300">?</span>
      {show && (
        <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-1 rounded bg-stone-800 text-white text-xs whitespace-nowrap z-50">
          {text}
          <span className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-stone-800" />
        </span>
      )}
    </span>
  )
}

export default function RegexGenerator({ state, onStateChange }) {
  const { testString, pattern, flags } = state
  const [copied, setCopied] = useState(false)

  // Compute matches directly — derived state, no effect needed
  const [matches, error] = useMemo(() => {
    if (!pattern) return [[], null]
    try {
      const re = new RegExp(pattern, flags)
      if (!testString) return [[], null]
      const found = []
      let m
      while ((m = re.exec(testString)) !== null) {
        found.push({ match: m[0], index: m.index, groups: m.slice(1) })
        if (!re.global) break
      }
      return [found, null]
    } catch (e) {
      return [[], e.message]
    }
  }, [testString, pattern, flags])

  const setField = useCallback((field, val) => {
    onStateChange(s => ({ ...s, [field]: val }))
  }, [onStateChange])

  const copy = useCallback(() => {
    navigator.clipboard.writeText(pattern)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }, [pattern])

  const clear = useCallback(() => {
    onStateChange({ testString: '', pattern: '', flags: 'g', error: null })
  }, [onStateChange])

  // Highlighted HTML
  const highlighted = (() => {
    if (!pattern || !testString || error || matches.length === 0) return null
    const re = new RegExp(pattern, flags)
    return testString.replace(re, m => `〖${m}〗`)
  })()

  return (
    <div className="mt-4 flex flex-col gap-4 min-h-[calc(100svh-200px)]">
      {/* Regex input */}
      <div className="flex gap-2">
        <input
          type="text"
          value={pattern}
          onChange={e => setField('pattern', e.target.value)}
          placeholder="Enter regex pattern, e.g. \b\w+\b"
          className="flex-1 px-4 py-3 rounded-xl border border-stone-200 font-mono text-sm text-stone-800 placeholder-stone-300 focus:outline-none focus:border-orange-400 transition-colors"
          style={{ backgroundColor: '#fafaf9' }}
        />
        <button
          onClick={copy}
          className="w-11 h-11 rounded-xl bg-white text-stone-600 border border-stone-200 flex items-center justify-center hover:bg-stone-50 transition-colors"
        >
          {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
        </button>
        <button
          onClick={clear}
          className="w-11 h-11 rounded-xl bg-white text-stone-600 border border-stone-200 flex items-center justify-center hover:bg-stone-50 transition-colors"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* Flags row with hover info */}
      <div className="flex gap-2 items-center">
        <span className="text-xs text-stone-400 uppercase">Flags:</span>
        {['g', 'i', 'm', 's'].map(f => (
          <label key={f} className="flex items-center gap-1 text-sm text-stone-600 cursor-pointer group">
            <input
              type="checkbox"
              checked={flags.includes(f)}
              onChange={e => {
                setField('flags', e.target.checked
                  ? flags + f
                  : flags.replace(f, ''))
              }}
              className="rounded border-stone-300 text-orange-500 focus:ring-orange-400"
            />
            <span className="font-mono text-orange-500">{f}</span>
            <Tooltip text={`${FLAG_INFO[f].label} — ${FLAG_INFO[f].desc}`} />
          </label>
        ))}
        <span className="ml-2 text-xs text-stone-400">(hover ? for flag info)</span>
      </div>

      {/* Cheatsheet */}
      <details className="rounded-xl border border-stone-200 overflow-hidden" style={{ backgroundColor: '#fafaf9' }}>
        <summary className="px-4 py-2 text-xs text-stone-400 uppercase cursor-pointer hover:bg-stone-50">
          Cheatsheet — click to expand
        </summary>
        <div className="px-4 pb-3 grid grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-1">
          {CHEATSHEET.map(({ pattern, desc }) => (
            <div key={pattern} className="flex gap-2 text-xs">
              <code className="font-mono text-orange-500 bg-orange-50 px-1 rounded">{pattern}</code>
              <span className="text-stone-500">{desc}</span>
            </div>
          ))}
        </div>
      </details>

      {/* Error */}
      {error && (
        <div className="px-4 py-2 rounded-xl text-sm text-red-500" style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca' }}>
          {error}
        </div>
      )}

      <div className="flex-1 flex flex-col lg:flex-row gap-4 min-h-0">
        {/* Test string */}
        <div className="flex-1 flex flex-col min-h-48 lg:min-h-0">
          <p className="text-xs text-stone-400 uppercase mb-2">Test String</p>
          <textarea
            value={testString}
            onChange={e => setField('testString', e.target.value)}
            placeholder="Enter test string..."
            className="flex-1 p-4 rounded-2xl border border-stone-200 font-mono text-sm text-stone-800 placeholder-stone-300 resize-none focus:outline-none focus:border-orange-400 transition-colors"
            style={{ backgroundColor: '#fafaf9' }}
          />
        </div>

        {/* Results */}
        <div className="flex-1 flex flex-col min-h-48 lg:min-h-0">
          <p className="text-xs text-stone-400 uppercase mb-2">
            Matches {matches.length > 0 && `(${matches.length})`}
          </p>
          <div
            className="flex-1 rounded-2xl border border-stone-200 overflow-auto p-4 font-mono text-sm"
            style={{ backgroundColor: '#fafaf9' }}
          >
            {highlighted ? (
              <pre className="whitespace-pre-wrap break-all text-stone-800">{highlighted}</pre>
            ) : (
              <span className="text-stone-300">Matches will be highlighted here</span>
            )}
          </div>

          {/* Match list */}
          {matches.length > 0 && (
            <div className="mt-2 rounded-xl border border-stone-200 divide-y divide-stone-100 overflow-hidden" style={{ backgroundColor: '#fafaf9' }}>
              {matches.map((m, i) => (
                <div key={i} className="px-4 py-2 text-xs font-mono">
                  <span className="text-orange-500 font-semibold">&quot;{m.match}&quot;</span>
                  <span className="text-stone-400 ml-2">index {m.index}</span>
                  {m.groups.length > 0 && (
                    <span className="text-stone-400 ml-2">groups: {m.groups.map(g => `&quot;${g}&quot;`).join(', ')}</span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  )
}
