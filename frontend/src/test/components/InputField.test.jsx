import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

describe('InputField', () => {
  beforeEach(() => {
    vi.resetModules()
  })

  it('renders with label and input', async () => {
    const { InputField } = await import('../../components/ui')
    render(<InputField label="Name" />)
    expect(screen.getByLabelText('Name')).toBeInTheDocument()
  })

  it('shows error message', async () => {
    const { InputField } = await import('../../components/ui')
    render(<InputField label="Email" error="Required" />)
    expect(screen.getByRole('alert')).toHaveTextContent('Required')
    expect(screen.getByLabelText('Email')).toHaveAttribute('aria-invalid', 'true')
  })

  it('shows helper text when no error', async () => {
    const { InputField } = await import('../../components/ui')
    render(<InputField label="Email" helperText="Enter your email" />)
    expect(screen.getByText('Enter your email')).toBeInTheDocument()
  })

  it('does not show helper text when error exists', async () => {
    const { InputField } = await import('../../components/ui')
    render(<InputField label="Email" error="Required" helperText="Enter your email" />)
    expect(screen.queryByText('Enter your email')).not.toBeInTheDocument()
  })

  it('accepts custom id', async () => {
    const { InputField } = await import('../../components/ui')
    render(<InputField label="Name" id="custom-id" />)
    expect(screen.getByLabelText('Name')).toHaveAttribute('id', 'custom-id')
  })

  it('forwards ref', async () => {
    const { InputField } = await import('../../components/ui')
    const ref = { current: null }
    render(<InputField label="Name" ref={ref} />)
    expect(ref.current).toBeInstanceOf(HTMLInputElement)
  })

  it('updates value on user input', async () => {
    const { InputField } = await import('../../components/ui')
    const user = userEvent.setup()
    render(<InputField label="Name" />)
    const input = screen.getByLabelText('Name')
    await user.type(input, 'John')
    expect(input).toHaveValue('John')
  })
})
