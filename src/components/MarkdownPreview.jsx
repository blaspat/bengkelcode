import { useState, useCallback } from 'react'
import { FileText, Copy, Check, Trash2 } from 'lucide-react'

// Simple markdown renderer (supports common patterns)
function renderMarkdown(text) {
  if (!text) return ''

  // Escape HTML first (must be done before other processing)
  let html = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')

  // Split into blocks for proper block-level rendering
  const blocks = html.split('\n\n')

  const renderedBlocks = blocks.map(block => {
    const lines = block.split('\n')
    const firstLine = lines[0]

    // Code blocks
    if (firstLine.startsWith('```') && block.endsWith('```')) {
      const code = block.slice(3, -3).trim()
      return `<pre class="rounded-lg p-4 my-2" style="background:#f5f5f4;border:1px solid #e7e5e4"><code>${code}</code></pre>`
    }

    // Headers
    if (firstLine.startsWith('### ')) {
      return `<h3 class="text-base font-semibold mt-4 mb-2">${block.slice(4)}</h3>`
    }
    if (firstLine.startsWith('## ')) {
      return `<h2 class="text-lg font-semibold mt-4 mb-2">${block.slice(3)}</h2>`
    }
    if (firstLine.startsWith('# ')) {
      return `<h1 class="text-xl font-bold mt-4 mb-2">${block.slice(2)}</h1>`
    }

    // Horizontal rule
    if (/^---+$/.test(firstLine.trim())) {
      return '<hr class="my-4 border-stone-200" />'
    }

    // Blockquotes
    if (firstLine.startsWith('> ')) {
      const content = lines
        .filter(l => l.startsWith('> '))
        .map(l => l.slice(2))
        .join('<br />')
      return `<blockquote class="border-l-4 border-orange-400 pl-4 my-2 text-stone-600 italic">${content}</blockquote>`
    }

    // Unordered list
    if (firstLine.startsWith('- ') || firstLine.startsWith('* ')) {
      const items = lines
        .filter(l => l.startsWith('- ') || l.startsWith('* '))
        .map(l => `<li>${l.slice(2)}</li>`)
        .join('')
      return `<ul class="list-disc ml-4 my-2">${items}</ul>`
    }

    // Ordered list
    if (/^\d+\.\s/.test(firstLine)) {
      const items = lines
        .filter(l => /^\d+\.\s/.test(l))
        .map(l => `<li>${l.replace(/^\d+\.\s/, '')}</li>`)
        .join('')
      return `<ol class="list-decimal ml-4 my-2">${items}</ol>`
    }

    // Paragraph — apply inline formatting
    let paragraph = block
      // Inline code
      .replace(/`([^`]+)`/g, '<code class="rounded px-1" style="background:#f5f5f4;font-family:monospace">$1</code>')
      // Bold
      .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
      // Italic
      .replace(/\*([^*]+)\*/g, '<em>$1</em>')
      // Links
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener" class="text-orange-500 underline">$1</a>')
      // Images
      .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" class="max-w-full rounded-lg my-2" />')
      // Line breaks within paragraph
      .replace(/\n/g, '<br />')

    return `<p class="my-2">${paragraph}</p>`
  })

  return renderedBlocks.join('\n')
}

export default function MarkdownPreview({ state, onStateChange }) {
  const { input } = state
  const [copied, setCopied] = useState(false)

  const copy = useCallback(() => {
    if (!input) return
    navigator.clipboard.writeText(input)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }, [input])

  const clear = useCallback(() => {
    onStateChange({ input: '', output: '' })
  }, [onStateChange])

  const rendered = input ? renderMarkdown(input) : ''

  return (
    <div className="mt-4 flex flex-col lg:flex-row gap-4 min-h-[calc(100svh-200px)]">
      {/* Input */}
      <div className="flex-1 flex flex-col min-h-48 lg:min-h-0">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-stone-400 uppercase">Markdown</span>
          <div className="flex gap-1">
            <button
              onClick={copy}
              disabled={!input}
              className="w-8 h-8 rounded-lg bg-white border border-stone-200 flex items-center justify-center hover:bg-stone-50 disabled:opacity-50"
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            </button>
            <button
              onClick={clear}
              className="w-8 h-8 rounded-lg bg-white border border-stone-200 flex items-center justify-center hover:bg-stone-50"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
        <textarea
          value={input}
          onChange={e => onStateChange(s => ({ ...s, input: e.target.value, output: e.target.value }))}
          placeholder="Write markdown here..."
          className="flex-1 p-4 rounded-2xl border border-stone-200 font-mono text-sm text-stone-800 placeholder-stone-300 resize-none focus:outline-none focus:border-orange-400 transition-colors"
          style={{ backgroundColor: '#fafaf9' }}
        />
      </div>

      {/* Preview */}
      <div className="flex-1 flex flex-col min-h-48 lg:min-h-0">
        <div className="flex items-center mb-2">
          <FileText className="w-4 h-4 text-stone-400 mr-2" />
          <span className="text-xs text-stone-400 uppercase">Preview</span>
        </div>
        <div
          className="flex-1 rounded-2xl border border-stone-200 p-4 overflow-auto"
          style={{ backgroundColor: '#fafaf9' }}
        >
          {rendered ? (
            <div className="prose prose-sm max-w-none text-stone-700" dangerouslySetInnerHTML={{ __html: rendered }} />
          ) : (
            <span className="text-stone-300">Preview will appear here...</span>
          )}
        </div>

      </div>
    </div>
  )
}
