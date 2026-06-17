import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Modal } from '../../components/ui'

describe('Modal', () => {
  it('does not render when closed', () => {
    render(<Modal isOpen={false} onClose={vi.fn()}><p>Content</p></Modal>)
    expect(screen.queryByText('Content')).not.toBeInTheDocument()
  })

  it('renders when open', () => {
    render(<Modal isOpen={true} onClose={vi.fn()}><p>Content</p></Modal>)
    expect(screen.getByText('Content')).toBeInTheDocument()
  })

  it('renders title', () => {
    render(<Modal isOpen={true} onClose={vi.fn()} title="My Title"><p>Content</p></Modal>)
    expect(screen.getByText('My Title')).toBeInTheDocument()
  })

  it('renders footer', () => {
    render(<Modal isOpen={true} onClose={vi.fn()} footer={<button>Save</button>}><p>Content</p></Modal>)
    expect(screen.getByRole('button', { name: 'Save' })).toBeInTheDocument()
  })

  it('calls onClose when close button clicked', async () => {
    const onClose = vi.fn()
    const user = userEvent.setup()
    render(<Modal isOpen={true} onClose={onClose} title="Title"><p>Content</p></Modal>)
    await user.click(screen.getByLabelText('Close modal'))
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('calls onClose when overlay clicked', () => {
    const onClose = vi.fn()
    render(<Modal isOpen={true} onClose={onClose}><p>Content</p></Modal>)
    const overlay = document.querySelector('[aria-hidden="true"]')
    fireEvent.click(overlay)
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('does not close on overlay click when closeOnOverlayClick is false', () => {
    const onClose = vi.fn()
    render(<Modal isOpen={true} onClose={onClose} closeOnOverlayClick={false}><p>Content</p></Modal>)
    const overlay = document.querySelector('[aria-hidden="true"]')
    fireEvent.click(overlay)
    expect(onClose).not.toHaveBeenCalled()
  })

  it('renders with dialog role and aria-modal', () => {
    render(<Modal isOpen={true} onClose={vi.fn()}><p>Content</p></Modal>)
    const dialog = screen.getByRole('dialog')
    expect(dialog).toHaveAttribute('aria-modal', 'true')
  })
})
