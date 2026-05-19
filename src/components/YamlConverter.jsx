import { useState, useCallback } from 'react'
import { ArrowLeftRight, Copy, Trash2, Check } from 'lucide-react'
import TextareaWithGutter from './TextareaWithGutter'
import AdPlaceholder from './AdPlaceholder'
import yaml from 'js-yaml'

const TYPES = ['YAML', 'JSON', 'Properties']

function yamlToJson(yamlStr) {
  const parsed = yaml.load(yamlStr)
  return JSON.stringify(parsed, null, 2)
}

function jsonToYaml(jsonStr) {
  const parsed = JSON.parse(jsonStr)
  return yaml.dump(parsed, { indent: 2, lineWidth: -1 })
}

function propertiesToYaml(propsStr) {
  const lines = propsStr.trim().split('\n')
  const obj = {}
  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const eqIdx = trimmed.indexOf('=')
    if (eqIdx === -1) continue
    const key = trimmed.slice(0, eqIdx).trim()
    const val = trimmed.slice(eqIdx + 1).trim()
    obj[key] = val
  }
  return yaml.dump(obj, { indent: 2, lineWidth: -1 })
}

function yamlToProperties(yamlStr) {
  const parsed = yaml.load(yamlStr)
  const lines = []
  function flatten(obj, prefix = '') {
    for (const [key, val] of Object.entries(obj)) {
      const newKey = prefix ? `${prefix}.${key}` : key
      if (val && typeof val === 'object' && !Array.isArray(val)) {
        flatten(val, newKey)
      } else {
        lines.push(`${newKey}=${val}`)
      }
    }
  }
  flatten(parsed)
  return lines.join('\n')
}

function detectType(input) {
  const trimmed = input.trim()
  if (trimmed.startsWith('{') || trimmed.startsWith('[')) return 'JSON'
  if (trimmed.includes('=') && !trimmed.includes(':')) return 'Properties'
  return 'YAML'
}

export default function YamlConverter({ state, onStateChange, onClear }) {
  const [inputType, setInputType] = useState('YAML')
  const [outputType, setOutputType] = useState('JSON')
  const [copied, setCopied] = useState(false)

  const { input, output, error } = state

  const setInput = useCallback((val) => {
    onStateChange(s => ({ ...s, input: typeof val === 'function' ? val(s.input) : val }))
  }, [onStateChange])

  const convert = useCallback(() => {
    if (!input.trim()) {
      onStateChange(s => ({ ...s, error: 'Please enter some input first', output: '' }))
      return
    }
    try {
      let result = ''
      const from = inputType
      const to = outputType

      if (from === 'YAML' && to === 'JSON') {
        result = yamlToJson(input)
      } else if (from === 'JSON' && to === 'YAML') {
        result = jsonToYaml(input)
      } else if (from === 'Properties' && to === 'YAML') {
        result = propertiesToYaml(input)
      } else if (from === 'YAML' && to === 'Properties') {
        result = yamlToProperties(input)
      } else if (from === 'JSON' && to === 'Properties') {
        const jsonParsed = JSON.parse(input)
        result = yamlToProperties(yaml.dump(jsonParsed))
      } else if (from === 'Properties' && to === 'JSON') {
        const yamlOut = propertiesToYaml(input)
        result = yamlToJson(yamlOut)
      } else {
        result = input
      }

      onStateChange(s => ({ ...s, output: result, error: null }))
    } catch (e) {
      let errMsg = e.message || String(e)
      // js-yaml errors include line/col info
      if (e.mark) {
        errMsg = `YAML error — line ${e.mark.line + 1}, column ${e.mark.column + 1}: ${errMsg}`
      } else if (errMsg.includes('JSON')) {
        const match = errMsg.match(/position (\d+)/)
        if (match) {
          const pos = parseInt(match[1])
          const lines = input.substring(0, pos).split('\n')
          const line = lines.length
          const col = lines[lines.length - 1].length + 1
          errMsg = `JSON error — line ${line}, column ${col}: ${errMsg}`
        }
      }
      onStateChange(s => ({ ...s, error: errMsg, output: '' }))
    }
  }, [input, inputType, outputType, onStateChange])

  const swap = useCallback(() => {
    setInputType(outputType)
    setOutputType(inputType)
    onStateChange(s => ({ ...s, input: s.output, output: s.input, error: null }))
  }, [outputType, inputType, onStateChange])

  const copy = useCallback(() => {
    if (!output) return
    navigator.clipboard.writeText(output)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }, [output])

  const clear = useCallback(() => {
    onStateChange(s => ({ input: '', output: '', error: null }))
  }, [onStateChange])

  const typeSelector = (current, other, side) => (
    <select
      value={current}
      onChange={e => {
        if (side === 'input') setInputType(e.target.value)
        else setOutputType(e.target.value)
      }}
      className="text-xs font-medium px-2 py-1 rounded-lg border border-stone-200 bg-white text-stone-600 focus:outline-none focus:ring-2 focus:ring-orange-400"
    >
      {TYPES.map(t => <option key={t} value={t}>{t}</option>)}
    </select>
  )

  return (
    <div className="mt-4 flex flex-col lg:flex-row gap-4 h-[calc(100svh-200px)] lg:h-[calc(100svh-180px)]">
      {/* Input */}
      <div className="flex-1 flex flex-col min-h-48 lg:min-h-0">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs font-semibold text-stone-400 uppercase tracking-wide">Input</span>
          {typeSelector(inputType, outputType, 'input')}
        </div>
        <TextareaWithGutter
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder={'Paste YAML, JSON, or Properties here...\n\nname: bengkelcode\nversion: "1.0.0"'}
        />
      </div>

      {/* Swap button */}
      <div className="flex lg:flex-col items-center justify-center gap-2 lg:gap-1">
        <button
          onClick={swap}
          title="Swap input and output"
          className="w-10 h-10 rounded-full bg-white border border-stone-200 flex items-center justify-center shadow-sm hover:scale-105 transition-all text-stone-500 hover:text-orange-500"
        >
          <ArrowLeftRight className="w-4 h-4" />
        </button>
      </div>

      {/* Output */}
      <div className="flex-1 flex flex-col min-h-48 lg:min-h-0">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs font-semibold text-stone-400 uppercase tracking-wide">Output</span>
          {typeSelector(outputType, inputType, 'output')}
        </div>
        {error && (
          <div className="mb-2 px-4 py-2 rounded-xl text-sm text-red-500 flex-shrink-0" style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca' }}>
            {error}
          </div>
        )}
        <TextareaWithGutter
          value={error ? '' : output}
          readOnly
          placeholder={error ? '' : 'Converted output will appear here...'}
          className="cursor-default"
        />
      </div>

      {/* Ad placeholder */}
      <div className="flex flex-col justify-end pb-4">
        <AdPlaceholder />
      </div>

      {/* FABs */}
      <div className="fixed bottom-6 right-6 flex flex-col gap-2">
        {[
          { icon: ArrowLeftRight, label: 'Convert', onClick: convert, primary: true },
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