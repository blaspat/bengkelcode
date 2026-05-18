import { useState, useCallback } from 'react'
import { Play, Copy, Trash2, Check } from 'lucide-react'
import TextareaWithGutter from './TextareaWithGutter'

export default function JsonLinter({ state, onStateChange, onClear }) {
  const { input, output, error } = state
  const [copied, setCopied] = useState(false)

  const setInput = useCallback((val) => {
    onStateChange(s => ({ ...s, input: typeof val === 'function' ? val(s.input) : val }))
  }, [onStateChange])

  const lint = useCallback(() => {
    if (!input.trim()) {
      onStateChange(s => ({ ...s, error: 'Please enter some JSON first', output: '' }))
      return
    }
    try {
      const parsed = JSON.parse(input)
      const formatted = JSON.stringify(parsed, null, 2)
      onStateChange(s => ({ ...s, output: formatted, error: null }))
    } catch (e) {
      const msg = e.message
      const match = msg.match(/position (\d+)/)
      if (match) {
        const pos = parseInt(match[1])
        const lines = input.substring(0, pos).split('\n')
        const line = lines.length
        const col = lines[lines.length - 1].length + 1
        onStateChange(s => ({ ...s, error: `Invalid JSON — line ${line}, column ${col}: ${msg}`, output: '' }))
      } else {
        onStateChange(s => ({ ...s, error: `Invalid JSON: ${msg}`, output: '' }))
      }
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
          placeholder={'Paste your JSON here...\n\n{"name": "bengkelcode", "version": "1.0"}'}
        />
      </div>

      {/* Output */}
      <div className="flex-1 flex flex-col min-h-48 lg:min-h-0">
        {error && (
          <div className="mb-2 px-4 py-2 rounded-xl text-sm text-red-500" style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca' }}>
            {error}
          </div>
        )}
        <TextareaWithGutter
          value={error ? '' : output}
          readOnly
          placeholder={error ? '' : 'Formatted output will appear here...'}
          className="cursor-default"
        />
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