import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'
import { Button, InputField, Select, Textarea, Badge, Card } from '../../components/ui'

function RegistrationForm() {
  const [submitted, setSubmitted] = useState(false)
  const [form, setForm] = useState({ name: '', role: '', bio: '' })
  const [errors, setErrors] = useState({})

  const validate = () => {
    const errs = {}
    if (!form.name) errs.name = 'Name is required'
    if (!form.role) errs.role = 'Role is required'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (validate()) setSubmitted(true)
  }

  if (submitted) {
    return (
      <Card>
        <Badge variant="success">Success</Badge>
        <p>Name: {form.name}</p>
        <p>Role: {form.role}</p>
        <p>Bio: {form.bio}</p>
      </Card>
    )
  }

  return (
    <form onSubmit={handleSubmit}>
      <InputField
        label="Name"
        value={form.name}
        onChange={(e) => setForm({ ...form, name: e.target.value })}
        error={errors.name}
      />
      <Select
        label="Role"
        options={['Developer', 'Designer', 'Manager']}
        value={form.role}
        onChange={(e) => setForm({ ...form, role: e.target.value })}
        error={errors.role}
      />
      <Textarea
        label="Bio"
        value={form.bio}
        onChange={(e) => setForm({ ...form, bio: e.target.value })}
        helperText="Optional"
      />
      <Button type="submit">Register</Button>
    </form>
  )
}

describe('Registration Form Integration', () => {
  it('renders all form fields', () => {
    render(<RegistrationForm />)
    expect(screen.getByLabelText('Name')).toBeInTheDocument()
    expect(screen.getByLabelText('Role')).toBeInTheDocument()
    expect(screen.getByLabelText('Bio')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Register' })).toBeInTheDocument()
  })

  it('shows validation errors on empty submit', async () => {
    const user = userEvent.setup()
    render(<RegistrationForm />)
    await user.click(screen.getByRole('button', { name: 'Register' }))
    expect(screen.getByText('Name is required')).toBeInTheDocument()
    expect(screen.getByText('Role is required')).toBeInTheDocument()
  })

  it('submits successfully with valid data', async () => {
    const user = userEvent.setup()
    render(<RegistrationForm />)

    await user.type(screen.getByLabelText('Name'), 'Alice')
    await user.selectOptions(screen.getByLabelText('Role'), 'Developer')
    await user.type(screen.getByLabelText('Bio'), 'Hello!')
    await user.click(screen.getByRole('button', { name: 'Register' }))

    expect(screen.getByText('Success')).toBeInTheDocument()
    expect(screen.getByText('Name: Alice')).toBeInTheDocument()
    expect(screen.getByText('Role: Developer')).toBeInTheDocument()
    expect(screen.getByText('Bio: Hello!')).toBeInTheDocument()
  })

  it('clears errors on valid input after initial error', async () => {
    const user = userEvent.setup()
    render(<RegistrationForm />)

    await user.click(screen.getByRole('button', { name: 'Register' }))
    expect(screen.getByText('Name is required')).toBeInTheDocument()

    await user.type(screen.getByLabelText('Name'), 'Alice')
    await user.selectOptions(screen.getByLabelText('Role'), 'Developer')
    await user.click(screen.getByRole('button', { name: 'Register' }))

    expect(screen.getByText('Success')).toBeInTheDocument()
  })
})
