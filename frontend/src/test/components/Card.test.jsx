import { render, screen } from '@testing-library/react'
import { Card } from '../../components/ui'

describe('Card', () => {
  it('renders children', () => {
    render(<Card><p>Content</p></Card>)
    expect(screen.getByText('Content')).toBeInTheDocument()
  })

  it('applies default padding', () => {
    const { container } = render(<Card><p>Content</p></Card>)
    expect(container.firstChild?.className).toMatch(/p-6/)
  })

  it('removes padding when padding is false', () => {
    const { container } = render(<Card padding={false}><p>Content</p></Card>)
    expect(container.firstChild?.className).not.toMatch(/p-6/)
  })

  it('applies hover shadow class', () => {
    const { container } = render(<Card hover><p>Content</p></Card>)
    expect(container.firstChild?.className).toMatch(/hover:shadow-md/)
  })

  it('accepts custom className', () => {
    const { container } = render(<Card className="custom-card"><p>Content</p></Card>)
    expect(container.firstChild?.className).toMatch(/custom-card/)
  })

  it('has border and shadow styles', () => {
    const { container } = render(<Card><p>Content</p></Card>)
    expect(container.firstChild?.className).toMatch(/border/)
    expect(container.firstChild?.className).toMatch(/shadow-sm/)
  })
})
