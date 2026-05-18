import { useState, useCallback, useEffect } from 'react'
import { Copy, Trash2, Check } from 'lucide-react'
import cronstrue from 'cronstrue'
import cronParser from 'cron-parser'

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

function buildExpression(fields) {
  return `${fields.minute} ${fields.hour} ${fields.day} ${fields.month} ${fields.weekday}`
}

function getNextRuns(expression, count = 5) {
  try {
    const interval = cronParser.parseExpression(expression)
    const runs = []
    for (let i = 0; i < count; i++) {
      runs.push(interval.next().toDate())
    }
    return runs
  } catch {
    return []
  }
}

export default function CronMaker({ state, onStateChange }) {
  const { fields, expression } = state
  const [description, setDescription] = useState('')
  const [nextRuns, setNextRuns] = useState([])
  const [error, setError] = useState(null)
  const [copied, setCopied] = useState(false)

  // Sync computed fields when state loads from localStorage
  useEffect(() => {
    if (expression) {
      try {
        setDescription(cronstrue.toString(expression))
        setNextRuns(getNextRuns(expression, 5))
        setError(null)
      } catch (e) {
        setError(e.message)
      }
    }
  }, [expression]) // eslint-disable-line

  const rebuild = useCallback((newFields) => {
    const expr = buildExpression(newFields)
    try {
      setDescription(cronstrue.toString(expr))
      setNextRuns(getNextRuns(expr, 5))
      setError(null)
    } catch (e) {
      setDescription('')
      setNextRuns([])
      setError(e.message)
    }
    return { fields: newFields, expression: expr }
  }, [])

  const syncFromExpression = useCallback((expr) => {
    const parsed = parseCronExpression(expr)
    if (!parsed) {
      setError('Invalid cron expression — use 5 fields: minute hour day month weekday')
      setDescription('')
      setNextRuns([])
      return
    }
    try {
      setDescription(cronstrue.toString(expr))
      const runs = getNextRuns(expr, 5)
      setNextRuns(runs)
      setError(null)
    } catch {
      setError('Invalid expression')
      setDescription('')
      setNextRuns([])
    }
    onStateChange({ fields: parsed, expression: expr })
  }, [onStateChange])

  const handleFieldChange = useCallback((field, value) => {
    const newFields = { ...fields, [field]: value }
    const newState = rebuild(newFields)
    onStateChange(newState)
  }, [fields, rebuild, onStateChange])

  const handleExpressionChange = useCallback((e) => {
    syncFromExpression(e.target.value)
  }, [syncFromExpression])

  const copy = useCallback(() => {
    navigator.clipboard.writeText(expression)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }, [expression])

  const clear = useCallback(() => {
    const empty = { fields: { minute: '*', hour: '*', day: '*', month: '*', weekday: '*' }, expression: '* * * * *' }
    setDescription(cronstrue.toString('* * * * *'))
    setNextRuns(getNextRuns('* * * * *', 5))
    setError(null)
    onStateChange(empty)
  }, [onStateChange])

  const formatDate = (date) => {
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

  return (
    <div className="mt-4 flex flex-col lg:flex-row gap-4 min-h-[calc(100svh-200px)]">
      {/* Builder */}
      <div className="flex-1 flex flex-col gap-4">
        {/* Expression input */}
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={expression}
            onChange={handleExpressionChange}
            placeholder="* * * * *"
            className="flex-1 px-4 py-3 rounded-xl border border-stone-200 font-mono text-sm text-stone-800 placeholder-stone-300 focus:outline-none focus:border-orange-400 transition-colors"
            style={{ backgroundColor: '#fafaf9' }}
          />
          <button
            onClick={copy}
            className="w-11 h-11 rounded-xl bg-white text-stone-600 border border-stone-200 flex items-center justify-center hover:bg-stone-50 transition-colors"
          >
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          </button>
          <button
            onClick={clear}
            className="w-11 h-11 rounded-xl bg-white text-stone-600 border border-stone-200 flex items-center justify-center hover:bg-stone-50 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>

        {/* Field pickers */}
        <div className="grid grid-cols-5 gap-2">
          {fieldDefs.map(({ name, label, values, labels }) => (
            <div key={name} className="flex flex-col gap-1">
              <label className="text-xs font-medium text-stone-400 uppercase tracking-wide">{label}</label>
              <select
                value={fields[name]}
                onChange={e => handleFieldChange(name, e.target.value)}
                className="px-3 py-2 rounded-xl border border-stone-200 text-sm text-stone-700 focus:outline-none focus:border-orange-400 transition-colors cursor-pointer"
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
        </div>

        {/* Description */}
        {description && (
          <div className="px-4 py-3 rounded-xl text-sm text-stone-600" style={{ backgroundColor: '#f5f5f4' }}>
            {description}
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="px-4 py-3 rounded-xl text-sm text-red-500" style={{ backgroundColor: '#fef2f2' }}>
            {error}
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