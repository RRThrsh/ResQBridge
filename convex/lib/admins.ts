export const DEFAULT_ADMIN = {
  email: 'codewithxiao@gmail.com',
  firstName: 'Xiao',
  lastName: 'Dev',
} as const

export function normalizeEmail(email: string) {
  return email.trim().toLowerCase()
}
