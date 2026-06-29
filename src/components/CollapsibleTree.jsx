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

  if (!isExpanded) {
    const bracket = isArray(data) ? '[...]' : '{...}'
    const count = getItemCount(data)
    return (
      <div className="pl-4 border-l" style={{ borderLeft: '1px solid var(--border)' }}>
        <button
          onClick={() => setLocalExpanded(true)}
          className="hover:text-orange-400 cursor-pointer text-xs"
          style={{ fontSize: '10px', color: 'var(--text-muted)' }}
        >
          ▶ {bracket} ({count} {count === 1 ? 'item' : 'items'})
        </button>
      </div>
    )
  }

  if (isArray(data)) {
    return (
      <div className="pl-4 border-l" style={{ borderLeft: '1px solid var(--border)' }}>
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
      <div className="pl-4 border-l" style={{ borderLeft: '1px solid var(--border)' }}>
        {Object.entries(data).map(([key, val]) => (
          <div key={key}>
            <div className="flex items-center gap-1">
              {(isObject(val) || isArray(val)) && (
                <button
                  onClick={() => setLocalExpanded(e => !e)}
                  className="hover:text-orange-400 cursor-pointer text-xs w-4 text-center"
                  style={{ fontSize: '10px', color: 'var(--text-muted)' }}
                >
                  ▼
                </button>
              )}
              <span className="font-semibold" style={{ color: 'var(--text)' }}>"{key}"</span>
              <span style={{ color: 'var(--text-muted)' }}>: </span>
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
          className="hover:text-orange-400 cursor-pointer text-xs w-4 text-center"
          style={{ fontSize: '10px', color: 'var(--text-muted)' }}
        >
          ▶
        </button>
        <span className="font-mono text-sm" style={{ color: 'var(--text-muted)' }}>
          {bracket}
          <span className="ml-1 text-xs" style={{ color: 'var(--text-muted)' }}>({count} {count === 1 ? 'item' : 'items'})</span>
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