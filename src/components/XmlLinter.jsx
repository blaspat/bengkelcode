import { useState, useCallback } from 'react'
import { Play, Copy, Trash2, Check } from 'lucide-react'
import TextareaWithGutter from './TextareaWithGutter'

function formatXml(xmlString) {
  // Parse and re-serialize to normalize
  const parser = new DOMParser()
  const doc = parser.parseFromString(xmlString, 'application/xml')
  const serialize = new XMLSerializer()
  let xml = serialize.serializeToString(doc)

  const formatted = []
  let indent = 0
  let i = 0

  while (i < xml.length) {
    // Skip any whitespace
    while (i < xml.length && xml[i] === ' ') i++
    if (i >= xml.length) break

    if (xml[i] === '<') {
      let tagEnd = xml.indexOf('>', i)
      if (tagEnd === -1) break
      const tag = xml.slice(i, tagEnd + 1)

      // Self-closing tag — emit and don't change indent
      if (tag.endsWith('/>')) {
        formatted.push('  '.repeat(indent) + tag)
        i = tagEnd + 1
        continue
      }

      // Closing tag — dedent first, then emit
      if (tag.startsWith('</')) {
        indent = Math.max(0, indent - 1)
        formatted.push('  '.repeat(indent) + tag)
        i = tagEnd + 1
        continue
      }

      // Doctype / comment / CDATA
      if (tag.startsWith('<?') || tag.startsWith('<!')) {
        formatted.push('  '.repeat(indent) + tag)
        i = tagEnd + 1
        continue
      }

      // Opening tag — emit, then indent for content
      formatted.push('  '.repeat(indent) + tag)
      indent++
      i = tagEnd + 1
      continue
    }

    // Text content — capture everything up to the next '<' (may be empty on next iteration)
    let textEnd = xml.indexOf('<', i)
    if (textEnd === -1) textEnd = xml.length
    const text = xml.slice(i, textEnd).trim()
    if (text) {
      formatted.push('  '.repeat(indent) + text)
    }
    i = textEnd
  }

  return formatted.join('\n')
}

export default function XmlLinter({ state, onStateChange }) {
  const { input, output, error } = state
  const [copied, setCopied] = useState(false)

  const setInput = useCallback((val) => {
    onStateChange(s => ({ ...s, input: typeof val === 'function' ? val(s.input) : val }))
  }, [onStateChange])

  const lint = useCallback(() => {
    if (!input.trim()) {
      onStateChange(s => ({ ...s, error: 'Please enter some XML first', output: '' }))
      return
    }
    try {
      const parser = new DOMParser()
      const doc = parser.parseFromString(input, 'application/xml')
      const parseError = doc.querySelector('parsererror')
      if (parseError) {
        const errorText = parseError.textContent
        const lineMatch = errorText.match(/line (\d+)/i)
        const colMatch = errorText.match(/column (\d+)/i)
        const line = lineMatch ? lineMatch[1] : '?'
        const col = colMatch ? colMatch[1] : '?'
        onStateChange(s => ({ ...s, error: `Invalid XML — line ${line}, column ${col}`, output: '' }))
        return
      }
      const formatted = formatXml(input)
      onStateChange(s => ({ ...s, output: formatted, error: null }))
    } catch (e) {
      onStateChange(s => ({ ...s, error: `Invalid XML: ${e.message}`, output: '' }))
    }
  }, [input, onStateChange])

  const copy = useCallback(() => {
    if (!output) return
    navigator.clipboard.writeText(output)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }, [output])

  const clear = useCallback(() => {
    onStateChange(s => ({ input: '', output: '', error: null }))
  }, [onStateChange])

  return (
    <div className="mt-4 flex flex-col lg:flex-row gap-4 h-[calc(100svh-200px)] lg:h-[calc(100svh-180px)]">
      {/* Input */}
      <div className="flex-1 flex flex-col min-h-48 lg:min-h-0">
        <TextareaWithGutter
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder={'Paste your XML here...\n\n<config>\n  <app>bengkelcode</app>\n</config>'}
        />
      </div>

      {/* Output */}
      <div className="flex-1 flex flex-col min-h-48 lg:min-h-0">
        <div
          className="flex-1 w-full p-4 rounded-2xl border overflow-auto font-mono text-sm"
          style={{
            backgroundColor: error ? '#fef2f2' : output ? '#f5f5f4' : '#fafaf9',
            borderColor: error ? '#fecaca' : output ? '#e7e5e4' : '#e7e5e4',
          }}
        >
          {error ? (
            <span className="text-red-500">{error}</span>
          ) : output ? (
            <pre className="whitespace-pre-wrap">{output}</pre>
          ) : (
            <span className="text-stone-300">Formatted output will appear here...</span>
          )}
        </div>
      </div>

      {/* FABs */}
      <div className="fixed bottom-6 right-6 flex flex-col gap-2">
        {[
          { icon: Play, label: 'Lint & Format', onClick: lint, primary: true },
          { icon: Copy, label: 'Copy', onClick: copy, show: !!output },
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