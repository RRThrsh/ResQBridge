export const DEFAULT_ADMIN = {
  email: 'ralphbandahala05@gmail.com',
  firstName: 'Ralph',
  lastName: 'vincent',
  // Add a strong initial password here. 
  // Make sure your backend hashes this when initializing the default admin!
  password: 'ChangeMe123!', 
} as const

export function normalizeEmail(email: string) {
  return email.trim().toLowerCase()
}
