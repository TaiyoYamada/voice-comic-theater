// サイドバーの項目ラベル（漢字＋ふりがな記法）とアイコン名。

import type { IconName } from '../components/icons'

export interface SectionMeta {
  key: string
  label: string
  icon: IconName
}

export const SECTIONS = {
  editor: { key: 'editor', label: 'へんしゅう', icon: 'edit' },
  record: { key: 'record', label: '録音(ろくおん)', icon: 'mic' },
  transcribe: { key: 'transcribe', label: '文字(もじ)', icon: 'text' },
  generate: { key: 'generate', label: 'AI声(こえ)', icon: 'sparkles' },
  theater: { key: 'theater', label: '劇場(げきじょう)', icon: 'film' },
} satisfies Record<string, SectionMeta>
