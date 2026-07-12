import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import InfoPopover from '../../components/ui/InfoPopover'

describe('InfoPopover', () => {
  it('renders info button', () => {
    render(<InfoPopover>Help text</InfoPopover>)
    expect(screen.getByRole('button')).toBeInTheDocument()
  })

  it('shows content when button is clicked', async () => {
    const user = userEvent.setup()
    render(<InfoPopover>Help text</InfoPopover>)
    await user.click(screen.getByRole('button'))
    expect(screen.getByText('Help text')).toBeInTheDocument()
  })

  it('hides content when button is clicked again', async () => {
    const user = userEvent.setup()
    render(<InfoPopover>Help text</InfoPopover>)
    const btn = screen.getByRole('button')
    await user.click(btn)
    expect(screen.getByText('Help text')).toBeInTheDocument()
    await user.click(btn)
    expect(screen.queryByText('Help text')).not.toBeInTheDocument()
  })

  it('hides content on Escape key', async () => {
    const user = userEvent.setup()
    render(<InfoPopover>Help text</InfoPopover>)
    await user.click(screen.getByRole('button'))
    expect(screen.getByText('Help text')).toBeInTheDocument()
    await user.keyboard('{Escape}')
    expect(screen.queryByText('Help text')).not.toBeInTheDocument()
  })

  it('accepts custom className', () => {
    const { container } = render(<InfoPopover className="my-class">Help</InfoPopover>)
    expect(container.firstChild.className).toMatch(/my-class/)
  })

  it('renders with bottom position by default', () => {
    render(<InfoPopover>Help text</InfoPopover>)
    expect(screen.getByRole('button')).toBeInTheDocument()
  })

  it('renders with top position', async () => {
    const user = userEvent.setup()
    const { container } = render(<InfoPopover position="top">Help text</InfoPopover>)
    await user.click(screen.getByRole('button'))
    expect(screen.getByText('Help text').className).toMatch(/bottom-full/)
  })
})
