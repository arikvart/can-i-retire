import { describe, it, expect, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useLocalStorage, clearLocalStorage } from './useLocalStorage'

// localStorage is replaced in src/test/setup.ts with an in-memory mock
const ls = window.localStorage

describe('useLocalStorage', () => {
  it('returns initial value when nothing stored', () => {
    const { result } = renderHook(() => useLocalStorage('key1', 42))
    expect(result.current[0]).toBe(42)
  })

  it('returns stored value when present', () => {
    ls.setItem('key2', JSON.stringify(99))
    const { result } = renderHook(() => useLocalStorage('key2', 0))
    expect(result.current[0]).toBe(99)
  })

  it('updates value and persists to localStorage', () => {
    const { result } = renderHook(() => useLocalStorage('key3', 0))
    act(() => result.current[1](123))
    expect(result.current[0]).toBe(123)
    expect(ls.getItem('key3')).toBe(JSON.stringify(123))
  })

  it('works with object values', () => {
    const { result } = renderHook(() => useLocalStorage('key4', { name: 'Alice' }))
    act(() => result.current[1]({ name: 'Bob' }))
    expect(result.current[0]).toEqual({ name: 'Bob' })
  })

  it('returns initial value when JSON parse fails', () => {
    ls.setItem('key5', 'invalid-json{')
    const { result } = renderHook(() => useLocalStorage('key5', 'default'))
    expect(result.current[0]).toBe('default')
  })

  it('still updates state when localStorage.setItem throws', () => {
    vi.spyOn(ls, 'setItem').mockImplementation(() => {
      throw new Error('QuotaExceededError')
    })
    const { result } = renderHook(() => useLocalStorage('key6', 0))
    act(() => result.current[1](777))
    expect(result.current[0]).toBe(777)
  })

  it('returns initial value when getItem throws', () => {
    vi.spyOn(ls, 'getItem').mockImplementation(() => {
      throw new Error('SecurityError')
    })
    const { result } = renderHook(() => useLocalStorage('key7', 'safe'))
    expect(result.current[0]).toBe('safe')
  })
})

describe('clearLocalStorage', () => {
  it('removes the key from localStorage', () => {
    ls.setItem('remove-key', JSON.stringify(42))
    clearLocalStorage('remove-key')
    expect(ls.getItem('remove-key')).toBeNull()
  })

  it('does not throw if key does not exist', () => {
    expect(() => clearLocalStorage('nonexistent')).not.toThrow()
  })

  it('silently handles removeItem throwing', () => {
    vi.spyOn(ls, 'removeItem').mockImplementation(() => {
      throw new Error('SecurityError')
    })
    expect(() => clearLocalStorage('any-key')).not.toThrow()
  })
})
