import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

describe('Textarea', () => {
  it('renders with label', async () => {
    const { Textarea } = await import('../../components/ui')
    render(<Textarea label="Description" />)
    expect(screen.getByLabelText('Description')).toBeInTheDocument()
  })

  it('shows error', async () => {
    const { Textarea } = await import('../../components/ui')
    render(<Textarea label="Bio" error="Too long" />)
    expect(screen.getByRole('alert')).toHaveTextContent('Too long')
  })

  it('shows helper text when no error', async () => {
    const { Textarea } = await import('../../components/ui')
    render(<Textarea label="Bio" helperText="Tell us about yourself" />)
    expect(screen.getByText('Tell us about yourself')).toBeInTheDocument()
  })

  it('forwards ref', async () => {
    const { Textarea } = await import('../../components/ui')
    const ref = { current: null }
    render(<Textarea label="Bio" ref={ref} />)
    expect(ref.current).toBeInstanceOf(HTMLTextAreaElement)
  })

  it('accepts user input', async () => {
    const { Textarea } = await import('../../components/ui')
    const user = userEvent.setup()
    render(<Textarea label="Bio" />)
    const textarea = screen.getByLabelText('Bio')
    await user.type(textarea, 'Hello world')
    expect(textarea).toHaveValue('Hello world')
  })
})
