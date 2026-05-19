import { useState } from 'react'

function getChildCount(node) {
  return node.childNodes.length
}

function XmlNode({ node }) {
  const [collapsed, setCollapsed] = useState(false)

  if (node.nodeType === Node.TEXT_NODE) {
    const text = node.textContent.trim()
    if (!text) return null
    return (
      <div className="pl-4 border-l border-stone-200">
        <span className="text-green-600">"{text}"</span>
      </div>
    )
  }

  if (node.nodeType === Node.ELEMENT_NODE) {
    const tagName = node.tagName.toLowerCase()
    const children = Array.from(node.childNodes)
    const elementChildren = children.filter(c => c.nodeType !== Node.TEXT_NODE || c.textContent.trim())
    const textContent = children
      .filter(c => c.nodeType === Node.TEXT_NODE)
      .map(c => c.textContent.trim())
      .filter(Boolean)
      .join(' ')

    const hasChildren = elementChildren.length > 0
    const childCount = elementChildren.length

    return (
      <div className="pl-4 border-l border-stone-200">
        <div className="flex items-center gap-1 flex-wrap">
          <button
            onClick={() => setCollapsed(c => !c)}
            className="text-stone-400 hover:text-orange-400 cursor-pointer text-xs w-4 text-center flex-shrink-0"
            style={{ fontSize: '10px' }}
          >
            {collapsed ? '▶' : '▼'}
          </button>
          <span className="text-orange-500">&lt;{tagName}</span>
          {Array.from(node.attributes).map(attr => (
            <span key={attr.name} className="text-stone-500">
              <span className="text-blue-400"> {attr.name}</span>
              <span className="text-stone-400">="</span>
              <span className="text-green-500">{attr.value}</span>
              <span className="text-stone-400">"</span>
            </span>
          ))}
          {collapsed ? (
            <span>
              <span className="text-orange-500">&gt;</span>
              <span className="text-stone-400 ml-1 text-xs">
                {childCount > 0 ? `(${childCount} ${childCount === 1 ? 'child' : 'children'})` : textContent && `"${textContent}"`}
              </span>
            </span>
          ) : (
            <span className="text-orange-500">&gt;</span>
          )}
        </div>

        {!collapsed && (
          <>
            {textContent && !hasChildren && (
              <div className="pl-6">
                <span className="text-green-600">"{textContent}"</span>
              </div>
            )}
            {elementChildren.map((child, i) => (
              <XmlNode key={i} node={child} />
            ))}
            <div className="flex items-center gap-1">
              <span className="text-stone-300 w-4 text-center" style={{ fontSize: '10px' }}></span>
              <span className="text-orange-500">&lt;/{tagName}&gt;</span>
            </div>
          </>
        )}
      </div>
    )
  }

  return null
}

export default function XmlTree({ doc }) {
  if (!doc) return null

  const root = doc.documentElement

  return (
    <div className="font-mono text-sm">
      <XmlNode node={root} />
    </div>
  )
}