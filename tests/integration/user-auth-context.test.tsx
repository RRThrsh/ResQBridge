import { render } from '@testing-library/react'
import { screen } from '@testing-library/dom'
import userEvent from '@testing-library/user-event'
import { UserAuthProvider, useUserAuth } from '@/context/UserAuthContext'

function AuthProbe() {
  const { isLoggedIn, user, login, updateUser, logout } = useUserAuth()
  return (
    <div>
      <span data-testid="logged-in">{String(isLoggedIn)}</span>
      <span data-testid="email">{user?.email ?? ''}</span>
      <span data-testid="name">
        {user ? `${user.firstName} ${user.lastName}` : ''}
      </span>
      <button
        type="button"
        onClick={() =>
          login({
            email: 'User@Example.com',
            firstName: 'Ada',
            lastName: 'Lovelace',
            role: 'user',
          })
        }
      >
        Login
      </button>
      <button
        type="button"
        onClick={() => updateUser({ firstName: 'Augusta', lastName: 'Lovelace' })}
      >
        Update
      </button>
      <button type="button" onClick={logout}>
        Logout
      </button>
    </div>
  )
}

describe('UserAuthProvider integration', () => {
  it('login normalizes email and persists to localStorage', async () => {
    const user = userEvent.setup()
    render(
      <UserAuthProvider>
        <AuthProbe />
      </UserAuthProvider>,
    )

    await user.click(screen.getByRole('button', { name: 'Login' }))

    expect(screen.getByTestId('logged-in')).toHaveTextContent('true')
    expect(screen.getByTestId('email')).toHaveTextContent('user@example.com')

    const stored = localStorage.getItem('pwrrc_user')
    expect(stored).toBeTruthy()
    expect(stored).toContain('user@example.com')
    expect(stored).not.toContain('User@Example.com')
  })

  it('updateUser patches profile in state and storage', async () => {
    const user = userEvent.setup()
    render(
      <UserAuthProvider>
        <AuthProbe />
      </UserAuthProvider>,
    )

    await user.click(screen.getByRole('button', { name: 'Login' }))
    await user.click(screen.getByRole('button', { name: 'Update' }))

    expect(screen.getByTestId('name')).toHaveTextContent('Augusta Lovelace')
    const stored = JSON.parse(localStorage.getItem('pwrrc_user') ?? '{}')
    expect(stored.firstName).toBe('Augusta')
  })

  it('logout clears session', async () => {
    const user = userEvent.setup()
    render(
      <UserAuthProvider>
        <AuthProbe />
      </UserAuthProvider>,
    )

    await user.click(screen.getByRole('button', { name: 'Login' }))
    await user.click(screen.getByRole('button', { name: 'Logout' }))

    expect(screen.getByTestId('logged-in')).toHaveTextContent('false')
    expect(localStorage.getItem('pwrrc_user')).toBeNull()
  })

  it('restores user from localStorage on mount', () => {
    localStorage.setItem(
      'pwrrc_user',
      JSON.stringify({
        email: 'saved@example.com',
        firstName: 'Saved',
        lastName: 'User',
        role: 'user',
      }),
    )

    render(
      <UserAuthProvider>
        <AuthProbe />
      </UserAuthProvider>,
    )

    expect(screen.getByTestId('logged-in')).toHaveTextContent('true')
    expect(screen.getByTestId('email')).toHaveTextContent('saved@example.com')
  })
})
