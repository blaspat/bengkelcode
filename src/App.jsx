import { useState, useEffect, useCallback, useRef } from 'react'
import { Wrench, Braces, FileCode, Clock, Regex, Lock, Key, Clock4, Database, FileText, QrCode, GitCompare, Sun, Moon, Search, X } from 'lucide-react'
import JsonLinter from './components/JsonLinter'
import XmlLinter from './components/XmlLinter'
import CronMaker from './components/CronMaker'
import RegexGenerator from './components/RegexGenerator'
import Encryption from './components/Encryption'
import JwtDecoder from './components/JwtDecoder'
import EpochConverter from './components/EpochConverter'
import SqlFormatter from './components/SqlFormatter'
import MarkdownPreview from './components/MarkdownPreview'
import QrGenerator from './components/QrGenerator'
import YamlConverter from './components/YamlConverter'
import DiffTool from './components/DiffTool'
import Footer from './components/Footer'

const tabs = [
  { id: 'json', label: 'JSON Linter', icon: Braces },
  { id: 'xml', label: 'XML Linter', icon: FileCode },
  { id: 'cron', label: 'Cron Maker', icon: Clock },
  { id: 'regex', label: 'Regex Generator', icon: Regex },
  { id: 'encryption', label: 'Encryption', icon: Lock },
  { id: 'jwt', label: 'JWT Decoder', icon: Key },
  { id: 'epoch', label: 'Epoch Converter', icon: Clock4 },
  { id: 'sql', label: 'SQL Formatter', icon: Database },
  { id: 'markdown', label: 'Markdown Preview', icon: FileText },
  { id: 'qr', label: 'QR Generator', icon: QrCode },
  { id: 'yaml', label: 'YAML Converter', icon: Braces },
  { id: 'diff', label: 'Diff Tool', icon: GitCompare },
]

const STORAGE_KEY = 'bengkelcode-state-v1'
const THEME_KEY = 'bengkelcode-theme-v1'

const lightThemeVars = {
  '--bg': '#ffffff',
  '--bg-subtle': '#fafaf9',
  '--bg-card': '#ffffff',
  '--border': '#e7e5e4',
  '--text': '#1c1917',
  '--text-muted': '#78716c',
  '--accent': '#F97316',
  '--accent-hover': '#ea580c',
  '--fab-bg': '#ffffff',
  '--fab-text': '#57534e',
  '--nav-inactive': '#78716c',
  '--nav-hover': '#1c1917',
  '--nav-hover-bg': '#f5f5f4',
}

const darkThemeVars = {
  '--bg': '#0c0c0c',
  '--bg-subtle': '#111111',
  '--bg-card': '#1a1a1a',
  '--border': '#2e2e2e',
  '--text': '#fafaf9',
  '--text-muted': '#a8a29e',
  '--accent': '#F97316',
  '--accent-hover': '#fb923c',
  '--fab-bg': '#1a1a1a',
  '--fab-text': '#a8a29e',
  '--nav-inactive': '#a8a29e',
  '--nav-hover': '#fafaf9',
  '--nav-hover-bg': '#1a1a1a',
}

function applyTheme(theme) {
  const root = document.documentElement
  const vars = theme === 'dark' ? darkThemeVars : lightThemeVars
  Object.entries(vars).forEach(([key, val]) => root.style.setProperty(key, val))
  root.setAttribute('data-theme', theme)
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw)
  } catch {}
  return null
}

function saveState(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch {}
}

export default function App() {
  const [activeTab, setActiveTab] = useState('json')
  const [theme, setTheme] = useState('light')
  const [searchQuery, setSearchQuery] = useState('')
  const [showDropdown, setShowDropdown] = useState(false)
  const searchRef = useRef(null)
  const [jsonState, setJsonState] = useState({ input: '', output: '', error: null })
  const [xmlState, setXmlState] = useState({ input: '', output: '', error: null })
  const [cronState, setCronState] = useState(null)
  const [regexState, setRegexState] = useState({ testString: '', pattern: '', flags: 'g' })
  const [encryptionState, setEncryptionState] = useState({ cipher: 'base64', input: '', output: '', error: null })
  const [jwtState, setJwtState] = useState({ token: '', output: null, error: null })
  const [epochState, setEpochState] = useState({ epoch: '', output: null, error: null })
  const [sqlState, setSqlState] = useState({ input: '', output: '', error: null })
  const [markdownState, setMarkdownState] = useState({ input: '', output: '' })
  const [qrState, setQrState] = useState({ input: '', size: 256 })
  const [yamlState, setYamlState] = useState({ input: '', output: '', error: null })
  const [diffState, setDiffState] = useState({ left: '', right: '', result: null })

  // Init theme from localStorage before first paint
  useEffect(() => {
    const stored = localStorage.getItem(THEME_KEY)
    const initial = stored === 'dark' || stored === 'light' ? stored : 'light'
    setTheme(initial)
    applyTheme(initial)
  }, [])

  // Persist theme changes
  useEffect(() => {
    localStorage.setItem(THEME_KEY, theme)
    applyTheme(theme)
  }, [theme])

  useEffect(() => {
    const saved = loadState()
    if (saved) {
      if (saved.json) setJsonState(saved.json)
      if (saved.xml) setXmlState(saved.xml)
      if (saved.cron) setCronState(saved.cron)
      if (saved.regex) setRegexState(saved.regex)
      if (saved.encryption) setEncryptionState(saved.encryption)
      if (saved.jwt) setJwtState(saved.jwt)
      if (saved.epoch) setEpochState(saved.epoch)
      if (saved.sql) setSqlState(saved.sql)
      if (saved.markdown) setMarkdownState(saved.markdown)
      if (saved.qr) setQrState(saved.qr)
      if (saved.yaml) setYamlState(saved.yaml)
      if (saved.diff) setDiffState(saved.diff)
    } else {
      setCronState({ fields: { minute: '*', hour: '*', day: '*', month: '*', weekday: '*' }, expression: '* * * * *' })
      setRegexState({ testString: '', pattern: '', flags: 'g' })
      setEncryptionState({ cipher: 'base64', input: '', output: '', error: null })
      setJwtState({ token: '', output: null, error: null })
      setEpochState({ epoch: '', output: null, error: null })
      setSqlState({ input: '', output: '', error: null })
      setMarkdownState({ input: '', output: '' })
      setQrState({ input: '', size: 256 })
      setYamlState({ input: '', output: '', error: null })
      setDiffState({ left: '', right: '', result: null })
    }
  }, [])

  useEffect(() => {
    saveState({ json: jsonState, xml: xmlState, cron: cronState, regex: regexState, encryption: encryptionState, jwt: jwtState, epoch: epochState, sql: sqlState, markdown: markdownState, qr: qrState, yaml: yamlState, diff: diffState })
  }, [jsonState, xmlState, cronState, yamlState, diffState])

  const filteredTabs = searchQuery.trim()
    ? tabs.filter(t => t.label.toLowerCase().includes(searchQuery.toLowerCase()))
    : []

  const handleSearchChange = useCallback((e) => {
    setSearchQuery(e.target.value)
    setShowDropdown(true)
  }, [])

  const handleSearchSelect = useCallback((id) => {
    setActiveTab(id)
    setSearchQuery('')
    setShowDropdown(false)
  }, [])

  const handleSearchClear = useCallback(() => {
    setSearchQuery('')
    setShowDropdown(false)
  }, [])

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowDropdown(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  // Keyboard: close on Escape
  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'Escape') {
        setShowDropdown(false)
        setSearchQuery('')
      }
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [])

  const clearAll = useCallback(() => {
    setJsonState({ input: '', output: '', error: null })
    setXmlState({ input: '', output: '', error: null })
    setCronState({ fields: { minute: '*', hour: '*', day: '*', month: '*', weekday: '*' }, expression: '* * * * *' })
    setRegexState({ testString: '', pattern: '', flags: 'g' })
    setEncryptionState({ cipher: 'base64', input: '', output: '', error: null })
    setJwtState({ token: '', output: null, error: null })
    setEpochState({ epoch: '', output: null, error: null })
    setSqlState({ input: '', output: '', error: null })
    setMarkdownState({ input: '', output: '' })
    setQrState({ input: '', size: 256 })
    setYamlState({ input: '', output: '', error: null })
    setDiffState({ left: '', right: '', result: null })
  }, [])

  const isDark = theme === 'dark'

  return (
    <div className="min-h-svh flex flex-col" style={{ backgroundColor: 'var(--bg)', color: 'var(--text)' }}>
      <header className="flex items-center gap-3 px-6 py-4 border-b" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg)' }}>
        <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#F97316' }}>
          <Wrench className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-base font-semibold leading-none" style={{ color: 'var(--text)' }}>bengkelcode</h1>
          <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>workshop for developers</p>
        </div>
        <div className="ml-auto flex items-center gap-2">
          {/* Search */}
          <div ref={searchRef} className="relative">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" style={{ color: 'var(--text-muted)' }} />
              <input
                type="text"
                value={searchQuery}
                onChange={handleSearchChange}
                onFocus={() => searchQuery.trim() && setShowDropdown(true)}
                placeholder="Search tools..."
                className="w-48 h-9 pl-9 pr-8 rounded-xl text-sm bg-transparent border transition-colors"
                style={{ color: 'var(--text)', borderColor: 'var(--border)', backgroundColor: 'var(--bg-subtle)' }}
              />
              {searchQuery && (
                <button
                  onClick={handleSearchClear}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-5 h-5 rounded flex items-center justify-center"
                  style={{ color: 'var(--text-muted)' }}
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
            {/* Dropdown */}
            {showDropdown && filteredTabs.length > 0 && (
              <div
                className="absolute top-full left-0 right-0 mt-1.5 rounded-xl border overflow-hidden z-50"
                style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-card)' }}
              >
                {filteredTabs.map(({ id, label, icon: Icon }) => (
                  <button
                    key={id}
                    onClick={() => handleSearchSelect(id)}
                    className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm text-left transition-colors hover:bg-stone-100"
                    style={{ color: 'var(--text)' }}
                  >
                    <Icon className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--accent)' }} />
                    {label}
                  </button>
                ))}
              </div>
            )}
          </div>

          <button
            onClick={() => setTheme(t => t === 'light' ? 'dark' : 'light')}
            title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            className="w-9 h-9 rounded-xl flex items-center justify-center transition-colors"
            style={{ backgroundColor: 'var(--fab-bg)', color: 'var(--fab-text)', border: '1px solid var(--border)' }}
          >
            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
        </div>
      </header>

      <nav className="flex gap-1 px-4 pt-4 overflow-x-auto">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors whitespace-nowrap ${
              activeTab === id
                ? 'text-white'
                : ''
            }`}
            style={
              activeTab === id
                ? { backgroundColor: '#F97316' }
                : { color: 'var(--nav-inactive)', backgroundColor: 'transparent' }
            }
            onMouseEnter={e => {
              if (activeTab !== id) {
                e.currentTarget.style.color = 'var(--nav-hover)'
                e.currentTarget.style.backgroundColor = 'var(--nav-hover-bg)'
              }
            }}
            onMouseLeave={e => {
              if (activeTab !== id) {
                e.currentTarget.style.color = 'var(--nav-inactive)'
                e.currentTarget.style.backgroundColor = 'transparent'
              }
            }}
          >
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </nav>

      <main className="flex-1 px-4 pb-6">
        {activeTab === 'json' && <JsonLinter state={jsonState} onStateChange={setJsonState} onClear={clearAll} />}
        {activeTab === 'xml' && <XmlLinter state={xmlState} onStateChange={setXmlState} onClear={clearAll} />}
        {activeTab === 'cron' && cronState && <CronMaker state={cronState} onStateChange={setCronState} onClear={clearAll} />}
        {activeTab === 'regex' && <RegexGenerator state={regexState} onStateChange={setRegexState} onClear={clearAll} />}
        {activeTab === 'encryption' && <Encryption state={encryptionState} onStateChange={setEncryptionState} onClear={clearAll} />}
        {activeTab === 'jwt' && <JwtDecoder state={jwtState} onStateChange={setJwtState} onClear={clearAll} />}
        {activeTab === 'epoch' && <EpochConverter state={epochState} onStateChange={setEpochState} onClear={clearAll} />}
        {activeTab === 'sql' && <SqlFormatter state={sqlState} onStateChange={setSqlState} onClear={clearAll} />}
        {activeTab === 'markdown' && <MarkdownPreview state={markdownState} onStateChange={setMarkdownState} onClear={clearAll} />}
        {activeTab === 'qr' && qrState && <QrGenerator state={qrState} onStateChange={setQrState} onClear={clearAll} />}
        {activeTab === 'yaml' && <YamlConverter state={yamlState} onStateChange={setYamlState} onClear={clearAll} />}
        {activeTab === 'diff' && <DiffTool state={diffState} onStateChange={setDiffState} onClear={clearAll} />}
      </main>

      <Footer theme={theme} />
    </div>
  )
}