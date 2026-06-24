import { beforeEach, describe, expect, it } from 'vitest'
import { getGasUrl, getServerFreshSeconds, setGasUrlOverride } from './config'

describe('config', () => {
  beforeEach(() => localStorage.clear())

  it('getServerFreshSeconds は既定で正の秒数を返す', () => {
    expect(getServerFreshSeconds()).toBeGreaterThan(0)
  })

  it('GAS URL を localStorage で上書きできる', () => {
    setGasUrlOverride('https://override.example/exec')
    expect(getGasUrl()).toBe('https://override.example/exec')
  })

  it('空文字で上書きを解除できる', () => {
    setGasUrlOverride('https://override.example/exec')
    setGasUrlOverride('')
    expect(getGasUrl()).toBe(import.meta.env.VITE_GAS_URL?.trim() ?? '')
  })
})
