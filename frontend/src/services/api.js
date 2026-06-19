const API_BASE = '/api/v1'

export class ApiError extends Error {
  constructor(message, status, errors) {
    super(message)
    this.status = status
    this.errors = errors
  }
}

async function request(endpoint, options = {}) {
  const token = localStorage.getItem('token')
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  }

  const res = await fetch(`${API_BASE}${endpoint}`, { ...options, headers })
  const data = await res.json()

  if (!res.ok) {
    throw new ApiError(data.message || 'Something went wrong', res.status, data.errors)
  }

  return data
}

export const auth = {
  sendOtp: (email) =>
    request('/auth/send-otp', {
      method: 'POST',
      body: JSON.stringify({ email }),
    }),
  register: (body) =>
    request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(body),
    }),
  login: (email, password) =>
    request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),
  forgotPassword: (email) =>
    request('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    }),
}

export const admin = {
  getUsers: () => request('/admin/users'),
  getUser: (uuid) => request(`/admin/users/${uuid}`),
  updateUserRole: (uuid, role) =>
    request(`/admin/users/${uuid}/role`, {
      method: 'PATCH',
      body: JSON.stringify({ role }),
    }),
  getStats: () => request('/admin/stats'),
}
