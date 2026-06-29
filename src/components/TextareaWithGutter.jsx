import { useCallback, useRef } from 'react'

/**
 * Textarea with a line number gutter.
 * Props:
 *   value, onChange, placeholder, ...rest — forwarded to the textarea
 *   className — textarea class only (not wrapper)
 */
export default function TextareaWithGutter({ value, onChange, className = '', ...props }) {
  const textareaRef = useRef(null)
  const gutterRef = useRef(null)

  // Compute line count directly from value — derived, no effect needed
  const lineCount = Math.max((value || '').split('\n').length, 1)

  // Scroll sync: gutter tracks textarea scroll
  const handleScroll = useCallback(() => {
    if (gutterRef.current && textareaRef.current) {
      gutterRef.current.scrollTop = textareaRef.current.scrollTop
    }
  }, [])

  const lineNumbers = Array.from({ length: lineCount }, (_, i) => i + 1)

  return (
    <div className="flex flex-1 overflow-hidden rounded-2xl border border-stone-200" style={{ backgroundColor: '#fafaf9' }}>
      {/* Line number gutter */}
      <div
        ref={gutterRef}
        className="flex-shrink-0 select-none overflow-hidden border-r border-stone-200 px-3 py-4 text-right"
        style={{
          minWidth: '3.5ch',
          fontFamily: 'ui-monospace, "Cascadia Code", "Source Code Pro", Menlo, Consolas, monospace',
          fontSize: '0.875rem',
          lineHeight: '1.5rem',
          color: '#a8a29e',
          backgroundColor: '#f5f5f4',
          userSelect: 'none',
        }}
        aria-hidden="true"
      >
        {lineNumbers.map(n => (
          <div key={n} style={{ height: '1.5rem', lineHeight: '1.5rem' }}>{n}</div>
        ))}
      </div>

      {/* Textarea */}
      <textarea
        ref={textareaRef}
        value={value}
        onChange={onChange}
        onScroll={handleScroll}
        className={`flex-1 p-4 bg-transparent font-mono text-sm text-stone-800 placeholder-stone-300 resize-none focus:outline-none transition-colors ${className}`}
        style={{ backgroundColor: '#fafaf9' }}
        {...props}
      />
    </div>
  )
}
