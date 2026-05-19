import { useState, useCallback } from 'react'
import { GitCompare, ArrowLeftRight, Trash2, Copy, Check } from 'lucide-react'
import TextareaWithGutter from './TextareaWithGutter'

function computeDiff(left, right) {
  const leftLines = left.split('\n')
  const rightLines = right.split('\n')
  const result = []
  const maxLen = Math.max(leftLines.length, rightLines.length)

  // Simple LCS-based line diff
  const dp = Array.from({ length: leftLines.length + 1 }, () => new Array(rightLines.length + 1).fill(0))
  for (let i = 1; i <= leftLines.length; i++) {
    for (let j = 1; j <= rightLines.length; j++) {
      if (leftLines[i - 1] === rightLines[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1] + 1
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1])
      }
    }
  }

  // Backtrack to build aligned diff
  let i = leftLines.length
  let j = rightLines.length
  const aligned = []
  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && leftLines[i - 1] === rightLines[j - 1]) {
      aligned.unshift({ type: 'same', left: leftLines[i - 1], right: rightLines[j - 1], lineLeft: i, lineRight: j })
      i--; j--
    } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
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
    onStateChange({ left: '', right: '', result: null })
  }, [onStateChange])

  const copyDiff = useCallback(() => {
    if (!result) return
    navigator.clipboard.writeText(formatDiffText(result))
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }, [result])

  return (
    <div className="mt-4 flex flex-col gap-4">
      {/* Controls */}
      <div className="flex gap-2">
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

      {/* Input panels */}
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1">
          <span className="text-xs text-stone-400 uppercase font-medium">Original</span>
          <TextareaWithGutter
            value={left}
            onChange={e => onStateChange(s => ({ ...s, left: e.target.value }))}
            placeholder="Paste original text..."
            style={{ height: '220px' }}
          />
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-xs text-stone-400 uppercase font-medium">Changed</span>
          <TextareaWithGutter
            value={right}
            onChange={e => onStateChange(s => ({ ...s, right: e.target.value }))}
            placeholder="Paste changed text..."
            style={{ height: '220px' }}
          />
        </div>
      </div>

      {/* Diff output */}
      {result && (
        <div className="flex flex-col gap-2">
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
          <div className="rounded-xl border border-stone-200 overflow-hidden">
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
      )}
    </div>
  )
}