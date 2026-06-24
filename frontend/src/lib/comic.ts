import type { Coma, Line } from '../types'

/** コマ順 → セリフ順に並べた、全セリフを返す（生成・再生で使う）。 */
export function flattenLines(comas: Coma[]): { comaIndex: number; line: Line }[] {
  const out: { comaIndex: number; line: Line }[] = []
  comas.forEach((c, comaIndex) => c.lines.forEach((line) => out.push({ comaIndex, line })))
  return out
}
