import { useState } from 'react'
import { StepHead } from '../components/StepHead'
import { Ruby } from '../components/Furigana'
import { Icon } from '../components/icons'
import { useApp } from '../state'
import { transcribe } from '../lib/api'

/** ろくおんを文字にする（文字起こし→編集）。 */
export function Transcribe() {
  const { assignment, recordingBlob, referenceText, setReferenceText } = useApp()
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [done, setDone] = useState(false)

  async function run() {
    if (!assignment || !recordingBlob) return
    setBusy(true)
    setError(null)
    try {
      const res = await transcribe(assignment.apiUrl, recordingBlob)
      setReferenceText(res.text)
      setDone(true)
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
    } finally {
      setBusy(false)
    }
  }

  return (
    <div>
      <StepHead
        title="文字(もじ)にする"
        hint={<Ruby text="録音(ろくおん)した声(こえ)を文字(もじ)にしてみよう。違(ちが)うところは直(なお)せるよ。" />}
      />

      {!recordingBlob && (
        <div className="banner warn">
          <Ruby text="さきに「録音(ろくおん)」で声(こえ)をろくおんしてね。" />
        </div>
      )}
      {error && <div className="banner err">{error}</div>}

      <div className="card center">
        <button className="btn big icon-btn" onClick={run} disabled={busy || !assignment || !recordingBlob}>
          <Icon name="text" size={22} />
          <Ruby text={busy ? '文字(もじ)にしているよ…' : done ? 'もう一度(いちど)文字(もじ)にする' : '文字(もじ)にする'} />
        </button>
        {busy && <div className="spinner" />}
      </div>

      {(done || referenceText) && (
        <div className="card">
          <p className="step-hint" style={{ marginTop: 0 }}>
            <Ruby text="直(なお)したいところはここで書(か)き直(なお)してね" />
          </p>
          <textarea rows={3} value={referenceText} onChange={(e) => setReferenceText(e.target.value)} />
        </div>
      )}
    </div>
  )
}
