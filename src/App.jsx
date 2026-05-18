import { useState } from 'react'
import { Wrench, Braces, FileCode, Clock } from 'lucide-react'
import JsonLinter from './components/JsonLinter'
import XmlLinter from './components/XmlLinter'
import CronMaker from './components/CronMaker'

const tabs = [
  { id: 'json', label: 'JSON Linter', icon: Braces },
  { id: 'xml', label: 'XML Linter', icon: FileCode },
  { id: 'cron', label: 'Cron Maker', icon: Clock },
]

export default function App() {
  const [activeTab, setActiveTab] = useState('json')

  return (
    <div className="min-h-svh flex flex-col">
      {/* Header */}
      <header className="flex items-center gap-3 px-6 py-4 border-b border-stone-200">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#F97316' }}>
          <Wrench className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-base font-semibold text-stone-900 leading-none">bengkelcode</h1>
          <p className="text-xs text-stone-400 mt-0.5">workshop for developers</p>
        </div>
      </header>

      {/* Tab Bar */}
      <nav className="flex gap-1 px-4 pt-4">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
              activeTab === id
                ? 'text-white'
                : 'text-stone-500 hover:text-stone-700 hover:bg-stone-100'
            }`}
            style={activeTab === id ? { backgroundColor: '#F97316' } : {}}
          >
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </nav>

      {/* Tool Content */}
      <main className="flex-1 px-4 pb-6">
        {activeTab === 'json' && <JsonLinter />}
        {activeTab === 'xml' && <XmlLinter />}
        {activeTab === 'cron' && <CronMaker />}
      </main>
    </div>
  )
}