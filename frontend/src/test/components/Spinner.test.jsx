import { render, screen } from '@testing-library/react'
import { Spinner } from '../../components/ui'

describe('Spinner', () => {
  it('renders with status role', () => {
    render(<Spinner />)
    expect(screen.getByRole('status')).toBeInTheDocument()
  })

  it('applies default size classes', () => {
    render(<Spinner />)
    const spinner = screen.getByRole('status')
    expect(spinner.className).toMatch(/h-8 w-8/)
  })

  it('applies sm size', () => {
    render(<Spinner size="sm" />)
    const spinner = screen.getByRole('status')
    expect(spinner.className).toMatch(/h-4 w-4/)
  })

  it('applies lg size', () => {
    render(<Spinner size="lg" />)
    const spinner = screen.getByRole('status')
    expect(spinner.className).toMatch(/h-12 w-12/)
  })

  it('accepts custom className', () => {
    render(<Spinner className="custom-spinner" />)
    expect(screen.getByRole('status').className).toMatch(/custom-spinner/)
  })

  it('has accessible label', () => {
    render(<Spinner />)
    expect(screen.getByRole('status')).toHaveAttribute('aria-label', 'Loading')
  })
})
