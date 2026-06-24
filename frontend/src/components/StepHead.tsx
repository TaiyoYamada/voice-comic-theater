import type { ReactNode } from 'react'
import { Ruby } from './Furigana'

/** 画面の見出し（タイトル＋ヒント）。タイトルはふりがな記法で渡す。番号は付けない。 */
export function StepHead({ title, hint }: { title: string; hint?: ReactNode }) {
  return (
    <>
      <h2 className="step-title">
        <Ruby text={title} />
      </h2>
      {hint && <p className="step-hint">{hint}</p>}
    </>
  )
}
