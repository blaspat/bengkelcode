import { useState } from 'react'

function isObject(val) {
  return val !== null && typeof val === 'object' && !Array.isArray(val)
}

function isArray(val) {
  return Array.isArray(val)
}

function getItemCount(val) {
  if (isArray(val)) return val.length
  if (isObject(val)) return Object.keys(val).length
  return 0
}

function ValueNode({ data }) {
  if (typeof data === 'string') {
    return <span className="font-medium" style={{ color: '#3b82f6' }}>"{data}"</span>
  }
  if (typeof data === 'number') {
    return <span style={{ color: '#f97316' }}>{String(data)}</span>
  }
  if (typeof data === 'boolean') {
    return <span style={{ color: '#a855f7' }}>{String(data)}</span>
  }
  if (data === null) {
    return <span style={{ color: '#a8a29e' }}>null</span>
  }
  return <span>{String(data)}</span>
}

function TreeNode({ data, path, expanded }) {
  const [localExpanded, setLocalExpanded] = useState(true)
  const isExpanded = expanded !== undefined ? expanded : localExpanded
  const toggleExpanded = expanded !== undefined
    ? () => {} // controlled — no-op
    : () => setLocalExpanded(e => !e)

  if (!isExpanded) {
    const bracket = isArray(data) ? '[...]' : '{...}'
    const count = getItemCount(data)
    return (
      <div className="pl-4 border-l border-stone-200">
        <button
          onClick={() => setLocalExpanded(true)}
          className="text-stone-400 hover:text-orange-400 cursor-pointer text-xs"
          style={{ fontSize: '10px' }}
        >
          ▶ {bracket} ({count} {count === 1 ? 'item' : 'items'})
        </button>
      </div>
    )
  }

  if (isArray(data)) {
    return (
      <div className="pl-4 border-l border-stone-200">
        {data.map((item, i) => (
          <div key={i}>
            <TreeNode data={item} path={`${path}[${i}]`} expanded={expanded} />
          </div>
        ))}
      </div>
    )
  }

  if (isObject(data)) {
    return (
      <div className="pl-4 border-l border-stone-200">
        {Object.entries(data).map(([key, val]) => (
          <div key={key}>
            <div className="flex items-center gap-1">
              {(isObject(val) || isArray(val)) && (
                <button
                  onClick={() => setLocalExpanded(e => !e)}
                  className="text-stone-400 hover:text-orange-400 cursor-pointer text-xs w-4 text-center"
                  style={{ fontSize: '10px' }}
                >
                  ▼
                </button>
              )}
              <span className="font-semibold" style={{ color: 'var(--text)' }}>"{key}"</span>
              <span className="text-stone-400">: </span>
              {isObject(val) || isArray(val) ? (
                <TreeNode data={val} path={`${path}.${key}`} expanded={expanded} />
              ) : (
                <ValueNode data={val} />
              )}
            </div>
          </div>
        ))}
      </div>
    )
  }

  return <ValueNode data={data} />
}

export default function CollapsibleTree({ data, expanded = true }) {
  if (!data) return null

  const count = getItemCount(data)
  const bracket = isArray(data) ? '[...]' : '{...}'

  if (!expanded) {
    return (
      <div className="flex items-center gap-2">
        <button
          onClick={() => {}}
          className="text-stone-400 hover:text-orange-400 cursor-pointer text-xs w-4 text-center"
          style={{ fontSize: '10px' }}
        >
          ▶
        </button>
        <span className="text-stone-500 font-mono text-sm">
          {bracket}
          <span className="ml-1 text-stone-400 text-xs">({count} {count === 1 ? 'item' : 'items'})</span>
        </span>
      </div>
    )
  }

  return (
    <div className="font-mono text-sm">
      <TreeNode data={data} path="root" expanded={expanded} />
    </div>
  )
}