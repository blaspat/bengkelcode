import { useState, useEffect, useCallback } from 'react'
import { Wrench, Braces, FileCode, Clock, Regex, Lock, Key, Clock4, Database, FileText, QrCode } from 'lucide-react'
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
]

const STORAGE_KEY = 'bengkelcode-state-v1'

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
  const [jsonState, setJsonState] = useState({ input: '', output: '', error: null })
  const [xmlState, setXmlState] = useState({ input: '', output: '', error: null })
  const [cronState, setCronState] = useState(null)
  const [regexState, setRegexState] = useState({ testString: '', pattern: '', flags: 'g' })
  const [encryptionState, setEncryptionState] = useState({ cipher: 'base64', input: '', output: '', error: null })
  const [jwtState, setJwtState] = useState({ token: '', output: null, error: null })
  const [epochState, setEpochState] = useState({ epoch: '', output: null, error: null })
  const [sqlState, setSqlState] = useState({ input: '', output: '', error: null })
  const [markdownState, setMarkdownState] = useState({ input: '', output: '' }) // null = not initialized yet
  const [qrState, setQrState] = useState({ input: '', size: 256 })

  // Hydrate from localStorage on mount
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
    } else {
      setCronState({ fields: { minute: '*', hour: '*', day: '*', month: '*', weekday: '*' }, expression: '* * * * *' })
      setRegexState({ testString: '', pattern: '', flags: 'g' })
      setEncryptionState({ cipher: 'base64', input: '', output: '', error: null })
      setJwtState({ token: '', output: null, error: null })
      setEpochState({ epoch: '', output: null, error: null })
      setSqlState({ input: '', output: '', error: null })
      setMarkdownState({ input: '', output: '' })
      setQrState({ input: '', size: 256 })
    }
  }, [])

  // Persist on every state change
  useEffect(() => {
    saveState({ json: jsonState, xml: xmlState, cron: cronState, regex: regexState, encryption: encryptionState, jwt: jwtState, epoch: epochState, sql: sqlState, markdown: markdownState, qr: qrState })
  }, [jsonState, xmlState, cronState])

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
  }, [])

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
        {activeTab === 'json' && (
          <JsonLinter
            state={jsonState}
            onStateChange={setJsonState}
            onClear={clearAll}
          />
        )}
        {activeTab === 'xml' && (
          <XmlLinter
            state={xmlState}
            onStateChange={setXmlState}
            onClear={clearAll}
          />
        )}
        {activeTab === 'cron' && cronState && (
          <CronMaker
            state={cronState}
            onStateChange={setCronState}
            onClear={clearAll}
          />
        )}
        {activeTab === 'regex' && (
          <RegexGenerator
            state={regexState}
            onStateChange={setRegexState}
            onClear={clearAll}
          />
        )}
        {activeTab === 'encryption' && (
          <Encryption
            state={encryptionState}
            onStateChange={setEncryptionState}
            onClear={clearAll}
          />
        )}
        {activeTab === 'jwt' && (
          <JwtDecoder
            state={jwtState}
            onStateChange={setJwtState}
            onClear={clearAll}
          />
        )}
        {activeTab === 'epoch' && (
          <EpochConverter
            state={epochState}
            onStateChange={setEpochState}
            onClear={clearAll}
          />
        )}
        {activeTab === 'sql' && (
          <SqlFormatter
            state={sqlState}
            onStateChange={setSqlState}
            onClear={clearAll}
          />
        )}
        {activeTab === 'markdown' && (
          <MarkdownPreview
            state={markdownState}
            onStateChange={setMarkdownState}
            onClear={clearAll}
          />
        )}
        {activeTab === 'qr' && qrState && (
          <QrGenerator
            state={qrState}
            onStateChange={setQrState}
            onClear={clearAll}
          />
        )}
      </main>

      <Footer />
    </div>
  )
}