// コエコミのマスコット（しゃべる吹き出しキャラ）。教育系キッズアプリ定番の
// 「キャラが語りかける」演出のための簡易キャラクター。画像アセット不要のSVG。

export function Mascot({ size = 132 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 120 120"
      role="img"
      aria-label="コエコミのキャラクター"
    >
      {/* しっぽ（吹き出しの口） */}
      <path d="M42 84 L40 106 L64 86 Z" fill="#ffffff" />
      {/* 吹き出し本体 */}
      <rect x="14" y="16" width="92" height="74" rx="26" fill="#ffffff" stroke="#ff7a1a" strokeWidth="5" />
      {/* ほっぺ */}
      <circle cx="40" cy="60" r="6" fill="#ffcdb8" />
      <circle cx="80" cy="60" r="6" fill="#ffcdb8" />
      {/* 目 */}
      <circle cx="47" cy="48" r="6" fill="#2b2b2b" />
      <circle cx="73" cy="48" r="6" fill="#2b2b2b" />
      <circle cx="49" cy="46" r="2" fill="#ffffff" />
      <circle cx="75" cy="46" r="2" fill="#ffffff" />
      {/* 笑顔 */}
      <path d="M48 62 Q60 74 72 62" fill="none" stroke="#2b2b2b" strokeWidth="4.5" strokeLinecap="round" />
      {/* 声（サウンドウェーブ） */}
      <path d="M100 44 q9 8 0 24" fill="none" stroke="#22c1c3" strokeWidth="4" strokeLinecap="round" />
      <path d="M108 38 q14 14 0 36" fill="none" stroke="#22c1c3" strokeWidth="4" strokeLinecap="round" opacity="0.6" />
    </svg>
  )
}
