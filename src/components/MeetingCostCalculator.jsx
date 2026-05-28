import { useState, useCallback } from 'react'
import { Users, DollarSign, Clock, Trash2, Copy, Check } from 'lucide-react'

function formatCurrency(amount) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}

export default function MeetingCostCalculator({ state, onStateChange, onClear }) {
  const { attendees, hourlyRate, duration, result } = state
  const [copied, setCopied] = useState(false)

  const calculate = useCallback(() => {
    const attendeesNum = parseFloat(attendees) || 0
    const rateNum = parseFloat(hourlyRate) || 0
    const durationNum = parseFloat(duration) || 0

    if (attendeesNum <= 0 || rateNum <= 0 || durationNum <= 0) {
      onStateChange(s => ({ ...s, result: null }))
      return
    }

    // Cost = (attendees * hourlyRate * durationInMinutes) / 60
    const totalCost = (attendeesNum * rateNum * durationNum) / 60
    const costPerMinute = (attendeesNum * rateNum) / 60
    const costPerSecond = (attendeesNum * rateNum) / 3600

    onStateChange(s => ({
      ...s,
      result: {
        total: totalCost,
        perMinute: costPerMinute,
        perSecond: costPerSecond,
        attendees: attendeesNum,
        hourlyRate: rateNum,
        duration: durationNum,
      }
    }))
  }, [attendees, hourlyRate, duration, onStateChange])

  const copyResult = useCallback(() => {
    if (!result) return
    navigator.clipboard.writeText(formatCurrency(result.total))
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }, [result])

  const clear = useCallback(() => {
    onStateChange({ attendees: '', hourlyRate: '', duration: '', result: null })
    if (onClear) onClear()
  }, [onStateChange, onClear])

  return (
    <div className="mt-4 flex flex-col gap-4">
      {/* Inputs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Attendees */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium uppercase" style={{ color: 'var(--text-muted)' }}>
            <Users className="w-3.5 h-3.5 inline mr-1" />
            Attendees
          </label>
          <input
            type="number"
            min="1"
            value={attendees}
            onChange={e => onStateChange(s => ({ ...s, attendees: e.target.value }))}
            placeholder="10"
            className="px-4 py-3 rounded-xl border text-sm font-mono placeholder-stone-300 focus:outline-none focus:border-orange-400 transition-colors"
            style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-subtle)', color: 'var(--text)' }}
          />
        </div>

        {/* Hourly Rate */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium uppercase" style={{ color: 'var(--text-muted)' }}>
            <DollarSign className="w-3.5 h-3.5 inline mr-1" />
            Avg Hourly Salary
          </label>
          <input
            type="number"
            min="0"
            step="0.01"
            value={hourlyRate}
            onChange={e => onStateChange(s => ({ ...s, hourlyRate: e.target.value }))}
            placeholder="50"
            className="px-4 py-3 rounded-xl border text-sm font-mono placeholder-stone-300 focus:outline-none focus:border-orange-400 transition-colors"
            style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-subtle)', color: 'var(--text)' }}
          />
        </div>

        {/* Duration */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium uppercase" style={{ color: 'var(--text-muted)' }}>
            <Clock className="w-3.5 h-3.5 inline mr-1" />
            Duration (minutes)
          </label>
          <input
            type="number"
            min="1"
            value={duration}
            onChange={e => onStateChange(s => ({ ...s, duration: e.target.value }))}
            placeholder="60"
            className="px-4 py-3 rounded-xl border text-sm font-mono placeholder-stone-300 focus:outline-none focus:border-orange-400 transition-colors"
            style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-subtle)', color: 'var(--text)' }}
          />
        </div>
      </div>

      {/* Calculate Button */}
      <div className="flex gap-2">
        <button
          onClick={calculate}
          className="px-6 py-3 rounded-xl text-white text-sm font-medium"
          style={{ backgroundColor: '#F97316' }}
        >
          Calculate Cost
        </button>
        <button
          onClick={clear}
          className="px-4 py-3 rounded-xl text-sm font-medium flex items-center gap-2"
          style={{ borderColor: 'var(--border)', border: '1px solid var(--border)', color: 'var(--text-muted)' }}
        >
          <Trash2 className="w-4 h-4" />
          Clear
        </button>
      </div>

      {/* Result */}
      {result && (
        <div className="flex flex-col gap-4">
          {/* Main result */}
          <div className="rounded-xl border p-6" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-card)' }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium uppercase" style={{ color: 'var(--text-muted)' }}>Total Meeting Cost</p>
                <p className="text-4xl font-bold mt-2" style={{ color: '#F97316' }}>{formatCurrency(result.total)}</p>
              </div>
              <button
                onClick={copyResult}
                className="w-10 h-10 rounded-xl flex items-center justify-center transition-colors"
                style={{ borderColor: 'var(--border)', border: '1px solid var(--border)', color: 'var(--text-muted)' }}
              >
                {copied ? <Check className="w-5 h-5" style={{ color: '#22c55e' }} /> : <Copy className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Breakdown */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="rounded-xl border p-4" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-subtle)' }}>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Attendees</p>
              <p className="text-lg font-semibold font-mono mt-1" style={{ color: 'var(--text)' }}>{result.attendees}</p>
            </div>
            <div className="rounded-xl border p-4" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-subtle)' }}>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Avg Salary/hr</p>
              <p className="text-lg font-semibold font-mono mt-1" style={{ color: 'var(--text)' }}>{formatCurrency(result.hourlyRate)}</p>
            </div>
            <div className="rounded-xl border p-4" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-subtle)' }}>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Duration</p>
              <p className="text-lg font-semibold font-mono mt-1" style={{ color: 'var(--text)' }}>{result.duration}m</p>
            </div>
            <div className="rounded-xl border p-4" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-subtle)' }}>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Cost/Minute</p>
              <p className="text-lg font-semibold font-mono mt-1" style={{ color: 'var(--text)' }}>{formatCurrency(result.perMinute)}</p>
            </div>
          </div>

          {/* Formula */}
          <div className="rounded-xl border px-4 py-3" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-subtle)' }}>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Formula</p>
            <p className="text-sm font-mono mt-1" style={{ color: 'var(--text)' }}>
              ({result.attendees} × {formatCurrency(result.hourlyRate)} × {result.duration}m) ÷ 60 = <span style={{ color: '#F97316', fontWeight: 600 }}>{formatCurrency(result.total)}</span>
            </p>
          </div>
        </div>
      )}

      {/* Empty state hint */}
      {!result && (
        <div className="rounded-xl border px-4 py-6 text-center" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-subtle)' }}>
          <Clock className="w-8 h-8 mx-auto mb-2" style={{ color: 'var(--text-muted)' }} />
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            Enter attendees, average hourly salary, and meeting duration to calculate total cost
          </p>
        </div>
      )}
    </div>
  )
}