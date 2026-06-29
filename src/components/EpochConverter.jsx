import { useState, useCallback } from 'react'
import { Clock, Copy, Check, Trash2 } from 'lucide-react'

const TIMEZONES = [
  { id: undefined, label: 'Local' },
  { id: 'UTC', label: 'UTC' },
  { id: 'Asia/Jakarta', label: 'Jakarta (UTC+7)' },
  { id: 'Asia/Singapore', label: 'Singapore (UTC+8)' },
  { id: 'America/New_York', label: 'New York (UTC-5)' },
  { id: 'Europe/London', label: 'London (UTC+0)' },
]

function formatDate(date, tzId) {
  return new Intl.DateTimeFormat('en-US', {
    timeZone: tzId,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }).format(date)
}

function getTimezones(date) {
  return TIMEZONES.map(tz => ({
    ...tz,
    formatted: formatDate(date, tz.id)
  }))
}

export default function EpochConverter({ state, onStateChange }) {
  const { epoch, output, error } = state
  const [copied, setCopied] = useState(false)

  const fromEpoch = useCallback(() => {
    if (!epoch.trim()) {
      onStateChange(s => ({ ...s, output: null, error: null }))
      return
    }
    const num = parseInt(epoch)
    if (isNaN(num)) {
      // Try parsing as date string
      const dateAttempt = new Date(epoch)
      if (!isNaN(dateAttempt.getTime())) {
        onStateChange(s => ({ ...s, output: { date: dateAttempt }, error: null }))
        return
      }
      onStateChange(s => ({ ...s, output: null, error: 'Invalid timestamp — enter a Unix timestamp (seconds or ms) or a date string' }))
      return
    }
    const date = num > 9999999999 ? new Date(num) : new Date(num * 1000)
    if (isNaN(date.getTime())) {
      onStateChange(s => ({ ...s, output: null, error: 'Invalid timestamp' }))
      return
    }
    onStateChange(s => ({ ...s, output: { date }, error: null }))
  }, [epoch, onStateChange])

  const fromDate = useCallback(() => {
    if (!epoch.trim()) {
      onStateChange(s => ({ ...s, output: null, error: null }))
      return
    }
    const date = new Date(epoch)
    if (isNaN(date.getTime())) {
      onStateChange(s => ({ ...s, output: null, error: 'Invalid date string — try: 2024-01-01 or Jan 1 2024' }))
      return
    }
    onStateChange(s => ({ ...s, output: { date }, error: null }))
  }, [epoch, onStateChange])

  const copy = useCallback(() => {
    if (!output) return
    navigator.clipboard.writeText(String(Math.floor(output.date.getTime() / 1000)))
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }, [output])

  const clear = useCallback(() => {
    onStateChange({ epoch: '', output: null, error: null })
  }, [onStateChange])

  const now = new Date()
  const timezones = output ? getTimezones(output.date) : getTimezones(now)

  return (
    <div className="mt-4 flex flex-col gap-4">
      {/* Input */}
      <div className="flex gap-2">
        <input
          type="text"
          value={epoch}
          onChange={e => onStateChange(s => ({ ...s, epoch: e.target.value }))}
          placeholder="Enter Unix timestamp or date string..."
          className="flex-1 px-4 py-3 rounded-xl border font-mono text-sm placeholder-stone-300 focus:outline-none focus:border-orange-400 transition-colors"
          style={{ backgroundColor: 'var(--bg-subtle)', borderColor: 'var(--border)', color: 'var(--text)' }}
        />
        <button
          onClick={fromEpoch}
          className="px-4 py-3 rounded-xl text-white text-sm font-medium"
          style={{ backgroundColor: '#F97316' }}
        >
          From Epoch
        </button>
        <button
          onClick={fromDate}
          className="px-4 py-3 rounded-xl text-sm font-medium"
          style={{ backgroundColor: 'var(--fab-bg)', color: 'var(--fab-text)', border: '1px solid var(--border)' }}
        >
          From Date
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="px-4 py-2 rounded-xl text-sm text-red-500" style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca' }}>
          {error}
        </div>
      )}

      {/* Output */}
      {output && (
        <div className="flex flex-col gap-4">
          {/* Quick copy */}
          <div className="flex gap-2 items-center">
            <Clock className="w-4 h-4" style={{ color: 'var(--text-muted)' }} />
            <span className="font-mono text-sm" style={{ color: 'var(--text)' }}>
              {Math.floor(output.date.getTime() / 1000)} <span style={{ color: 'var(--text-muted)' }}>(seconds)</span>
            </span>
            <span className="font-mono text-sm" style={{ color: 'var(--text-muted)' }}>
              {Math.floor(output.date.getTime())} <span style={{ color: 'var(--text-muted)' }}>(ms)</span>
            </span>
            <button
              onClick={copy}
              className="ml-auto w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: 'var(--fab-bg)', border: '1px solid var(--border)' }}
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            </button>
            <button
              onClick={clear}
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: 'var(--fab-bg)', border: '1px solid var(--border)' }}
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>

          {/* Timezones */}
          <div className="rounded-xl border overflow-hidden" style={{ borderColor: 'var(--border)' }}>
            <div className="px-4 py-2 text-xs uppercase border-b" style={{ color: 'var(--text-muted)', borderBottom: '1px solid var(--border)', backgroundColor: 'var(--nav-hover-bg)' }}>
              All Timezones
            </div>
            <div className="divide-y">
              {timezones.map(tz => (
                <div key={tz.id} className="px-4 py-2 flex items-center justify-between" style={{ borderColor: 'var(--border)' }}>
                  <span className="text-sm" style={{ color: 'var(--text-muted)' }}>{tz.label}</span>
                  <span className="font-mono text-sm" style={{ color: 'var(--text)' }}>{tz.formatted}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Relative time */}
          <div className="rounded-xl border px-4 py-3" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-subtle)' }}>
            <span className="text-xs uppercase" style={{ color: 'var(--text-muted)' }}>Relative</span>
            <p className="text-sm mt-1" style={{ color: 'var(--text)' }}>
              {output.date.toLocaleString('en-US', { dateStyle: 'full', timeStyle: 'long' })}
            </p>
          </div>
        </div>
      )}

      {/* Quick now */}
      {!output && (
        <div className="flex flex-col gap-2">
          <p className="text-xs uppercase" style={{ color: 'var(--text-muted)' }}>Current Time</p>
          <div className="rounded-xl border px-4 py-3 flex items-center justify-between" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-subtle)' }}>
            <span className="font-mono text-sm" style={{ color: 'var(--text)' }}>{Math.floor(now.getTime() / 1000)}</span>
            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>seconds</span>
          </div>
        </div>
      )}
    </div>
  )
}