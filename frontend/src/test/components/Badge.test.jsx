import { render, screen } from '@testing-library/react'
import { Badge } from '../../components/ui'

describe('Badge', () => {
  it('renders children', () => {
    render(<Badge>New</Badge>)
    expect(screen.getByText('New')).toBeInTheDocument()
  })

  it('applies default variant classes', () => {
    render(<Badge>Default</Badge>)
    expect(screen.getByText('Default').className).toMatch(/bg-gray-100/)
  })

  it('applies primary variant', () => {
    render(<Badge variant="primary">Primary</Badge>)
    expect(screen.getByText('Primary').className).toMatch(/bg-green-100/)
  })

  it('applies success variant', () => {
    render(<Badge variant="success">Success</Badge>)
    expect(screen.getByText('Success').className).toMatch(/bg-green-100/)
  })

  it('applies warning variant', () => {
    render(<Badge variant="warning">Warning</Badge>)
    expect(screen.getByText('Warning').className).toMatch(/bg-yellow-100/)
  })

  it('applies danger variant', () => {
    render(<Badge variant="danger">Danger</Badge>)
    expect(screen.getByText('Danger').className).toMatch(/bg-red-100/)
  })

  it('applies sm size', () => {
    render(<Badge size="sm">Small</Badge>)
    expect(screen.getByText('Small').className).toMatch(/text-xs/)
  })

  it('accepts custom className', () => {
    render(<Badge className="custom-badge">Custom</Badge>)
    expect(screen.getByText('Custom').className).toMatch(/custom-badge/)
  })
})
