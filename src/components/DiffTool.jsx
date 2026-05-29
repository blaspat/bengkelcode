import { useState, useCallback, Component } from 'react'
import { GitCompare, ArrowLeftRight, Trash2, Copy, Check } from 'lucide-react'
import TextareaWithGutter from './TextareaWithGutter'

class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, errorMessage: '' }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, errorMessage: error.message || 'Diff computation failed. Try a smaller input.' }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <strong>⚠️ {this.state.errorMessage}</strong>
        </div>
      )
    }
    return this.props.children
  }
}

const MAX_LINES_WARN = 2000

function computeDiff(left, right) {
  if (left == null || right == null) return []

  const leftLines = left.split('\n')
  const rightLines = right.split('\n')

  // Guard against O(n²) memory explosion on large inputs
  if (leftLines.length > MAX_LINES_WARN || rightLines.length > MAX_LINES_WARN) {
    throw new Error(`Input too large (${Math.max(leftLines.length, rightLines.length)} lines). Maximum allowed is ${MAX_LINES_WARN} lines. Please split the input into smaller chunks.`)
  }

  const result = []

  // Hunt-McIlroy LCS-based diff — O(n) space instead of O(n²)
  // Build diagonal map of LCS lengths
  const diagonals = { 0: { i: 0, j: 0 } }
  let i = 0
  let j = 0
  for (let l = 0; l < leftLines.length + rightLines.length; l++) {
    // Extend along current diagonal
    while (i < leftLines.length && j < rightLines.length && leftLines[i] === rightLines[j]) {
      i++; j++
    }
    diagonals[j - i] = { i, j }
    if (i >= leftLines.length && j >= rightLines.length) break
    // Advance
    if (j < rightLines.length && (i >= leftLines.length || (diagonals[j - i + 1] && diagonals[j - i + 1].i <= i + 1))) {
      j++
    } else {
      i++
    }
  }

  // Backtrack to build aligned diff
  i = leftLines.length
  j = rightLines.length
  const aligned = []
  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && leftLines[i - 1] === rightLines[j - 1]) {
      aligned.unshift({ type: 'same', left: leftLines[i - 1], right: rightLines[j - 1], lineLeft: i, lineRight: j })
      i--; j--
    } else if (j > 0 && (i === 0 || (diagonals[j - i - 1] && diagonals[j - i - 1].i >= i))) {
      aligned.unshift({ type: 'added', left: null, right: rightLines[j - 1], lineLeft: null, lineRight: j })
      j--
    } else {
      aligned.unshift({ type: 'removed', left: leftLines[i - 1], right: null, lineLeft: i, lineRight: null })
      i--
    }
  }

  return aligned
}

function formatDiffText(diff) {
  return diff.map(row => {
    if (row.type === 'added') return `+ ${row.right}`
    if (row.type === 'removed') return `- ${row.left}`
    return `  ${row.left}`
  }).join('\n')
}

export default function DiffTool({ state, onStateChange }) {
  const { left, right, result } = state
  const [copied, setCopied] = useState(false)

  const compare = useCallback(() => {
    const diff = computeDiff(left, right)
    onStateChange(s => ({ ...s, result: diff }))
  }, [left, right, onStateChange])

  const swap = useCallback(() => {
    onStateChange(s => ({ ...s, left: s.right, right: s.left, result: null }))
  }, [onStateChange])

  const clear = useCallback(() => {
    onStateChange(s => ({ left: '', right: '', result: null }))
  }, [onStateChange])

  const copyDiff = useCallback(() => {
    if (!result) return
    navigator.clipboard.writeText(formatDiffText(result))
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }, [result])

  return (
    <div className="mt-4 flex flex-col flex-1 gap-3 min-h-0">
      {/* Controls */}
      <div className="flex gap-2 flex-shrink-0">
        <button
          onClick={compare}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm font-medium"
          style={{ backgroundColor: '#F97316' }}
        >
          <GitCompare className="w-4 h-4" />
          Compare
        </button>
        <button
          onClick={swap}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-stone-200 text-stone-600 text-sm font-medium hover:bg-stone-50"
        >
          <ArrowLeftRight className="w-4 h-4" />
          Swap
        </button>
        <button
          onClick={clear}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-stone-200 text-stone-600 text-sm font-medium hover:bg-stone-50 ml-auto"
        >
          <Trash2 className="w-4 h-4" />
          Clear
        </button>
      </div>

      {/* Input panels — fixed height, side by side */}
      <div className="flex gap-3 flex-shrink-0" style={{ height: '320px' }}>
        <div className="flex flex-col gap-1 flex-1 min-h-0">
          <span className="text-xs text-stone-400 uppercase font-medium">Original</span>
          <TextareaWithGutter
            value={left}
            onChange={e => onStateChange(s => ({ ...s, left: e.target.value }))}
            placeholder="Paste original text..."
          />
        </div>
        <div className="flex flex-col gap-1 flex-1 min-h-0">
          <span className="text-xs text-stone-400 uppercase font-medium">Changed</span>
          <TextareaWithGutter
            value={right}
            onChange={e => onStateChange(s => ({ ...s, right: e.target.value }))}
            placeholder="Paste changed text..."
          />
        </div>
      </div>

      {/* Diff output — fills remaining height */}
      {result && (
        <ErrorBoundary>
          <div className="flex flex-col gap-2 flex-1 min-h-0 overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs text-stone-400 uppercase font-medium">Diff Output</span>
            <button
              onClick={copyDiff}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-stone-200 text-stone-500 text-xs font-medium hover:bg-stone-50"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Copied' : 'Copy diff as text'}
            </button>
          </div>
          <div className="rounded-xl border border-stone-200 overflow-auto flex-1">
            <table className="w-full text-sm font-mono">
              <tbody>
                {result.map((row, idx) => (
                  <tr key={idx} className="border-t border-stone-100 last:border-b-0">
                    <td className="px-3 py-1.5 text-right text-stone-400 w-10 select-none" style={{ backgroundColor: '#f5f5f4' }}>
                      {row.lineLeft ?? ''}
                    </td>
                    <td className="px-3 py-1.5 text-right text-stone-400 w-10 select-none" style={{ backgroundColor: '#f5f5f4' }}>
                      {row.lineRight ?? ''}
                    </td>
                    <td
                      className="px-3 py-1.5 w-6"
                      style={
                        row.type === 'added' ? { backgroundColor: '#f0fdf4' } :
                        row.type === 'removed' ? { backgroundColor: '#fef2f2' } :
                        { backgroundColor: '#fafaf9' }
                      }
                    >
                      {row.type === 'added' ? '+' : row.type === 'removed' ? '-' : ' '}
                    </td>
                    <td
                      className="px-3 py-1.5"
                      style={
                        row.type === 'added' ? { backgroundColor: '#dcfce7', color: '#166534' } :
                        row.type === 'removed' ? { backgroundColor: '#fee2e2', color: '#991b1b' } :
                        { backgroundColor: '#fafaf9', color: '#78716c' }
                      }
                    >
                      {row.type === 'added' ? row.right : row.left ?? ''}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        </ErrorBoundary>
      )}
    </div>
  )
}