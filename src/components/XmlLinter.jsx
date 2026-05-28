import { useState, useCallback } from 'react'
import { Play, Copy, Trash2, Check } from 'lucide-react'
import TextareaWithGutter from './TextareaWithGutter'
import XmlTree from './XmlTree'

function formatXml(xmlString) {
  const parser = new DOMParser()
  const doc = parser.parseFromString(xmlString, 'application/xml')
  const serialize = new XMLSerializer()
  return serialize.serializeToString(doc)
}

export default function XmlLinter({ state, onStateChange }) {
  const { input, output, error } = state
  const [copied, setCopied] = useState(false)

  const setInput = useCallback((val) => {
    onStateChange(s => ({ ...s, input: typeof val === 'function' ? val(s.input) : val }))
  }, [onStateChange])

  const lint = useCallback(() => {
    if (!input.trim()) {
      onStateChange(s => ({ ...s, error: 'Please enter some XML first', output: null }))
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
        onStateChange(s => ({ ...s, error: `Invalid XML — line ${line}, column ${col}`, output: null }))
        return
      }
      onStateChange(s => ({ ...s, output: doc, error: null }))
    } catch (e) {
      onStateChange(s => ({ ...s, error: `Invalid XML: ${e.message}`, output: null }))
    }
  }, [input, onStateChange])

  const copy = useCallback(() => {
    if (!output) return
    const serializer = new XMLSerializer()
    navigator.clipboard.writeText(serializer.serializeToString(output))
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }, [output])

  const clear = useCallback(() => {
    onStateChange(s => ({ input: '', output: null, error: null }))
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
        {error && (
          <div className="mb-2 px-4 py-2 rounded-xl text-sm text-red-500" style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca' }}>
            {error}
          </div>
        )}
        <div
          className="flex-1 rounded-2xl border border-stone-200 overflow-auto p-4"
          style={{ backgroundColor: '#fafaf9' }}
        >
          {output ? (
            <XmlTree doc={output} />
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