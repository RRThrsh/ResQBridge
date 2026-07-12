import { render, screen } from '@testing-library/react'
import { Skeleton, SkeletonCard, SkeletonTable, SkeletonConfigCard } from '../../components/ui'

describe('Skeleton', () => {
  it('renders with default classes', () => {
    const { container } = render(<Skeleton />)
    const el = container.firstChild
    expect(el.className).toMatch(/animate-pulse/)
    expect(el.className).toMatch(/rounded-lg/)
    expect(el.className).toMatch(/bg-gray-200/)
  })

  it('accepts custom className', () => {
    const { container } = render(<Skeleton className="h-10 w-40" />)
    expect(container.firstChild.className).toMatch(/h-10 w-40/)
  })
})

describe('SkeletonCard', () => {
  it('renders with default 3 lines', () => {
    const { container } = render(<SkeletonCard />)
    expect(container.firstChild).toBeInTheDocument()
  })

  it('renders specified number of lines', () => {
    const { container } = render(<SkeletonCard lines={5} />)
    const lines = container.querySelectorAll('.h-4')
    expect(lines.length).toBe(5)
  })

  it('accepts custom className', () => {
    const { container } = render(<SkeletonCard className="my-4" />)
    expect(container.firstChild.className).toMatch(/my-4/)
  })
})

describe('SkeletonTable', () => {
  it('renders with default dimensions', () => {
    const { container } = render(<SkeletonTable />)
    expect(container.firstChild).toBeInTheDocument()
  })

  it('renders specified rows and columns', () => {
    const { container } = render(<SkeletonTable rows={3} cols={4} />)
    const rows = container.querySelectorAll('.divide-y > div')
    expect(rows.length).toBe(3)
  })
})

describe('SkeletonConfigCard', () => {
  it('renders without crashing', () => {
    const { container } = render(<SkeletonConfigCard />)
    expect(container.firstChild).toBeInTheDocument()
  })

  it('accepts custom className', () => {
    const { container } = render(<SkeletonConfigCard className="my-4" />)
    expect(container.firstChild.className).toMatch(/my-4/)
  })
})
