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

function getBracket(val) {
  if (isArray(val)) return '[...]'
  return '{...}'
}

export function JsonTree({ data, defaultExpanded = true, initialExpanded = true }) {
  const [expanded, setExpanded] = useState(initialExpanded)

  if (!expanded) {
    return (
      <span className="text-stone-400">
        {isArray(data) ? '[...]' : '{...}'}
        <button
          onClick={() => setExpanded(true)}
          className="ml-1 text-orange-400 hover:text-orange-500 cursor-pointer text-xs"
        >
          ({getItemCount(data)} items)
        </button>
      </span>
    )
  }

  if (isArray(data)) {
    return (
      <span>
        <span className="text-stone-400">{'['}</span>
        {data.length === 0 ? (
          <span className="text-stone-400">{']'}</span>
        ) : (
          <>
            <div className="pl-4 border-l border-stone-200">
              {data.map((item, i) => (
                <div key={i}>
                  <span className="inline-flex items-center gap-1">
                    {isObject(item) || isArray(item) ? (
                      <button
                        onClick={() => {}}
                        className="text-stone-400 hover:text-orange-400 cursor-pointer text-xs w-4 text-center"
                      >
                        ▼
                      </button>
                    ) : null}
                    <JsonTree data={item} initialExpanded={defaultExpanded} />
                    {i < data.length - 1 && <span className="text-stone-400">,</span>}
                  </span>
                </div>
              ))}
            </div>
            <span className="text-stone-400">{']'}</span>
          </>
        )}
      </span>
    )
  }

  if (isObject(data)) {
    const entries = Object.entries(data)
    return (
      <span>
        <span className="text-stone-400">{'{'}</span>
        {entries.length === 0 ? (
          <span className="text-stone-400">{'}'}</span>
        ) : (
          <>
            <div className="pl-4 border-l border-stone-200">
              {entries.map(([key, val], i) => (
                <div key={key}>
                  <span className="inline-flex items-center gap-1">
                    {isObject(val) || isArray(val) ? (
                      <button
                        onClick={() => {}}
                        className="text-stone-400 hover:text-orange-400 cursor-pointer text-xs w-4 text-center"
                      >
                        ▼
                      </button>
                    ) : null}
                    <span className="text-orange-400">"{key}"</span>
                    <span className="text-stone-400">: </span>
                    <JsonTree data={val} initialExpanded={defaultExpanded} />
                    {i < entries.length - 1 && <span className="text-stone-400">,</span>}
                  </span>
                </div>
              ))}
            </div>
            <span className="text-stone-400">{'}'}</span>
          </>
        )}
      </span>
    )
  }

  // Primitive
  if (typeof data === 'string') {
    return <span className="text-green-600">"{data}"</span>
  }
  if (typeof data === 'number') {
    return <span className="text-blue-600">{String(data)}</span>
  }
  if (typeof data === 'boolean') {
    return <span className="text-purple-600">{String(data)}</span>
  }
  if (data === null) {
    return <span className="text-stone-400">null</span>
  }
  return <span>{String(data)}</span>
}

export default function CollapsibleTree({ data }) {
  const [expanded, setExpanded] = useState(true)

  if (!data) return null

  const count = getItemCount(data)
  const bracket = getBracket(data)

  if (!expanded) {
    return (
      <div className="flex items-center gap-2">
        <button
          onClick={() => setExpanded(true)}
          className="text-stone-400 hover:text-orange-400 cursor-pointer text-xs w-4 text-center"
          style={{ fontSize: '10px' }}
        >
          ▶
        </button>
        <span className="text-stone-500 font-mono text-sm">
          {isArray(data) ? '[...]' : '{...}'}
          <span className="ml-1 text-stone-400 text-xs">({count} {count === 1 ? 'item' : 'items'})</span>
        </span>
      </div>
    )
  }

  return (
    <div className="font-mono text-sm">
      {/* Root toggle */}
      <button
        onClick={() => setExpanded(false)}
        className="text-stone-400 hover:text-orange-400 cursor-pointer w-4 text-center inline-block"
        style={{ fontSize: '10px' }}
        title="Collapse all"
      >
        ▼
      </button>
      <TreeNode data={data} path="" />
    </div>
  )
}

function TreeNode({ data, path }) {
  const [collapsed, setCollapsed] = useState(false)

  if (collapsed) {
    return (
      <div className="pl-4">
        <button
          onClick={() => setCollapsed(false)}
          className="text-stone-400 hover:text-orange-400 cursor-pointer text-xs"
          style={{ fontSize: '10px' }}
        >
          ▶ {isArray(data) ? '[...]' : '{...}'} ({getItemCount(data)} items)
        </button>
      </div>
    )
  }

  if (isArray(data)) {
    return (
      <div className="pl-4 border-l border-stone-200">
        {data.map((item, i) => (
          <div key={i}>
            <TreeNode data={item} path={`${path}[${i}]`} />
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
              <button
                onClick={() => setCollapsed(true)}
                className="text-stone-400 hover:text-orange-400 cursor-pointer text-xs w-4 text-center"
                style={{ fontSize: '10px' }}
              >
                ▼
              </button>
              <span className="text-orange-400">"{key}"</span>
              <span className="text-stone-400">: </span>
              <TreeNode data={val} path={`${path}.${key}`} />
            </div>
          </div>
        ))}
      </div>
    )
  }

  // Primitive
  return (
    <span>
      {typeof data === 'string' ? (
        <span className="text-green-600">"{data}"</span>
      ) : typeof data === 'number' ? (
        <span className="text-blue-600">{String(data)}</span>
      ) : typeof data === 'boolean' ? (
        <span className="text-purple-600">{String(data)}</span>
      ) : data === null ? (
        <span className="text-stone-400">null</span>
      ) : (
        <span>{String(data)}</span>
      )}
    </span>
  )
}