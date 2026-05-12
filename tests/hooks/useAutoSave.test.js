import { describe, it, expect, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useAutoSave } from '../../src/hooks/useAutoSave'

vi.useFakeTimers()

describe('useAutoSave', () => {
  it('1초 뒤 저장 함수 1회 호출', async () => {
    const saveFn = vi.fn().mockResolvedValue(undefined)
    const { result } = renderHook(() => useAutoSave(saveFn, 1000))

    act(() => result.current[0]())
    expect(saveFn).not.toHaveBeenCalled()

    await act(async () => vi.advanceTimersByTime(1000))
    expect(saveFn).toHaveBeenCalledTimes(1)
  })

  it('연속 호출 시 마지막 1회만 실행 (디바운스)', async () => {
    const saveFn = vi.fn().mockResolvedValue(undefined)
    const { result } = renderHook(() => useAutoSave(saveFn, 1000))

    act(() => { result.current[0](); result.current[0](); result.current[0]() })
    await act(async () => vi.advanceTimersByTime(1000))
    expect(saveFn).toHaveBeenCalledTimes(1)
  })
})
