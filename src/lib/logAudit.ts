import { getAuthApiUrl } from '@/lib/auth-api-base'

type LogoutRole = 'user' | 'admin' | 'rescuer' | 'domestic_approver'

const actionMap: Record<LogoutRole, string> = {
  user: 'user.logout',
  admin: 'admin.logout',
  rescuer: 'rescuer.logout',
  domestic_approver: 'domestic_approver.logout',
}

export function logLogout(email: string, name: string, role: LogoutRole) {
  let url: string
  try {
    url = getAuthApiUrl('/api/log-event')
  } catch {
    return
  }

  fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action: actionMap[role],
      actorEmail: email,
      actorName: name,
      actorRole: role,
    }),
  }).catch(() => {})
}
