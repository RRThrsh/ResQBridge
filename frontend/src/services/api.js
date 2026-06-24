const API_BASE = '/api/v1'

export class ApiError extends Error {
  constructor(message, status, errors) {
    super(message)
    this.status = status
    this.errors = errors
  }
}

async function request(endpoint, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  }

  const res = await fetch(`${API_BASE}${endpoint}`, { ...options, headers, credentials: 'include' })
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

  getLogs: (params = {}) => {
    const qs = new URLSearchParams()
    if (params.eventType) qs.set('eventType', params.eventType)
    if (params.ipAddress) qs.set('ipAddress', params.ipAddress)
    if (params.limit) qs.set('limit', params.limit)
    if (params.cursor) qs.set('cursor', params.cursor)
    const query = qs.toString()
    return request(`/admin/logs${query ? `?${query}` : ''}`)
  },
  getDashboardData: () => request('/admin/dashboard'),
  getLogStats: () => request('/admin/logs/stats'),
  getLogsByIP: (ip) => request(`/admin/logs/ip/${ip}`),
  cleanupLogs: (retentionDays) =>
    request('/admin/logs/cleanup', {
      method: 'POST',
      body: JSON.stringify({ retentionDays }),
    }),

  getConfig: () => request('/admin/config'),
  updateConfig: (key, value) =>
    request('/admin/config', {
      method: 'PUT',
      body: JSON.stringify({ key, value }),
    }),

  getLandingConfig: () => request('/admin/landing-config'),
  updateLandingConfig: (config) =>
    request('/admin/landing-config', {
      method: 'PUT',
      body: JSON.stringify(config),
    }),
  getReports: () => request('/admin/reports'),
  assignReport: (reportId, userId) =>
    request(`/admin/reports/${reportId}/assign`, {
      method: 'POST',
      body: JSON.stringify({ userId }),
    }),
  getRescuerLocations: () => request('/admin/rescuer-locations'),
}

export const rescuer = {
  getReports: (params = {}) => {
    const qs = new URLSearchParams()
    if (params.status) qs.set('status', params.status)
    if (params.assignedTo) qs.set('assignedTo', params.assignedTo)
    if (params.search) qs.set('search', params.search)
    if (params.sortBy) qs.set('sortBy', params.sortBy)
    const query = qs.toString()
    return request(`/rescuer/reports${query ? `?${query}` : ''}`)
  },
  updateReportStatus: (id, status) =>
    request(`/rescuer/reports/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }),
  getStats: () => request('/rescuer/stats'),
  updateProfile: (body) =>
    request('/rescuer/profile', {
      method: 'PATCH',
      body: JSON.stringify(body),
    }),
  getActivity: (cursor) => request(`/rescuer/activity?limit=20${cursor ? `&cursor=${encodeURIComponent(cursor)}` : ''}`),
  updateAvailability: (availability) =>
    request('/rescuer/availability', {
      method: 'PATCH',
      body: JSON.stringify({ availability }),
    }),
  getNotes: (reportId) => request(`/rescuer/reports/${reportId}/notes`),
  addNote: (reportId, content) =>
    request(`/rescuer/reports/${reportId}/notes`, {
      method: 'POST',
      body: JSON.stringify({ content }),
    }),
  updateLocation: (latitude, longitude) =>
    request('/rescuer/location', {
      method: 'POST',
      body: JSON.stringify({ latitude, longitude }),
    }),
  rejectAssignment: (reportId) =>
    request(`/rescuer/reports/${reportId}/reject`, { method: 'POST' }),
  triggerSos: (lat, lng) =>
    request('/rescuer/sos', {
      method: 'POST',
      body: JSON.stringify({ lat, lng }),
    }),
}

export const logs = {
  trackGuest: (section, duration, eventType) =>
    request('/log/guest', {
      method: 'POST',
      body: JSON.stringify({ section, duration, eventType }),
    }),
  trackLogout: () =>
    request('/log/logout', { method: 'POST' }),
}
