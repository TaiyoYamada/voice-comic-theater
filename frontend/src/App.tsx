import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from './state'
import { ensureAssignment, assignFreshServer } from './lib/registry'
import { ServerBadge } from './components/ServerBadge'
import { Sidebar } from './components/Sidebar'
import { Ruby } from './components/Furigana'
import { SECTIONS, type SectionMeta } from './ui/labels'
import { Home } from './steps/Home'
import { Editor } from './steps/Editor'
import { Record } from './steps/Record'
import { Transcribe } from './steps/Transcribe'
import { GenerateVoices } from './steps/GenerateVoices'
import { SelfRecordComas } from './steps/SelfRecordComas'
import { Theater } from './steps/Theater'
import type { VoiceMode } from './types'

interface Section {
  meta: SectionMeta
  Comp: () => JSX.Element
}

/** モードごとの画面構成（順番なし。サイドバーで自由に行き来できる）。 */
function sectionsForMode(mode: VoiceMode): Section[] {
  const editor: Section = { meta: SECTIONS.editor, Comp: Editor }
  const theater: Section = { meta: SECTIONS.theater, Comp: Theater }
  if (mode === 'self-record')
    return [editor, { meta: SECTIONS.record, Comp: SelfRecordComas }, theater]
  if (mode === 'browser-tts') return [editor, theater]
  return [
    editor,
    { meta: SECTIONS.record, Comp: Record },
    { meta: SECTIONS.transcribe, Comp: Transcribe },
    { meta: SECTIONS.generate, Comp: GenerateVoices },
    theater,
  ]
}

export function App() {
  const navigate = useNavigate()
  const { assignment, setAssignment, mode, setMode } = useApp()
  const [started, setStarted] = useState(false)
  const [active, setActive] = useState('editor')
  const [connecting, setConnecting] = useState(false)
  const [connError, setConnError] = useState<string | null>(null)

  const connect = useCallback(async () => {
    if (mode !== 'ai') return
    setConnecting(true)
    setConnError(null)
    const result = await ensureAssignment()
    if (result.status === 'ok') setAssignment(result.assignment)
    else {
      setAssignment(null)
      setConnError(result.error)
    }
    setConnecting(false)
  }, [mode, setAssignment])

  useEffect(() => {
    void connect()
  }, [connect])

  async function reassign() {
    setConnecting(true)
    setConnError(null)
    try {
      setAssignment(await assignFreshServer(assignment?.serverId))
    } catch (e) {
      setAssignment(null)
      setConnError(e instanceof Error ? e.message : String(e))
    } finally {
      setConnecting(false)
    }
  }

  const sections = sectionsForMode(mode)
  const activeSection = sections.find((s) => s.meta.key === active) ?? sections[0]
  const ActiveComp = activeSection.Comp

  if (!started) return <Home onStart={() => setStarted(true)} />

  return (
    <div className="layout">
      <Sidebar
        items={sections.map((s) => s.meta)}
        active={activeSection.meta.key}
        onSelect={setActive}
      />

      <main className="main">
        <ServerBadge assignment={assignment} mode={mode} connecting={connecting} />

        {mode === 'ai' && connError && (
          <div className="banner err">
            <div className="row" style={{ display: 'flex', gap: 8, marginTop: 4, flexWrap: 'wrap' }}>
              <button className="btn secondary" onClick={() => void reassign()}>
                <Ruby text="別(べつ)のサーバーにつなぐ" />
              </button>
              <button className="btn secondary" onClick={() => setMode('self-record')}>
                <Ruby text="自分(じぶん)で録音(ろくおん)モード" />
              </button>
              <button className="btn secondary" onClick={() => setMode('browser-tts')}>
                <Ruby text="読(よ)み上(あ)げモード" />
              </button>
            </div>
          </div>
        )}

        <ActiveComp />
      </main>

      {/* 子どもが触りにくい右上の隠し導線（先生メニュー） */}
      <button className="gear" aria-label="先生用せってい" onClick={() => navigate('/admin')}>
        ⚙
      </button>
    </div>
  )
}
