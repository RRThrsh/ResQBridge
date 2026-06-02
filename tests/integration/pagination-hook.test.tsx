import { renderHook, act } from '@testing-library/react'
import { usePaginatedRows } from '@/hooks/usePaginatedRows'

describe('usePaginatedRows integration', () => {
  const rows = Array.from({ length: 25 }, (_, i) => `row-${i + 1}`)

  it('paginates rows with default page size', () => {
    const { result } = renderHook(() => usePaginatedRows(rows))

    expect(result.current.paginatedRows).toHaveLength(10)
    expect(result.current.totalPages).toBe(3)
    expect(result.current.rangeStart).toBe(1)
    expect(result.current.rangeEnd).toBe(10)
  })

  it('navigates pages and respects boundaries', () => {
    const { result } = renderHook(() => usePaginatedRows(rows))

    act(() => result.current.setPage(2))
    expect(result.current.page).toBe(2)
    expect(result.current.paginatedRows[0]).toBe('row-11')

    act(() => result.current.setPage(99))
    expect(result.current.page).toBe(3)
    expect(result.current.canGoNext).toBe(false)
  })

  it('resets to page 1 when page size changes', () => {
    const { result } = renderHook(() => usePaginatedRows(rows))

    act(() => result.current.setPage(3))
    act(() => result.current.setPageSize(50))

    expect(result.current.page).toBe(1)
    expect(result.current.paginatedRows).toHaveLength(25)
  })
})
