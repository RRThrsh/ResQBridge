import { useMemo, useState } from 'react'

export const ADMIN_PAGE_SIZE_OPTIONS = [10, 30, 50, 100] as const
export type AdminPageSize = (typeof ADMIN_PAGE_SIZE_OPTIONS)[number]

type Options = {
  defaultPageSize?: AdminPageSize
  resetKey?: string
}

export function usePaginatedRows<T>(rows: T[], options: Options = {}) {
  const { defaultPageSize = 10, resetKey = '' } = options
  const [pageSize, setPageSizeState] = useState<AdminPageSize>(defaultPageSize)
  const [page, setPage] = useState(1)

  const totalItems = rows.length
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize) || 1)
  const currentPage = Math.min(page, totalPages)

  const resetToken = `${resetKey}|${totalItems}`
  const [prevResetToken, setPrevResetToken] = useState(resetToken)
  if (resetToken !== prevResetToken) {
    setPrevResetToken(resetToken)
    setPage(1)
  }

  const setPageSize = (size: AdminPageSize) => {
    setPageSizeState(size)
    setPage(1)
  }

  const paginatedRows = useMemo(() => {
    const start = (currentPage - 1) * pageSize
    return rows.slice(start, start + pageSize)
  }, [rows, currentPage, pageSize])

  const rangeStart = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1
  const rangeEnd = Math.min(currentPage * pageSize, totalItems)

  return {
    paginatedRows,
    page: currentPage,
    setPage,
    pageSize,
    setPageSize,
    totalPages,
    totalItems,
    rangeStart,
    rangeEnd,
    pageSizeOptions: ADMIN_PAGE_SIZE_OPTIONS,
    canGoPrev: currentPage > 1,
    canGoNext: currentPage < totalPages,
  }
}
