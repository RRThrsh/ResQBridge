import { useQuery } from 'convex/react'
import { api } from '../../../convex/_generated/api'
import { useAdminAuth } from '@/context/AdminAuthContext'
import { normalizeEmail } from '@/lib/admin'
import { useEffect, useMemo, useRef, useState } from 'react'

const ACTION_COLORS: Record<string, string> = {
  'user.signup': '#00ff88',
  'user.login': '#00ff88',
  'user.login.failed': '#ff4444',
  'user.account_locked': '#ff4444',
  'user.update_profile': '#00ff88',
  'user.report.submit': '#ffcc00',
  'user.report.update': '#ffcc00',
  'user.report.delete': '#ff4444',
  'user.password_reset': '#ff8800',
  'user.logout': '#ff4444',
  'admin.login': '#00aaff',
  'admin.logout': '#00aaff',
  'admin.update_profile': '#00aaff',
  'admin.change_password': '#ff8800',
  'admin.add': '#ff44ff',
  'admin.remove': '#ff4444',
  'admin.update': '#00aaff',
  'admin.report.update': '#00aaff',
  'admin.report.delete': '#ff4444',
  'admin.report.assign_rescuer': '#ff8800',
  'admin.report.reassign': '#ff8800',
  'admin.rescuer.add': '#ff44ff',
  'admin.rescuer.update': '#00aaff',
  'admin.rescuer.remove': '#ff4444',
  'admin.approver.add': '#ff44ff',
  'admin.approver.remove': '#ff4444',
  'admin.wildlife.create': '#ff44ff',
  'admin.wildlife.update': '#00aaff',
  'admin.wildlife.delete': '#ff4444',
  'admin.news.create': '#ff44ff',
  'admin.news.update': '#00aaff',
  'admin.news.delete': '#ff4444',
  'admin.password_reset': '#ff8800',
  'rescuer.login': '#88ff88',
  'rescuer.accept_report': '#88ff88',
  'rescuer.mark_en_route': '#88ff88',
  'rescuer.complete_rescue': '#88ff88',
  'rescuer.password_reset': '#ff8800',
  'rescuer.logout': '#ff4444',
  'domestic_approver.login': '#88aaff',
  'domestic_approver.logout': '#ff4444',
  'guest.page_view': '#aaaaaa',
}

const ACTION_LABELS: Record<string, string> = {
  'user.signup': 'Signup',
  'user.login': 'Login',
  'user.login.failed': 'Login Failed',
  'user.account_locked': 'Locked',
  'user.update_profile': 'Profile Update',
  'user.report.submit': 'Report Submitted',
  'user.report.update': 'Report Updated',
  'user.report.delete': 'Report Deleted',
  'user.password_reset': 'Password Reset',
  'user.logout': 'Logout',
  'admin.login': 'Admin Login',
  'admin.logout': 'Admin Logout',
  'admin.update_profile': 'Admin Profile',
  'admin.change_password': 'Change Password',
  'admin.add': 'Admin Added',
  'admin.remove': 'Admin Removed',
  'admin.update': 'Admin Updated',
  'admin.report.update': 'Edit Report',
  'admin.report.delete': 'Delete Report',
  'admin.report.assign_rescuer': 'Assign Rescuer',
  'admin.report.reassign': 'Reassign Rescuer',
  'admin.rescuer.add': 'Rescuer Added',
  'admin.rescuer.update': 'Rescuer Updated',
  'admin.rescuer.remove': 'Rescuer Removed',
  'admin.approver.add': 'Approver Added',
  'admin.approver.remove': 'Approver Removed',
  'admin.wildlife.create': 'Wildlife Created',
  'admin.wildlife.update': 'Wildlife Updated',
  'admin.wildlife.delete': 'Wildlife Deleted',
  'admin.news.create': 'News Created',
  'admin.news.update': 'News Updated',
  'admin.news.delete': 'News Deleted',
  'admin.password_reset': 'Admin Password Reset',
  'rescuer.login': 'Rescuer Login',
  'rescuer.accept_report': 'Accepted',
  'rescuer.mark_en_route': 'En Route',
  'rescuer.complete_rescue': 'Completed',
  'rescuer.password_reset': 'Rescuer Password Reset',
  'rescuer.logout': 'Rescuer Logout',
  'domestic_approver.login': 'Approver Login',
  'domestic_approver.logout': 'Approver Logout',
  'guest.page_view': 'Page View',
}

function formatTime(ts: number): string {
  const d = new Date(ts)
  const hh = String(d.getHours()).padStart(2, '0')
  const mm = String(d.getMinutes()).padStart(2, '0')
  const ss = String(d.getSeconds()).padStart(2, '0')
  return `${hh}:${mm}:${ss}`
}

function formatDate(ts: number): string {
  const d = new Date(ts)
  return d.toLocaleDateString('en-PH', { month: 'short', day: 'numeric' })
}

type AuditLogEntry = {
  _id: string
  _creationTime: number
  action: string
  actorEmail: string
  actorName?: string
  actorRole?: string
  targetType?: string
  targetId?: string
  details?: string
  metadata?: string
  ipAddress?: string
  createdAt: number
}

function extractActorName(log: AuditLogEntry): string {
  if (log.actorName?.trim()) return log.actorName.trim()
  return log.actorEmail.split('@')[0]
}

function buildLogObject(log: AuditLogEntry): Record<string, unknown> {
  const obj: Record<string, unknown> = {
    action: log.action,
    actor: log.actorEmail,
    timestamp: `${formatDate(log.createdAt)} ${formatTime(log.createdAt)}`,
  }
  if (log.actorName) obj.actorName = log.actorName
  if (log.actorRole) obj.role = log.actorRole
  if (log.targetType) obj.targetType = log.targetType
  if (log.targetId) obj.targetId = log.targetId
  if (log.ipAddress) obj.ip = log.ipAddress
  if (log.details) {
    try { obj.details = JSON.parse(log.details) } catch { obj.details = log.details }
  }
  if (log.metadata) {
    try { obj.metadata = JSON.parse(log.metadata) } catch { obj.metadata = log.metadata }
  }
  return obj
}

const ROLE_OPTIONS = [
  { value: 'all', label: 'All Roles' },
  { value: 'user', label: 'User' },
  { value: 'admin', label: 'Admin' },
  { value: 'rescuer', label: 'Rescuer' },
  { value: 'domestic_approver', label: 'Approver' },
  { value: 'guest', label: 'Guest' },
]

export function AdminAuditLogsPage() {
  const { admin } = useAdminAuth()
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [refreshTick, setRefreshTick] = useState(0)
  const [roleFilter, setRoleFilter] = useState<string>('all')
  const scrollRef = useRef<HTMLDivElement>(null)

  const adminEmail = admin ? normalizeEmail(admin.email) : null

  const logs = useQuery(
    api.auditLogs.list,
    adminEmail ? { adminEmail, limit: 500 } : 'skip',
  )

  const filteredLogs = useMemo(() => {
    return logs?.filter(
      (log) => roleFilter === 'all' || log.actorRole === roleFilter,
    )
  }, [logs, roleFilter])

  useEffect(() => {
    const id = setInterval(() => setRefreshTick((t) => t + 1), 1000)
    return () => clearInterval(id)
  }, [])

  useEffect(() => {
    if (!scrollRef.current || !filteredLogs) return
    scrollRef.current.scrollTop = 0
  }, [filteredLogs?.length])

  if (!admin) return null

  return (
    <div className="mx-auto w-full max-w-full font-mono">
      <div className="rounded-lg border border-[#00ff8833] bg-[#0a0a0a]">
        {/* Header bar */}
        <div className="flex items-center justify-between border-b border-[#00ff8822] px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <span className="text-sm font-bold tracking-wider text-[#00ff88]">
              AUDIT LOG
            </span>
            <span className="flex items-center gap-1.5 text-[10px] text-[#00ff8866]">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#00ff88]" />
              LIVE
            </span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-[11px] text-[#00ff8844]">
              {logs?.length ?? 0} total
            </span>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="rounded border border-[#00ff8833] bg-black px-2 py-1 text-[11px] text-[#00ff88] outline-none"
            >
              {ROLE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Table */}
        {logs === undefined ? (
          <div className="flex items-center justify-center py-20 text-[#00ff8866]">
            <span className="animate-pulse text-xs">connecting to audit stream...</span>
          </div>
        ) : logs.length === 0 ? (
          <div className="py-20 text-center text-[#00ff8866]">
            <p className="text-xs">No audit logs found.</p>
          </div>
        ) : filteredLogs === undefined || filteredLogs.length === 0 ? (
          <div className="py-20 text-center text-[#00ff8866]">
            <p className="text-xs">No logs match the selected filter.</p>
          </div>
        ) : (
          <>
            {/* Scrollable list */}
            <div ref={scrollRef} className="h-[600px] overflow-y-auto">
              {/* Sticky header row */}
              <div className="sticky top-0 z-20 flex border-b border-[#00ff8822] bg-[#0a0a0a] px-4 py-2 text-[10px] uppercase tracking-wider text-[#00ff8877]">
                <div className="w-[140px] min-w-0 shrink-0">Action</div>
                <div className="w-[120px] min-w-0 shrink-0">Actor</div>
                <div className="w-[70px] min-w-0 shrink-0">Role</div>
                <div className="w-[100px] min-w-0 shrink-0">IP</div>
                <div className="ml-auto w-[130px] min-w-0 shrink-0 text-right">Time</div>
              </div>

              {filteredLogs!.map((log) => {
                const color = ACTION_COLORS[log.action] ?? '#ffffff'
                const label = ACTION_LABELS[log.action] ?? log.action.replace(/_/g, ' ')
                const isExpanded = expandedId === log._id

                return (
                  <div key={log._id} className="border-b border-[#ffffff08] last:border-0">
                    <button
                      type="button"
                      onClick={() => setExpandedId(isExpanded ? null : log._id)}
                      className="flex w-full items-center gap-2 px-4 py-2.5 text-left transition-colors hover:bg-[#ffffff05]"
                    >
                      <span className={`text-[10px] text-[#00ff8877] transition-transform ${isExpanded ? 'rotate-90' : ''}`}>▶</span>
                      <div className="flex min-w-0 flex-1 items-center gap-2">
                        <span
                          className="shrink-0 truncate text-[11px] font-semibold tracking-wide"
                          style={{ color }}
                        >
                          {label}
                        </span>
                        <span className="w-[120px] shrink-0 truncate text-[11px] text-[#999]">
                          {extractActorName(log)}
                        </span>
                        <span className="w-[70px] shrink-0 truncate text-[10px] text-[#666]">
                          {log.actorRole ?? '-'}
                        </span>
                        <span className="w-[100px] shrink-0 truncate text-[10px] text-[#555]">
                          {log.ipAddress ?? '-'}
                        </span>
                        <span className="ml-auto shrink-0 text-right text-[10px] text-[#555] tabular-nums">
                          <span className="hidden sm:inline">{formatDate(log.createdAt)} </span>
                          {formatTime(log.createdAt)}
                        </span>
                      </div>
                    </button>

                    {/* Expandable JSON */}
                    <div
                      className={`overflow-hidden transition-all duration-300 ease-out ${isExpanded ? 'max-h-[600px]' : 'max-h-0'}`}
                    >
                      <div className="border-t border-[#ffffff08] bg-[#00000055] px-4 py-3">
                        <pre className="overflow-x-auto text-[11px] leading-relaxed text-[#bdbdbd]">
{JSON.stringify(buildLogObject(log), null, 2)}
                        </pre>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between border-t border-[#00ff8822] px-4 py-2 text-[10px] text-[#00ff8844]">
              <span>
                {filteredLogs!.length} shown · {refreshTick}s
              </span>
              <span>click a row to inspect</span>
            </div>
          </>
        )}
      </div>
    </div>
  )
}