import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Pagination } from '../../components/ui'

describe('Pagination', () => {
  it('does not render when totalPages <= 1', () => {
    const { container } = render(<Pagination currentPage={1} totalPages={1} onPageChange={vi.fn()} />)
    expect(container.firstChild).toBeNull()
  })

  it('renders page buttons', () => {
    render(<Pagination currentPage={1} totalPages={5} onPageChange={vi.fn()} />)
    expect(screen.getByText('1')).toBeInTheDocument()
    expect(screen.getByText('5')).toBeInTheDocument()
  })

  it('marks current page with aria-current', () => {
    render(<Pagination currentPage={3} totalPages={5} onPageChange={vi.fn()} />)
    expect(screen.getByText('3')).toHaveAttribute('aria-current', 'page')
  })

  it('disables previous button on first page', () => {
    render(<Pagination currentPage={1} totalPages={5} onPageChange={vi.fn()} />)
    const prevBtn = screen.getAllByRole('button')[0]
    expect(prevBtn).toBeDisabled()
  })

  it('disables next button on last page', () => {
    render(<Pagination currentPage={5} totalPages={5} onPageChange={vi.fn()} />)
    const buttons = screen.getAllByRole('button')
    expect(buttons[buttons.length - 1]).toBeDisabled()
  })

  it('calls onPageChange with correct page number', async () => {
    const onPageChange = vi.fn()
    const user = userEvent.setup()
    render(<Pagination currentPage={1} totalPages={5} onPageChange={onPageChange} />)
    await user.click(screen.getByText('3'))
    expect(onPageChange).toHaveBeenCalledWith(3)
  })

  it('calls onPageChange with prev page', async () => {
    const onPageChange = vi.fn()
    const user = userEvent.setup()
    render(<Pagination currentPage={3} totalPages={5} onPageChange={onPageChange} />)
    const prevBtn = screen.getAllByRole('button')[0]
    await user.click(prevBtn)
    expect(onPageChange).toHaveBeenCalledWith(2)
  })

  it('calls onPageChange with next page', async () => {
    const onPageChange = vi.fn()
    const user = userEvent.setup()
    render(<Pagination currentPage={3} totalPages={5} onPageChange={onPageChange} />)
    const buttons = screen.getAllByRole('button')
    await user.click(buttons[buttons.length - 1])
    expect(onPageChange).toHaveBeenCalledWith(4)
  })

  it('shows ellipsis with many pages', () => {
    render(<Pagination currentPage={5} totalPages={20} onPageChange={vi.fn()} />)
    const ellipsis = screen.getAllByText('...')
    expect(ellipsis.length).toBeGreaterThanOrEqual(1)
  })

  it('has accessible nav label', () => {
    render(<Pagination currentPage={1} totalPages={3} onPageChange={vi.fn()} />)
    expect(screen.getByLabelText('Pagination')).toBeInTheDocument()
  })
})
