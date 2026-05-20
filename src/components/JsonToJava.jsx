import { useState, useCallback } from 'react'
import { Play, Copy, Trash2, Check, Braces, ArrowLeftRight } from 'lucide-react'
import TextareaWithGutter from './TextareaWithGutter'
import AdPlaceholder from './AdPlaceholder'

function toPascalCase(str) {
  return str
    .replace(/[-_](.)/g, (_, c) => c.toUpperCase())
    .replace(/^(.)/, (_, c) => c.toUpperCase())
}

function inferJavaType(value) {
  if (value === null) return 'Object'
  if (value === true || value === false) return 'boolean'
  if (typeof value === 'number') {
    return Number.isInteger(value) ? 'long' : 'double'
  }
  if (typeof value === 'string') return 'String'
  if (Array.isArray(value)) return 'List<Object>'
  if (typeof value === 'object') return 'Map<String, Object>'
  return 'Object'
}

function generateJavaClass(json, className) {
  if (!json || typeof json !== 'object' || Array.isArray(json)) {
    return '// Invalid input: provide a JSON object'
  }

  const fields = Object.entries(json)
  const imports = new Set(['import java.util.List;', 'import java.util.Map;'])

  let innerClasses = ''
  let fieldDefs = ''

  fields.forEach(([key, value]) => {
    const javaType = inferJavaType(value)
    if (javaType === 'List<Object>') imports.add('import java.util.ArrayList;')
    if (javaType === 'Map<String, Object>') imports.add('import java.util.HashMap;')

    if (javaType === 'Map<String, Object>' && typeof value === 'object' && value !== null) {
      const innerClassName = toPascalCase(key)
      innerClasses += `\n\n  public static class ${innerClassName} {\n`
      Object.entries(value).forEach(([k, v]) => {
        const fType = inferJavaType(v)
        if (fType === 'List<Object>') imports.add('import java.util.ArrayList;')
        if (fType === 'Map<String, Object>') imports.add('import java.util.HashMap;')
        const fName = toPascalCase(k)
        const safeKey = /^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(k) ? k : `"${k}"`
        innerClasses += `    @JsonProperty(${safeKey})\n`
        innerClasses += `    private ${fType} ${fName};\n`
      })
      innerClasses += `\n    // Getters & setters\n`
      Object.entries(value).forEach(([k, v]) => {
        const fType = inferJavaType(v)
        const fName = toPascalCase(k)
        innerClasses += `    public ${fType} get${fName}() { return ${fName}; }\n`
        innerClasses += `    public void set${fName}(${fType} ${fName}) { this.${fName} = ${fName}; }\n`
      })
      innerClasses += `  }`
    }

    const safeKey = /^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(key) ? key : `"${key}"`
    fieldDefs += `    @JsonProperty(${safeKey})\n`
    fieldDefs += `    private ${javaType} ${toPascalCase(key)};\n\n`
  })

  // getters & setters
  fields.forEach(([key, value]) => {
    const javaType = inferJavaType(value)
    const fName = toPascalCase(key)
    fieldDefs += `    public ${javaType} get${fName}() { return ${fName}; }\n`
    fieldDefs += `    public void set${fName}(${javaType} ${fName}) { this.${fName} = ${fName}; }\n\n`
  })

  const importLines = [...imports].sort().join('\n')
  const hasImports = importLines.length > 0

  return `${hasImports ? importLines + '\n\n' : ''}import com.fasterxml.jackson.annotation.JsonProperty;\n\npublic class ${className} {\n${fieldDefs}${innerClasses}\n}`
}

export default function JsonToJava({ state, onStateChange, onClear }) {
  const { input, output, error } = state
  const [copied, setCopied] = useState(false)
  const [className, setClassName] = useState('MyClass')

  const setInput = useCallback((val) => {
    onStateChange(s => ({ ...s, input: typeof val === 'function' ? val(s.input) : val }))
  }, [onStateChange])

  const generate = useCallback(() => {
    if (!input.trim()) {
      onStateChange(s => ({ ...s, error: 'Please enter some JSON first', output: null }))
      return
    }
    try {
      const parsed = JSON.parse(input)
      if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
        onStateChange(s => ({ ...s, error: 'JSON must be an object', output: null }))
        return
      }
      const result = generateJavaClass(parsed, className || 'MyClass')
      onStateChange(s => ({ ...s, output: result, error: null }))
    } catch (e) {
      onStateChange(s => ({ ...s, error: `Invalid JSON: ${e.message}`, output: null }))
    }
  }, [input, className, onStateChange])

  const copy = useCallback(() => {
    if (!output) return
    navigator.clipboard.writeText(output)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }, [output])

  const clear = useCallback(() => {
    onStateChange(s => ({ input: '', output: null, error: null }))
  }, [onStateChange])

  return (
    <div className="mt-4 flex flex-col lg:flex-row gap-4 h-[calc(100svh-200px)] lg:h-[calc(100svh-180px)]">
      {/* Left panel */}
      <div className="flex-1 flex flex-col min-h-48 lg:min-h-0">
        {/* Class name input */}
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs uppercase font-medium" style={{ color: 'var(--text-muted)' }}>Class Name</span>
          <input
            type="text"
            value={className}
            onChange={e => setClassName(e.target.value)}
            placeholder="MyClass"
            className="px-3 py-1.5 rounded-lg border text-sm font-mono focus:outline-none focus:border-orange-400 transition-colors"
            style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-subtle)', color: 'var(--text)' }}
          />
        </div>

        {/* Hint */}
        <div className="mb-2 px-3 py-2 rounded-xl text-xs" style={{ backgroundColor: 'var(--bg-subtle)', border: '1px solid var(--border)', color: 'var(--text-muted)' }}>
          Paste a JSON object — fields will become Java class members with Jackson annotations
        </div>

        <TextareaWithGutter
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder={'{\n  "firstName": "Alice",\n  "age": 30,\n  "active": true\n}'}
        />
      </div>

      {/* Output */}
      <div className="flex-1 flex flex-col min-h-48 lg:min-h-0">
        {error && (
          <div className="mb-2 px-4 py-2 rounded-xl text-sm" style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca', color: '#991b1b' }}>
            {error}
          </div>
        )}
        <div
          className="flex-1 rounded-2xl border overflow-auto p-4"
          style={{ backgroundColor: 'var(--bg-subtle)', borderColor: 'var(--border)' }}
        >
          {output ? (
            <pre className="font-mono text-sm whitespace-pre-wrap break-all" style={{ color: 'var(--text)' }}>
              {output}
            </pre>
          ) : (
            <span className="text-sm" style={{ color: 'var(--text-muted)' }}>Java class will appear here...</span>
          )}
        </div>
      </div>

      {/* Ad placeholder */}
      <AdPlaceholder />

      {/* FABs */}
      <div className="fixed bottom-6 right-6 flex flex-col gap-2">
        {[
          { icon: Play, label: 'Generate', onClick: generate, primary: true },
          { icon: Copy, label: 'Copy', onClick: copy, show: output },
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