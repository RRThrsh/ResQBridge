import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { AdminPageSize } from '@/hooks/usePaginatedRows'
import { usePaginatedRows } from '@/hooks/usePaginatedRows'

type PaginationState = ReturnType<typeof usePaginatedRows<unknown>>

type Props = {
  page: number
  setPage: (page: number) => void
  pageSize: AdminPageSize
  setPageSize: (size: AdminPageSize) => void
  totalPages: number
  totalItems: number
  rangeStart: number
  rangeEnd: number
  pageSizeOptions: readonly AdminPageSize[]
  canGoPrev: boolean
  canGoNext: boolean
}

export function AdminTablePaginationBar({ pagination }: { pagination: PaginationState }) {
  return (
    <AdminTablePagination
      page={pagination.page}
      setPage={pagination.setPage}
      pageSize={pagination.pageSize}
      setPageSize={pagination.setPageSize}
      totalPages={pagination.totalPages}
      totalItems={pagination.totalItems}
      rangeStart={pagination.rangeStart}
      rangeEnd={pagination.rangeEnd}
      pageSizeOptions={pagination.pageSizeOptions}
      canGoPrev={pagination.canGoPrev}
      canGoNext={pagination.canGoNext}
    />
  )
}

export function AdminTablePagination({
  page,
  setPage,
  pageSize,
  setPageSize,
  totalPages,
  totalItems,
  rangeStart,
  rangeEnd,
  pageSizeOptions,
  canGoPrev,
  canGoNext,
}: Props) {
  return (
    <div className="flex flex-col gap-3 border-t border-border px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm text-muted-foreground">
        {totalItems === 0
          ? 'No results'
          : `Showing ${rangeStart}–${rangeEnd} of ${totalItems}`}
      </p>

      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">Rows per page</span>
          <Select
            value={String(pageSize)}
            onValueChange={(value) => value && setPageSize(Number(value) as AdminPageSize)}
          >
            <SelectTrigger size="sm" className="w-[72px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {pageSizeOptions.map((size) => (
                <SelectItem key={size} value={String(size)}>
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">
            Page {page} of {totalPages}
          </span>
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="h-8 w-8"
            disabled={!canGoPrev}
            onClick={() => setPage(page - 1)}
            aria-label="Previous page"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="h-8 w-8"
            disabled={!canGoNext}
            onClick={() => setPage(page + 1)}
            aria-label="Next page"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
