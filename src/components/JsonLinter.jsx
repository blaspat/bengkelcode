import { useState, useCallback } from 'react'
import { Play, Copy, Trash2, Check } from 'lucide-react'

export default function JsonLinter() {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [error, setError] = useState(null)
  const [copied, setCopied] = useState(false)

  const lint = useCallback(() => {
    if (!input.trim()) {
      setError('Please enter some JSON first')
      setOutput('')
      return
    }
    try {
      const parsed = JSON.parse(input)
      const formatted = JSON.stringify(parsed, null, 2)
      setOutput(formatted)
      setError(null)
    } catch (e) {
      const msg = e.message
      const match = msg.match(/position (\d+)/)
      if (match) {
        const pos = parseInt(match[1])
        const lines = input.substring(0, pos).split('\n')
        const line = lines.length
        const col = lines[lines.length - 1].length + 1
        setError(`Invalid JSON — line ${line}, column ${col}: ${msg}`)
      } else {
        setError(`Invalid JSON: ${msg}`)
      }
      setOutput('')
    }
  }, [input])

  const format = useCallback(() => {
    lint()
  }, [lint])

  const copy = useCallback(() => {
    if (!output) return
    navigator.clipboard.writeText(output)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }, [output])

  const clear = useCallback(() => {
    setInput('')
    setOutput('')
    setError(null)
  }, [])

  return (
    <div className="mt-4 flex flex-col lg:flex-row gap-4 h-[calc(100svh-200px)] lg:h-[calc(100svh-180px)]">
      {/* Input */}
      <div className="flex-1 flex flex-col min-h-48 lg:min-h-0">
        <textarea
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder='Paste your JSON here...&#10;&#10;{"name": "bengkelcode", "version": "1.0"}'
          className="flex-1 w-full p-4 rounded-2xl border border-stone-200 font-mono text-sm text-stone-800 placeholder-stone-300 resize-none focus:outline-none focus:border-orange-400 transition-colors"
          style={{ backgroundColor: '#fafaf9' }}
        />
      </div>

      {/* Output */}
      <div className="flex-1 flex flex-col min-h-48 lg:min-h-0">
        <div
          className="flex-1 w-full p-4 rounded-2xl border overflow-auto font-mono text-sm"
          style={{
            backgroundColor: error ? '#fef2f2' : output ? '#f5f5f4' : '#fafaf9',
            borderColor: error ? '#fecaca' : output ? '#e7e5e4' : '#e7e5e4',
            color: error ? '#ef4444' : output ? '#1c1917' : '#d6d3d1',
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