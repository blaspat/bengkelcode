import { useState, useCallback } from 'react'
import { Play, Copy, Trash2, Check, Braces, ArrowLeftRight, Minus, GitCompare, ChevronsUpDown, ChevronsDownUp } from 'lucide-react'
import TextareaWithGutter from './TextareaWithGutter'
import AdPlaceholder from './AdPlaceholder'
import CollapsibleTree from './CollapsibleTree'

function jsonDiff(leftObj, rightObj) {
  const result = []
  const allKeys = new Set([...Object.keys(leftObj ?? {}), ...Object.keys(rightObj ?? {})])

  for (const key of allKeys) {
    const inLeft = key in (leftObj ?? {})
    const inRight = key in (rightObj ?? {})

    if (!inLeft && inRight) {
      result.push({ type: 'added', key, value: rightObj[key] })
    } else if (inLeft && !inRight) {
      result.push({ type: 'removed', key, value: leftObj[key] })
    } else {
      const lv = leftObj[key]
      const rv = rightObj[key]
      if (JSON.stringify(lv) !== JSON.stringify(rv)) {
        result.push({ type: 'changed', key, from: lv, to: rv })
      }
    }
  }
  return result
}

export default function JsonLinter({ state, onStateChange, onClear }) {
  const { input, output, error } = state
  const [copied, setCopied] = useState(false)
  const [mode, setMode] = useState('format') // 'format' | 'compact' | 'compare'
  const [compareLeft, setCompareLeft] = useState('')
  const [compareRight, setCompareRight] = useState('')
  const [compareResult, setCompareResult] = useState(null)
  const [treeExpanded, setTreeExpanded] = useState(true)

  const setInput = useCallback((val) => {
    onStateChange(s => ({ ...s, input: typeof val === 'function' ? val(s.input) : val }))
  }, [onStateChange])

  const lint = useCallback(() => {
    if (!input.trim()) {
      onStateChange(s => ({ ...s, error: 'Please enter some JSON first', output: null }))
      return
    }
    try {
      const parsed = JSON.parse(input)
      onStateChange(s => ({ ...s, output: parsed, error: null }))
    } catch (e) {
      const msg = e.message
      const match = msg.match(/position (\d+)/)
      if (match) {
        const pos = parseInt(match[1])
        const lines = input.substring(0, pos).split('\n')
        const line = lines.length
        const col = lines[lines.length - 1].length + 1
        onStateChange(s => ({ ...s, error: `Invalid JSON — line ${line}, column ${col}: ${msg}`, output: null }))
      } else {
        onStateChange(s => ({ ...s, error: `Invalid JSON: ${msg}`, output: null }))
      }
    }
  }, [input, onStateChange])

  const copyFormatted = useCallback(() => {
    if (!output) return
    navigator.clipboard.writeText(JSON.stringify(output, null, 2))
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }, [output])

  const clear = useCallback(() => {
    onStateChange(s => ({ input: '', output: null, error: null }))
  }, [onStateChange])

  const handleCompact = useCallback(() => {
    if (!input.trim()) {
      onStateChange(s => ({ ...s, error: 'Please enter some JSON first', output: null }))
      return
    }
    try {
      const parsed = JSON.parse(input)
      const compacted = JSON.stringify(parsed)
      onStateChange(s => ({ ...s, input: compacted, output: null, error: null }))
    } catch (e) {
      onStateChange(s => ({ ...s, error: `Invalid JSON: ${e.message}`, output: null }))
    }
  }, [input, onStateChange])

  const handleCompare = useCallback(() => {
    setCompareResult(null)
    try {
      const leftObj = compareLeft.trim() ? JSON.parse(compareLeft) : {}
      const rightObj = compareRight.trim() ? JSON.parse(compareRight) : {}
      const diff = jsonDiff(leftObj, rightObj)
      setCompareResult(diff)
    } catch (e) {
      setCompareResult([{ type: 'error', key: 'Error', value: e.message }])
    }
  }, [compareLeft, compareRight])

  const swapCompare = useCallback(() => {
    setCompareLeft(s => compareRight)
    setCompareRight(s => compareLeft)
  }, [compareLeft, compareRight])

  const clearCompare = useCallback(() => {
    setCompareLeft('')
    setCompareRight('')
    setCompareResult(null)
  }, [])

  return (
    <div className="mt-4 flex flex-col lg:flex-row gap-4 h-[calc(100svh-200px)] lg:h-[calc(100svh-180px)]">
      {/* Left panel — input */}
      <div className="flex-1 flex flex-col min-h-48 lg:min-h-0">
        {/* Mode selector */}
        <div className="flex items-center gap-2 mb-2 flex-wrap">
          {[
            { id: 'format', label: 'Format', icon: Braces },
            { id: 'compact', label: 'Compact', icon: Minus },
            { id: 'compare', label: 'Compare', icon: GitCompare },
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setMode(id)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
              style={
                mode === id
                  ? { backgroundColor: '#F97316', color: '#fff' }
                  : { backgroundColor: 'var(--fab-bg)', color: 'var(--fab-text)', border: '1px solid var(--border)' }
              }
            >
              <Icon className="w-3.5 h-3.5" />
              {label}
            </button>
          ))}
        </div>

        {/* Compare mode: side-by-side inputs + diff at bottom */}
        {mode === 'compare' ? (
          <div className="flex flex-col gap-3 flex-1">
            <div className="flex flex-col lg:flex-row gap-3 flex-1">
              {/* Left JSON */}
              <div className="flex-1 flex flex-col gap-1 min-h-32">
                <span className="text-xs uppercase font-medium" style={{ color: 'var(--text-muted)' }}>Original JSON</span>
                <TextareaWithGutter
                  value={compareLeft}
                  onChange={e => setCompareLeft(e.target.value)}
                  placeholder={'{\n  "name": "Alice"\n}'}
                />
              </div>
              {/* Right JSON */}
              <div className="flex-1 flex flex-col gap-1 min-h-32">
                <span className="text-xs uppercase font-medium" style={{ color: 'var(--text-muted)' }}>Changed JSON</span>
                <TextareaWithGutter
                  value={compareRight}
                  onChange={e => setCompareRight(e.target.value)}
                  placeholder={'{\n  "name": "Bob"\n}'}
                />
              </div>
            </div>

            {/* Diff result - full width below */}
            <div className="flex flex-col gap-2 flex-1">
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase font-medium" style={{ color: 'var(--text-muted)' }}>Diff Result</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={swapCompare}
                    title="Swap left/right"
                    className="p-2 rounded-lg"
                    style={{ backgroundColor: 'var(--fab-bg)', color: 'var(--fab-text)', border: '1px solid var(--border)' }}
                  >
                    <ArrowLeftRight className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={handleCompare}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-white"
                    style={{ backgroundColor: '#F97316' }}
                  >
                    <Play className="w-3.5 h-3.5" />
                    Compare
                  </button>
                  <button
                    onClick={clearCompare}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium"
                    style={{ backgroundColor: 'var(--fab-bg)', color: 'var(--fab-text)', border: '1px solid var(--border)' }}
                  >
                    Clear
                  </button>
                </div>
              </div>
              <div
                className="flex-1 rounded-2xl border overflow-auto p-4"
                style={{ backgroundColor: 'var(--bg-subtle)', borderColor: 'var(--border)' }}
              >
                {compareResult === null ? (
                  <span className="text-sm" style={{ color: 'var(--text-muted)' }}>Enter two JSON objects and click Compare...</span>
                ) : compareResult.length === 0 ? (
                  <span className="text-sm" style={{ color: 'var(--text-muted)' }}>Objects are identical</span>
                ) : (
                  <div className="flex flex-col gap-1">
                    {compareResult.map((row, idx) => {
                      if (row.type === 'error') {
                        return (
                          <div key={idx} className="text-sm font-mono px-3 py-2 rounded-lg" style={{ backgroundColor: '#fef2f2', color: '#991b1b' }}>
                            {row.value}
                          </div>
                        )
                      }
                      return (
                        <div key={idx} className="font-mono text-sm px-3 py-2 rounded-lg" style={
                          row.type === 'added' ? { backgroundColor: '#dcfce7', color: '#166534' } :
                          row.type === 'removed' ? { backgroundColor: '#fee2e2', color: '#991b1b' } :
                          { backgroundColor: '#fef9c3', color: '#854d0e' }
                        }>
                          <span className="mr-2">{row.type === 'added' ? '+' : row.type === 'removed' ? '-' : '~'}</span>
                          {row.type === 'changed' ? (
                            <span>"{row.key}": {JSON.stringify(row.from)} → {JSON.stringify(row.to)}</span>
                          ) : (
                            <span>"{row.key}": {JSON.stringify(row.value)}</span>
                          )}
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <TextareaWithGutter
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder={'Paste your JSON here...\n\n{"name": "bengkelcode", "version": "1.0"}'}
          />
        )}
      </div>

      {/* Right panel — tree view */}
      {mode !== 'compare' && (
        <div className="flex-1 flex flex-col min-h-48 lg:min-h-0">
          {error && (
            <div className="mb-2 px-4 py-2 rounded-xl text-sm" style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca', color: '#991b1b' }}>
              {error}
            </div>
          )}

          {/* Tree toolbar */}
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <button
              onClick={() => setTreeExpanded(true)}
              title="Expand all"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium"
              style={{ backgroundColor: 'var(--fab-bg)', color: 'var(--fab-text)', border: '1px solid var(--border)' }}
            >
              <ChevronsUpDown className="w-3.5 h-3.5" />
              Expand all
            </button>
            <button
              onClick={() => setTreeExpanded(false)}
              title="Collapse all"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium"
              style={{ backgroundColor: 'var(--fab-bg)', color: 'var(--fab-text)', border: '1px solid var(--border)' }}
            >
              <ChevronsDownUp className="w-3.5 h-3.5" />
              Collapse all
            </button>
            <button
              onClick={copyFormatted}
              disabled={!output}
              title="Copy formatted JSON"
              className="ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium disabled:opacity-40"
              style={{ backgroundColor: '#F97316', color: '#fff' }}
            >
              <Copy className="w-3.5 h-3.5" />
              {copied ? 'Copied!' : 'Copy formatted'}
            </button>
          </div>

          {/* Tree output */}
          <div
            className="flex-1 rounded-2xl border overflow-auto p-4"
            style={{ backgroundColor: 'var(--bg-subtle)', borderColor: 'var(--border)' }}
          >
            {output ? (
              <CollapsibleTree data={output} expanded={treeExpanded} />
            ) : (
              <span className="text-sm" style={{ color: 'var(--text-muted)' }}>
                Parsed JSON tree will appear here...
              </span>
            )}
          </div>
        </div>
      )}

      {/* Ad placeholder */}
      <AdPlaceholder />

      {/* FABs */}
      <div className="fixed bottom-6 right-6 flex flex-col gap-2">
        {[
          mode === 'compare'
            ? { icon: Play, label: 'Compare', onClick: handleCompare, primary: true }
            : mode === 'compact'
            ? { icon: Minus, label: 'Compact', onClick: handleCompact, primary: true }
            : { icon: Play, label: 'Lint', onClick: lint, primary: true },
          { icon: Trash2, label: 'Clear', onClick: mode === 'compare' ? clearCompare : clear },
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
              <Icon className="w-5 h-5" />
            </button>
          )
        )}
      </div>
    </div>
  )
}