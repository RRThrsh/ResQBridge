export const DEFAULT_ADMIN = {
  email: 'ralphbandahala05@gmail.com',
  firstName: 'Ralph',
  lastName: 'vincent',
} as const

export function normalizeEmail(email: string) {
  return email.trim().toLowerCase()
}
