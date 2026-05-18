import { useState, useCallback, useEffect } from 'react'
import { Copy, Trash2, Check, ChevronDown, ChevronUp } from 'lucide-react'
import { CronExpressionParser } from 'cron-parser'
import cronstrue from 'cronstrue'

// Preset expressions
const PRESETS = [
  { label: 'Every minute', expr: '* * * * *' },
  { label: 'Every 5 min', expr: '*/5 * * * *' },
  { label: 'Every 15 min', expr: '*/15 * * * *' },
  { label: 'Every hour', expr: '0 * * * *' },
  { label: 'Daily at 9am', expr: '0 9 * * *' },
  { label: 'Weekdays 9am', expr: '0 9 * * 1-5' },
  { label: 'Monthly 1st', expr: '0 0 1 * *' },
  { label: 'Every Sunday', expr: '0 0 * * 0' },
]

// Visual builder fields (single-select only)
const fieldDefs = [
  {
    name: 'minute',
    label: 'Minute',
    values: ['*', ...Array.from({ length: 60 }, (_, i) => String(i))],
  },
  {
    name: 'hour',
    label: 'Hour',
    values: ['*', ...Array.from({ length: 24 }, (_, i) => String(i))],
  },
  {
    name: 'day',
    label: 'Day',
    values: ['*', ...Array.from({ length: 31 }, (_, i) => String(i + 1))],
  },
  {
    name: 'month',
    label: 'Month',
    values: ['*', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'],
  },
  {
    name: 'weekday',
    label: 'Weekday',
    values: ['*', '0', '1', '2', '3', '4', '5', '6'],
    labels: { '*': 'Every', '0': 'Sun', '1': 'Mon', '2': 'Tue', '3': 'Wed', '4': 'Thu', '5': 'Fri', '6': 'Sat' },
  },
]

function parseCronExpression(expr) {
  const parts = expr.trim().split(/\s+/)
  if (parts.length !== 5) return null
  const [minute, hour, day, month, weekday] = parts
  return { minute, hour, day, month, weekday }
}

// Check if expression can be represented in the visual builder (single values only)
function isSimpleExpression(expr) {
  const parsed = parseCronExpression(expr)
  if (!parsed) return false
  const { minute, hour, day, month, weekday } = parsed
  return (
    isSimpleField(minute) &&
    isSimpleField(hour) &&
    isSimpleField(day) &&
    isSimpleField(month) &&
    isSimpleField(weekday)
  )
}

function isSimpleField(value) {
  return value === '*' || /^\d+$/.test(value)
}

function buildExpression(fields) {
  return `${fields.minute} ${fields.hour} ${fields.day} ${fields.month} ${fields.weekday}`
}

function getNextRuns(expression, count = 5) {
  try {
    const interval = CronExpressionParser.parse(expression, { tz: 'UTC' })
    const runs = []
    for (let i = 0; i < count; i++) {
      runs.push(interval.next().toDate())
    }
    return runs
  } catch {
    return []
  }
}

function formatDate(date) {
  return date.toLocaleString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  })
}

export default function CronMaker({ state, onStateChange }) {
  const { fields: initialFields, expression: initialExpression } = state
  const [expression, setExpression] = useState(initialExpression || '* * * * *')
  const [fields, setFields] = useState(initialFields || { minute: '*', hour: '*', day: '*', month: '*', weekday: '*' })
  const [description, setDescription] = useState('')
  const [nextRuns, setNextRuns] = useState([])
  const [error, setError] = useState(null)
  const [copied, setCopied] = useState(false)
  const [showBuilder, setShowBuilder] = useState(false)
  const [isCustom, setIsCustom] = useState(false)

  // Sync when state changes (e.g., from localStorage load or preset)
  useEffect(() => {
    updateFromExpression(initialExpression)
  }, [initialExpression]) // eslint-disable-line

  function updateFromExpression(expr) {
    const parsed = parseCronExpression(expr)
    if (!parsed) {
      setError('Invalid cron expression — use 5 fields: minute hour day month weekday')
      setDescription('')
      setNextRuns([])
      setIsCustom(true)
      return
    }
    try {
      setDescription(cronstrue.toString(expr))
      const runs = getNextRuns(expr, 5)
      setNextRuns(runs)
      setError(null)
      setIsCustom(!isSimpleExpression(expr))
      setFields(parsed)
    } catch (e) {
      setError(e.message)
      setDescription('')
      setNextRuns([])
      setIsCustom(true)
    }
  }

  const handleExpressionChange = useCallback((e) => {
    const val = e.target.value
    setExpression(val)
    updateFromExpression(val)
  }, []) // eslint-disable-line

  const handlePreset = useCallback((expr) => {
    setExpression(expr)
    updateFromExpression(expr)
    onStateChange({ fields, expression: expr })
  }, [fields, onStateChange])

  const handleFieldChange = useCallback((field, value) => {
    const newFields = { ...fields, [field]: value }
    const newExpr = buildExpression(newFields)
    setFields(newFields)
    setExpression(newExpr)
    setIsCustom(false)
    try {
      setDescription(cronstrue.toString(newExpr))
      setNextRuns(getNextRuns(newExpr, 5))
      setError(null)
    } catch (e) {
      setError(e.message)
      setDescription('')
      setNextRuns([])
    }
    onStateChange({ fields: newFields, expression: newExpr })
  }, [fields, onStateChange]) // eslint-disable-line

  const copy = useCallback(() => {
    navigator.clipboard.writeText(expression)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }, [expression])

  const clear = useCallback(() => {
    const empty = { fields: { minute: '*', hour: '*', day: '*', month: '*', weekday: '*' }, expression: '* * * * *' }
    setFields(empty.fields)
    setExpression(empty.expression)
    setDescription(cronstrue.toString('* * * * *'))
    setNextRuns(getNextRuns('* * * * *', 5))
    setError(null)
    setIsCustom(false)
    onStateChange(empty)
  }, [onStateChange])

  return (
    <div className="mt-4 flex flex-col lg:flex-row gap-4 min-h-[calc(100svh-200px)]">
      {/* Main panel */}
      <div className="flex-1 flex flex-col gap-3">
        {/* Expression input — PRIMARY */}
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={expression}
            onChange={handleExpressionChange}
            placeholder="* * * * *"
            className="flex-1 px-4 py-3 rounded-xl border-2 border-stone-200 font-mono text-base text-stone-800 placeholder-stone-300 focus:outline-none focus:border-orange-400 transition-colors"
            style={{ backgroundColor: '#fafaf9' }}
          />
          <button
            onClick={copy}
            className="w-11 h-11 rounded-xl bg-white text-stone-600 border border-stone-200 flex items-center justify-center hover:bg-stone-50 transition-colors"
            title="Copy expression"
          >
            {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
          </button>
          <button
            onClick={clear}
            className="w-11 h-11 rounded-xl bg-white text-stone-600 border border-stone-200 flex items-center justify-center hover:bg-stone-50 transition-colors"
            title="Clear"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>

        {/* Presets */}
        <div className="flex flex-wrap gap-2">
          {PRESETS.map(({ label, expr }) => (
            <button
              key={expr}
              onClick={() => handlePreset(expr)}
              className="px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors"
              style={{
                backgroundColor: expression === expr ? '#F97316' : 'white',
                color: expression === expr ? 'white' : '#78716c',
                borderColor: expression === expr ? '#F97316' : '#e7e5e4',
              }}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Description */}
        {description && (
          <div className="px-4 py-3 rounded-xl text-sm text-stone-600 leading-relaxed" style={{ backgroundColor: '#f5f5f4' }}>
            {description}
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="px-4 py-3 rounded-xl text-sm text-red-500" style={{ backgroundColor: '#fef2f2' }}>
            {error}
          </div>
        )}

        {/* Visual builder toggle */}
        <button
          onClick={() => setShowBuilder(v => !v)}
          className="flex items-center gap-1 text-xs font-medium text-stone-400 hover:text-stone-600 transition-colors py-1"
        >
          {showBuilder ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          {showBuilder ? 'Hide' : 'Show'} visual builder
        </button>

        {/* Visual builder — SECONDARY */}
        {showBuilder && (
          <div className="grid grid-cols-5 gap-2 p-4 rounded-xl border border-stone-200" style={{ backgroundColor: '#fafaf9' }}>
            {fieldDefs.map(({ name, label, values, labels }) => (
              <div key={name} className="flex flex-col gap-1">
                <label className="text-xs font-medium text-stone-400 uppercase tracking-wide">{label}</label>
                <select
                  value={fields[name]}
                  onChange={e => handleFieldChange(name, e.target.value)}
                  disabled={isCustom}
                  className="px-3 py-2 rounded-xl border border-stone-200 text-sm text-stone-700 focus:outline-none focus:border-orange-400 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ backgroundColor: '#fafaf9' }}
                >
                  {values.map(v => (
                    <option key={v} value={v}>
                      {labels ? labels[v] : v}
                    </option>
                  ))}
                </select>
              </div>
            ))}
            {isCustom && (
              <p className="col-span-5 text-xs text-stone-400 mt-1">
                Custom expression — visual builder disabled. Clear the expression field to use the builder.
              </p>
            )}
          </div>
        )}
      </div>

      {/* Next runs */}
      <div className="lg:w-72 flex flex-col gap-2">
        <h3 className="text-sm font-medium text-stone-500 uppercase tracking-wide">Next 5 Runs</h3>
        <div className="flex-1 rounded-xl border border-stone-200 overflow-hidden" style={{ backgroundColor: '#fafaf9' }}>
          {nextRuns.length > 0 ? (
            <ul className="divide-y divide-stone-100">
              {nextRuns.map((run, i) => (
                <li key={i} className="px-4 py-3 font-mono text-xs text-stone-600">
                  {formatDate(run)}
                </li>
              ))}
            </ul>
          ) : (
            <div className="p-4 text-sm text-stone-400">No upcoming runs</div>
          )}
        </div>
      </div>
    </div>
  )
}
