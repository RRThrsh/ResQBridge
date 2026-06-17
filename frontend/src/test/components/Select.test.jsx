import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

describe('Select', () => {
  it('renders with label', async () => {
    const { Select } = await import('../../components/ui')
    render(<Select label="Role" options={['Admin', 'User']} />)
    expect(screen.getByLabelText('Role')).toBeInTheDocument()
  })

  it('renders string options', async () => {
    const { Select } = await import('../../components/ui')
    render(<Select label="Role" options={['Admin', 'User']} />)
    expect(screen.getByText('Admin')).toBeInTheDocument()
    expect(screen.getByText('User')).toBeInTheDocument()
  })

  it('renders object options', async () => {
    const { Select } = await import('../../components/ui')
    render(<Select label="Role" options={[{ value: 'admin', label: 'Admin' }, { value: 'user', label: 'User' }]} />)
    expect(screen.getByText('Admin')).toBeInTheDocument()
    expect(screen.getByText('User')).toBeInTheDocument()
  })

  it('renders placeholder', async () => {
    const { Select } = await import('../../components/ui')
    render(<Select label="Role" options={['Admin']} placeholder="Choose..." />)
    expect(screen.getByText('Choose...')).toBeInTheDocument()
  })

  it('shows error', async () => {
    const { Select } = await import('../../components/ui')
    render(<Select label="Role" options={['Admin']} error="Required" />)
    expect(screen.getByRole('alert')).toHaveTextContent('Required')
    expect(screen.getByLabelText('Role')).toHaveAttribute('aria-invalid', 'true')
  })

  it('allows selecting an option', async () => {
    const { Select } = await import('../../components/ui')
    const user = userEvent.setup()
    render(<Select label="Role" options={['Admin', 'User']} />)
    const select = screen.getByLabelText('Role')
    await user.selectOptions(select, 'User')
    expect(select).toHaveValue('User')
  })
})
