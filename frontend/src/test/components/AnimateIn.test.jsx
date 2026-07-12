import { render, screen } from '@testing-library/react'
import AnimateIn from '../../components/ui/AnimateIn'

const mockUseInView = vi.fn()
vi.mock('../../hooks/useInView', () => ({
  default: (...args) => mockUseInView(...args),
}))

describe('AnimateIn', () => {
  beforeEach(() => {
    mockUseInView.mockReturnValue([null, false])
  })

  it('renders children', () => {
    render(<AnimateIn><p>Hello</p></AnimateIn>)
    expect(screen.getByText('Hello')).toBeInTheDocument()
  })

  it('renders as default div element', () => {
    const { container } = render(<AnimateIn><p>Content</p></AnimateIn>)
    expect(container.firstChild?.nodeName).toBe('DIV')
  })

  it('renders as specified tag', () => {
    const { container } = render(<AnimateIn as="section"><p>Content</p></AnimateIn>)
    expect(container.firstChild?.nodeName).toBe('SECTION')
  })

  it('applies custom className', () => {
    const { container } = render(<AnimateIn className="my-custom-class"><p>Content</p></AnimateIn>)
    expect(container.firstChild.className).toMatch(/my-custom-class/)
  })

  it('applies starting animation class when not in view', () => {
    const { container } = render(<AnimateIn animation="fade-up"><p>Content</p></AnimateIn>)
    expect(container.firstChild.className).toMatch(/opacity-0/)
    expect(container.firstChild.className).toMatch(/translate-y-10/)
  })

  it('applies visible classes when in view', () => {
    mockUseInView.mockReturnValue([null, true])
    const { container } = render(<AnimateIn><p>Content</p></AnimateIn>)
    expect(container.firstChild.className).toMatch(/opacity-100/)
    expect(container.firstChild.className).toMatch(/translate-y-0/)
  })

  it('applies custom animation delay', () => {
    const { container } = render(<AnimateIn delay={300}><p>Content</p></AnimateIn>)
    expect(container.firstChild.style.transitionDelay).toBe('300ms')
  })

  it('applies custom animation duration', () => {
    const { container } = render(<AnimateIn duration={1000}><p>Content</p></AnimateIn>)
    expect(container.firstChild.style.transitionDuration).toBe('1000ms')
  })

  it('uses fade-up as default animation', () => {
    const { container } = render(<AnimateIn><p>Content</p></AnimateIn>)
    expect(container.firstChild.className).toMatch(/translate-y-10/)
  })
})
