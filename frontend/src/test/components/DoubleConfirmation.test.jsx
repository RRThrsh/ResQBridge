import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { DoubleConfirmation } from '../../components/ui'

describe('DoubleConfirmation', () => {
  it('renders trigger button with label', () => {
    render(<DoubleConfirmation onConfirm={vi.fn()} triggerLabel="Delete Item" />)
    expect(screen.getByRole('button', { name: 'Delete Item' })).toBeInTheDocument()
  })

  it('opens modal on trigger click', async () => {
    const user = userEvent.setup()
    render(<DoubleConfirmation onConfirm={vi.fn()} triggerLabel="Delete" title="Confirm?" message="Are you sure?" />)
    await user.click(screen.getByRole('button', { name: 'Delete' }))
    expect(screen.getByText('Are you sure?')).toBeInTheDocument()
    expect(screen.getByText('Confirm?')).toBeInTheDocument()
  })

  it('calls onConfirm when confirmed', async () => {
    const onConfirm = vi.fn()
    const user = userEvent.setup()
    render(<DoubleConfirmation onConfirm={onConfirm} triggerLabel="Delete" />)
    await user.click(screen.getByRole('button', { name: 'Delete' }))
    await user.click(screen.getByRole('button', { name: 'Confirm' }))
    expect(onConfirm).toHaveBeenCalledTimes(1)
  })

  it('closes modal without confirming on cancel', async () => {
    const onConfirm = vi.fn()
    const user = userEvent.setup()
    render(<DoubleConfirmation onConfirm={onConfirm} triggerLabel="Delete" />)
    await user.click(screen.getByRole('button', { name: 'Delete' }))
    await user.click(screen.getByRole('button', { name: 'Cancel' }))
    expect(onConfirm).not.toHaveBeenCalled()
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('uses default title and message', async () => {
    const user = userEvent.setup()
    render(<DoubleConfirmation onConfirm={vi.fn()} triggerLabel="Delete" />)
    await user.click(screen.getByRole('button', { name: 'Delete' }))
    expect(screen.getByText('Confirm Action')).toBeInTheDocument()
    expect(screen.getByText('Are you sure you want to proceed?')).toBeInTheDocument()
  })

  it('renders children as trigger when no label', async () => {
    const user = userEvent.setup()
    render(<DoubleConfirmation onConfirm={vi.fn()}><button>Child Trigger</button></DoubleConfirmation>)
    await user.click(screen.getByRole('button', { name: 'Child Trigger' }))
    expect(screen.getByRole('dialog')).toBeInTheDocument()
  })
})
