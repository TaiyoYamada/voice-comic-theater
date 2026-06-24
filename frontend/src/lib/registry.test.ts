import { describe, expect, it } from 'vitest'
import { rankServers } from './registry'
import type { ServerInfo } from '../types'

function makeServer(over: Partial<ServerInfo>): ServerInfo {
  return {
    serverId: 'colab-x',
    color: 'blue',
    label: 'テスト',
    apiUrl: 'https://example.com',
    enabled: true,
    capacity: 2,
    assignedCount: 0,
    lastSeen: String(Date.now()),
    ...over,
  }
}

describe('rankServers', () => {
  it('enabled=false は除外する', () => {
    const list = rankServers([makeServer({ serverId: 'a', enabled: false })])
    expect(list).toHaveLength(0)
  })

  it('満員でも除外しない（ソフト上限）', () => {
    // capacity を超えていても候補から外さない（割り当て不能を防ぐ）。
    const list = rankServers([makeServer({ serverId: 'a', capacity: 2, activeCount: 5 })])
    expect(list).toHaveLength(1)
  })

  it('lastSeen が古い（heartbeat 切れ）は除外する', () => {
    const old = String(Date.now() - 10 * 60 * 1000) // 10分前
    const list = rankServers([makeServer({ serverId: 'a', lastSeen: old })])
    expect(list).toHaveLength(0)
  })

  it('在席数（activeCount）が少ない順に並べる', () => {
    const list = rankServers([
      makeServer({ serverId: 'busy', activeCount: 3 }),
      makeServer({ serverId: 'free', activeCount: 0 }),
      makeServer({ serverId: 'mid', activeCount: 1 }),
    ])
    expect(list.map((s) => s.serverId)).toEqual(['free', 'mid', 'busy'])
  })

  it('activeCount が無ければ assignedCount で代替する', () => {
    const list = rankServers([
      makeServer({ serverId: 'b', assignedCount: 2 }),
      makeServer({ serverId: 'a', assignedCount: 0 }),
    ])
    expect(list.map((s) => s.serverId)).toEqual(['a', 'b'])
  })

  it('lastSeen は epoch 数値文字列でも ISO 文字列でも扱える', () => {
    const iso = new Date().toISOString()
    const list = rankServers([makeServer({ serverId: 'iso', lastSeen: iso })])
    expect(list).toHaveLength(1)
  })
})
