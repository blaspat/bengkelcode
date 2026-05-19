import { useState, useCallback } from 'react'
import { FileText, Copy, Check, Trash2 } from 'lucide-react'
import AdPlaceholder from './AdPlaceholder'

// Simple markdown renderer (supports common patterns)
function renderMarkdown(text) {
  if (!text) return ''

  let html = text
    // Escape HTML first
    html = html.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    // Code blocks (```...```)
    html = html.replace(/```([\s\S]*?)```/g, '<pre class="rounded-lg p-4 my-2" style="background:#f5f5f4;border:1px solid #e7e5e4"><code>$1</code></pre>')
    // Inline code (`...`)
    html = html.replace(/`([^`]+)`/g, '<code class="rounded px-1" style="background:#f5f5f4;font-family:monospace">$1</code>')
    // Headers
    html = html.replace(/^### (.*$)/gm, '<h3 class="text-base font-semibold mt-4 mb-2">$1</h3>')
    html = html.replace(/^## (.*$)/gm, '<h2 class="text-lg font-semibold mt-4 mb-2">$1</h2>')
    html = html.replace(/^# (.*$)/gm, '<h1 class="text-xl font-bold mt-4 mb-2">$1</h1>')
    // Bold
    html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    // Italic
    html = html.replace(/\*([^*]+)\*/g, '<em>$1</em>')
    // Links
    html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener" class="text-orange-500 underline">$1</a>')
    // Images
    html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" class="max-w-full rounded-lg my-2" />')
    // Blockquotes
    html = html.replace(/^> (.*$)/gm, '<blockquote class="border-l-4 border-orange-400 pl-4 my-2 text-stone-600 italic">$1</blockquote>')
    // Unordered lists
    html = html.replace(/^\- (.*$)/gm, '<li class="ml-4">$1</li>')
    html = html.replace(/(<li.*<\/li>)/gs, '<ul class="list-disc ml-4 my-2">$1</ul>')
    // Ordered lists
    html = html.replace(/^\d+\. (.*$)/gm, '<li class="ml-4">$1</li>')
    // Horizontal rule
    html = html.replace(/^---$/gm, '<hr class="my-4 border-stone-200" />')
    // Paragraphs
    html = html.replace(/\n\n/g, '</p><p class="my-2">')
    html = '<p class="my-2">' + html + '</p>'
    // Clean up empty paragraphs
    html = html.replace(/<p class="my-2"><\/p>/g, '')
    // Line breaks
    html = html.replace(/\n/g, '<br />')

  return html
}

export default function MarkdownPreview({ state, onStateChange }) {
  const { input, output } = state
  const [copied, setCopied] = useState(false)

  const updatePreview = useCallback(() => {
    onStateChange(s => ({ ...s, output: s.input }))
  }, [onStateChange])

  const copy = useCallback(() => {
    if (!input) return
    navigator.clipboard.writeText(input)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }, [input])

  const clear = useCallback(() => {
    onStateChange({ input: '', output: '' })
  }, [onStateChange])

  const rendered = output ? renderMarkdown(output) : ''

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

        {/* Ad placeholder */}
        <div className="mt-4">
          <AdPlaceholder />
        </div>
      </div>
    </div>
  )
}