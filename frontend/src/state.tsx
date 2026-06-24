// アプリ全体の状態管理（React Context）。

import { createContext, useContext, useMemo, useState, type ReactNode } from 'react'
import { COMA_COUNT, MAX_LINES_PER_COMA, type Assignment, type Coma, type Line, type VoiceMode } from './types'
import { loadMode, saveMode } from './lib/storage'

let _seq = 0
function newLine(text = ''): Line {
  return { id: `l${++_seq}`, text, voiceUrl: null }
}
function emptyComas(): Coma[] {
  return Array.from({ length: COMA_COUNT }, () => ({ panelId: null, lines: [newLine()] }))
}

function moveItem<T>(arr: T[], index: number, dir: -1 | 1): T[] {
  const j = index + dir
  if (j < 0 || j >= arr.length) return arr
  const next = arr.slice()
  ;[next[index], next[j]] = [next[j], next[index]]
  return next
}

export interface AppState {
  // 接続先
  assignment: Assignment | null
  setAssignment: (a: Assignment | null) => void

  // モード（AI / 自分で録音 / 読み上げ）
  mode: VoiceMode
  setMode: (m: VoiceMode) => void

  // 作品データ（コマ＝写真＋セリフ複数）
  comas: Coma[]
  setComaPanel: (comaIndex: number, panelId: string) => void
  moveComa: (comaIndex: number, dir: -1 | 1) => void
  addLine: (comaIndex: number) => void
  updateLine: (comaIndex: number, lineId: string, text: string) => void
  deleteLine: (comaIndex: number, lineId: string) => void
  moveLine: (comaIndex: number, lineId: string, dir: -1 | 1) => void
  /** lineId に対応する音声URLをセットする。 */
  setLineVoice: (lineId: string, url: string | null) => void
  /** すべてのセリフの音声URLをクリアする。 */
  clearVoices: () => void

  // 録音（参照音声）
  recordingBlob: Blob | null
  recordingUrl: string | null
  setRecording: (blob: Blob | null) => void

  // 文字起こし結果（編集可能・TTSの参照テキスト）
  referenceText: string
  setReferenceText: (t: string) => void
}

const Ctx = createContext<AppState | null>(null)

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [assignment, setAssignment] = useState<Assignment | null>(null)
  const [mode, setModeState] = useState<VoiceMode>(() => loadMode())
  const [comas, setComas] = useState<Coma[]>(() => emptyComas())
  const [recordingBlob, setRecordingBlob] = useState<Blob | null>(null)
  const [recordingUrl, setRecordingUrl] = useState<string | null>(null)
  const [referenceText, setReferenceText] = useState('')

  function mapComa(comaIndex: number, fn: (c: Coma) => Coma) {
    setComas((prev) => prev.map((c, i) => (i === comaIndex ? fn(c) : c)))
  }

  const value = useMemo<AppState>(
    () => ({
      assignment,
      setAssignment,
      mode,
      setMode: (m) => {
        setModeState(m)
        saveMode(m)
      },
      comas,
      setComaPanel: (comaIndex, panelId) => mapComa(comaIndex, (c) => ({ ...c, panelId })),
      moveComa: (comaIndex, dir) => setComas((prev) => moveItem(prev, comaIndex, dir)),
      addLine: (comaIndex) =>
        mapComa(comaIndex, (c) =>
          c.lines.length >= MAX_LINES_PER_COMA ? c : { ...c, lines: [...c.lines, newLine()] },
        ),
      updateLine: (comaIndex, lineId, text) =>
        mapComa(comaIndex, (c) => ({
          ...c,
          lines: c.lines.map((l) => (l.id === lineId ? { ...l, text } : l)),
        })),
      deleteLine: (comaIndex, lineId) =>
        mapComa(comaIndex, (c) => {
          const lines = c.lines.filter((l) => l.id !== lineId)
          // 0個にはせず、最低1つの空セリフを残す。
          return { ...c, lines: lines.length ? lines : [newLine()] }
        }),
      moveLine: (comaIndex, lineId, dir) =>
        mapComa(comaIndex, (c) => {
          const idx = c.lines.findIndex((l) => l.id === lineId)
          return idx < 0 ? c : { ...c, lines: moveItem(c.lines, idx, dir) }
        }),
      setLineVoice: (lineId, url) =>
        setComas((prev) =>
          prev.map((c) => ({
            ...c,
            lines: c.lines.map((l) => (l.id === lineId ? { ...l, voiceUrl: url } : l)),
          })),
        ),
      clearVoices: () =>
        setComas((prev) =>
          prev.map((c) => ({ ...c, lines: c.lines.map((l) => ({ ...l, voiceUrl: null })) })),
        ),
      recordingBlob,
      recordingUrl,
      setRecording: (blob) => {
        setRecordingBlob(blob)
        setRecordingUrl((prevUrl) => {
          if (prevUrl) URL.revokeObjectURL(prevUrl)
          return blob ? URL.createObjectURL(blob) : null
        })
      },
      referenceText,
      setReferenceText,
    }),
    [assignment, mode, comas, recordingBlob, recordingUrl, referenceText],
  )

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useApp(): AppState {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useApp must be used within AppStateProvider')
  return ctx
}
