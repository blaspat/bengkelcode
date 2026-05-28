import { useState, useCallback } from 'react'
import { Database, Copy, Check, Trash2 } from 'lucide-react'

const KEYWORDS = [
  'SELECT', 'FROM', 'WHERE', 'AND', 'OR', 'NOT', 'IN', 'LIKE', 'BETWEEN',
  'JOIN', 'LEFT', 'RIGHT', 'INNER', 'OUTER', 'FULL', 'CROSS', 'ON',
  'GROUP', 'BY', 'HAVING', 'ORDER', 'ASC', 'DESC', 'LIMIT', 'OFFSET',
  'INSERT', 'INTO', 'VALUES', 'UPDATE', 'SET', 'DELETE', 'CREATE',
  'TABLE', 'INDEX', 'DROP', 'ALTER', 'AS', 'DISTINCT', 'UNION', 'ALL',
  'EXISTS', 'CASE', 'WHEN', 'THEN', 'ELSE', 'END', 'NULL', 'IS',
]

function formatSQL(sql) {
  // Simple format with newlines and indentation
  let result = sql.trim()

  // Upper case keywords
  const kw = KEYWORDS.join('|')
  const kwRegex = new RegExp(`\\b(${kw})\\b`, 'gi')

  // Add newlines before major keywords
  result = result
    .replace(/\s+/g, ' ')
    .replace(/,/g, ',\n  ')
    .replace(/\bSELECT\b/gi, '\nSELECT\n  ')
    .replace(/\bFROM\b/gi, '\nFROM\n  ')
    .replace(/\bWHERE\b/gi, '\nWHERE\n  ')
    .replace(/\bAND\b/gi, '\n  AND ')
    .replace(/\bOR\b/gi, '\n  OR ')
    .replace(/\bJOIN\b/gi, '\nJOIN ')
    .replace(/\bLEFT JOIN\b/gi, '\nLEFT JOIN ')
    .replace(/\bRIGHT JOIN\b/gi, '\nRIGHT JOIN ')
    .replace(/\bINNER JOIN\b/gi, '\nINNER JOIN ')
    .replace(/\bGROUP BY\b/gi, '\nGROUP BY ')
    .replace(/\bORDER BY\b/gi, '\nORDER BY ')
    .replace(/\bHAVING\b/gi, '\nHAVING ')
    .replace(/\bLIMIT\b/gi, '\nLIMIT ')
    .replace(/\bUNION\b/gi, '\nUNION\n')

  return result.trim()
}

export default function SqlFormatter({ state, onStateChange }) {
  const { input, output, error } = state
  const [copied, setCopied] = useState(false)

  const format = useCallback(() => {
    if (!input.trim()) return
    try {
      const result = formatSQL(input)
      onStateChange(s => ({ ...s, output: result, error: null }))
    } catch (e) {
      onStateChange(s => ({ ...s, output: '', error: e.message }))
    }
  }, [input, onStateChange])

  const copy = useCallback(() => {
    if (!output) return
    navigator.clipboard.writeText(output)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }, [output])

  const clear = useCallback(() => {
    onStateChange({ input: '', output: '', error: null })
  }, [onStateChange])

  return (
    <div className="mt-4 flex flex-col lg:flex-row gap-4 min-h-[calc(100svh-200px)]">
      {/* Input */}
      <div className="flex-1 flex flex-col min-h-48 lg:min-h-0">
        <textarea
          value={input}
          onChange={e => onStateChange(s => ({ ...s, input: e.target.value }))}
          placeholder="Paste your SQL here..."
          className="flex-1 p-4 rounded-2xl border border-stone-200 font-mono text-sm text-stone-800 placeholder-stone-300 resize-none focus:outline-none focus:border-orange-400 transition-colors"
          style={{ backgroundColor: '#fafaf9' }}
        />
      </div>

      {/* Output */}
      <div className="flex-1 flex flex-col min-h-48 lg:min-h-0">
        <div
          className="flex-1 rounded-2xl border overflow-auto p-4 font-mono text-sm"
          style={{
            backgroundColor: output ? '#f5f5f4' : '#fafaf9',
            borderColor: '#e7e5e4',
          }}
        >
          {output ? (
            <pre className="whitespace-pre-wrap">{output}</pre>
          ) : (
            <span className="text-stone-300">Formatted SQL will appear here...</span>
          )}
        </div>

      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <button
          onClick={format}
          className="w-12 h-12 rounded-full flex items-center justify-center shadow-lg text-white"
          style={{ backgroundColor: '#F97316' }}
          title="Format SQL"
        >
          <Database className="w-5 h-5" />
        </button>
        {output && (
          <button
            onClick={copy}
            className="w-12 h-12 rounded-full bg-white text-stone-600 border border-stone-200 flex items-center justify-center shadow-lg hover:bg-stone-50"
          >
            {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
          </button>
        )}
        <button
          onClick={clear}
          className="w-12 h-12 rounded-full bg-white text-stone-600 border border-stone-200 flex items-center justify-center shadow-lg hover:bg-stone-50"
        >
          <Trash2 className="w-5 h-5" />
        </button>
      </div>
    </div>
  )
}